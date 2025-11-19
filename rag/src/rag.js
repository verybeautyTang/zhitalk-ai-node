import { Chroma } from '@langchain/community/vectorstores/chroma';
import { ChatDeepSeek } from "@langchain/deepseek"
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';
import { StateGraph, END } from '@langchain/langgraph';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

// 1. 初始化组件
function initializeVectorStore() {
  return new Chroma({
    collectionName: 'nike_inc_2025',
    url: 'http://localhost:8000',
    collectionMetadata: {
      "hnsw:space": "cosine"
    }
  });
}

function initializeLLM() {
  return new ChatDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: 'deepseek-chat',
    // temperature: 0.1,
    // maxTokens: 1000
  });
}

// 2. 构建检索器
function buildRetriever(vectorStore) {
  return vectorStore.asRetriever({
    k: 5,
    searchType: 'similarity',
    filter: {}
  });
}

// 3. 构建提示模板
function buildPromptTemplates() {
  const mainPrompt = PromptTemplate.fromTemplate(`
你是一个专业的财务分析助手，专门分析 Nike 公司的年度报告。

请基于以下上下文信息回答用户的问题。如果上下文中没有足够的信息，请如实说明。

上下文信息：
{context}

用户问题：{question}

请提供准确、专业的回答，并引用相关的数据和支持信息。
回答：`);

  const refinementPrompt = PromptTemplate.fromTemplate(`
基于原始问题和以下补充信息，请完善你的回答：

原始问题：{original_question}
初始回答：{initial_answer}

补充上下文：
{additional_context}

请整合所有信息，提供一个更完整、准确的回答：
`);

  return { mainPrompt, refinementPrompt };
}

// 4. 检查是否需要细化回答
function checkIfNeedsRefinement(answer, context) {
  const uncertaintyIndicators = [
    'I\'m not sure',
    'I don\'t know',
    'the context doesn\'t mention',
    'not specified',
    'unclear',
    'not provided',
    '不确定',
    '不知道',
    '没有提到',
    '未指定'
  ];

  const hasUncertainty = uncertaintyIndicators.some(indicator => 
    answer.toLowerCase().includes(indicator)
  );

  const isTooShort = answer.split(' ').length < 30;
  const lacksNumbers = !/\d/.test(answer);

  return hasUncertainty || isTooShort || lacksNumbers;
}

// 5. 构建 RAG 链
function buildRAGChain(vectorStore, llm) {
  const retriever = buildRetriever(vectorStore);
  const { mainPrompt } = buildPromptTemplates();

  return RunnableSequence.from([
    {
      context: (input) => retriever.invoke(input.question || input),
      question: new RunnablePassthrough()
    },
    {
      context: (previous) => previous.context.map(doc => doc.pageContent).join('\n\n'),
      question: (previous) => previous.question
    },
    mainPrompt,
    llm,
    new StringOutputParser()
  ]);
}

// 6. 构建 Agent
function buildRAGAgent() {
  const vectorStore = initializeVectorStore();
  const llm = initializeLLM();
  
  // 定义状态
  const State = {
    messages: {
      value: (x, y) => x.concat(y),
      default: () => []
    },
    question: {
      value: (x, y) => y || x,
      default: () => ''
    },
    context: {
      value: (x, y) => y || x,
      default: () => []
    },
    answer: {
      value: (x, y) => y || x,
      default: () => ''
    },
    needs_refinement: {
      value: (x, y) => y !== undefined ? y : x,
      default: () => false
    }
  };

  // 创建图
  const workflow = new StateGraph(State);

  // 节点1: 检索文档
  const retrieveDocuments = async (state) => {
    console.log('🔍 检索相关文档...');
    const retriever = buildRetriever(vectorStore);
    const question = state.messages[state.messages.length - 1].content;
    
    const documents = await retriever.invoke(question);
    console.log(`📄 检索到 ${documents.length} 个相关文档片段`);
    
    return {
      context: documents,
      question: question
    };
  };

  // 节点2: 生成初始回答
  const generateInitialAnswer = async (state) => {
    console.log('🤖 生成初始回答...');
    const { mainPrompt } = buildPromptTemplates();
    
    const contextText = state.context.map(doc => doc.pageContent).join('\n\n');
    const question = state.question;

    const response = await llm.invoke(
      await mainPrompt.format({ context: contextText, question: question })
    );

    const answer = response.content;
    console.log('✅ 初始回答生成完成');

    const needsRefinement = checkIfNeedsRefinement(answer, contextText);

    return {
      answer: answer,
      needs_refinement: needsRefinement,
      messages: [...state.messages, new AIMessage(answer)]
    };
  };

  // 节点3: 细化回答
  const refineAnswer = async (state) => {
    console.log('🎯 细化回答...');
    const { refinementPrompt } = buildPromptTemplates();
    
    const retriever = buildRetriever(vectorStore);
    const additionalDocs = await retriever.invoke(state.question);
    const additionalContext = additionalDocs.map(doc => doc.pageContent).join('\n\n');

    const response = await llm.invoke(
      await refinementPrompt.format({
        original_question: state.question,
        initial_answer: state.answer,
        additional_context: additionalContext
      })
    );

    console.log('✅ 回答细化完成');
    return {
      answer: response.content,
      messages: [...state.messages.slice(0, -1), new AIMessage(response.content)]
    };
  };

  // 节点4: 路由逻辑
  const routeLogic = (state) => {
    if (state.needs_refinement) {
      console.log('🔄 需要细化回答，转到细化节点');
      return 'refine';
    }
    console.log('✅ 回答满意，结束流程');
    return 'end';
  };

  // 添加节点
  workflow.addNode('retrieve', retrieveDocuments);
  workflow.addNode('generate', generateInitialAnswer);
  workflow.addNode('refine', refineAnswer);

  // 设置入口点
  workflow.setEntryPoint('retrieve');

  // 添加边
  workflow.addEdge('retrieve', 'generate');
  workflow.addConditionalEdges('generate', routeLogic, {
    refine: 'refine',
    end: END
  });
  workflow.addEdge('refine', END);

  const compiledAgent = workflow.compile();

  return {
    agent: compiledAgent,
    vectorStore,
    llm
  };
}

