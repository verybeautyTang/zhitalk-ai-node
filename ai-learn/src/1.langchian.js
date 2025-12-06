import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'

const llm = new ChatDeepSeek({
  // 用于判断回答问题的一个准确性
  temperature: 1.5,
  model: 'deepseek-chat',
  // 控制 token 数据
  // maxTokens: 3,
  // 是否流式布局
  // streaming: false,
})

console.log(await llm.invoke('你现在是一名要接触 AI 的前端工程师，你现在要应该怎么去学习'))
