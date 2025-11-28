import { db } from '@/lib/db'
import { blog } from '@/lib/schema'
import { desc } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    // 从 request 获取数据
    const body = await request.json()
    const { title, content, userId } = body

    // 验证必填字段
    if (!title || !content || !userId) {
      return NextResponse.json(
        {
          errno: -1,
          message: '缺少必填字段：title, content, userId',
        },
        { status: 400 }
      )
    }

    // 生成 blog id
    const id = randomUUID()

    // 创建 blog 并存储到数据库
    const result = await db
      .insert(blog)
      .values({
        id,
        title,
        content,
        userId,
        thumbup: 0, // 默认值为 0
      })
      .returning()

    // 成功返回
    return NextResponse.json({
      errno: 0,
      data: result[0],
    })
  } catch (error) {
    console.error('创建 blog 失败:', error)

    // 失败返回
    return NextResponse.json(
      {
        errno: -1,
        message: error instanceof Error ? error.message : '创建 blog 失败',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const posts = await db.select().from(blog).orderBy(desc(blog.createdAt))
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
