import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'
import { tool } from '@langchain/core/tools'
import * as z from 'zod'
import { MessagesZodMeta } from '@langchain/langgraph'
import { registry } from '@langchain/langgraph/zod'
import { SystemMessage } from '@langchain/core/messages'
import { isAIMessage } from '@langchain/core/messages'
import { HumanMessage } from '@langchain/core/messages'
import { StateGraph, START, END } from '@langchain/langgraph'
import dotenv from 'dotenv'
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres'

dotenv.config()

async function createPostgresSaver() {
  console.log('Creating PostgreSQL checkpoint...')
  // 初始化 PostgreSQL checkpoint
  if (!process.env.DB_URL) {
    console.warn('DB_URL not found in environment variables. Checkpoint will not be used.')
    return null
  }

  const checkpointer = PostgresSaver.fromConnString(process.env.DB_URL)
  // 初始化数据库表结构（异步操作，会在首次使用时自动执行）
  try {
    console.log('Setting up PostgreSQL checkpoint...')
    await checkpointer.setup()
    console.log('PostgreSQL checkpoint setup successfully')
    return checkpointer
  } catch (err) {
    console.error('Failed to setup PostgreSQL checkpoint:', err)
  }
}

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

// Define tools
const add = tool(({ a, b }) => a + b, {
  name: 'add',
  description: 'Add two numbers',
  schema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
})

const multiply = tool(({ a, b }) => a * b, {
  name: 'multiply',
  description: 'Multiply two numbers',
  schema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
})

const divide = tool(({ a, b }) => a / b, {
  name: 'divide',
  description: 'Divide two numbers',
  schema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
})

// Augment the LLM with tools
const toolsByName = {
  [add.name]: add,
  [multiply.name]: multiply,
  [divide.name]: divide,
}
const tools = Object.values(toolsByName)
const modelWithTools = llm.bindTools(tools)

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

async function createAgent() {
  const checkpointer = await createPostgresSaver()
  const agent = graph.compile({ checkpointer })
  console.log('Agent created successfully')
  return agent
}

const agent = await createAgent()
console.log('Agent created successfully')

// Invoke
const result = await agent.invoke(
  {
    messages: [new HumanMessage('Add 3 and 4.')],
  },
  {
    configurable: {
      thread_id: 'thread-1',
    },
  }
)
for (const message of result.messages) {
  console.log(`[${message.getType()}]: ${message.text}`)
}
