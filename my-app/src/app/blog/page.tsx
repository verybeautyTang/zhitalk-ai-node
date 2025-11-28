'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import DeletePostButton from '../../components/DeletePostButton' // 新增导入
import EditPostButton from '../../components/EditPostButton' // 新增导入

interface BlogPost {
  id: string
  title: string
  content: string
  createdAt: Date
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blog')
        const data = await response.json()
        // 按时间逆序排序
        const sorted = data.sort(
          (a: BlogPost, b: BlogPost) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setPosts(sorted)
      } catch (error) {
        console.error('Failed to fetch posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1>Blog Page</h1>
        <Link href="/blog/new">
          <button style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}>
            New Blog
          </button>
        </Link>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts.map((post) => (
          <li
            key={post.id}
            style={{
              marginBottom: '2rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid #eee',
            }}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: '0.5rem 0' }}>
                  <Link
                    href={`/blog/${post.id}`}
                    style={{ color: '#0066cc', textDecoration: 'none' }}
                  >
                    {post.title}
                  </Link>
                </h2>
                <p style={{ color: '#666', margin: '0.5rem 0' }}>
                  {post.content.substring(0, 150)}...
                </p>
                <small style={{ color: '#999' }}>
                  {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                </small>
              </div>

              {/* 删除按钮组件 */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <EditPostButton postId={post.id} />
                <DeletePostButton postId={post.id} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
