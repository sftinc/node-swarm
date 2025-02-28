class BaseAgent {
	constructor({
		name = '',
		instructions = '',
		prompt = '',
		tools = [],
		toolChoice = 'auto',
		parallelToolCalls = false,
		model = null,
	} = {}) {
		this.name = name
		this.instructions = instructions
		this.prompt = prompt
		this.tools = tools
		this.toolChoice = toolChoice
		this.parallelToolCalls = parallelToolCalls
		this.model = model
	}
}

class BaseTool {
	constructor({ title = '', description = '', function: func = null, parameters = {} } = {}) {
		this.name = func?.name || null
		this.title = title
		this.description = description
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

export { BaseAgent, BaseTool, Response, Result }
