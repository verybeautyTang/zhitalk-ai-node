import { db } from '@/lib/db'
import { users } from '@/lib/schema'

export async function POST() {
  try {
    const timestamp = Date.now()
    // 生成两个测试用户数据
    const testUsers = [
      {
        id: 'hello-world-user-id-1',
        username: `testuser1-${timestamp}`,
        email: `testuser1-${timestamp}@example.com`,
        image: 'https://via.placeholder.com/150',
        intro: 'waoo',
        created_at: timestamp,
        updated_at: timestamp,
      },
      {
        id: 'hello-world-user-id-2',
        username: `testuser2-${timestamp}`,
        email: `testuser2-${timestamp}@example.com`,
        image: 'https://via.placeholder.com/150',
        intro: 'nicess',
        created_at: timestamp,
        updated_at: timestamp,
      },
    ]

    // 使用 drizzle 插入数据
    const result = await db.insert(users).values(testUsers).returning()

    return Response.json(
      {
        errno: 0,
        message: '成功插入两个测试用户',
        data: result,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('插入用户失败:', error)

    return Response.json(
      {
        errno: 1,
        message: '插入用户失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}
