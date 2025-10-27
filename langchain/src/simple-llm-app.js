import { ChatDeepSeek } from '@langchain/deepseek'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatPromptTemplate } from '@langchain/core/prompts'

import 'dotenv/config'

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})
// 定义 template
const systemTemplate = '帮我回答这个问题:{language}'
const promptTemplate = ChatPromptTemplate.fromMessages([
  ['system', systemTemplate],
  ['user', '{text}'],
])

const promptValue = await promptTemplate.invoke({
  language: 'Chinese',
  text: '你可以给我解释?',
})


const response = await llm.invoke(promptValue)
console.log(`${response.content}`)


// const messages = [
//   new SystemMessage('我需要你给我一个大前端的学习路线图，内容要详细且具体'),
//   new HumanMessage('你是谁啊'),
// ]

// const stream = await llm.stream(messages)
// const chunks = []
// for await (const chunk of stream) {
//   chunks.push(chunk)
//   console.log(`${chunk.content}|`)
// }

// 根据 template 生成 prompt 值