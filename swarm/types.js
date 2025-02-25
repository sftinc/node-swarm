import { functionToJson } from './utils.js'

class Agent {
	constructor({ name, instructions, tools = [], toolChoice = 'auto', parallelToolCalls = false, model = 'gpt-4o' } = {}) {
		console.log('Agent constructor', { name, instructions, tools, toolChoice, parallelToolCalls, model })

		if (!Array.isArray(tools)) {
			throw new TypeError('Agent tools must be an array')
		}

		const processedTools = tools.map((tool) => {
			if (tool instanceof Tool) return tool
			return new Tool({ function: tool })
		})

		this.name = name || 'Agent (add agent name)'
		this.instructions = instructions || 'You are a helpful agent.'
		this.tools = processedTools
		this.toolChoice = toolChoice
		this.parallelToolCalls = parallelToolCalls
		this.model = model
	}
}

class Tool {
	constructor({ title, description, function: func, parameters: params = {} } = {}) {
		if (!func || typeof func !== 'function') {
			throw new Error('A tool function is required and must be a function')
		}

		const schema = func ? functionToJson(func) : {}
		const parameters = schema?.parameters || {}

		for (const key in parameters?.properties) {
			parameters.properties[key] = params[key] ? { ...parameters.properties[key], ...params[key] } : parameters.properties[key]
			if (parameters.properties[key]?.optional) parameters.required = parameters.required.filter((param) => param !== key)
		}

		this.name = func?.name
		this.title = title || func?.name
		this.description = description || `This tool is used to ${func?.name}`
		this.function = func
		this.parameters = parameters
	}
}

class Response {
	constructor({ messages = [], data = {}, agent = null } = {}) {
		this.messages = messages
		this.data = data
		this.agent = agent
	}
}

class Result {
	constructor({ note = '', data = {}, agent = null } = {}) {
		this.note = note
		this.data = data
		this.agent = agent
	}
}

class Data {
	constructor(note = '', data = {}) {
		return new Result({
			note,
			data,
		})
	}
}

// class StreamMessageToolCall {
// 	constructor({ id, function: func, type }) {
// 		this.id = id
// 		this.function = func
// 		this.type = type
// 	}
// }

// class StreamFunction {
// 	constructor({ name, args }) {
// 		this.name = name
// 		this.arguments = args
// 	}
// }

export { Agent, Tool, Response, Result, Data }
