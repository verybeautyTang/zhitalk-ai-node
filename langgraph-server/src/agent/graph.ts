import { StateGraph, Annotation } from '@langchain/langgraph'
import { ChatDeepSeek } from '@langchain/deepseek'
import { BaseMessage, ToolMessage, SystemMessage } from '@langchain/core/messages'
import { TavilySearch } from '@langchain/tavily'

const tavilySearchTool = new TavilySearch({
  maxResults: 3,
  topic: 'general',
})

const SYSTEM_PROMPT = new SystemMessage({
  content: 'You are a helpful AI assistant',
})

const tools = [tavilySearchTool]

// 创建工具映射，方便根据名称查找工具
const toolsByName = Object.fromEntries(tools.map((tool) => [tool.name, tool]))

// 定义 MessagesAnnotation
const MessagesAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => [],
  }),
})

// 定义 ConfigurationSchema
const ConfigurationSchema = Annotation.Root({})

// 定义状态类型
type State = typeof MessagesAnnotation.State & typeof ConfigurationSchema.State

// 创建 LLM 模型实例并绑定 tools
// 注意：需要在 .env 文件中设置 DEEPSEEK_API_KEY
const model = new ChatDeepSeek({
  model: 'deepseek-chat',
  temperature: 0,
}).bindTools(tools)

// 定义 callModel 节点
async function callModel(state: State) {
  const messages = state.messages as BaseMessage[]

  // 在模型调用前注入 system prompt（若需要可根据实际逻辑避免重复注入）
  const inputMessages = [SYSTEM_PROMPT, ...messages]

  const response = await model.invoke(inputMessages)
  return { messages: [response] }
}

// 定义 tools 节点，处理工具调用
async function toolsNode(state: State) {
  const messages = state.messages as BaseMessage[]
  const lastMessage = messages[messages.length - 1]
  const toolMessages: ToolMessage[] = []

  if (lastMessage && 'tool_calls' in lastMessage && Array.isArray(lastMessage.tool_calls)) {
    // 执行所有工具调用
    for (const toolCall of lastMessage.tool_calls) {
      const tool = toolsByName[toolCall.name]
      if (tool) {
        const result = await tool.invoke(toolCall.args)
        toolMessages.push(
          new ToolMessage({
            content: JSON.stringify(result),
            tool_call_id: toolCall.id,
          })
        )
      }
    }
  }

  return { messages: toolMessages }
}

// 定义路由函数，决定是否调用 tools
function routeModelOutput(state: State) {
  const messages = state.messages as BaseMessage[]
  const lastMessage = messages[messages.length - 1]
  // 如果最后一条消息包含 tool calls，则路由到 tools 节点
  if (
    lastMessage &&
    'tool_calls' in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls.length > 0
  ) {
    return 'tools'
  }
  // 否则结束
  return '__end__'
}

// 创建 LangGraph
const workflow = new StateGraph(MessagesAnnotation, ConfigurationSchema)
  // Define the two nodes we will cycle between
  .addNode('callModel', callModel)
  .addNode('tools', toolsNode)
  // Set the entrypoint as `callModel`
  // This means that this node is the first one called
  .addEdge('__start__', 'callModel')
  .addConditionalEdges(
    // First, we define the edges' source node. We use `callModel`.
    // This means these are the edges taken after the `callModel` node is called.
    'callModel',
    // Next, we pass in the function that will determine the sink node(s), which
    // will be called after the source node is called.
    routeModelOutput
  )
  // This means that after `tools` is called, `callModel` node is called next.
  .addEdge('tools', 'callModel')

// 编译 graph
const app = workflow.compile()

export const graph = app
