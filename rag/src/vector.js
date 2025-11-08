import { AlibabaTongyiEmbeddings } from '@langchain/community/embeddings/alibaba_tongyi'
import 'dotenv/config'

const model = new AlibabaTongyiEmbeddings({})
const res = await model.embedQuery('你觉得如何评判一个人？')
console.log({ res })
