import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'
import { TavilySearch } from '@langchain/tavily'

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

const tool = new TavilySearch({
  maxResults: 5,
  topic: 'general',
})

const llmWithTools = llm.bindTools([tool])

// tool存在的意思是llm 可以通过函数去实现自定义的功能，AI可以在适当的时机去调用 tools 去执行相关的函数从而达到目的
// tools 的底层就是 function_call,也就是赋予 llm调用特定函数的能力（你预设的能力）；

// mcp 是基于 function_call的一个封装，function_call需要与 ai 进行交互
//TODO：这里有一个问题，就是怎么定义 tool 的边界能力（需要在 description 里面去描述得越详细越好）
// ------------------------

// 刚刚我 invoke 了 1+1 等于多少/ 帮我看看广州增城区的天气怎么样/帮我用英语翻译一下
// 有且只有看广州天气的时候去调用了 tools，其他两个没有在 tools_call 里面看到对应调用的函数

// ------------------------

const res = await llmWithTools.invoke('用英语帮我翻译一下你好吗？')

console.log(res)
