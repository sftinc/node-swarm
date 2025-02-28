const debugPrint = (debug, ...args) => {
	if (!debug) return
	const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0]
	console.log(`\x1b[97m[\x1b[90m${timestamp}\x1b[97m]\x1b[90m`, ...args, '\x1b[0m')
}

const mergeFields = (target, source) => {
	for (const [key, value] of Object.entries(source)) {
		if (typeof value === 'string') {
			if (!target[key] || !target[key].endsWith(value)) {
				target[key] = (target[key] || '') + value
			}
		} else if (value !== null && typeof value === 'object') {
			if (!target[key]) target[key] = {}
			mergeFields(target[key], value)
		}
	}
}

const mergeChunk = (finalResponse, delta) => {
	delete delta.role
	mergeFields(finalResponse, delta)

	const toolCalls = delta.tool_calls
	if (toolCalls && toolCalls.length > 0) {
		const index = toolCalls[0].index
		delete toolCalls[0].index
		mergeFields(finalResponse.tool_calls[index], toolCalls[0])
	}
}

const functionToJson = (func) => {
	const funcStr = func.toString()
	const params = funcStr.match(/\(([^)]*)\)/)
	const properties = {}
	const required = []

	if (params) {
		let functParams = params[1]
			.split(',')
			.map((p) => p.trim())
			.map((p) => {
				p = p
					.split('=')[0]
					.replace(/^\.\.\./, '')
					.trim()
				return p
			})
			.filter((p) => p)

		for (const param of functParams) {
			properties[param] = {
				type: 'string',
			}
			required.push(param)
		}
	}

	return {
		parameters: {
			type: 'object',
			properties,
			required,
			additionalProperties: false,
		},
	}
}

const agentToJson = (agent) => ({
	name: agent.name,
	model: agent.model,
	prompt: agent.prompt,
	functions: agent.tools.map((fn) => fn.name),
	toolChoice: agent.toolChoice,
	parallelToolCalls: agent.parallelToolCalls,
})

export { debugPrint, mergeFields, mergeChunk, functionToJson, agentToJson }
