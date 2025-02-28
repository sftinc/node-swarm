// Using a Tool to define input parameters for the function

import { Swarm, Agent, Tool } from '@sftinc/node-swarm'
import dotenv from 'dotenv'
dotenv.config()

// Initialize Swarm
const swarm = new Swarm()

//Function to get the weather for today (current) or for the next 3 days (forecast)
const getWeather = (type) => {
	const addDays = (num) => new Date(new Date().setDate(new Date().getDate() + num)).toISOString().split('T')[0]
	const fakeApi = {
		current: { date: addDays(0), weather: 'sunny', temp: 70 },
		forecast: [
			{ date: addDays(1), weather: 'cloudy', temp: 60 },
			{ date: addDays(2), weather: 'rainy', temp: 50 },
			{ date: addDays(3), weather: 'sunny', temp: 75 },
		],
	}
	return fakeApi[type]
}

// Define the tool with parameters
const getWeatherTool = new Tool({
	title: 'Get the weather',
	description: 'Use this tool when you need to get weather information. current: for today, forecast: for the next 3 days.',
	function: getWeather,
	parameters: {
		type: {
			type: 'string',
			description: 'The type of weather information to get',
			enum: ['current', 'forecast'],
			// NOTE: All params are required unless you add optional: true
		},
	},
})

// Orchestrator agent that will use the tool w/ current time as context
const orchestrator = new Agent({
	name: 'Orchestrator Agent',
	instructions: `You are a helpful assistant. Today's date/time is ${new Date().toISOString()}.`,
	tools: [getWeatherTool],
})

// User message
const messages = [
	{
		role: 'user',
		content: 'What is the weather going to be like tomorrow?',
	},
]

// Run Swarm with the orchestrator agent and the user message
const response = await swarm.run(orchestrator, messages)
console.dir(response, { depth: null, colors: true })
