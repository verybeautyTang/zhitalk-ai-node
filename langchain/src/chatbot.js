import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

const res1 = await llm.invoke([
  {
    role: 'user',
    content: '你好，我是瘦瘦'
  }
])

const res2 = await llm.invoke([{
    role: 'user',
    content: '我是谁？'
}])

// console.log(
// 'res1', res1
// );

// console.log('res2', res2);

// 明明已经在 res1 中告诉他了，我是谁，但是我在 res2 中，去问我是谁 没有回答上来。
// 上面两个实验告诉我们，聊天激励是独立的，无法共享消息，所以我们必须要把所有的信息在调用的时候一次性传入


const res3 = await llm.invoke([
    {
        role: 'user',
        content: '您好，我是瘦瘦'
    },
    {
        role: 'assistant',
        content: '您好瘦瘦，请问我有什么可以帮助您的吗？'
    },
    {
        role: 'user',
        content: '请问您知道我叫什么吗？'
    }
])

console.log(res3);