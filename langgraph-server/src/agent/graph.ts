import { StateGraph } from '@langchain/langgraph'
import { MessagesAnnotation, ConfigurationSchema } from './config'
import { callModel } from './nodes/callModel'
import { toolsNode } from './nodes/toolsNode'
import { routeModelOutput } from './nodes/routeModelOutput'

// 创建 LangGraph
const workflow = new StateGraph(MessagesAnnotation, ConfigurationSchema)
const app = workflow.compile()

export const graph = app
