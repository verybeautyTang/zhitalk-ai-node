import { BaseMessage, SystemMessage } from '@langchain/core/messages'
import { State } from '../config'
import { model, reasoningModel } from '../model'
import { buildSystemPrompt } from '../prompt'

// 定义 callModel 节点
export async function callModel(state: State) {
  const messages = state.messages as BaseMessage[]
  // console.log('messages ', messages);

  // 过滤掉 messages 中带有 type=file 的 item，创建新的 messages 数组（不改变原 messages）
  const newMessages = messages.map((message) => {
    const content = message.content

    // 检查 content 是否为数组格式
    if (Array.isArray(content)) {
      // 过滤掉 type=file 的项
      const filteredContent = content.filter((item) => {
        // 如果不是对象，保留
        if (typeof item !== 'object' || item === null) {
          return true
        }
        // 如果 type 不是 'file'，保留
        if (!('type' in item) || item.type !== 'file') {
          return true
        }
        // 过滤掉 type=file 的项
        return false
      })

      // 使用 message 的构造函数创建新对象，替换 content
      return new (message.constructor as any)({
        ...message,
        content: filteredContent,
      })
    }

    // 如果 content 不是数组，直接返回原 message
    return message
  })

  // 使用 state 中的 pdfParseFailed 标志（由 extractPdfNode 设置）
  const pdfParseFailed = state.pdfParseFailed ?? false
  const pdfContent = state.pdfContent ?? null
  // console.log('pdfParseFailed ', pdfParseFailed);
  // console.log('pdfContent ', pdfContent);
  const lastMessageIsPdf = state.lastMessageIsPdf ?? false
  // console.log('lastMessageIsPdf ', lastMessageIsPdf);

  // 根据 lastMessageIsPdf 选择使用普通模型还是深度思考模型
  const selectedModel = lastMessageIsPdf ? reasoningModel : model
  console.log('selectedModel ', selectedModel)

  // 构建系统提示词（如果 pdfContent 有值，会拼接到 systemPrompt）
  const systemPrompt = buildSystemPrompt(pdfParseFailed, pdfContent)

  // 确保系统提示词存在
  const hasSystemMessage = newMessages.length > 0 && newMessages[0] instanceof SystemMessage

  // 如果没有系统消息，则在开头添加；如果有，则更新系统消息
  const messagesWithSystem = hasSystemMessage
    ? [new SystemMessage(systemPrompt), ...newMessages.slice(1)]
    : [new SystemMessage(systemPrompt), ...newMessages]
  // console.log('messagesWithSystem ', messagesWithSystem);
  const response = await selectedModel.invoke(messagesWithSystem)
  // 返回完整的消息历史 + 新回复（因为 reducer 现在是替换逻辑）
  return { messages: [response] }
}
