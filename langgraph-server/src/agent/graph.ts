import { StateGraph, END, START } from '@langchain/langgraph'
import { ChatDeepSeek } from '@langchain/deepseek'
import { HumanMessage, AIMessage } from '@langchain/core/messages'

// 定义 Agent 的状态接口
interface AgentState {
  messages: (HumanMessage | AIMessage)[]
}

// 创建 LLM 模型实例
// 注意：需要在 .env 文件中设置 DEEPSEEK_API_KEY
const model = new ChatDeepSeek({
  model: 'deepseek-chat',
  temperature: 0,
})

// 定义 agent 节点
async function agentNode(state: AgentState) {
  // 获取所有消息
  const messages = state.messages

  // 调用 LLM 生成响应
  const response = await model.invoke(messages)

  // 返回更新后的状态
  return {
    messages: [...messages, response],
  }
}

// 创建 LangGraph
const workflow = new StateGraph<AgentState>({
  channels: {
    messages: {
      reducer: (x: (HumanMessage | AIMessage)[], y: (HumanMessage | AIMessage)[]) => x.concat(y),
      default: () => [],
    },
  },
})
  .addNode('agent', agentNode)
  .addEdge(START, 'agent')
  .addEdge('agent', END)

// 编译 graph
const app = workflow.compile()

export const graph = app
