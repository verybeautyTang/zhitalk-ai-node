import { BaseMessage, HumanMessage } from '@langchain/core/messages'
import { State } from '../config'
// import { PDFParse } from 'pdf-parse'
const { PDFParse } = require('pdf-parse')

// 定义 extractPdf 节点，提取 PDF 文件内容
export async function extractPdfNode(state: State) {
  const messages = state.messages as BaseMessage[]
  let pdfContent: string | null | undefined = undefined
  let pdfParseFailed = false
  let pdfMessages: BaseMessage[] = []

  // 检测最后一个 message 是否包含 PDF 文件
  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1]
    const content = lastMessage.content

    // 检查 content 是否为数组格式
    if (Array.isArray(content)) {
      const newContent: any[] = []
      let hasPdf = false

      for (const item of content) {
        // 检查是否为 file 类型且是 PDF
        if (
          typeof item === 'object' &&
          item !== null &&
          'type' in item &&
          item.type === 'file' &&
          'mimeType' in item &&
          item.mimeType === 'application/pdf'
        ) {
          hasPdf = true
          const fileData = item.data as string
          const metadata = item.metadata as { filename?: string } | undefined
          const fileName = metadata?.filename || 'unknown.pdf'

          // console.log('PDF File Name:', fileName);

          // 将 base64 字符串解码为 Buffer，然后转换为 Uint8Array
          const pdfBuffer = Buffer.from(fileData, 'base64')
          const pdfUint8Array = new Uint8Array(pdfBuffer)

          // 使用 pdf-parse 提取文本内容
          try {
            const pdfParser = new PDFParse(pdfUint8Array)
            await pdfParser.load()
            const textContent = await pdfParser.getText()

            // 检查是否成功获取到文本内容
            if (!textContent || !textContent.text || textContent.text.trim().length === 0) {
              console.warn('PDF 文件解析失败：未获取到文本内容')
              pdfContent = null // 解析失败，设置为 null
              pdfParseFailed = true // 标记解析失败
            } else {
              // console.log('PDF 文本内容:');
              // console.log('='.repeat(50));
              // console.log(textContent.text);
              // console.log('='.repeat(50));
              pdfContent = textContent.text // 解析成功
              pdfParseFailed = false // 标记解析成功
            }
          } catch (error) {
            console.error('解析 PDF 文件时出错:', error)
            pdfContent = null // 解析失败，设置为 null
            pdfParseFailed = true // 标记解析失败
          }

          // 将 file 类型改为 text 类型，内容为 "<filename.pdf>"
          newContent.push({
            type: 'text',
            text: `<${fileName}>`,
          })
        } else {
          // 保留非 PDF 文件的其他内容
          newContent.push(item)
        }
      }

      // 如果有 PDF 文件，更新最后一个 message
      if (hasPdf) {
        pdfMessages = [
          new HumanMessage({
            content: newContent,
          }),
        ]
      }
    }
  }

  // 构建返回结果
  const result: any = {
    messages: pdfMessages,
    lastMessageIsPdf: false,
  }

  // 只有在有 PDF 文件时才返回 pdfContent 和 pdfParseFailed
  if (pdfContent !== undefined) {
    result.pdfContent = pdfContent
    result.pdfParseFailed = pdfParseFailed
    result.lastMessageIsPdf = !pdfParseFailed
  }

  return result
}
