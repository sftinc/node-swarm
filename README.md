# node-swarm

A Node.js library for building AI agents using OpenAI Swarm framework. Create autonomous agents that can communicate with each other, use tools, and share/modify data.

## Table of Contents

-   [Installation](#installation)
-   [Quick Start](#quick-start)
-   [Swarm Client](#swarm-client)
-   [Agent](#agent)
-   [Tool](#tool)
-   [Data](#data)
-   [Swarm Run](#swarm-run)
-   [Examples](#examples)
    -   [Simple Agent Transfer](#1-simple-agent-transfer)
    -   [Tool Definition](#2-tool-definition)
    -   [Parameter Validation](#3-parameter-validation)
    -   [Data Context](#4-data-context)

## Installation

### Option 1: Install from npm

```bash
npm install @sftinc/node-swarm
```

Create a `.env` file with your OpenAI API key:

```bash
OPENAI_API_KEY=your-api-key-here
```

Import the library:

```javascript
import { Swarm, Agent, Tool, Data } from '@sftinc/node-swarm'
```

### Option 2: Clone Repository

```bash
1. git clone https://github.com/sftinc/node-swarm.git
2. cd node-swarm
3. npm install
4. cp .env.example .env
5. Edit .env with your OpenAI API key
6. npm start (runs ./examples/simple.js)
```

Import the library:

```javascript
import { Swarm, Agent, Tool, Data } from 'node-swarm'
```

## Quick Start

```javascript
import { Swarm, Agent, Tool, Data } from 'node-swarm'
import dotenv from 'dotenv'
dotenv.config()

// Initialize Swarm with LLM settings
const swarm = new Swarm({
	apiKey: 'YOUR-LLM-API-KEY', // Optional: LLM API key (defaults: process.env.OPENAI_API_KEY)
	baseURL: 'BASE-URL (defaults to OpenAI base URL)', // Optional: LLM API URL (defaults: OpenAI base URL)
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
	instructions: 'A helpful assistant that only speaks Spanish and loves emojies.',
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
console.dir(response, { depth: null, colors: true })
```

### Swarm Client

The Swarm client accepts OpenAI configuration options:

```javascript
const swarm = new Swarm({
	(defaultModel): string, // Optional: Default model to use for Swarm Agents (default: 'gpt-4o')
	(dataParam): string, // Optional: Custom data parameter name for Swarm Agents and Tools (default: '\_data')
	(apiKey): string, // Optional: LLM API key (defaults: process.env.OPENAI_API_KEY)
	(baseURL): string, // Optional: LLM API URL (defaults: OpenAI base URL)
	(...LLMOptions): // Optional:Any other LLM client options
})
```

### Agent

Create an AI agent:

```javascript
const agent = new Agent({
	name: string // Agent name
	(instructions): string // Optional: System instructions
	(prompt): string | Function // Optional: Custom prompt
	(tools): Tool[] | Function[] // Optional: Available tools
	(toolChoice = 'auto') // Optional: Tool selection mode
	(parallelToolCalls = false): boolean // Optional: Run tools in parallel
	(model = null): string, // Optional: Defaults to Swarm.defaultModel
})
```

### Tool

Create a tool for agents to use:

```javascript
const tool = new Tool({
	title: string, // Tool title
	description: string, // Optional: Description of what the tool does
	function: Function, // A function to call when a tool is used
	(parameters): Object // Optional: JSON Schema parameters
})
```

### Data

Data can be passed and modified throughout the conversation. The data is passed to a function or Agent instruction via the dataParam (defaults to \_data - [see Swarm Client](#swarm-client)) :

> **Important**: Agent instructions only have access to data passed via `Swarm.run(agent, messages, data <--)`. Instructions cannot access any other external data or functions.

```javascript
// Function that gets the temperature
const getTemperature = (_data) => {
	return { temperature: _data.temperature }
}

// Function that updates the temperature
const updateTemperature = (temp) => {
	return new Data({
		note: 'Temperature updated', // Note detailing the tool's action
		data: { temperature: temp }, // Updates data object based on key
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
console.dir(response.data, { depth: null, colors: true }) // Access updated data
```

### Swarm Run

Run a conversation with an agent:

```javascript
const swarm = new Swarm()

const response = await swarm.run({
	agent: string // Agent instance
	messages: array // Array of message objects
	(data = {}): object // Optional: data context
	(modelOverride = null): string // Optional: override all agents' model
	(stream = false): boolean // Optional: stream responses
	(debug = true): boolean // Optional: show debug logs
	(maxTurns = Infinity): number // Optional: max conversation turns
	(executeTools = true): boolean // Optional: execute tools
})
```

## Examples

Run examples using npm:

### 1. Simple Agent Transfer

```
npm run simple
```

Demonstrates basic agent-to-agent communication. Shows how an English-speaking agent can transfer to a Spanish-speaking agent when needed. Teaches the basics of creating agents and automatic tool conversion from functions.

### 2. Tool Definition

```
npm run tool
```

Shows explicit tool creation using the Tool class. Similar to the simple example but demonstrates how to add metadata (title, description) to tools for better LLM understanding. Teaches proper tool definition and configuration.

### 3. Parameter Validation

```
npm run params
```

Demonstrates how to create tools with parameter validation. Uses a weather API example to show how to define required parameters, enums, and parameter descriptions. Teaches input validation and parameter configuration for tools.

### 4. Data Context

```
npm run data
```

Shows how to use shared data context between agents and tools. Demonstrates updating user information and accessing data in agent instructions. Teaches data management, Data class usage, and dynamic instructions.

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
