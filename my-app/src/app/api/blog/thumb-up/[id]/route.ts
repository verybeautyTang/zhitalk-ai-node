import { db } from '@/lib/db'
import { blog } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // 更新数据库中的 thumbup 字段，增加 1
    const result = await db
      .update(blog)
      .set({
        thumbup: sql`${blog.thumbup} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(blog.id, id))
      .returning({ thumbup: blog.thumbup })

    // 如果博客不存在
    if (result.length === 0) {
      return Response.json({ errno: 1, message: '博客不存在' }, { status: 404 })
    }

    return Response.json({
      errno: 0,
      data: {
        id,
        thumbup: result[0].thumbup,
      },
    })
  } catch (error) {
    console.error('点赞失败:', error)
    return Response.json({ errno: 1, message: '点赞失败，请稍后重试' }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const blogPost = await db.query.blog.findFirst({
      where: eq(blog.id, id),
    })

    if (!blogPost) {
      return Response.json({ error: '博客不存在' }, { status: 404 })
    }

    return Response.json({
      errno: 0,
      data: {
        id,
        thumbup: blogPost.thumbup,
      },
    })
  } catch (error) {
    console.error('点赞失败:', error)
    return Response.json({ errno: 1, message: '点赞失败，请稍后重试' }, { status: 500 })
  }
}
