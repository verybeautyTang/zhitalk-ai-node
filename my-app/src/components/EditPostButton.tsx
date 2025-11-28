'use client'

import Link from 'next/link'

interface Props {
  postId: string
}

export default function EditPostButton({ postId }: Props) {
  return (
    <Link href={`/blog/${postId}/edit`}>
      <button
        style={{
          marginLeft: '0.5rem',
          padding: '0.25rem 0.5rem',
          fontSize: '0.9rem',
          cursor: 'pointer',
          background: '#1890ff',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
        }}
      >
        编辑
      </button>
    </Link>
  )
}
