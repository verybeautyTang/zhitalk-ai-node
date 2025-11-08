import { ChromaClient } from 'chromadb'
import { AlibabaTongyiEmbeddings } from '@langchain/community/embeddings/alibaba_tongyi'
import 'dotenv/config'

const client = new ChromaClient()

const embeddings = new AlibabaTongyiEmbeddings()

async function run() {
  // 尝试删除已存在的集合
  await client.deleteCollection({ name: 'test_collection' })
  const collection = await client.getOrCreateCollection({
    name: 'test_collection',
    embeddingFunction: embeddings,
  })

  const documents = ['书中自有颜如玉', '书中自有黄金屋']

  const docEmbeddings = await embeddings.embedDocuments(documents)

  await collection.add({
    ids: ['id22', 'id11'],
    documents: documents,
    embeddings: docEmbeddings,
  })

  const queryTexts = '书中有什么呢？'
  const queryEmbeddings = await embeddings.embedQuery(queryTexts)
  const results = await collection.query({
    nResults: 2, // how many results to return
    queryEmbeddings: [queryEmbeddings],
  })

  console.log(results)
}

run().catch(console.error) // 调用异步函数并处理错误
