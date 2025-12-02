import { StateGraph } from '@langchain/langgraph'
import { MessagesAnnotation, ConfigurationSchema } from './config'
import { callModel } from './nodes/callModel'
import { toolsNode } from './nodes/toolsNode'
import { routeModelOutput } from './nodes/routeModelOutput'
import { extractPdfNode } from './nodes/extractPdfNode'
import dotenv from 'dotenv'
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres'

dotenv.config() // Load environment variables from .env

let checkpoint: PostgresSaver | undefined = undefined
if (process.env.DB_URL) {
  // Instantiate PostgreSQL checkpoint
  checkpoint = PostgresSaver.fromConnString(process.env.DB_URL)
  checkpoint
    .setup()
    .then(() => {
      console.log('Postgres checkpoint setup complete.')
    })
    .catch((err) => {
      console.error('Error setting up Postgres checkpoint:', err)
    })
} else {
  console.warn('DB_URL is not set in environment variables. Checkpointing is disabled.')
}
// 创建 LangGraph
const workflow = new StateGraph(MessagesAnnotation, ConfigurationSchema)
  // Define the nodes
  .addNode('extractPdf', extractPdfNode)
  .addNode('callModel', callModel)
  .addNode('tools', toolsNode)
  // Set the entrypoint as `extractPdf`
  // This means that this node is the first one called
  .addEdge('__start__', 'extractPdf')
  // After extractPdf, go to callModel
  .addEdge('extractPdf', 'callModel')
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
const app = workflow.compile({
  checkpoint: checkpoint,
})

export const graph = app
