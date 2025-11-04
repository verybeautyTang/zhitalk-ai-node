/**
 * 如何利用现有的知识，去实践、去做一个简历优化 Agent 呢？我一开始也是没有思路的。

虽然我 1v1 简历优化无数次了，但让 AI 帮我优化，我的脑子也是一下载转不过来，也得思考一下。

其实关键就是告诉 AI ，简历优化的步骤是什么，大概是这样的

提取信息，例如个人信息、专业技能、项目经验
分析，看技能、经验是否匹配
给出建议
有了这个过程，AI 就可以写出比较合理的代码。否则让 AI 自由发挥，肯定是不行的。Let’s roll
 */

import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'
import { createAgent, tool } from 'langchain'
import * as z from 'zod'
import { MemorySaver } from '@langchain/langgraph'
import { StateGraph, START, END } from '@langchain/langgraph'

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})
