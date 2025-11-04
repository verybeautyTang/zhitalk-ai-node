// 新建 JS 文件 src/graph1.js ，并定义三个 tool 来模拟数学计算
import { tool } from '@langchain/core/tools'
import * as z from 'zod'
import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'
import { MessagesZodMeta, MemorySaver } from '@langchain/langgraph'
import { registry } from '@langchain/langgraph/zod'
import { SystemMessage, HumanMessage, BaseMessage } from '@langchain/core/messages'
import { isAIMessage } from '@langchain/core/messages'
import { StateGraph, START, END } from '@langchain/langgraph'

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

// 定义 deepseek llm 绑定三个 tool ，再调用 llm 时即可自动调用这些 tool

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

const toolsByName = {
  [addFunction.name]: addFunction,
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

async function llmCall(state) {
  const newMessages = await modelWithTools.invoke([
    new SystemMessage(
      'You are a helpful assistant tasked with performing arithmetic on a set of inputs.'
    ),
    ...state.messages,
  ])

  const newLlmCalls = (state.llmCalls ?? 0) + 1
  return {
    messages: newMessages,
    llmCalls: newLlmCalls,
  }
}

async function toolNode(state) {
  const lastMessage = state.messages.at(-1)

  if (lastMessage == null || !isAIMessage(lastMessage)) {
    return { messages: [] }
  }

  const result = []
  for (const toolCall of lastMessage.tool_calls ?? []) {
    const tool = toolsByName[toolCall.name]
    const observation = await tool.invoke(toolCall)
    result.push(observation)
  }

  return { messages: result }
}

async function shouldContinue(state) {
  const lastMessage = state.messages.at(-1)
  if (lastMessage == null || !isAIMessage(lastMessage)) return END

  // If the LLM makes a tool call, then perform an action
  if (lastMessage.tool_calls?.length) {
    return 'toolNode'
  }

  // Otherwise, we stop (reply to the user)
  return END
}

const graph = new StateGraph(MessagesState)
  .addNode('llmCall', llmCall)
  .addNode('toolNode', toolNode)
  .addEdge(START, 'llmCall')
  .addConditionalEdges('llmCall', shouldContinue, ['toolNode', END])
  .addEdge('toolNode', 'llmCall')
// 创建记忆
const checkpointer = new MemorySaver()

const agent = graph.compile({
  checkpointer,
})

// Memory 需要一个 thread_id ，每个对话一个 id ，防止混乱
const config = {
  configurable: { thread_id: 'xxx' },
}

// Invoke
try {
  const result1 = await agent.invoke(
    {
      messages: [new HumanMessage('2乘以 17 等于多少？')],
    },
    config
  )
} catch (err) {
  console.error('API error:', err?.message ?? err)
  // 如果 SDK 有响应体，打印更多细节
  console.error('Full error:', err?.response?.data ?? err)
  process.exit(1)
}

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
