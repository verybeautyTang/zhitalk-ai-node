
import { PromptTemplate } from '@langchain/core/prompts'
import { FewShotPromptTemplate } from '@langchain/core/prompts'


const examplePrompt = PromptTemplate.fromTemplate(
  'Question: {question}\nAnswer: {answer}'
)


const examples = [
  {
    question: `
      给以下 JS 函数写注释
      function add(a, b) {
        return a + b;
      }`,
    answer: `
      /**
      * 两个数字相加求和
      * @param {number} a - 第一个数字
      * @param {number} b - 第二个数字
      * @returns {number} 两个数字的和
      */`,
  },
  {
    question: `
      给以下 JS 函数写注释
      function getUser(id) {
        return db.findUserById(id);
      }
    `,
    answer: `
      /**
      * 根据用户ID从数据库中获取用户信息
      * @param {string} id - 唯一的用户 id
      * @returns {Object|null} 返回用户对象，如果未找到则返回 null
      */`,
  },
]
const escapeCurlyBraces = (s) => s.replace(/\{/g, '{{').replace(/\}/g, '}}')

const escapedExamples = examples.map((ex) => ({
  ...ex,
  question: escapeCurlyBraces(ex.question),
  answer: escapeCurlyBraces(ex.answer),
}))


const prompt = new FewShotPromptTemplate({
  examples: escapedExamples,
  examplePrompt,
  suffix: 'Question: {input}',
  inputVariables: ['input'],
})


const formatted = await prompt.format({
  input: `
  给以下 JS 函数写注释
  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }`,
})

console.log(formatted);