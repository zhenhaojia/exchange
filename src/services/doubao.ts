import axios from 'axios'
import { Book, AIRecommendation } from '../types'

interface DoubaoResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

class DoubaoService {
  private apiKey: string
  private apiUrl: string

  constructor() {
    this.apiKey = import.meta.env.VITE_DOUBAO_API_KEY || ''
    this.apiUrl = import.meta.env.VITE_DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3'
    
    // 验证API Key格式
    if (!this.apiKey) {
      console.warn('豆包API Key未配置')
    } else if (!this.apiKey.startsWith('ak-') && !this.apiKey.startsWith('AKLT') && !this.apiKey.startsWith('VOLC_AK')) {
      console.warn('豆包API Key格式可能不正确，应该以ak-、AKLT或VOLC_AK开头')
    }
  }

  // 推荐图书
  async recommendBooks(userPreferences: string, readingHistory: Book[] = []): Promise<AIRecommendation> {
    try {
      const systemPrompt = `你是一个专业的图书推荐助手，基于用户的喜好和阅读历史推荐合适的图书。

用户偏好：${userPreferences}

阅读历史：
${readingHistory.map(book => `-《${book.title}》(${book.category})`).join('\n')}

请根据用户信息推荐5本最适合的图书，每本推荐都包含：
1. 书名
2. 作者
3. 推荐理由
4. 适合的原因

请以JSON格式返回，格式如下：
{
  "books": [
    {
      "title": "书名",
      "author": "作者",
      "recommendation_reason": "推荐理由"
    }
  ],
  "overall_reason": "总体推荐理由"
}

注意：推荐要符合用户的实际需求和兴趣，避免过于宽泛的推荐。`

      const response = await axios.post<DoubaoResponse>(
        `${this.apiUrl}/chat/completions`,
        {
          model: 'Doubao-lite-4k', // 使用豆包轻量版模型
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: `请根据我的喜好和阅读历史推荐一些好书。我的偏好是：${userPreferences}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const content = response.data.choices[0]?.message?.content || ''
      
      try {
        const parsed = JSON.parse(content)
        return {
          books: parsed.books || [],
          reason: parsed.overall_reason || '基于您的喜好为您推荐以上图书',
          timestamp: new Date().toISOString()
        }
      } catch (parseError) {
        // 如果解析失败，返回简单的推荐
        return {
          books: [],
          reason: content,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Doubao API error:', error)
      
      // 如果API不可用，返回模拟的图书推荐
      return {
        books: [
          { title: "人类简史", author: "尤瓦尔·赫拉利", recommendation_reason: "通俗易懂的历史读物，适合了解人类文明发展" },
          { title: "活着", author: "余华", recommendation_reason: "感人至深的经典作品，值得反复阅读" },
          { title: "原则", author: "瑞·达利欧", recommendation_reason: "生活和工作的指导原则，实用性强" }
        ],
        reason: '基于您的兴趣，为您推荐这些经典好书。这些书籍都经过了时间检验，值得深入阅读。注意：这是模拟推荐，如需个性化推荐请配置正确的API密钥。',
        timestamp: new Date().toISOString()
      }
    }
  }

  // 图书搜索助手
  async searchBooksAssistant(query: string): Promise<string> {
    try {
      const systemPrompt = `你是一个专业的图书搜索助手，帮助用户找到想要的图书。

用户查询：${query}

请提供详细的搜索建议，包括：
1. 关键词分析
2. 搜索建议
3. 相关图书推荐
4. 搜索技巧

回答要简洁明了，突出重点。`

      const response = await axios.post<DoubaoResponse>(
        `${this.apiUrl}/chat/completions`,
        {
          model: 'Doubao-lite-4k',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.5,
          max_tokens: 800
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data.choices[0]?.message?.content || '抱歉，无法处理您的查询'
    } catch (error) {
      console.error('Doubao search assistant error:', error)
      
      // 如果API不可用，返回模拟的搜索建议
      return `🔍 搜索建议：

关键词分析："${query}"包含了${query.split('').length}个字符

搜索技巧：
1. 尝试使用更精确的关键词
2. 可以搜索作者名、书名或主题
3. 使用引号进行精确搜索，如："活着"
4. 结合多个关键词提高搜索精度

图书推荐方向：
- 如果搜索技术类书籍，建议包含"入门"、"实战"、"教程"等关键词
- 如果搜索文学类书籍，可以尝试作者名或作品名
- 如果搜索专业书籍，建议包含专业术语

建议：您可以在图书广场页面浏览分类，或使用搜索框进行更精确的查找。

注意：这是模拟搜索建议。如需智能搜索助手，请配置正确的API密钥。`
    }
  }

  // 读书建议
  async getReadingAdvice(userLevel: string, interests: string[]): Promise<string> {
    try {
      const systemPrompt = `你是一个专业的读书顾问，根据用户的水平和兴趣提供个性化的读书建议。

用户水平：${userLevel}
兴趣领域：${interests.join(', ')}

请提供：
1. 阅读路径建议
2. 基础入门书籍推荐
3. 进阶阅读计划
4. 读书方法建议

建议要切实可行，符合用户的实际情况。`

      // 添加调试信息
      console.log('豆包API调用:', {
        url: `${this.apiUrl}/chat/completions`,
        model: 'Doubao-lite-4k',
        apiKey: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : '未设置'
      })

      const response = await axios.post<DoubaoResponse>(
        `${this.apiUrl}/chat/completions`,
        {
          model: 'Doubao-lite-4k',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: `请根据我的水平和兴趣为我制定一个读书计划`
            }
          ],
          temperature: 0.6,
          max_tokens: 1200
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data.choices[0]?.message?.content || '抱歉，无法提供读书建议'
    } catch (error) {
      console.error('Doubao reading advice error:', error)
      
      // 如果API不可用，返回模拟的读书建议
      return `基于您的${userLevel}水平和在${interests.join('、')}领域的兴趣，为您制定以下阅读计划：

📚 阅读路径建议：
1. 从基础入门书籍开始，逐步深入
2. 选择通俗易懂、实用性强的书籍
3. 定期阅读，保持学习节奏

📖 基础入门推荐：
- 选择评分高、评价好的经典入门书籍
- 优先选择理论与实践结合的书籍
- 注重书籍的可读性和实用性

🎯 进阶学习计划：
1. 基础阶段（1-2个月）：掌握核心概念和基本技能
2. 进阶阶段（3-4个月）：深入学习专业知识和技能
3. 高级阶段（5-6个月）：研究和实践高级应用

💡 读书方法建议：
- 制定每日阅读计划，保持学习连续性
- 做好读书笔记，记录重要观点和个人思考
- 结合实践应用所学知识
- 定期回顾和总结学习成果

注意：这是模拟建议。如需个性化AI推荐，请确保配置正确的API密钥。`
    }
  }
}

export const doubaoService = new DoubaoService()