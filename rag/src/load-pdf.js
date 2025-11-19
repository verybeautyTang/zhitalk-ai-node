import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { AlibabaTongyiEmbeddings } from '@langchain/community/embeddings/alibaba_tongyi'
import { Chroma } from '@langchain/community/vectorstores/chroma'
import { ChromaClient } from 'chromadb'
import { Document } from '@langchain/core/documents'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import PDFParser from 'pdf2json'
import fs from 'fs'

// 加载环境变量
dotenv.config()

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 清理 PDF 解析后的文本格式
 */
function cleanText(text) {
  // 移除单字符之间的空格（针对 PDF 特殊编码）
  let cleaned = text.replace(/(\w)\s+(?=\w)/g, '$1')
  // 移除多余的空格
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  return cleaned
}

/**
 * 使用 pdf2json 加载 PDF 文件
 */
async function loadPDF(pdfPath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser()

    pdfParser.on('pdfParser_dataError', (errData) => {
      reject(errData.parserError)
    })

    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      try {
        const pages = pdfData.Pages || []
        const documents = []

        pages.forEach((page, pageIndex) => {
          let pageText = ''
          const texts = page.Texts || []

          texts.forEach((text) => {
            try {
              const decodedText = decodeURIComponent(text.R[0].T)
              pageText += decodedText + ' '
            } catch (e) {
              // 如果解码失败，使用原始文本
              pageText += text.R[0].T + ' '
            }
          })

          if (pageText.trim()) {
            documents.push(
              new Document({
                pageContent: cleanText(pageText),
                metadata: {
                  source: pdfPath,
                  pageNumber: pageIndex + 1,
                },
              })
            )
          }
        })

        resolve(documents)
      } catch (error) {
        reject(error)
      }
    })

    pdfParser.loadPDF(pdfPath)
  })
}

/**
 * RAG 检索功能演示
 * 1. 加载 PDF 文件
 * 2. 拆分文档为 chunks
 * 3. 转换为 embedding 向量
 * 4. 存储到 ChromaDB
 * 5. 执行检索并展示结果
 */
async function ragDemo() {
  try {
    console.log('=== RAG 检索功能演示 ===\n')

    // 1. 加载 PDF 文件
    console.log('📄 步骤 1: 加载 PDF 文件...')
    const pdfPath = path.join(__dirname, '../files/nike-inc-2025.pdf')
    const docs = await loadPDF(pdfPath)
    console.log(`✅ 成功加载 PDF，共 ${docs.length} 页\n`)

    // 2. 拆分文档为 chunks
    console.log('✂️  步骤 2: 拆分文档为 chunks...')
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })
    const splitDocs = await textSplitter.splitDocuments(docs)
    console.log(`✅ 成功拆分为 ${splitDocs.length} 个 chunks`)

    // 为了演示，只使用前 100 个 chunks 以避免配额限制
    const limitedDocs = splitDocs.slice(0, 100)
    console.log(
      `📝 为避免配额限制，本次演示使用前 ${limitedDocs.length} 个 chunks\n`
    )

    // 3. 初始化 Embedding 模型
    console.log('🔢 步骤 3: 初始化 Embedding 模型...')
    const embeddings = new AlibabaTongyiEmbeddings({
      apiKey: process.env.ALIBABA_API_KEY,
      batchSize: 10, // 降低批处理大小以避免配额限制
    })
    console.log('✅ Embedding 模型初始化成功\n')

    // 4. 存储到 ChromaDB
    console.log('💾 步骤 4: 存储到 ChromaDB...')
    const collectionName = 'nike_inc_2025'

    // 首先清理已存在的集合
    try {
      const chromaClient = new ChromaClient({
        path: 'http://localhost:8000',
      })
      await chromaClient.deleteCollection({ name: collectionName })
      console.log('🗑️  已删除旧的集合')
    } catch (error) {
      // 集合不存在，忽略错误
    }

    // 创建向量存储
    const vectorStore = await Chroma.fromDocuments(limitedDocs, embeddings, {
      collectionName: collectionName,
      url: 'http://localhost:8000',
    })
    console.log(`✅ 成功存储 ${limitedDocs.length} 个 chunks 到 ChromaDB\n`)

    // 5. 执行检索演示
    console.log('🔍 步骤 5: 执行检索演示...\n')
    console.log('='.repeat(80))

    // 检索示例 1: 关于 Nike 的收入
    console.log('\n【检索示例 1】')
    const query1 = "What was Nike's revenue in 2025?"
    console.log(`查询问题: ${query1}`)
    console.log('-'.repeat(80))

    const results1 = await vectorStore.similaritySearchWithScore(query1, 3)
    console.log(`找到 ${results1.length} 个相关文档片段:\n`)

    results1.forEach(([doc, score], index) => {
      console.log(`结果 ${index + 1}: (相似度: ${(score * 100).toFixed(2)}%)`)
      console.log(`内容: ${doc.pageContent.substring(0, 400)}...`)
      console.log(`来源: 第 ${doc.metadata.pageNumber || '未知'} 页`)
      console.log('-'.repeat(80))
    })

    // 检索示例 2: 关于 Nike 的产品
    console.log('\n【检索示例 2】')
    const query2 = "What are Nike's main product categories?"
    console.log(`查询问题: ${query2}`)
    console.log('-'.repeat(80))

    const results2 = await vectorStore.similaritySearchWithScore(query2, 3)
    console.log(`找到 ${results2.length} 个相关文档片段:\n`)

    results2.forEach(([doc, score], index) => {
      console.log(`结果 ${index + 1}: (相似度: ${(score * 100).toFixed(2)}%)`)
      console.log(`内容: ${doc.pageContent.substring(0, 400)}...`)
      console.log(`来源: 第 ${doc.metadata.pageNumber || '未知'} 页`)
      console.log('-'.repeat(80))
    })

    console.log('\n✨ RAG 检索演示完成！')
  } catch (error) {
    console.error('❌ 错误:', error.message)
    console.error(error)
  }
}

// 运行演示
ragDemo()