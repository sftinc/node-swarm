// Using Swarm data object to be used by functions and instructions

import { Swarm, Agent, Tool, Data } from 'node-swarm'
import dotenv from 'dotenv'
dotenv.config()

// Initialize Swarm
const swarm = new Swarm()

//Function to update the user information
const updateUser = (name, age, _data) => {
	const user = _data.user

	user.name = name || user.name
	user.age = age || user.age

	// Make sure to return the key and all data for that key
	return new Data({
		note: `User Updated: ${JSON.stringify(user)}`,
		data: { user },
	})
}
const updateUserTool = new Tool({
	title: 'Update User Information',
	description: 'Use this tool when you need to update the user information.',
	function: updateUser,
	parameters: {
		name: {
			type: 'string',
			description: 'The name of the user',
			optional: true,
		},
		age: {
			type: 'number',
			description: 'The age of the user',
			minimum: 0,
			maximum: 120,
			optional: true,
		},
	},
})

// Orchestrator agent that has access to data, time/date and tools
const orchestrator = new Agent({
	name: 'Orchestrator Agent',
	// Instructions can have access to data using the dataParam via a function
	instructions: (_data) =>
		`You are a helpful assistant. Personalize all responses.\n\nMy information is: ${JSON.stringify(
			_data.user
		)}.\n\nThe current date and time is: ${new Date().toISOString()}.`,
	tools: [updateUserTool],
})

// User message
const messages = [
	{
		role: 'user',
		content: 'Change my name to Bob Smith.',
	},
]

// Data object
const data = {
	user: {
		name: 'John Doe',
		age: 30,
	},
	other: 'some other data',
}

// Run Swarm with the orchestrator agent and the user message
const response = await swarm.run(orchestrator, messages, data)
console.log(response)
