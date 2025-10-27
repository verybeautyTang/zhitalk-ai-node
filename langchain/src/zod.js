import { z } from 'zod'
import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'

/*
  使用 zod 定义结构化输出格式：情感分类
  {
    label: "贬义" | "褒义" | "中性",
    confidence?: number, // 0 到 1
    reason?: string
  }
*/
export const SentimentSchema = z.object({
  label: z.enum(['贬义', '褒义', '中性']).describe('情感倾向'),
  confidence: z.number().min(0).max(1).optional().describe('置信度，范围 0-1，可选'),
  reason: z.string().optional().describe('简短说明，解释判断依据，可选'),
})

export const parseSentiment = (data) => SentimentSchema.parse(data)

/*
  用法：
    node src/zod.js "这家公司的服务真差劲，让人很失望"
  说明：
    - 使用 llm.withStructuredOutput 让模型直接返回符合 SentimentSchema 的结构化结果
    - 仍然做一次 zod.parse 作为二次校验，保证类型与默认值一致
*/

const sentenceFromArg = process.argv[2] ?? ''

if (!process.env.DEEPSEEK_API_KEY) {
  console.error('请设置环境变量 DEEPSEEK_API_KEY（例如在终端执行：export DEEPSEEK_API_KEY=your_key）')
  process.exit(1)
}

if (!sentenceFromArg) {
  console.error('请通过命令行参数传入要判断的一句话，例如：\n  node langchain/src/zod.js "这家公司的服务真差劲，让人很失望"')
  process.exit(1)
}

const llm = new ChatDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  model: 'deepseek-chat',
})

// 将 llm 包装为结构化输出版本
const llmWithStructuredOutput = llm.withStructuredOutput(SentimentSchema)

// system prompt：指示模型只返回结构化内容，字段必须与 schema 对齐
const systemPrompt = `
你是一个情感倾向判定助手。请严格按照指定字段返回数据：label, confidence, reason。
字段说明：
- label: 必须为 "贬义"、"褒义" 或 "中性" 之一。
- confidence: 可选，0 到 1 之间的数字，表示置信度。
- reason: 可选，简短说明判定依据。

只返回结构化内容（withStructuredOutput 会尝试直接返回符合 schema 的数据），不要输出任何多余文本、解释或代码块。
`

const userPrompt = `请判断下面这句话的情感倾向（只需返回结构化结果）：\n\n${sentenceFromArg}`

async function run() {
  try {
    const prompt = systemPrompt + '\n\n' + userPrompt

    // 使用 withStructuredOutput 调用，期望返回已解析的结构化对象
    const res = await llmWithStructuredOutput.invoke(prompt)

    // 不同版本可能返回位置不同，尝试取出实际值
    const candidate = res?.output ?? res?.value ?? res ?? null

    if (!candidate) {
      throw new Error('未从 LLM 返回结构化结果')
    }

    // 使用 zod 做二次校验与转换
    const sentiment = SentimentSchema.parse(candidate)

    console.log('解析并校验通过，结果：')
    console.log(JSON.stringify(sentiment, null, 2))
  } catch (err) {
    console.error('处理失败：', err)
    process.exitCode = 1
  }
}

run()