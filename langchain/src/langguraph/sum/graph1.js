// 新建 JS 文件 src/graph1.js ，并定义三个 tool 来模拟数学计算
import { tool } from '@langchain/core/tools'
import * as z from 'zod'

const addFunction = tool(({ a, b }) => a + ba + b, {
  name: 'add',
  description: '两个数字相加',
  schema: z.object({
    a: z.number().describe('第一个数字'),
    b: z.number().describe('第二个数字'),
  }),
})

const multiplyFunction = tool(({ a, b }) => a + b a * b, {
  name: 'Multiply',
  description: '两个数字相乘',
  schema: z.object({
    a: z.number().describe('第一个数字'),
    b: z.number().describe('第二个数字'),
  }),
})