'use client'

import { useState, useEffect } from 'react'

export default function ThumbUpButton({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [thumbUpCount, setThumbUpCount] = useState(0)
  const [hasThumbedUp, setHasThumbedUp] = useState(false)

  useEffect(() => {
    const fetchThumbUpStatus = async () => {
      try {
        const res = await fetch(`/api/blog/thumb-up/${id}`)
        if (res.ok) {
          const data = await res.json()
          setThumbUpCount(data.data.thumbup)
        }
      } catch (error) {
        console.error('获取点赞状态失败:', error)
      }
    }

    fetchThumbUpStatus()
  }, [id])

  async function handleThumbUp() {
    if (isLoading) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/blog/thumb-up/${id}`, {
        method: 'POST',
      })

      if (!res.ok) throw new Error('点赞失败')

      const data = await res.json()

      console.log(data)
      setThumbUpCount(data.data.thumbup)
    } catch (error) {
      console.error('点赞错误:', error)
      alert('点赞失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // if (!isInitialized) {
  //   return <button disabled>👍 加载中...</button>
  // }

  return (
    <button
      onClick={handleThumbUp}
      disabled={isLoading}
      className={hasThumbedUp ? 'thumbed-up' : ''}
      style={{
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        opacity: 1,
      }}
    >
      👍 {thumbUpCount}
    </button>
  )
}
