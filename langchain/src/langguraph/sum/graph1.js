// 新建 JS 文件 src/graph1.js ，并定义三个 tool 来模拟数学计算
import { tool } from '@langchain/core/tools'
import * as z from 'zod'

const addFunction = tool(a + b, {
    name:'add',
    describtion: '两个数字相加',
})