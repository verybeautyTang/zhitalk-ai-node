import { initConfig } from './config'
import { log } from './tools'
import { ToolNode } from './toolNode'
import { buildPrompt } from './prompt'
import { callModel } from './callModel'

// Workflow definition only: compose modules without side-effects
export async function runWorkflow(input: string) {
  // initialize config/log once if desired
  initConfig()

  log('info', 'Workflow starting')

  const prepareNode = new ToolNode('preparePrompt', async (i) => {
    const p = buildPrompt(String(i))
    return { success: true, output: p }
  })

  const prepared = await prepareNode.run(input)
  if (!prepared.success) {
    log('error', `Preparation failed: ${prepared.error}`)
    return { success: false, error: prepared.error }
  }

  const prompt = String(prepared.output)
  const result = await callModel(prompt)

  log('info', 'Workflow finished')
  return { success: true, prompt, result }
}
