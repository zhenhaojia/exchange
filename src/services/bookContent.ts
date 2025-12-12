import { supabase } from './supabase'

export interface BookChapter {
  id: string
  book_id: string
  chapter_number: number
  chapter_title: string
  content: string
  word_count: number
  reading_time: number
  created_at: string
  updated_at: string
}

export interface BookContent {
  book_id: string
  chapters: BookChapter[]
  total_words: number
  total_reading_time: number
}

export const bookContentService = {
  // 获取图书的所有章节
  async getBookContent(bookId: string): Promise<BookContent | null> {
    const { data: chapters, error } = await supabase
      .from('book_content')
      .select('*')
      .eq('book_id', bookId)
      .order('chapter_number', { ascending: true })

    if (error) {
      console.error('获取图书内容失败:', error)
      return null
    }

    if (!chapters || chapters.length === 0) {
      return null
    }

    // 计算总字数和阅读时间
    const totalWords = chapters.reduce((sum, chapter) => sum + (chapter.word_count || 0), 0)
    const totalReadingTime = chapters.reduce((sum, chapter) => sum + (chapter.reading_time || 0), 0)

    return {
      book_id: bookId,
      chapters,
      total_words: totalWords,
      total_reading_time: totalReadingTime
    }
  },

  // 获取单个章节
  async getChapter(bookId: string, chapterNumber: number): Promise<BookChapter | null> {
    const { data: chapter, error } = await supabase
      .from('book_content')
      .select('*')
      .eq('book_id', bookId)
      .eq('chapter_number', chapterNumber)
      .single()

    if (error) {
      console.error('获取章节失败:', error)
      return null
    }

    return chapter
  },

  // 更新阅读进度
  async updateReadingProgress(
    userId: string, 
    bookId: string, 
    currentChapter: number, 
    progress: number
  ): Promise<void> {
    const { error } = await supabase
      .from('reading_sessions')
      .update({
        current_chapter: currentChapter,
        progress_percentage: progress,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('book_id', bookId)

    if (error) {
      console.error('更新阅读进度失败:', error)
      throw new Error('更新阅读进度失败')
    }
  },

  // 获取阅读进度
  async getReadingProgress(userId: string, bookId: string): Promise<{
    currentChapter: number
    progress: number
  } | null> {
    const today = new Date().toISOString().split('T')[0]
    const { data: session, error } = await supabase
      .from('reading_sessions')
      .select('current_chapter, progress_percentage')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .gte('created_at', today)
      .single()

    if (error || !session) {
      return { currentChapter: 1, progress: 0 }
    }

    return {
      currentChapter: session.current_chapter || 1,
      progress: Number(session.progress_percentage) || 0
    }
  },

  // 创建图书内容（管理员功能）
  async createBookContent(content: Omit<BookChapter, 'id' | 'created_at' | 'updated_at'>): Promise<BookChapter> {
    const { data, error } = await supabase
      .from('book_content')
      .insert(content)
      .select()
      .single()

    if (error) {
      console.error('创建图书内容失败:', error)
      throw new Error('创建图书内容失败')
    }

    return data
  },

  // 更新图书内容（管理员功能）
  async updateBookContent(
    id: string, 
    content: Partial<BookChapter>
  ): Promise<BookChapter> {
    const { data, error } = await supabase
      .from('book_content')
      .update({
        ...content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新图书内容失败:', error)
      throw new Error('更新图书内容失败')
    }

    return data
  },

  // 删除图书内容（管理员功能）
  async deleteBookContent(id: string): Promise<void> {
    const { error } = await supabase
      .from('book_content')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('删除图书内容失败:', error)
      throw new Error('删除图书内容失败')
    }
  }
}