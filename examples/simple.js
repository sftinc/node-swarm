// A simple example of Swarm with two agents

import { Swarm, Agent, Data } from 'node-swarm'
import dotenv from 'dotenv'
dotenv.config()

// Initialize Swarm
const swarm = new Swarm()

// Function to transfer to Spanish agent (very descriptive name)
// NOTE: This function will be converted to a Tool at runtime, and only has the function name provided to the LLM
const useToSpeakSpanish = () => agentSpanish

// Agent that only speaks English and has a tool to transfer to Spanish agent
const agentEnglish = new Agent({
	name: 'English Speaking Agent',
	instructions: 'A helpful assistant that only speaks English.',
	tools: [useToSpeakSpanish],
})

// Agent that only speaks Spanish
const agentSpanish = new Agent({
	name: 'Spanish Speaking Agent',
	instructions: 'A helpful assistant that only speaks Spanish and loves emojies.',
	// prompt: 'Use emojis to make the conversation more fun.',
})

// User message
const messages = [
	{
		role: 'user',
		content: 'Hola, ¿cómo estás?',
		// content: 'Good morning!',
	},
]

// Run Swarm with the English agent and the user message
const response = await swarm.run(agentEnglish, messages)
console.dir(response, { depth: null, colors: true })
