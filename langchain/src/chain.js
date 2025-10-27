import { ChatDeepSeek } from '@langchain/deepseek'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableLambda } from '@langchain/core/runnables'
import 'dotenv/config'

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

const prompt = ChatPromptTemplate.fromTemplate('如果是你，你遇到了${topic}这种场景，你会怎么做？')


const chain = prompt.pipe(llm).pipe(new StringOutputParser())

const res = await chain.invoke({ topic: '职场霸凌' })
console.log(res)

// const stream = await chain.stream({topic: '狗熊'})

// for await (const chunk of stream) {
//     console.log(`${chunk}`);
// }


// 串行任务
// const analysisPrompt =
//   ChatPromptTemplate.fromTemplate('这个笑话搞笑吗？ {joke}')

// const composedChain = new RunnableLambda({
//   func: async (input) => {
//     const result = await chain.invoke(input)
//     return { joke: result }
//   },
// })
//   .pipe(analysisPrompt)
//   .pipe(llm)
//   .pipe(new StringOutputParser())

// const res2 = await composedChain.invoke({ topic: '狗熊' })
// console.log(res2)