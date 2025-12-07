import { ChatDeepSeek } from '@langchain/deepseek'
import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import 'dotenv/config'

// tools 就是 function_call，llm 可以调用这个 tool获取到内容，整合后再次输出这个内容；
const llm = new ChatDeepSeek({
  // 用于判断回答问题的一个准确性
  temperature: 1.5,
  model: 'deepseek-chat',
})

const addTool = tool(
  (input) => {
    console.log(input)
    const sum = input.num1 + input.num2
    return `${input.num1} 加 ${input.num2} 等于 ${sum}`
  },
  {
    name: 'add',
    description: 'add two number together',
    schema: z.object({
      num1: z.number().describe('first add number'),
      num2: z.number().describe('second add number'),
    }),
  }
)

const weatherTool = tool(
  (input) => {
    return input.name + 'is ????'
  },
  {
    name: 'weather',
    description: 'Obtain the weather information of the city',
    schema: z.object({
      city: z.string().describe('the city name'),
    }),
  }
)
const llmWithTools = llm.bindTools([addTool, weatherTool])

console.log(await llmWithTools.invoke('今天广州增城区的天气怎么样？'))
console.log(await llmWithTools.invoke('2+3'))
