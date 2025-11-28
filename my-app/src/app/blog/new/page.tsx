  'use client'
  import { useState } from 'react'
  import { useRouter } from 'next/navigation'

  const NewBlogPage = () => {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
      e.preventDefault()
      setError('')
      setSuccess('')

      if (!title || !content) {
        setError('请填写所有字段')
        return
      }

      setLoading(true)

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          userId: 'hello-world-user-id-1',
          id: Date.now().toString(),
          thumbup: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (data.errno === 0) {
        setSuccess('博客创建成功！')
        setTitle('')
        setContent('')
        setTimeout(() => router.push('/blog'), 1500)
      } else {
        setError(data.message || '创建博客失败')
      }

      setLoading(false)
    }

    return (
      <div>
        <h1>创建新博客</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">标题:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div>
            <label htmlFor="content">内容:</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? '提交中...' : '提交'}
          </button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </div>
    )
  }

  export default NewBlogPage
