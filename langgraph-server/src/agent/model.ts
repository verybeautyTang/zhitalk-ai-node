import { ChatDeepSeek } from '@langchain/deepseek'
import { tools } from './tools'

// 创建 LLM 模型实例并绑定 tools
// 注意：需要在 .env 文件中设置 DEEPSEEK_API_KEY
export const model = new ChatDeepSeek({
  model: 'deepseek-chat',
  temperature: 0,
}).bindTools(tools)
