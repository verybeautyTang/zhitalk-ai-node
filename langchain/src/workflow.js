/**
 * 如果直接用 deepseek的进行聊天的话，需要自己去管理聊天记录，如果忘记或者有 bug 就会影响 llm 的生成结果
 * langGraph 是可以高效的创建 Agent 去定义 workflow
 */

import { ChatDeepSeek } from "@langchain/deepseek"

import 'dotenv/config'

const llm = new ChatDeepSeek({
    model:'deepseek-chat'
})

const callModel = async(state) => {
    console.log('Input message length:', state.messages.length);
    // state.message: 就是聊天记录，包含历史记录
    const response = await llm.invoke(state.message)
    return { messages: response}
}