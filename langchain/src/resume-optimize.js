import { ChatDeepSeek } from '@langchain/deepseek'
import 'dotenv/config'
import { createAgent, tool } from 'langchain'
import { MemorySaver } from '@langchain/langgraph'
import { StateGraph, START, END } from '@langchain/langgraph'
import * as z from 'zod'

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
})

// Define the state structure
const ResumeState = z.object({
  resume_text: z.string(),
  personal_info: z.object({
    content: z.string(),
    analysis: z.string(),
  }),
  skills: z.object({
    content: z.string(),
    depth_analysis: z.string(),
    breadth_analysis: z.string(),
    match_analysis: z.string(),
  }),
  experience: z.object({
    content: z.string(),
    complexity_analysis: z.string(),
    relevance_analysis: z.string(),
    match_analysis: z.string(),
  }),
  work_years: z.number(),
  final_recommendations: z.array(z.string()),
})

// Tool definitions
const resumeTools = [
  tool(
    async ({ resume_text }) => {
      console.log('resume_text', resume_text)
      const personalInfoPattern =
        /(个人信息|个人简介|基本信息)[：:\n]*([\s\S]*?)(?=\n\s*\n|\n\s*[^：：\n]*[：:]|$)/i
      const personalMatch = resume_text.match(personalInfoPattern)
      let personalInfo = personalMatch ? personalMatch[2].trim() : '未找到明确的个人信息部分'

      const yearsPattern = /(\d+)\s*年工作经验|工作\s*(\d+)\s*年|经验\s*(\d+)\s*年/i
      const yearsMatch = resume_text.match(yearsPattern)
      let workYears = 0

      if (yearsMatch) {
        for (let i = 1; i < yearsMatch.length; i++) {
          if (yearsMatch[i]) {
            workYears = parseInt(yearsMatch[i])
            break
          }
        }
      }

      return {
        personal_info: personalInfo,
        work_years: workYears,
      }
    },
    {
      name: 'extract_personal_info',
      description: '从简历文本中提取个人信息和工作年限',
      schema: z.object({
        resume_text: z.string(),
      }),
    }
  ),

  tool(
    async ({ resume_text }) => {
      const skillsPattern =
        /(专业技能|技术技能|技术栈)[：:\n]*([\s\S]*?)(?=\n\s*\n|\n\s*[^：：\n]*[：:]|$)/i
      const skillsMatch = resume_text.match(skillsPattern)
      const skillsContent = skillsMatch ? skillsMatch[2].trim() : '未找到明确的专业技能部分'

      return {
        skills_content: skillsContent,
      }
    },
    {
      name: 'extract_skills',
      description: '从简历文本中提取专业技能部分',
      schema: z.object({
        resume_text: z.string(),
      }),
    }
  ),

  tool(
    async ({ resume_text }) => {
      const experiencePattern =
        /(项目经验|工作经历|项目经历)[：:\n]*([\s\S]*?)(?=\n\s*\n|\n\s*[^：：\n]*[：:]|$)/i
      const experienceMatch = resume_text.match(experiencePattern)
      const experienceContent = experienceMatch
        ? experienceMatch[2].trim()
        : '未找到明确的项目经验部分'

      return {
        experience_content: experienceContent,
      }
    },
    {
      name: 'extract_experience',
      description: '从简历文本中提取项目经验部分',
      schema: z.object({
        resume_text: z.string(),
      }),
    }
  ),

  tool(
    async ({ skills_content, work_years }) => {
      const skillLines = skills_content.split('\n').filter((line) => line.trim())
      const skillCount = skillLines.length

      let depthAnalysis = ''
      let breadthAnalysis = ''
      let matchAnalysis = ''

      const hasAdvancedSkills = /(精通|深入|专家|高级|advanced|expert)/i.test(skills_content)
      const hasFrameworkSkills = /(React|Vue|Spring|Django|TensorFlow|PyTorch)/i.test(
        skills_content
      )

      if (hasAdvancedSkills && hasFrameworkSkills) {
        depthAnalysis = '技能深度较好，包含高级技能和主流框架'
      } else if (hasFrameworkSkills) {
        depthAnalysis = '技能深度一般，包含主流框架但缺乏高级技能体现'
      } else {
        depthAnalysis = '技能深度不足，建议增加高级技能和框架经验'
      }

      const techCategories = {
        frontend: /(JavaScript|TypeScript|HTML|CSS|React|Vue|Angular)/i,
        backend: /(Java|Python|Node\.js|Go|Spring|Django|Express)/i,
        database: /(MySQL|PostgreSQL|MongoDB|Redis|SQL)/i,
        devops: /(Docker|Kubernetes|AWS|Azure|CI\/CD|Linux)/i,
      }

      let categoryCount = 0
      for (const category in techCategories) {
        if (techCategories[category].test(skills_content)) {
          categoryCount++
        }
      }

      if (categoryCount >= 3) {
        breadthAnalysis = '技能广度很好，覆盖多个技术领域'
      } else if (categoryCount >= 2) {
        breadthAnalysis = '技能广度一般，建议扩展技术栈'
      } else {
        breadthAnalysis = '技能广度较窄，建议学习相关技术扩展能力范围'
      }

      if (work_years > 0) {
        if (work_years >= 5 && hasAdvancedSkills && categoryCount >= 3) {
          matchAnalysis = '技能水平与工作年限匹配良好'
        } else if (work_years >= 3 && hasFrameworkSkills && categoryCount >= 2) {
          matchAnalysis = '技能水平与工作年限基本匹配'
        } else if (work_years >= 3 && (!hasFrameworkSkills || categoryCount < 2)) {
          matchAnalysis = '技能水平可能低于工作年限预期，建议加强技术深度'
        } else {
          matchAnalysis = '需要更多信息来准确评估技能与年限的匹配度'
        }
      } else {
        matchAnalysis = '无法确定工作年限，无法进行匹配度分析'
      }

      return {
        depth_analysis: depthAnalysis,
        breadth_analysis: breadthAnalysis,
        match_analysis: matchAnalysis,
      }
    },
    {
      name: 'analyze_skills',
      description: '分析专业技能的深度、广度和与工作年限的匹配度',
      schema: z.object({
        skills_content: z.string(),
        work_years: z.number(),
      }),
    }
  ),

  tool(
    async ({ experience_content, work_years }) => {
      const projects = experience_content.split(/\n\s*\n/).filter((project) => project.trim())

      let complexityAnalysis = ''
      let relevanceAnalysis = ''
      let matchAnalysis = ''

      const hasLargeScale = /(大型|高并发|分布式|微服务|系统架构)/i.test(experience_content)
      const hasTechnicalChallenges = /(性能优化|技术难点|架构设计|技术攻关)/i.test(
        experience_content
      )
      const hasLeadership = /(主导|负责|带领团队|项目管理)/i.test(experience_content)

      if (hasLargeScale && hasTechnicalChallenges && hasLeadership) {
        complexityAnalysis = '项目复杂度高，包含大型系统和技术挑战'
      } else if (hasTechnicalChallenges || hasLeadership) {
        complexityAnalysis = '项目复杂度中等，有一定技术含量'
      } else {
        complexityAnalysis = '项目复杂度较低，建议增加有挑战性的项目经验'
      }

      const modernTechMentioned = /(云原生|容器化|微服务|AI|大数据|敏捷开发)/i.test(
        experience_content
      )
      const businessImpact = /(提升效率|降低成本|增加收入|优化性能|用户增长)/i.test(
        experience_content
      )

      if (modernTechMentioned && businessImpact) {
        relevanceAnalysis = '项目经验技术相关性高，包含现代技术和业务影响'
      } else if (businessImpact) {
        relevanceAnalysis = '项目经验有一定业务价值，但技术现代性可以加强'
      } else {
        relevanceAnalysis = '建议增加更具技术挑战和业务影响力的项目描述'
      }

      if (work_years > 0) {
        if (work_years >= 5 && hasLargeScale && hasLeadership) {
          matchAnalysis = '项目经验与工作年限匹配良好'
        } else if (work_years >= 3 && (hasTechnicalChallenges || hasLeadership)) {
          matchAnalysis = '项目经验与工作年限基本匹配'
        } else if (work_years >= 3 && !hasTechnicalChallenges && !hasLeadership) {
          matchAnalysis = '项目经验可能低于工作年限预期，建议增加有挑战性的项目'
        } else {
          matchAnalysis = '项目经验与工作年限匹配度需要进一步观察'
        }
      } else {
        matchAnalysis = '无法确定工作年限，无法进行项目经验匹配度分析'
      }

      return {
        complexity_analysis: complexityAnalysis,
        relevance_analysis: relevanceAnalysis,
        match_analysis: matchAnalysis,
      }
    },
    {
      name: 'analyze_experience',
      description: '分析项目经验的复杂度、技术相关性和与工作年限的匹配度',
      schema: z.object({
        experience_content: z.string(),
        work_years: z.number(),
      }),
    }
  ),
]

