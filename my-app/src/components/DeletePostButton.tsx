'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  postId: string
}

export default function DeletePostButton({ postId }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('确定删除这篇文章吗？')) return
    setLoading(true)
    try {
      console.log(postId)
      const res = await fetch(`/api/blog/${postId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Delete failed')
      // 刷新页面数据
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('删除失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        marginLeft: '1rem',
        padding: '0.25rem 0.5rem',
        fontSize: '0.9rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        background: '#ff4d4f',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
      }}
    >
      {loading ? '删除中...' : '删除'}
    </button>
  )
}
