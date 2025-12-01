import { BaseMessage } from '@langchain/core/messages'
import { State } from '../config'

// 定义路由函数，决定是否调用 tools
export function routeModelOutput(state: State) {
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
