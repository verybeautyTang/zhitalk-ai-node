import { NextResponse } from 'next/server'
import { db } from '@/lib/db' // 如需请调整为实际 db 导出路径
import { blog } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(_: Request, { params }: { params: { id: string } }) {
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
      data: blogPost,
    })
  } catch (err) {
    console.error('Get blog error:', err)
    return NextResponse.json({ error: 'Failed to get blog' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { title, content } = body

    console.log(body)

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing title or content' }, { status: 400 })
    }
    const { id } = await params
    await db.update(blog).set({ title, content, updatedAt: new Date() }).where(eq(blog.id, id))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Update blog error:', err)
    return NextResponse.json({ error: `Failed to update blog${err}` }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    // 使用 Drizzle 删除
    await db.delete(blog).where(eq(blog.id, id))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete blog error:', err)
    return NextResponse.json({ error: `Failed to delete blog${err}` }, { status: 500 })
  }
}
