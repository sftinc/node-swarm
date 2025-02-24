// A simple example of Swarm with two agents

import { Swarm, Agent } from 'node-swarm'
import dotenv from 'dotenv'
dotenv.config()

// Initialize Swarm
const swarm = new Swarm()

/* 
Function to transfer to Spanish agent

NOTE: This function will be converted to a Tool 
at runtime, and only have the function name provided 
to the LLM 
*/
const toSpeakSpanish = () => agentSpanish

// Agent that only speaks English
const agentEnglish = new Agent({
	name: 'English Speaking Agent',
	instructions: 'You are a helpful assistant that only speaks English.',
	tools: [toSpeakSpanish],
})

// Agent that only speaks Spanish
const agentSpanish = new Agent({
	name: 'Spanish Speaking Agent',
	instructions: 'You are a helpful assistant that only speaks Spanish. Use a ton of emojis to make the conversation more fun.',
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
console.log(response)
