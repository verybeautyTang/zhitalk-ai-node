import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// 从环境变量获取 DeepSeek API Key
const apiKey = process.env.DEEPSEEK_API_KEY;

// 初始化 OpenAI 客户端，指定 baseURL 为 DeepSeek API 地址
const openai = new OpenAI({
  apiKey:process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

// 要提问的问题
const question = "天空为什么是蓝色的";

// 构造请求参数
const messages = [
  {
    role: "user",
    content: question,
  },
];

// 调用 deepseek-reasoner 模型，使用流式输出
async function askDeepSeek() {
  const stream = await openai.chat.completions.create({
    model: "deepseek-reasoner",
    messages,
    stream: true,
    // 你可以根据需要添加其他参数
  });

  let reason = "";
  let content = "";
  let reasonPrinted = false;

  // 监听流式数据
  for await (const chunk of stream) {
    // DeepSeek Reasoner 的输出结构通常为 function_call 或 content
    if (chunk.choices && chunk.choices[0]) {
      const delta = chunk.choices[0].delta;
      // 先收集 reason
      if (delta && delta.function_call && delta.function_call.arguments) {
        try {
          const args = JSON.parse(delta.function_call.arguments);
          if (args.reason) {
            reason += args.reason;
          }
          if (args.content) {
            content += args.content;
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
      // 普通 content 字段
      if (delta && delta.content) {
        content += delta.content;
      }
    }
  }

  // 先打印 reason，再打印 content
  if (reason) {
    console.log("推理过程：", reason);
    reasonPrinted = true;
  }
  if (content) {
    console.log("答案内容：", content);
  }
}

askDeepSeek().catch(console.error);