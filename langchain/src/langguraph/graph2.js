// 新建 JS 文件 src/graph2.js ，并定义三个 tool 来模拟数学计算
import { tool } from '@langchain/core/tools'
import * as z from 'zod'
import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'
import { task, entrypoint } from '@langchain/langgraph'

const addFunction = tool(({ a, b }) => a + b, {
  name: 'add',
  description: '两个数字相加',
  schema: z.object({
    a: z.number().describe('第一个数字'),
    b: z.number().describe('第二个数字'),
  }),
})

const multiplyFunction = tool(({ a, b }) => a * b, {
  name: 'multiply',
  description: '两个数字相乘',
  schema: z.object({
    a: z.number().describe('第一个数字'),
    b: z.number().describe('第二个数字'),
  }),
})

const divideFunction = tool(({ a, b }) => a / b, {
  name: 'divide',
  description: '两个数字相除',
  schema: z.object({
    a: z.number().describe('第一个数字'),
    b: z.number().describe('第二个数字'),
  }),
})

const llm = new ChatDeepSeek({
  model: 'deepseek',
  apiKey: process.env.DEEPSEEK_API_KEY,
})

const toolsByName = {
  [add.name]: addFunction,
  [multiply.name]: multiplyFunction,
  [divide.name]: divideFunction,
}

const tools = Object.value(toolsByName)

const modelWithTools = llm.bindTools(tools)

const callModel = task({ name: 'callLlm' }, async (messages) => {
  return modelWithTools.invoke([
    new SystemMessage(
      'You are a helpful assistant tasked with performing arithmetic on a set of inputs.'
    ),
    ...messages,
  ])
})

const callTool = task({ name: 'callTool' }, async (toolCall) => {
  const tool = toolsByName[toolCall.name]
  return tool.invoke(toolCall)
})

const agent = entrypoint({ name: 'agent' }, async (messages) => {
  // 先调用 llm
  let modelResponse = await callModel(messages)

  // 一个无限循环
  while (true) {
    // 看是否需要 tool call
    if (!modelResponse.tool_calls?.length) {
      // 不需要则退出循环
      break
    }

    // 执行 tool
    const toolResults = await Promise.all(
      modelResponse.tool_calls.map((toolCall) => callTool(toolCall))
    )
    // 将 tool 执行结果再调用 llm
    messages = addMessages(messages, [modelResponse, ...toolResults])
    modelResponse = await callModel(messages)
  }

  return messages
})

const result = await agent.invoke([new HumanMessage('Add 3 and 4.')])

for (const message of result) {
  console.log(`[${message.getType()}]: ${message.text}`)
}
