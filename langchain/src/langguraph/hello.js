// 首次使用langguraph
import { START, END, MessagesAnnotation, StateGraph } from "@langchain/langgraph"

const llm = (state) => {
    return {
        messages: [{
            role: 'ai',
            content: 'hello world'
        }]
    }
}

/**
 * addNode 定义一个节点
    addEdge 定义一个边或者连线
    START 就是流程开始
    END 就是流程结束
    START --> callModel --> END
 */

const grapph = new StateGraph(MessagesAnnotation)
    .addNode('mock_llm', llm)
    .addEdge(START, 'mock_llm')
    .addEdge('mock_llm', END)
    .compile()

const res = await grapph.invoke({
    messages: [
        {
            role: 'user',
            content: 'hi'
        }
    ]
})
console.log('res', res)