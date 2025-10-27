import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'
import { TavilySearch } from '@langchain/tavily'
import { z } from 'zod'
import { DynamicStructuredTool } from '@langchain/core/tools'

// Create the LLM instance
const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

// Create a Tavily network search tool
const tavilyTool = new TavilySearch({
  maxResults: 5,
  topic: 'general',
})

// Create weather tool
const weatherTool = new DynamicStructuredTool({
  name: 'get_weather',
  description: 'Get the current weather and forecast for a specific location',
  schema: z.object({
    location: z.string().describe('The city and country/region name, e.g. "Beijing, China" or "New York, US"'),
    days: z.number().optional().describe('Number of days for forecast, default is 1 (current weather)').default(1),
  }),
  func: async ({ location, days }) => {
    try {
      // 这里可以使用真实的天气 API，例如：
      // - OpenWeatherMap: https://openweathermap.org/api
      // - WeatherAPI: https://www.weatherapi.com/
      // - 或者使用 Tavily 搜索天气信息
      
      // 模拟天气数据返回（实际使用时请替换为真实的 API 调用）
      const mockWeatherData = {
        location,
        current: {
          temperature: 22,
          condition: 'Sunny',
          humidity: 65,
          windSpeed: 15,
        },
        forecast: days > 1 ? Array.from({ length: days }, (_, i) => ({
          date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          high: 25 + i,
          low: 18 + i,
          condition: i % 2 === 0 ? 'Sunny' : 'Cloudy',
        })) : [],
      }

      if (days === 1) {
        return `Current weather in ${location}: ${mockWeatherData.current.temperature}°C, ${mockWeatherData.current.condition}, Humidity: ${mockWeatherData.current.humidity}%, Wind: ${mockWeatherData.current.windSpeed} km/h`
      } else {
        const forecastText = mockWeatherData.forecast.map(day => 
          `${day.date}: High ${day.high}°C, Low ${day.low}°C, ${day.condition}`
        ).join('\n')
        return `Weather forecast for ${location} (${days} days):\n${forecastText}`
      }
    } catch (error) {
      return `Error getting weather for ${location}: ${error.message}`
    }
  },
})

// 使用真实天气 API 的版本（取消注释并配置 API key 后使用）
/*
const realWeatherTool = new DynamicStructuredTool({
  name: 'get_weather',
  description: 'Get the current weather and forecast for a specific location',
  schema: z.object({
    location: z.string().describe('The city and country/region name'),
    days: z.number().optional().default(1),
  }),
  func: async ({ location, days }) => {
    try {
      // 使用 OpenWeatherMap API（需要注册获取 API key）
      const apiKey = process.env.OPENWEATHER_API_KEY
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
      )
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      return `Current weather in ${location}: ${data.main.temp}°C, ${data.weather[0].description}, Humidity: ${data.main.humidity}%, Wind: ${data.wind.speed} m/s`
    } catch (error) {
      return `Error getting weather for ${location}: ${error.message}`
    }
  },
})
*/

// Bind all tools to the LLM
const llmWithTools = llm.bindTools([tavilyTool, weatherTool])

async function run() {
  try {
    // 测试天气查询
    const weatherPrompt = `What's the current weather in Beijing, China? Also give me a 3-day forecast.`

    console.log('--- Testing weather tool ---')
    const weatherRes = await llmWithTools.invoke(weatherPrompt)
    
    console.log('Weather response:')
    console.log(weatherRes)
    
    // 测试搜索功能（原有功能）
    const searchPrompt = `Search the web and summarize the top results for "AI in healthcare". Return a short summary and include the top result titles and URLs.`

    console.log('\n--- Testing search tool ---')
    const searchRes = await llmWithTools.invoke(searchPrompt)

    console.log('Search response:')
    console.log(searchRes)
    
    // 测试混合查询
    const mixedPrompt = `What's the weather like in Tokyo today? Also search for recent news about climate change.`

    console.log('\n--- Testing mixed query ---')
    const mixedRes = await llmWithTools.invoke(mixedPrompt)

    console.log('Mixed response:')
    console.log(mixedRes)

  } catch (err) {
    console.error('Error running demo:', err)
    process.exitCode = 1
  }
}

// 单独测试天气工具
async function testWeatherTool() {
  console.log('--- Direct weather tool test ---')
  const result = await weatherTool.invoke({
    location: 'Paris, France',
    days: 2
  })
  console.log('Direct tool result:', result)
}

// Run when executed directly (ESM)
if (process.argv[1] === new URL(import.meta.url).pathname) {
  // 可以根据命令行参数选择测试模式
  if (process.argv[2] === 'weather') {
    testWeatherTool()
  } else {
    testWeatherTool()
  }
}

export { llmWithTools, weatherTool, tavilyTool }