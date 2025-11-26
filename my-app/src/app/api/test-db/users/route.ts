import { NextResponse } from 'next/server'
import { db } from '../../../../lib/db'
import * as schema from '../../../../lib/schema'

function makeUsernameFromEmail(email: string) {
  const prefix = email.split('@')[0].replace(/[^\w.-]/g, '')
  return `${prefix}_${Date.now().toString().slice(-6)}`
}

export async function POST(request: Request) {
  try {
    // 解析请求 body（可传入自定义 users 数组或单个 user 对象）
    const body = await request.json().catch(() => null)
    let usersToInsert: any[] = []

    if (Array.isArray(body)) {
      usersToInsert = body
    } else if (body && Array.isArray(body.users)) {
      usersToInsert = body.users
    } else if (body && (body.name || body.email || body.username)) {
      usersToInsert = [body]
    } else {
      // 默认插入两条测试用户（根据 src/lib/schema.ts 的字段自行调整）
      usersToInsert = [
        { username: 'testuser_a', name: '测试用户 A', email: 'test-a@example.com' },
        { username: 'testuser_b', name: '测试用户 B', email: 'test-b@example.com' },
      ]
    }

    // 校验并补齐必填字段（根据 schema.users 的定义）
    const prepared = usersToInsert
      .map((u) => {
        const email = u.email?.trim()
        if (!email) return null // email 缺失就丢弃
        const username = (u.username && String(u.username).trim()) || makeUsernameFromEmail(email)
        // 保留其他字段（image/intro 等）或使用 null/default
        return {
          username,
          email,
          name: u.name ?? null,
          image: u.image ?? null,
          intro: u.intro ?? null,
        }
      })
      .filter(Boolean) as any[]

    if (prepared.length === 0) {
      return NextResponse.json(
        { success: false, message: '请求中没有有效的用户数据（需要至少包含 email）' },
        { status: 400 }
      )
    }

    // 插入数据并返回插入的行（drizzle 的 .returning()）
    const inserted = await db.insert(schema.users).values(prepared).returning()

    return NextResponse.json(
      {
        success: true,
        message: '插入成功',
        data: inserted,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ 插入用户失败:', error)
    // 如果是重复键等数据库错误，打印详细信息到日志（不直接写到客户端）
    return NextResponse.json(
      {
        success: false,
        message: '插入用户失败',
        data: { message: error?.message || String(error) },
      },
      { status: 500 }
    )
  }
}