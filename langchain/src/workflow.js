/**
 * 如果直接用 deepseek的进行聊天的话，需要自己去管理聊天记录，如果忘记或者有 bug 就会影响 llm 的生成结果
 * langGraph 是可以高效的创建 Agent 去定义 workflow
 */

import { ChatDeepSeek } from "@langchain/deepseek"

import { START, END, MessagesAnnotation, StateGraph, MemorySaver } from "@langchain/langgraph"

import { v4 as uuidv4 } from 'uuid'

import 'dotenv/config'

import { trimMessages } from "@langchain/core/messages";


// 管理聊天记录，一般是保存最近的 10 条记录
const trimmer = trimMessages({
    maxTokens: 10,
    strategy: "last",
    tokenCounter: (msgs) => msgs.length,
    includesSystem: true,
    allowPartial: false,
    startOn: 'human'
})

const llm = new ChatDeepSeek({
    model:'deepseek-chat'
})

// 然后定义一个函数 callModel 用于调用
const callModel = async(state) => {
    // state.message: 就是聊天记录，包含历史记录
    const trimmerMessages = await trimmer.invoke(state.messages)

    console.log('trimmer message length', trimmerMessages.length);

    const response = await llm.invoke(trimmerMessages)
    return { messages: response}
}

// 定义一个 graph
//addNode 定义一个节点
//addEdge 定义一个边或者连线

// START --> callModel --> END
const workflow = new StateGraph(MessagesAnnotation)
  // Define the node and edge
  .addNode('model', callModel)
  .addEdge(START, 'model')
  .addEdge('model', END)

  

//   执行 compile 生成 app
// 刚才代码中定义了 workflow 工作流，现在执行 compile 可以生成一个 app 就可以调用了
// 同时，传入 MemorySaver 用于保存聊天记录，这样就解决了开局的问题。
const memory = new MemorySaver();

const app = workflow.compile({ checkpointer: memory })


// 保留聊天记录又带来新的问题：如果多人聊天，每个人都得保存自己的聊天记录，不能混了。

// 所以我们给每个聊天都定一个为一个 id ，一般叫做 thread_id

// 先安装 uuid 用于生成唯一 id

const config = { configurable: { thread_id: uuidv4() } };

const input1 = [
    {
        role: 'user',
        content: 'hello, my name is jasmineHe！'
    }
]

await app.invoke({ messages: input1 }, config)

// console.log('output1', output1.messages[output1.messages.length - 1]);


const input2 = [
    {
        role: 'user',
        content: 'hello, can you tell me what\'s my name'
    }
]

// const output2 = await app.invoke({ messages: input2 }, config)
await app.invoke({ messages: input2 }, config)
await app.invoke({ messages: input2 }, config)
await app.invoke({ messages: input2 }, config)
await app.invoke({ messages: input2 }, config)

const output2 = await app.invoke({ messages: input2 }, config)
console.log('output2', output2.messages[ output2.messages.length - 1 ]);

