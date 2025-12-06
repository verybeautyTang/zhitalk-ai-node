//定义 agent
import { ChatDeepSeek } from "@langchain/deepseek"

import 'dotenv/config'

import { createAgent, tool } from 'langchain';


import { MemorySaver } from '@langchain/langgraph'
import * as z from 'zod'

// 这里的 node 要 20 以上才可以

const llm = new  ChatDeepSeek({
    model: 'deepseek-chat'
})


const systemPrompt = `You are an export weather forecaster, who speaks in puns.

You have access to two tools


- get_weather_for_location: use this to get the weather for a specific location
- get_user_location: use this to get user's location

If a user asks you for the weather, make sure you know the location. If you can tell from the question that they mean wherever they are, use the get_user_location tool to find their location.
`

// define a tool
// 代码中定义了一个 tool getWeather 获取天气信息，但它是模拟的，并不是真的获取天气信息。不过这不影响 Agent 功能。
const getWeather = tool((input) => `It is always sunny in ${input.city}!`, {
    name: 'get_weather',
    description: 'Get the weather for a given city',
    schema: z.object({
        city: z.string().describe('The city to get the weather for')
    })
})


const getUserLocation = tool((_, config) => {
    const { user_id } = config.context
    return user_id === '1' ? 'Florida' : 'SF'
}, {
    name: 'get_user_location',
    description: 'Retrieve user information based on user ID'
})


const responseFormat = z.object({
    punny_response: z.string(),
    weather_conditions: z.string().optional()
})


const checkpointer = new MemorySaver();

const config = {
    configurable: {thread_id: '1'},
    context: {user_id: '1'}
}

const agent = createAgent({
    model: llm,
    tools: [ getWeather,getUserLocation ],
    prompt: systemPrompt,
    responseFormat,
    checkpointer,
})



const res = await agent.invoke({
    messages: [
        {
            role: 'user',
            content: 'What is the weather  outside?'
        }
    ]
}, config)

// console.log('res', res);

