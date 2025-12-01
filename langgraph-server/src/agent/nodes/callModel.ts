import { BaseMessage, SystemMessage } from '@langchain/core/messages'
import { State } from '../config'
import { model } from '../model'
import { SYSTEM_PROMPT } from '../prompt'

// 定义 callModel 节点
export async function callModel(state: State) {
  const messages = state.messages as BaseMessage[]

  // 确保系统提示词存在
  const hasSystemMessage = messages.length > 0 && messages[0] instanceof SystemMessage

  // 如果没有系统消息，则在开头添加
  const messagesWithSystem = hasSystemMessage
    ? messages
    : [new SystemMessage(SYSTEM_PROMPT), ...messages]

  const response = await model.invoke(messagesWithSystem)
  return { messages: [response] }
}
