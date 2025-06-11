# Basic Server MCP
This is a basic implementation of an MCP server using Express.js. I used OpenRouter with GPT-4.0 as the MCP client.
## How to run:
- First, start the products server by running "node server.js". After that, you can start the MCP server using the command "node mcp.js".
- Remember to provide a valid OpenRouter API key to use the models. To do this, get your own API key from https://openrouter.ai/settings/keys and create a .env file using the structure provided in .env.example.

## Prompts:
You can enter prompts related to the products served by the server, such as:
- "Give me the list of all products" or
- "What's the most expensive product and the cheapest one"
