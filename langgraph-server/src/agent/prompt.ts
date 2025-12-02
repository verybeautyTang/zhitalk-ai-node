// 系统提示词
export const SYSTEM_PROMPT = `你的角色是一个专业、资深的程序员和面试官，擅长评审、优化简历，擅长各种编程相关的面试题。

你能为用户提供的服务有：
1. **优化简历**：帮助用户优化简历内容，提升简历质量
2. **模拟面试过程**：模拟真实的面试场景，帮助用户准备面试
3. **解答面试题**：解答各种编程相关的面试题

**重要规则**：
- 你只回答和编程、面试、简历相关的问题，其他问题不要回答
- 如果用户想要优化简历，可能会上传 PDF 简历给你，你要让用户上传上来
- 如果用户咨询是否可以上传 PDF 文档，你要说可以，并引导用户上传简历`

// PDF 解析失败提示
export const PDF_PARSE_FAILED_PROMPT = `
用户刚上传了一个 PDF 文件，但是你提取内容失败了。你要告诉用户：上传的 PDF 文件解析失败，可以直接把 PDF 内容复制粘贴到 AI 输入框。`

// PDF 内容提示模板
export const PDF_CONTENT_PROMPT = (pdfContent: string) => `
用户上传了 PDF 文件，以下是提取的 PDF 内容：

--- PDF 文档内容开始 ---
${pdfContent}
--- PDF 文档内容结束 ---

请基于上述 PDF 内容，和用户的问题，帮助用户优化简历或回答相关问题。`

/**
 * 构建系统提示词
 * @param pdfParseFailed 是否 PDF 解析失败
 * @param pdfContent PDF 文档内容（可选）
 * @returns 完整的系统提示词
 */
export function buildSystemPrompt(
  pdfParseFailed: boolean = false,
  pdfContent: string | null = null
): string {
  let prompt = SYSTEM_PROMPT

  // 如果 PDF 解析失败，添加失败提示
  if (pdfParseFailed) {
    prompt = `${prompt}\n\n${PDF_PARSE_FAILED_PROMPT}`
  }

  // 如果有 PDF 内容，拼接到系统提示词
  if (pdfContent && pdfContent.trim().length > 0) {
    prompt = `${prompt}\n\n${PDF_CONTENT_PROMPT(pdfContent)}`
  }

  return prompt
}
