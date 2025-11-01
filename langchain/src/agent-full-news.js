// 现在去构建一个真实的现代世界的agent代理（具体步骤如下）

// 1、定义一个system prompts，可以更好的做agent
// 2. 创建一个跟外部集成的工具
// 3.配置模型
// 4. 结构化输出
// 5. 对话记忆
// 6. 运行并且创建代理


// 系统提示定义了代理的角色和行为。请确保提示内容具体且可操作：


import  { ChatDeepSeek } from "@langchain/deepseek"
import { TavilySearch} from "@langchain/tavily"
import { createAgent } from "langchain"
import { MemorySaver } from "@langchain/langgraph"
import * as z from "zod"
import "dotenv/config"


// 创建模型并且配置模型
const llm = new ChatDeepSeek({
    model: 'deepseek-chat'
})

// 创建prompt
const systemPrompt = `您是一名喜欢追星的人，你现在有两个工具可以用到。
get_idol_message: 使用此功能获得指定明星的个人信息
get_idol_list: 使用此功能可获得指定明星的个人作品集合

如果用户向您询问明星，请务必了解其姓名，如果从问题中可以判断出他们说的是哪个明星。
请使用get_idol_message工具来获得他们信息
`

// 写get_idol_message工具
const get_idol_message = new TavilySearch({
    name: 'get_idol_message',
    description: '请根据得到的明星名称返回明星的信息',
    schema: z.object({
        idol_name: z.string().describe('明星的名字')
    })
})


const get_idol_list = new TavilySearch({
    name:'get_idol_list',
    describtion: '得到对应明星的作品集',
    schema: z.object({
        idol_name:z.string().describe('明星的名字')
    })
})


const responseFormat = z.object({
  punny_response: z.string(),
  idol_message: z.string().optional(),
});

// 创建记忆
const checkpointer = new MemorySaver();
// Memory 需要一个 thread_id ，每个对话一个 id ，防止混乱
const config = {
  configurable: { thread_id: "1" }
};


// 创建agent
const agent = createAgent({
  model: llm,
  systemPrompt: systemPrompt,
  tools: [get_idol_message, get_idol_list],
  responseFormat,
  checkpointer,
});


const response = await agent.invoke(
  { messages: [{ role: "user", content: "刘亦菲是谁？" }] },
  config
);

console.log('response', response.structuredResponse);


//  这里拿到有问题，继续看看
const thankYouResponse = await agent.invoke(
  { messages: [{ role: "user", content: "谢谢您。好的我知道了！" }] },
  config
);


console.log(thankYouResponse.structuredResponse);