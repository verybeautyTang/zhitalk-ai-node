import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// 初始化 OpenAI 客户端，配置 DeepSeek API 地址和密钥
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY, // 推荐用环境变量
  baseURL: "https://api.deepseek.com", // DeepSeek API 地址
});

async function main(msg) {
  try {
    // 调用 DeepSeek chat 接口，开启流式输出
    const stream = await openai.chat.completions.create({
      model: "deepseek-chat", // 使用 deepseek-chat 模型
      messages: [
        { role: "system", content: "你是一个乐于助人的助手，请用中文回答用户的问题。" },
        { role: "user", content: msg }
      ],
      stream: true // 开启流式输出
    });

    // 实时输出流式响应内容
    for await (const chunk of stream) {
      if (chunk?.choices) {
        for (const choice of chunk.choices) {
          const delta = choice.delta;
          if (delta && typeof delta.content === 'string') {
            process.stdout.write(delta.content);
          }
          if (choice.finish_reason) {
            console.log("\n--- 结束 ---", choice.finish_reason);
          }
        }
      }
    }
    console.log("\n--- 完成 ---");
  } catch (error) {
    console.log(error);
  }
}

main(" 我想知道钢铁是怎么炼成的？");