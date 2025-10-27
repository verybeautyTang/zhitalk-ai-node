import { createServer } from "http";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

// 工具函数：解析 POST 请求体
async function getPostData(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
  });
}

// 创建 HTTP 服务
const server = createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/chat") {
    // 设置 SSE 响应头
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    try {
      // 解析客户端输入
      const { message } = await getPostData(req);

      // 构造请求参数
      const messages = [
        { role: "user", content: message }
      ];

      // 调用 DeepSeek Reasoner，开启 stream
      const stream = await openai.chat.completions.create({
        model: "deepseek-reasoner",
        messages,
        stream: true,
      });

      let reason = "";
      let content = "";

      // 监听流式数据
      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices[0]) {
          const delta = chunk.choices[0].delta;
          // 解析 function_call.arguments
          if (delta && delta.function_call && delta.function_call.arguments) {
            try {
              const args = JSON.parse(delta.function_call.arguments);
              if (args.reason) reason += args.reason;
              if (args.content) content += args.content;
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

      // 先推送 reason，再推送 content
      if (reason) {
        res.write(`event: reason\ndata: ${reason}\n\n`);
      }
      if (content) {
        res.write(`event: content\ndata: ${content}\n\n`);
      }
      res.write(`event: end\ndata: 完成\n\n`);
      res.end();
    } catch (err) {
      res.write(`event: error\ndata: ${err.message}\n\n`);
      res.end();
    }
    return;
  }
  // 新增 GET /chat 路由，返回 chat.html 页面
  if (req.method === "GET" && req.url === "/chat") {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const filePath = path.resolve(new URL(import.meta.url).pathname,'..', "chat.html");
      const html = fs.readFileSync(filePath, {encoding: "utf-8" });
      // 设置响应头为 text/html
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } catch (err) {
      // 读取失败返回 500 错误
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      console.log(err);
      res.end("无法读取 chat.html 文件wwww");
    }
    return;
  }

  // 其他路由返回 404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

// 启动服务
server.listen(3000, () => {
  console.log("服务已启动，监听端口 3000");
});