// Create the agent
const resumeAgent = await createAgent({
  model: llm,
  tools: resumeTools,
  systemMessage: `你是一个专业的程序员简历优化专家。请按照以下步骤分析简历：
  1. 提取并格式化简历的各个部分
  2. 分析专业技能的深度、广度和与工作年限的匹配度
  3. 分析项目经验的复杂度、技术相关性和与工作年限的匹配度
  4. 提供具体的优化建议
  请使用提供的工具来执行分析，并给出专业、实用的建议。`,
})

// Build the state graph
const workflow = new StateGraph(ResumeState)
  .addNode('extract_info', async (state) => {
    const personalResult = await resumeTools[0].func({ resume_text: state.resume_text })

    return {
      ...state,
      personal_info: {
        content: personalResult.personal_info,
        analysis: '个人信息提取成功',
      },
      work_years: personalResult.work_years,
    }
  })
  .addNode('extract_skills', async (state) => {
    const skillsResult = await resumeTools[1].func({ resume_text: state.resume_text })

    return {
      ...state,
      skills: {
        ...state.skills,
        content: skillsResult.skills_content,
      },
    }
  })
  .addNode('extract_experience', async (state) => {
    const experienceResult = await resumeTools[2].func({ resume_text: state.resume_text })

    return {
      ...state,
      experience: {
        ...state.experience,
        content: experienceResult.experience_content,
      },
    }
  })
  .addNode('analyze_skills', async (state) => {
    if (!state.skills.content || state.work_years === undefined) return state

    const analysisResult = await resumeTools[3].func({
      skills_content: state.skills.content,
      work_years: state.work_years,
    })

    return {
      ...state,
      skills: {
        ...state.skills,
        depth_analysis: analysisResult.depth_analysis,
        breadth_analysis: analysisResult.breadth_analysis,
        match_analysis: analysisResult.match_analysis,
      },
    }
  })
  .addNode('analyze_experience', async (state) => {
    if (!state.experience.content || state.work_years === undefined) return state

    const analysisResult = await resumeTools[4].func({
      experience_content: state.experience.content,
      work_years: state.work_years,
    })

    return {
      ...state,
      experience: {
        ...state.experience,
        complexity_analysis: analysisResult.complexity_analysis,
        relevance_analysis: analysisResult.relevance_analysis,
        match_analysis: analysisResult.match_analysis,
      },
    }
  })
  .addNode('generate_recommendations', async (state) => {
    const recommendations = []

    if (state.skills.depth_analysis.includes('不足')) {
      recommendations.push('加强技能深度，学习高级技术和架构设计')
    }

    if (state.skills.breadth_analysis.includes('较窄')) {
      recommendations.push('扩展技术栈广度，学习相关领域技术')
    }

    if (state.skills.match_analysis.includes('低于预期')) {
      recommendations.push('提升技能水平以匹配工作年限期望')
    }

    if (state.experience.complexity_analysis.includes('较低')) {
      recommendations.push('增加有技术挑战性的项目经验')
    }

    if (state.experience.relevance_analysis.includes('可以加强')) {
      recommendations.push('更新项目经验，加入现代技术和业务影响描述')
    }

    if (state.experience.match_analysis.includes('低于预期')) {
      recommendations.push('寻求更具挑战性的项目来匹配工作经验')
    }

    if (recommendations.length === 0) {
      recommendations.push(
        '简历整体不错，建议继续维护技术深度和广度',
        '保持学习新技术，关注行业发展趋势',
        '量化项目成果，用数据展示技术价值'
      )
    }

    return {
      ...state,
      final_recommendations: recommendations,
    }
  })

