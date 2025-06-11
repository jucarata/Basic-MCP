import axios from 'axios';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const tools = [
  {
    type: "function",
    function: {
      name: "listar_productos",
      description: "Devuelve los productos disponibles desde la API",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "obtener_producto_por_id",
      description: "Devuelve un producto específico basado en su ID",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "El ID del producto que se desea obtener"
          }
        },
        required: ["id"]
      }
    }
  }
];

async function obtenerProductos() {
  try {
    const response = await axios.get("http://localhost:3000/products");
    return response.data;
  } catch (err) {
    console.error("Error llamando a /products:", err.message);
    return [];
  }
}

async function obtenerProductoPorId(id) {
  try {
    const response = await axios.get(`http://localhost:3000/products/${id}`);
    return response.data;
  } catch (err) {
    console.error("Error llamando a /products/:id:", err.message);
    return { error: "Producto no encontrado" };
  }
}


async function callMCP(userMessage) {
  const messages = [
    {
      role: "user",
      content: userMessage
    }
  ];

  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "openai/gpt-4o",
      messages,
      tools,
      tool_choice: "auto",
      max_tokens: 100
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const message = response.data.choices[0].message;
    console.log("\nRespuesta inicial del modelo:", message);

    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      if (toolCall.function.name === "listar_productos") {
        const productos = await obtenerProductos();

        const secondResponse = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
          model: "mistralai/mistral-7b-instruct",
          messages: [
            ...messages,
            message,
            {
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(productos)
            }
          ]
        }, {
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          }
        });

        console.log("\nRespuesta final del modelo:");
        console.log(secondResponse.data.choices[0].message.content);
      }
    } else if (toolCall.function.name === "obtener_producto_por_id") {
        const args = JSON.parse(toolCall.function.arguments);
        const producto = await obtenerProductoPorId(args.id);

        const secondResponse = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
        model: "mistralai/mistral-7b-instruct",
        messages: [
            ...messages,
            message,
            {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(producto)
            }
        ]
        }, {
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        }
        });

        console.log("\nRespuesta final del modelo:");
        console.log(secondResponse.data.choices[0].message.content);
    }
    
    else {
      console.log("\nEl modelo respondió directamente:");
      console.log(message.content);
    }

  } catch (error) {
    console.error("Error general:", error.response?.data || error.message);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Ingresa tu mensaje para el modelo: ", (input) => {
  callMCP(input);
  rl.close();
});