import { db } from '@/lib/db'
import { blog } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import ThumbUpButton from './thumb-up'

type BlogDetailProps = {
  params: Promise<{ id: string }>
}

export default async function BlogDetail({ params }: BlogDetailProps) {
  const { id } = await params

  const blogPost = await db.select().from(blog).where(eq(blog.id, id)).limit(1)

  if (!blogPost || blogPost.length === 0) {
    return (
      <div>
        <h1>Blog Post Not Found</h1>
        <p>The blog post with ID {id} does not exist.</p>
      </div>
    )
  }

  const post = blogPost[0]
  const formattedDate = new Date(post.updatedAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return (
    <div>
      <h1>{post.title}</h1>
      <p className="text-gray-500 text-sm">更新于: {formattedDate}</p>
      <article className="mt-6">{post.content}</article>
      <ThumbUpButton id={id} />
    </div>
  )
}
