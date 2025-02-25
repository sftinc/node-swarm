# node-swarm

A Node.js library for building AI agents. Create autonomous agents that can communicate with each other, use tools, and share/modify data.

## Installation

```
1. git clone https://github.com/seefusion/node-swarm.git
2. cd node-swarm
3. npm install
4. cp .env.example .env
5. Edit .env with your LLM API key
6. npm start (runs ./examples/1-simple.js)
```

## Quick Start

```javascript
import { Swarm, Agent } from 'node-swarm'
import dotenv from 'dotenv'
dotenv.config()

// Initialize Swarm with LLM settings
const swarm = new Swarm({
	apiKey: 'YOUR-LLM-API-KEY', // LLM API key
	baseURL: 'BASE-URL (defaults to OpenAI base URL)', // Optional: custom base URL
})

// Create a simple agent that transfers to Spanish
const useToSpeakSpanish = () => agentSpanish

// Create an English-speaking agent
const agentEnglish = new Agent({
	name: 'English Speaking Agent',
	instructions: 'You are a helpful assistant that only speaks English.',
	tools: [useToSpeakSpanish],
	model: 'gpt-4', // Optional: defaults to gpt-4
})

// Create a Spanish-speaking agent
const agentSpanish = new Agent({
	name: 'Spanish Speaking Agent',
	instructions: 'You are a helpful assistant that only speaks Spanish.',
})

// Define messages
const messages = [
	{
		role: 'user',
		content: 'Hola, ¿cómo estás?',
	},
]

// Run the swarm
const response = await swarm.run(agentEnglish, messages)
console.log(response)
```

### Swarm Client

The Swarm client accepts OpenAI configuration options:

```javascript
const swarm = new Swarm({
apiKey: string, // LLM API key
baseURL?: string, // LLM API URL
...LLMOptions // Any other LLM client options
dataParam?: string, // Custom data parameter name for Swarm (default: '\_data')
})
```

### Swarm.run()

Run a conversation with an agent:

```javascript
const response = await swarm.run(
	agent, // Agent instance
	messages, // Array of message objects
	(data = {}), // Optional: data context
	(modelOverride = null), // Optional: override agent's model
	(stream = false), // Optional: stream responses
	(debug = true), // Optional: show debug logs
	(maxTurns = Infinity), // Optional: max conversation turns
	(executeTools = true) // Optional: execute tools
)
```

### Agent

Create an AI agent:

```javascript
const agent = new Agent({
name: string, // Agent name
instructions: string | Function, // System instructions
tools?: Tool[] | Function[], // Available tools
model?: string, // OpenAI model
toolChoice?: 'auto' | 'none', // Tool selection mode
parallelToolCalls?: boolean // Run tools in parallel
})
```

### Tool

Create a tool for agents to use:

```javascript
const tool = new Tool({
title?: string, // Tool title
description?: string, // Tool description
function: Function, // Tool implementation
parameters?: Object // JSON Schema parameters
})
```

### Using Data in Functions and Instructions

Data can be passed and modified throughout the conversation:

```javascript
// Function that gets the temperature
const getTemperature = (_data) => {
	return { temperature: _data.temperature }
}

// Function that updates the temperature
const updateTemperature = (temp) => {
	return new Result({
		note: 'Temperature updated', // Optional: note detailing the tool's action
		data: { temperature: temp }, // Updates data context
	})
}

// Agent with data context in instructions
const agent = new Agent({
	name: 'Agent with data context',
	instructions: (_data) => `You are a helpful assistant that can update the temperature. The user is located in: ${_data.location}.`,
	tools: [updateTemperature],
})

// Input data context
const data = {
	temperature: 72,
	location: 'New York',
}

const response = await swarm.run(agent, messages, data)
console.log(response.data) // Access updated data
```

## Examples

Run examples using npm:

### 1. Simple Agent Transfer (\`npm run simple\`)

\```
npm run simple
\```
Demonstrates basic agent-to-agent communication. Shows how an English-speaking agent can transfer to a Spanish-speaking agent when needed. Teaches the basics of creating agents and automatic tool conversion from functions.

### 2. Tool Definition (\`npm run tool\`)

\```
npm run tool
\```
Shows explicit tool creation using the Tool class. Similar to the simple example but demonstrates how to add metadata (title, description) to tools for better LLM understanding. Teaches proper tool definition and configuration.

### 3. Parameter Validation (\`npm run params\`)

\```
npm run params
\```
Demonstrates how to create tools with parameter validation. Uses a weather API example to show how to define required parameters, enums, and parameter descriptions. Teaches input validation and parameter configuration for tools.

### 4. Data Context (\`npm run data\`)

\```
npm run data
\```
Shows how to use shared data context between agents and tools. Demonstrates updating user information and accessing data in agent instructions. Teaches data management, Result class usage, and dynamic instructions.

Each example builds on the previous one, introducing new concepts while maintaining the core agent-swarm functionality.

## MIT License

Copyright (c) 2025 See Fusion Technologies, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
