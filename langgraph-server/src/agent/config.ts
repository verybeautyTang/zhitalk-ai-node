import { Annotation } from '@langchain/langgraph'
import { BaseMessage } from '@langchain/core/messages'

// 定义 MessagesAnnotation
export const MessagesAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => [],
  }),
})

// 定义 ConfigurationSchema
export const ConfigurationSchema = Annotation.Root({})

// 定义状态类型
export type State = typeof MessagesAnnotation.State & typeof ConfigurationSchema.State
