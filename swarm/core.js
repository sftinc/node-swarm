import { OpenAI } from 'openai'
import { debugPrint, mergeChunk, agentToJson } from './utils.js'
import { Agent, Response, Result } from './types.js'

class Swarm {
	constructor(args = {}) {
		const { dataParam, ...settings } = args

		this.dataParam = dataParam || '_data'
		this.client = new OpenAI({ ...settings })
	}

	async getChatCompletion(agent, history, data, modelOverride, stream, debug) {
		debugPrint(debug, '⬜ LLM Chat Completion')
		const instructions = typeof agent.instructions === 'function' ? agent.instructions(data) : agent.instructions
		const messages = [{ role: 'system', content: instructions }, ...history]

		const tools = agent.tools.map((tool) => {
			console.log('tool', tool)
			const processedTool = JSON.parse(JSON.stringify(tool))
			delete processedTool.function
			delete processedTool[this.dataParam]
			delete processedTool.parameters.properties[this.dataParam]

			processedTool.parameters.required = processedTool.parameters.required.filter((param) => param !== this.dataParam)
			return {
				type: 'function',
				function: processedTool,
			}
		})

		const createParams = {
			model: modelOverride || agent.model,
			messages,
			tools: tools.length ? tools : undefined,
			tool_choice: tools.length ? agent.toolChoice : undefined,
			stream,
		}
		if (tools.length) createParams.parallel_tool_calls = agent.parallelToolCalls

		return this.client.chat.completions.create(createParams)
	}

	handleToolResult(toolName, result, debug) {
		if (result == null) {
			debugPrint(debug, `🟥 Null result from tool "${toolName}"`)
			return new Result({ value: `Error: No result returned from tool "${toolName}"` })
		}

		debugPrint(debug, `🟦 Process Tool Result for tool "${toolName}"`)

		if (result instanceof Result) return result
		if (result instanceof Agent) {
			return new Result({
				value: JSON.stringify({ assistant: result.name }),
				agent: result,
			})
		}

		const stringValue = typeof result === 'object' ? JSON.stringify(result) : String(result)

		return new Result({ value: stringValue })
	}

	async handleToolCalls(toolCalls, agent, data, debug) {
		const toolMap = agent.tools.reduce((map, tool) => {
			map[tool.name] = tool
			return map
		}, {})
		const partialResponse = new Response({
			messages: [],
			agent: null,
			data,
		})

		const processToolCall = async (toolCall) => {
			try {
				const name = toolCall.function.name
				if (!toolMap[name]) {
					throw new Error(`processToolCall - Tool "${name}" not found`)
				}

				const toolCallArgs = JSON.parse(toolCall.function.arguments)

				const toolParams = Object.keys(toolMap[name].parameters.properties || {})
				const toolRequiredParams = toolMap[name].parameters.required
				const toolMissingArgs = toolRequiredParams.filter((param) => !(param in toolCallArgs) && param !== this.variable)

				if (toolMissingArgs.length) {
					throw new Error(`processToolCall - Missing required parameters in tool "${name}" [${toolMissingArgs.join(', ')}]`)
				}

				const funcArgs = Object.fromEntries(
					toolParams.map((param) => [param, param === this.dataParam ? data : toolCallArgs[param] || null])
				)
				const funcValues = toolParams.map((param) => funcArgs[param])

				debugPrint(debug, `🟦 Calling tool "${name}" with (${JSON.stringify(funcValues).slice(1, -1)})`)

				const rawResult = await toolMap[name].function(...funcValues)
				const result = this.handleToolResult(name, rawResult, debug)

				return {
					message: {
						role: 'tool',
						tool_call_id: toolCall.id,
						tool_name: name,
						content: result.value,
					},
					result,
				}
			} catch (error) {
				debugPrint(debug, `🟥 Error: ${error.message}`)
				return {
					message: {
						role: 'tool',
						tool_call_id: toolCall.id,
						tool_name: toolCall.function.name,
						content: `Error: ${error.message}`,
					},
					result: null,
				}
			}
		}

		const results = agent.parallelToolCalls
			? await Promise.all(toolCalls.map(processToolCall))
			: await toolCalls.reduce(async (promise, toolCall) => {
					const arr = await promise
					const result = await processToolCall(toolCall)
					return [...arr, result]
			  }, Promise.resolve([]))

		for (const { message, result } of results) {
			partialResponse.messages.push(message)

			if (!result) continue
			if (result.data) Object.assign(partialResponse.data, result.data)
			if (result.agent) partialResponse.agent = result.agent
		}
		return partialResponse
	}

	async run(agent, messages, data = {}, modelOverride = null, stream = false, debug = true, maxTurns = Infinity, executeTools = true) {
		debugPrint(debug, '🟩 Starting swarm run')
		if (stream) {
			debugPrint(debug, '↪️ Delegating to runStream')
			return this.runStream(agent, messages, data, modelOverride, debug, maxTurns, executeTools)
		}

		let activeAgent = agent
		const history = [...messages]
		const initLen = messages.length

		while (history.length - initLen < maxTurns && activeAgent) {
			const completion = await this.getChatCompletion(activeAgent, history, data, modelOverride, stream, debug)
			const message = completion.choices[0].message
			message.sender = activeAgent.name
			history.push(message)

			if (!message.tool_calls || !executeTools) break
			const partialResponse = await this.handleToolCalls(message.tool_calls, activeAgent, data, debug)
			history.push(...partialResponse.messages)
			Object.assign(data, partialResponse.data)
			if (partialResponse.agent) activeAgent = partialResponse.agent
		}
		debugPrint(debug, '🟧 Ending swarm run')
		return new Response({
			messages: history.slice(initLen),
			agent: agentToJson(activeAgent),
			data,
		})
	}

	async *runStream(agent, messages, data = {}, modelOverride = null, debug = false, maxTurns = Infinity, executeTools = true) {
		debugPrint(debug, '🟩 Starting Swarm runStream')
		let activeAgent = agent
		const history = [...messages]
		const initLen = messages.length

		while (history.length - initLen < maxTurns) {
			const message = { content: '', sender: agent.name, role: 'assistant', function_call: null, tool_calls: {} }
			const completion = await this.getChatCompletion(activeAgent, history, data, modelOverride, true, debug)

			yield { delim: 'start' }
			for await (const chunk of completion) {
				const delta = chunk.choices[0].delta
				if (delta.role === 'assistant') delta.sender = activeAgent.name
				yield delta
				delete delta.role
				delete delta.sender
				mergeChunk(message, delta)
			}
			yield { delim: 'end' }

			message.tool_calls = Object.values(message.tool_calls)
			if (!message.tool_calls.length) message.tool_calls = null
			history.push(message)
			if (!message.tool_calls || !executeTools) break

			const toolCalls = message.tool_calls.map((tc) => ({ id: tc.id, type: tc.type, function: tc.function }))

			const partialResponse = await this.handleToolCalls(toolCalls, activeAgent, data, debug)
			history.push(...partialResponse.messages)
			Object.assign(data, partialResponse.data)
			if (partialResponse.agent) activeAgent = partialResponse.agent
		}
		debugPrint(debug, '🟧 Ending swarm stream')
		yield { response: new Response({ messages: history.slice(initLen), agent: agentToJson(activeAgent), data }) }
	}
}

export default Swarm
