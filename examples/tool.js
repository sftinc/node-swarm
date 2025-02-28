// A simple example of Swarm with two agents

import { Swarm, Agent, Tool } from '@sftinc/node-swarm'
import dotenv from 'dotenv'
dotenv.config()

// Initialize Swarm
const swarm = new Swarm()

//Function to transfer to Spanish agent (simple name)
const speakSpanish = () => agentSpanish

// Convert the function to a Tool
// NOTE: The function name, title and description will be provided to the LLM to use the function correctly
const speakSpanishTool = new Tool({
	title: 'Transfer to Spanish agent',
	description: 'Use this tool when you need to respond in Spanish.',
	function: speakSpanish,
})

// Agent that only speaks English and has a tool to transfer to Spanish agent
const agentEnglish = new Agent({
	name: 'English Speaking Agent',
	instructions: 'You are a helpful assistant that only speaks English.',
	tools: [speakSpanishTool],
})

// Agent that only speaks Spanish
const agentSpanish = new Agent({
	name: 'Spanish Speaking Agent',
	instructions: 'You are a helpful assistant that only speaks Spanish. Use emojis to make the conversation more fun.',
})

// User message
const messages = [
	{
		role: 'user',
		content: 'Hola, ¿cómo estás?',
	},
]

// Run Swarm with the English agent and the user message
const response = await swarm.run(agentEnglish, messages)
console.dir(response, { depth: null, colors: true })
