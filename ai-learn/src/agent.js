// 可多次调用llm 和 tools 直到达到我们想要的目的
// Agent 根据实际情况多次调用自动 llm 和 tool ，可以自动识别并行动，这就是 re-act 或 ReAct

import { ChatDeepSeek } from '@langchain/deepseek'
import { createAgent, tool } from 'langchain'
import * as z from 'zod'
import 'dotenv/config'

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

const getUidTool = tool(
  (input) => {
    return `${input.name} uid is hello`
  },
  {
    name: 'getUid',
    description: 'Obtain the uid based on the username',
    schema: z.object({
      name: z.string().describe('the user name'),
    }),
  }
)

const agent = createAgent({
  model: llm,
  tools: [getUidTool],
})

const res = await agent.invoke({
  messages: [{ role: 'user', content: '请问贺诗雨的 uid 是？' }],
})

console.log(res)
