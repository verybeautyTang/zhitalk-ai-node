// 新建 JS 文件 src/graph2.js ，并定义三个 tool 来模拟数学计算
import { tool } from '@langchain/core/tools'
import * as z from 'zod'
import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'
import {
  task,
  entrypoint,
  addMessages,
  MessagesZodMeta,
  MemorySaver,
  getPreviousState,
} from '@langchain/langgraph'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'
import { registry } from '@langchain/langgraph/zod'

const addFunction = tool(({ a, b }) => a + b, {
  name: 'addFunction',
  description: '两个数字相加',
  schema: z.object({
    a: z.number().describe('第一个数字'),
    b: z.number().describe('第二个数字'),
  }),
})

const multiplyFunction = tool(({ a, b }) => a * b, {
  name: 'multiplyFunction',
  description: '两个数字相乘',
  schema: z.object({
    a: z.number().describe('第一个数字'),
    b: z.number().describe('第二个数字'),
  }),
})

const divideFunction = tool(({ a, b }) => a / b, {
  name: 'divideFunction',
  description: '两个数字相除',
  schema: z.object({
    a: z.number().describe('第一个数字'),
    b: z.number().describe('第二个数字'),
  }),
})

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

// 创建记忆
const checkpointer = new MemorySaver()

// Memory 需要一个 thread_id ，每个对话一个 id ，防止混乱
const config = {
  configurable: { thread_id: 'xxx' },
}

const toolsByName = {
  [divideFunction.name]: addFunction,
  [multiplyFunction.name]: multiplyFunction,
  [divideFunction.name]: divideFunction,
}

const tools = Object.values(toolsByName)

const modelWithTools = llm.bindTools(tools)

// 定义 MessagesState 它将用于存储 AI messages 消息列表，和 llmCalls llm 调用的次数

const MessagesState = z.object({
  messages: z.array(z.custom()).register(registry, MessagesZodMeta),
  llmCalls: z.number().optional(),
})

// callModel Task（调用模型任务）：指的是要做什么，是意图和目标的抽象描述。
// 这里创建一个 task

const callModel = task({ name: 'llmCalls' }, async (messages) => {
  return modelWithTools.invoke([
    new SystemMessage('你是一个非常专业的数学专家，对所有数学运算都了如指掌'),
    ...messages,
  ])
})

// 在定义一个task，用于调用 tools，
const callTask = task({ name: 'callTool' }, async (tollCall) => {
  const tool = toolsByName[tollCall.name]
  return tool.invoke(tollCall)
})

const agent = entrypoint({ name: 'agent', checkpointer }, async (messages) => {
  const previousState = getPreviousState(MessagesState) ?? {
    messages: [],
    llmCalls: 0,
  }
  // LangGraph 函数式 API 不会自动拼接历史，这里手动合并
  let newMessages = addMessages(previousState.messages ?? [], messages)
  let totalLlmCalls = previousState.llmCalls ?? 0
  // 先调用 llm
  let modelResponse = await callModel(newMessages)

  // 一个无限循环--如果一直需要调用工具，就一直循环调用工具
  while (true) {
    totalLlmCalls++
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
    newMessages = addMessages(newMessages, [modelResponse, ...toolResults])
    modelResponse = await callModel(newMessages)
  }

  return {
    messages: addMessages(newMessages, [modelResponse]), //最后返回的消息队列要加上最后一次大模型的回复，这样最终回复才能完整

    llmCalls: totalLlmCalls,
  }
})
const result1 = await agent.invoke([new HumanMessage('3 + 4等于多少')], config)

const result2 = await agent.invoke(
  {
    messages: [new HumanMessage('1 + 2 等于多少')],
  },
  config
)

const result3 = await agent.invoke(
  {
    messages: [new HumanMessage('这两轮结果相减是多少')],
  },
  config
)

const result4 = await agent.invoke(
  {
    messages: [new HumanMessage('我刚刚问了一些什么问题？')],
  },
  config
)
for (const message of result4.messages) {
  console.log(`[${message.getType()}]: ${message.text}`)
}
