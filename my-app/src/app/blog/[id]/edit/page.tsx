'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [data, setData] = useState({})
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    let cancelled = false

    const fetchPost = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/blog/${id}`)
        if (res.status === 404) {
          if (!cancelled) setNotFound(true)
          return
        }
        if (!res.ok) throw new Error('Fetch failed')
        // console.log(await res.json())
        const post = await res.json()
        if (!cancelled) {
          setData(post.data)
          setTitle(post.data.title)
          setContent(post.data.content)
        }
      } catch (err) {
        console.error('加载文章失败', err)
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPost()

    return () => {
      cancelled = true
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('标题和内容不能为空')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          title: title.trim(),
          content: content.trim(),
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      // 保存成功，回到列表页并刷新
      router.push('/blog')
      router.refresh?.()
    } catch (err) {
      console.error(err)
      alert('保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ padding: 16 }}>加载中...</div>
  if (notFound)
    return (
      <div style={{ padding: 16 }}>
        <h1>文章未找到</h1>
        <p>ID 为 {id} 的文章不存在。</p>
        <button
          onClick={() => router.push('/blog')}
          style={{
            marginTop: 12,
            padding: '0.5rem 1rem',
            background: '#1890ff',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          返回列表
        </button>
      </div>
    )

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1>编辑文章</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>标题</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: 8, fontSize: 16 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            style={{ width: '100%', padding: 8, fontSize: 14 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '0.5rem 1rem',
              background: '#1890ff',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? '保存中...' : '保存'}
          </button>

          <button
            type="button"
            onClick={() => {
              router.back()
            }}
            style={{
              padding: '0.5rem 1rem',
              background: '#f0f0f0',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}