// 7. 主要查询函数
async function queryRAGAgent(question, agentInstance = null) {
  console.log(`\n=== RAG Agent 开始处理问题 ===`);
  console.log(`问题: "${question}"`);

  let agent;
  if (!agentInstance) {
    agent = buildRAGAgent().agent;
  } else {
    agent = agentInstance.agent;
  }

  try {
    const initialState = {
      messages: [new HumanMessage(question)],
      question: question
    };

    const result = await agent.invoke(initialState);
    
    console.log(`\n=== RAG Agent 处理完成 ===`);
    return {
      answer: result.answer,
      sources: result.context ? result.context.map(doc => ({
        content: doc.pageContent.substring(0, 200) + '...',
        metadata: doc.metadata
      })) : [],
      conversation_history: result.messages
    };
  } catch (error) {
    console.error('RAG Agent 处理错误:', error);
    throw error;
  }
}

// 8. 简单的 RAG 链查询（备选方案）
async function simpleRAGQuery(question) {
  console.log(`使用简单 RAG 链查询: "${question}"`);
  
  const vectorStore = initializeVectorStore();
  const llm = initializeLLM();
  const ragChain = buildRAGChain(vectorStore, llm);
  
  const result = await ragChain.invoke({ question });
  
  return {
    answer: result,
    method: 'simple_rag'
  };
}

// 9. 批量查询函数
async function batchQueryRAG(questions) {
  console.log(`\n🔄 开始批量处理 ${questions.length} 个问题`);
  
  const agentInstance = buildRAGAgent();
  const results = [];
  
  for (let i = 0; i < questions.length; i++) {
    console.log(`\n处理问题 ${i + 1}/${questions.length}: "${questions[i]}"`);
    
    try {
      const result = await queryRAGAgent(questions[i], agentInstance);
      results.push({
        question: questions[i],
        answer: result.answer,
        sources: result.sources
      });
    } catch (error) {
      console.error(`问题 "${questions[i]}" 处理失败:`, error);
      results.push({
        question: questions[i],
        answer: '处理失败',
        error: error.message
      });
    }
  }
  
  return results;
}

// 10. 使用示例
async function main() {
  // 测试问题
  const testQuestion = "What was Nike's revenue in 2025?";
  
  try {
    console.log('🚀 启动 RAG Agent...\n');
    
    // 方法1: 使用完整的 Agent
    const agentResult = await queryRAGAgent(testQuestion);
    
    console.log('\n📊 === 最终回答 ===');
    console.log(agentResult.answer);
    
    console.log('\n📚 === 参考来源 ===');
    if (agentResult.sources && agentResult.sources.length > 0) {
      agentResult.sources.forEach((source, index) => {
        console.log(`\n来源 ${index + 1}:`);
        console.log(`   📄 页面: ${source.metadata?.page || '未知'}`);
        console.log(`   📝 内容: ${source.content}`);
      });
    } else {
      console.log('没有找到相关来源');
    }
    
    // 方法2: 批量查询示例
    /*
    const batchQuestions = [
      "What was Nike's revenue in 2025?",
      "What are Nike's sustainability initiatives?",
      "What is Nike's growth strategy?"
    ];
    
    const batchResults = await batchQueryRAG(batchQuestions);
    console.log('\n批量查询结果:', batchResults);
    */
    
  } catch (error) {
    console.error('执行过程中出错:', error);
  }
}

// 11. 导出所有函数
export {
  initializeVectorStore,
  initializeLLM,
  buildRAGAgent,
  queryRAGAgent,
  simpleRAGQuery,
  batchQueryRAG,
  buildRAGChain
};

// 运行示例
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}