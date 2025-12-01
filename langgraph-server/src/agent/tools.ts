import { TavilySearch } from '@langchain/tavily'
import { StructuredToolInterface } from '@langchain/core/tools'
const tavilySearchTool = new TavilySearch({
  maxResults: 3,
  topic: 'general',
})
// 工具列表
export const tools: StructuredToolInterface[] = [tavilySearchTool]
// 创建工具映射，方便根据名称查找工具
export const toolsByName = Object.fromEntries(tools.map((tool) => [tool.name, tool]))