/**
 * res {
  messages: [
    HumanMessage {
      "id": "3972c4a3-bd0f-41f1-896e-8eb5c0bec117",
      "content": "What is the weather  outside?",
      "additional_kwargs": {},
      "response_metadata": {}
    },
    AIMessage {
      "id": "3129e7e9-d91b-4e91-a7c0-7825a11f683b",
      "content": "",
      "name": "model",
      "additional_kwargs": {
        "tool_calls": [
          {
            "index": 0,
            "id": "call_00_kUCsmNKOXSFo4lEGmfiBHaLJ",
            "type": "function",
            "function": "[Object]"
          }
        ]
      },
      "response_metadata": {
        "tokenUsage": {
          "promptTokens": 328,
          "completionTokens": 14,
          "totalTokens": 342
        },
        "finish_reason": "tool_calls",
        "model_provider": "openai",
        "model_name": "deepseek-chat",
        "usage": {
          "prompt_tokens": 328,
          "completion_tokens": 14,
          "total_tokens": 342,
          "prompt_tokens_details": {
            "cached_tokens": 64
          },
          "prompt_cache_hit_tokens": 64,
          "prompt_cache_miss_tokens": 264
        },
        "system_fingerprint": "fp_ffc7281d48_prod0820_fp8_kvcache"
      },
      "tool_calls": [
        {
          "name": "get_user_location",
          "args": {
            "input": "current user"
          },
          "type": "tool_call",
          "id": "call_00_kUCsmNKOXSFo4lEGmfiBHaLJ"
        }
      ],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "output_tokens": 14,
        "input_tokens": 328,
        "total_tokens": 342,
        "input_token_details": {
          "cache_read": 64
        },
        "output_token_details": {}
      }
    },
    ToolMessage {
      "id": "4e266c28-529b-4d82-8824-410ff62de597",
      "content": "Florida",
      "name": "get_user_location",
      "additional_kwargs": {},
      "response_metadata": {},
      "tool_call_id": "call_00_kUCsmNKOXSFo4lEGmfiBHaLJ"
    },
    AIMessage {
      "id": "9d358667-292a-43dc-8de2-15b640c4a308",
      "content": "",
      "name": "model",
      "additional_kwargs": {
        "tool_calls": [
          {
            "index": 0,
            "id": "call_00_sGt8X7TI2SUzRUDWjS7bdUSs",
            "type": "function",
            "function": "[Object]"
          }
        ]
      },
      "response_metadata": {
        "tokenUsage": {
          "promptTokens": 346,
          "completionTokens": 12,
          "totalTokens": 358
        },
        "finish_reason": "tool_calls",
        "model_provider": "openai",
        "model_name": "deepseek-chat",
        "usage": {
          "prompt_tokens": 346,
          "completion_tokens": 12,
          "total_tokens": 358,
          "prompt_tokens_details": {
            "cached_tokens": 128
          },
          "prompt_cache_hit_tokens": 128,
          "prompt_cache_miss_tokens": 218
        },
        "system_fingerprint": "fp_ffc7281d48_prod0820_fp8_kvcache"
      },
      "tool_calls": [
        {
          "name": "get_weather",
          "args": {
            "city": "Florida"
          },
          "type": "tool_call",
          "id": "call_00_sGt8X7TI2SUzRUDWjS7bdUSs"
        }
      ],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "output_tokens": 12,
        "input_tokens": 346,
        "total_tokens": 358,
        "input_token_details": {
          "cache_read": 128
        },
        "output_token_details": {}
      }
    },
    ToolMessage {
      "id": "ec7d02f1-ff1f-497b-b91e-afbd4dc1aef0",
      "content": "It is always sunny in Florida!",
      "name": "get_weather",
      "additional_kwargs": {},
      "response_metadata": {},
      "tool_call_id": "call_00_sGt8X7TI2SUzRUDWjS7bdUSs"
    },
    AIMessage {
      "id": "d36d3559-2839-4579-b868-09bb072e3c83",
      "content": "",
      "additional_kwargs": {
        "tool_calls": [
          {
            "index": 0,
            "id": "call_00_cOjTqXjnieagvKo89ADL29BR",
            "type": "function",
            "function": "[Object]"
          }
        ]
      },
      "response_metadata": {
        "tokenUsage": {
          "promptTokens": 369,
          "completionTokens": 55,
          "totalTokens": 424
        },
        "finish_reason": "tool_calls",
        "model_provider": "openai",
        "model_name": "deepseek-chat",
        "usage": {
          "prompt_tokens": 369,
          "completion_tokens": 55,
          "total_tokens": 424,
          "prompt_tokens_details": {
            "cached_tokens": 128
          },
          "prompt_cache_hit_tokens": 128,
          "prompt_cache_miss_tokens": 241
        },
        "system_fingerprint": "fp_ffc7281d48_prod0820_fp8_kvcache"
      },
      "tool_calls": [
        {
          "name": "extract-3",
          "args": {
            "punny_response": "Looks like Florida is living up to its nickname as the Sunshine State! The weather outside is always sunny - perfect for a day at the beach or enjoying some orange juice!",
            "weather_conditions": "sunny"
          },
          "type": "tool_call",
          "id": "call_00_cOjTqXjnieagvKo89ADL29BR"
        }
      ],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "output_tokens": 55,
        "input_tokens": 369,
        "total_tokens": 424,
        "input_token_details": {
          "cache_read": 128
        },
        "output_token_details": {}
      }
    },
    AIMessage {
      "id": "35df3c1d-2a41-42f8-bb1b-78af3585f7e0",
      "content": "Returning structured response: {\"punny_response\":\"Looks like Florida is living up to its nickname as the Sunshine State! The weather outside is always sunny - perfect for a day at the beach or enjoying some orange juice!\",\"weather_conditions\":\"sunny\"}",
      "additional_kwargs": {},
      "response_metadata": {},
      "tool_calls": [],
      "invalid_tool_calls": []
    }
  ],
  structuredResponse: {
    punny_response: 'Looks like Florida is living up to its nickname as the Sunshine State! The weather outside is always sunny - perfect for a day at the beach or enjoying some orange juice!',
    weather_conditions: 'sunny'
  }
 */
console.log('structuredResponse', res.structuredResponse);

const thankYouResponse = await agent.invoke(
  { messages: [{ role: 'user', content: 'thank you!' }] },
  config
)
console.log(thankYouResponse)
