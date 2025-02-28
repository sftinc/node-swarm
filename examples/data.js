// Using Swarm data object to be used by functions and instructions

import { Swarm, Agent, Tool, Data } from '@sftinc/node-swarm'
import dotenv from 'dotenv'
dotenv.config()

// Initialize Swarm
const swarm = new Swarm()

//Function to get the user information
const getUser = (_data) => {
	// return the user information to provide context to the agent
	return _data.user
}
const getUserTool = new Tool({
	title: 'Get User Information',
	description: 'Used to get the current user information.',
	function: getUser,
})

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
	description: 'Used to update the current user information.',
	function: updateUser,
	parameters: {
		name: {
			type: 'string',
			description: 'The full name of the user',
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
	prompt: (_data) => `You are a helpful assistant. Personalize all responses.\n\nCurrent Date/Time:\n${_data.dateTime}`,
	tools: [getUserTool, updateUserTool],
})

// User message
const messages = [
	{
		role: 'user',
		// content: 'What is my name?',
		content: 'Change my last name to Smith.',
	},
]

// Data object
const data = {
	user: {
		name: 'John Doe',
		age: 30,
	},
	dateTime: new Date().toISOString(),
}

// Run Swarm with the orchestrator agent and the user message
const response = await swarm.run(orchestrator, messages, data)
console.dir(response, { depth: null, colors: true })
