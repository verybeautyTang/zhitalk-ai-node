/** 获取代理agent */

import { ChatDeepSeek } from '@langchain/deepseek'
import * as z from 'zod'
import { createAgent } from 'langchain'
import { TavilySearch } from '@langchain/tavily'
import 'dotenv/config'


// 创建llm模型
const llm = new ChatDeepSeek({
    model: 'deepseek-chat'
})

// 获取天气的工具
const weatherTool = new TavilySearch( (input) => `It's always sunny in ${input.city}!`,{
    name: 'get_weather',
    description: 'Get the weather for a given city',
    schema: z.object({
        query: 'what is the crurrent weather in Beijing',
        city: z.string().describe('input city name')
    })
})

// 获取agent
const agent = createAgent({
    model: llm,
    tools: [weatherTool]
})

const res = await agent.invoke({
    messages: [
        {
            role: 'user',
            content: 'please tell me what is the weather in beijing'
        }
    ]
})

console.log('res', res)