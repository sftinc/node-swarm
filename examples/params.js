// Using a Tool to define input parameters for the function

import { Swarm, Agent, Tool } from 'node-swarm'
import dotenv from 'dotenv'
dotenv.config()

// Initialize Swarm
const swarm = new Swarm()

//Function to get the weather for today (current) or for the next 3 days (forecast)
const getWeather = (type) => {
	const fakeApi = {
		current: { weather: 'sunny', temp: 70 },
		forecast: [
			{ weather: 'cloudy', temp: 60 },
			{ weather: 'rainy', temp: 50 },
			{ weather: 'sunny', temp: 75 },
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
	instructions: `You are a helpful assistant. Today's date is ${new Date().toISOString()}.`,
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
console.log(response)
