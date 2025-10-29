//定义 agent
import { ChatDeepSeek } from "@langchain/deepseek"

import 'dotenv/config'

import { createAgent, tool } from 'langchain';

import * as z from 'zod'

// 这里的 node 要 20 以上才可以

const llm = new  ChatDeepSeek({
    model: 'deepseek-chat'
})

// define a tool
// 代码中定义了一个 tool getWeather 获取天气信息，但它是模拟的，并不是真的获取天气信息。不过这不影响 Agent 功能。
const getWeather = tool((input) => `It is always sunny in ${input.city}!`, {
    name: 'get_weather',
    description: 'Get the weather for a given city',
    schema: z.object({
        city: z.string().describe('The city to get the weather for')
    })
})

const agent = createAgent({
    model: llm,
    tools: [getWeather]
})

const res = await agent.invoke({
    messages: [
        {
            role: 'user',
            content: 'What is the weather in Tokyo?'
        }
    ]
})

console.log('res', res);

// 返回的 res 如下：

/**
 * HumanMessage: 用户发送的消息
 * AIMessage：  AI返回的消息，AI 判断用户输入的信息，需要调用 tool 并发起 tool call
 * ToolMessage：是调用 tool 的返回结果，即定义 tool 时那个函数返回的模拟的信息
 * AIMessage：是 agent 调用 llm ，把 tool 返回结果告诉 llm ，llm 返回了最终结果
 */

/**
 * res {
  messages: [
    HumanMessage {
      "id": "8a2d1c4d-f27d-434a-8d9f-a3ccf5244936",
      "content": "What is the weather in Tokyo?",
      "additional_kwargs": {},
      "response_metadata": {}
    },
    AIMessage {
      "id": "5978e428-70c5-4635-89ae-c5cb1e79555e",
      "content": "I'll check the weather in Tokyo for you.",
      "name": "model",
      "additional_kwargs": {
        "tool_calls": [
          {
            "index": 0,
            "id": "call_00_1PM3X98X3K0yMT3aKzHm2XVP",
            "type": "function",
            "function": "[Object]"
          }
        ]
      },
      "response_metadata": {
        "tokenUsage": {
          "promptTokens": 180,
          "completionTokens": 24,
          "totalTokens": 204
        },
        "finish_reason": "tool_calls",
        "model_provider": "openai",
        "model_name": "deepseek-chat",
        "usage": {
          "prompt_tokens": 180,
          "completion_tokens": 24,
          "total_tokens": 204,
          "prompt_tokens_details": {
            "cached_tokens": 0
          },
          "prompt_cache_hit_tokens": 0,
          "prompt_cache_miss_tokens": 180
        },
        "system_fingerprint": "fp_ffc7281d48_prod0820_fp8_kvcache"
      },
      "tool_calls": [
        {
          "name": "get_weather",
          "args": {
            "city": "Tokyo"
          },
          "type": "tool_call",
          "id": "call_00_1PM3X98X3K0yMT3aKzHm2XVP"
        }
      ],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "output_tokens": 24,
        "input_tokens": 180,
        "total_tokens": 204,
        "input_token_details": {
          "cache_read": 0
        },
        "output_token_details": {}
      }
    },
    ToolMessage {
      "id": "6c0cc35d-27d9-4e11-afe1-3a8c5e6ce26c",
      "content": "It is always sunny in Tokyo!",
      "name": "get_weather",
      "additional_kwargs": {},
      "response_metadata": {},
      "tool_call_id": "call_00_1PM3X98X3K0yMT3aKzHm2XVP"
    },
    AIMessage {
      "id": "e5f90eae-489a-4884-82cb-80f741aa6d88",
      "content": "The weather in Tokyo is sunny!",
      "name": "model",
      "additional_kwargs": {},
      "response_metadata": {
        "tokenUsage": {
          "promptTokens": 203,
          "completionTokens": 7,
          "totalTokens": 210
        },
        "finish_reason": "stop",
        "model_provider": "openai",
        "model_name": "deepseek-chat",
        "usage": {
          "prompt_tokens": 203,
          "completion_tokens": 7,
          "total_tokens": 210,
          "prompt_tokens_details": {
            "cached_tokens": 128
          },
          "prompt_cache_hit_tokens": 128,
          "prompt_cache_miss_tokens": 75
        },
        "system_fingerprint": "fp_ffc7281d48_prod0820_fp8_kvcache"
      },
      "tool_calls": [],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "output_tokens": 7,
        "input_tokens": 203,
        "total_tokens": 210,
        "input_token_details": {
          "cache_read": 128
        },
        "output_token_details": {}
      }
    }
  ]
}
 */