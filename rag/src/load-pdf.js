import fs from 'fs'
import { PDFParse } from 'pdf-parse'
import { ChromaClient } from 'chromadb'
import 'dotenv/config'
import { AlibabaTongyiEmbeddings } from '@langchain/community/embeddings/alibaba_tongyi'

// 初始化嵌入模型
const embeddings = new AlibabaTongyiEmbeddings({})

// 1. 加载 PDF 文件内容
const pdfPath = '../files/nike-inc-2025.pdf'
const pdfData = fs.readFileSync(pdfPath)

// 2. 拆分 chunk
const splitIntoChunks = (text, chunkSize, overlap) => {
  const chunks = []
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.slice(i, i + chunkSize))
  }
  return chunks
}

// 3. 使用真实的嵌入模型转换文本
const convertToEmbedding = async (text) => {
  try {
    const embedding = await embeddings.embedQuery(text)
    return embedding
  } catch (error) {
    console.error('生成嵌入向量时出错:', error)
    // 备用方案：简单的字符编码
    return text.split('').map((char) => char.charCodeAt(0) / 1000)
  }
}

// 4. 批量生成嵌入向量
const generateEmbeddingsBatch = async (chunks) => {
  try {
    // 使用 embedDocuments 批量处理
    const embeddingsList = await embeddings.embedDocuments(chunks)
    return embeddingsList
  } catch (error) {
    console.error('批量生成嵌入向量时出错，使用备用方案:', error)
    // 备用方案：逐个生成
    const result = []
    for (const chunk of chunks) {
      const embedding = await convertToEmbedding(chunk)
      result.push(embedding)
    }
    return result
  }
}

// 5. 存储到 chroma 数据库
const storeInChroma = async (chunks, embeddingsList) => {
  const client = new ChromaClient()

  try {
    // 获取或创建集合
    const collection = await client.getOrCreateCollection({
      name: 'pdf_documents',
    })

    // 准备数据
    const ids = chunks.map((_, index) => `chunk_${index}`)
    const documents = chunks

    await collection.add({
      ids: ids,
      documents: documents,
      embeddings: embeddingsList,
    })

    console.log(`成功存储 ${chunks.length} 个文档块到 ChromaDB`)
  } catch (error) {
    console.error('存储到 ChromaDB 时出错:', error)
  }
}

// 6. 执行检索并打印结果
const searchInChroma = async (query) => {
  const client = new ChromaClient()

  try {
    const collection = await client.getCollection({
      name: 'pdf_documents',
    })

    // 为查询文本生成嵌入向量
    const queryEmbedding = await convertToEmbedding(query)

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: 3,
    })

    console.log(`\n=== 查询: "${query}" ===`)
    if (results.documents && results.documents[0]) {
      results.documents[0].forEach((doc, index) => {
        console.log(`\n结果 ${index + 1}:`)
        console.log(`距离: ${results.distances[0][index]}`)
        console.log(`内容: ${doc.substring(0, 200)}...`)
      })
    } else {
      console.log('未找到相关结果')
    }
  } catch (error) {
    console.error('检索时出错:', error)
  }
}

// 主逻辑
const main = async () => {
  try {
    const parser = new PDFParse({ data: pdfData })
    console.log('parser', parser)
    const text = await parser.options.data
    console.log('text', text)
    console.log(`PDF 文本长度: ${text.length} 字符`)

    const chunks = splitIntoChunks(text, 1000, 200)
    console.log(`拆分成 ${chunks.length} 个文档块`)

    // 批量生成嵌入向量
    console.log('正在生成嵌入向量...')
    const embeddingsList = await generateEmbeddingsBatch(chunks)
    console.log('嵌入向量生成完成')

    await storeInChroma(chunks, embeddingsList)

    // 执行检索
    await searchInChroma('Nike 2025')
    await searchInChroma('sustainability')
    await searchInChroma('financial report')
  } catch (error) {
    console.error('处理PDF时出错:', error)
  }
}

// 运行主函数
main().catch(console.error)
