import { Annotation } from '@langchain/langgraph'
import { BaseMessage } from '@langchain/core/messages'

// 定义状态 Annotation（合并 messages 和 pdfContent）
export const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => [],
  }),
  pdfContent: Annotation<string | null>({
    reducer: (x: string | null, y: string | null) => y ?? x,
    default: () => null,
  }),
  pdfParseFailed: Annotation<boolean>({
    reducer: (x: boolean, y: boolean) => y ?? x,
    default: () => false,
  }),
  lastMessageIsPdf: Annotation<boolean>({
    reducer: (x: boolean, y: boolean) => y ?? x,
    default: () => false,
  }),
})

// 为了向后兼容，保留这些导出
export const MessagesAnnotation = StateAnnotation
export const ConfigurationSchema = Annotation.Root({})

// 定义状态类型
export type State = typeof StateAnnotation.State