// Define workflow connections
workflow
  .addEdge(START, 'extract_info')
  .addEdge('extract_info', 'extract_skills')
  .addEdge('extract_skills', 'extract_experience')
  .addEdge('extract_experience', 'analyze_skills')
  .addEdge('analyze_skills', 'analyze_experience')
  .addEdge('analyze_experience', 'generate_recommendations')
  .addEdge('generate_recommendations', END)

// Compile the workflow
const checkpointer = new MemorySaver()
const app = workflow.compile({ checkpointer })

// Memory 需要一个 thread_id ，每个对话一个 id ，防止混乱
const config = {
  configurable: { thread_id: 'yyy' },
}

// Example usage
async function analyzeResume(resumeText) {
  const initialState = {
    resume_text: resumeText,
    personal_info: { content: '', analysis: '' },
    skills: { content: '', depth_analysis: '', breadth_analysis: '', match_analysis: '' },
    experience: {
      content: '',
      complexity_analysis: '',
      relevance_analysis: '',
      match_analysis: '',
    },
    work_years: 0,
    final_recommendations: [],
    config,
  }

  try {
    const result = await app.invoke(initialState, config)
    console.log('=== 简历分析结果 ===')
    console.log(`工作年限: ${result.work_years}年`)
    console.log('\n--- 专业技能分析 ---')
    console.log(`深度分析: ${result.skills.depth_analysis}`)
    console.log(`广度分析: ${result.skills.breadth_analysis}`)
    console.log(`匹配度分析: ${result.skills.match_analysis}`)

    console.log('\n--- 项目经验分析 ---')
    console.log(`复杂度分析: ${result.experience.complexity_analysis}`)
    console.log(`相关性分析: ${result.experience.relevance_analysis}`)
    console.log(`匹配度分析: ${result.experience.match_analysis}`)

    console.log('\n--- 优化建议 ---')
    result.final_recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`)
    })

    return result
  } catch (error) {
    console.error('分析出错:', error)
  }
}

// Export main functionality
export { analyzeResume, resumeAgent }

// Example usage
const sampleResume = `
个人信息
姓名：张三
工作经验：3年
邮箱：zhangsan@email.com

专业技能
• 熟练掌握 Java、Python 编程语言
• 了解 Spring 框架
• 熟悉 MySQL 数据库
• 了解 Docker 基本使用

项目经验
项目一：电商系统开发
• 参与订单模块开发
• 修复了一些bug

项目二：内容管理系统
• 负责用户管理功能
• 进行代码维护
`

// Run example
analyzeResume(sampleResume)
  .then((result) => {
    console.log('\n分析完成！')
  })
  .catch((error) => {
    console.error('分析出错:', error)
  })
