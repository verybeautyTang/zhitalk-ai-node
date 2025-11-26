import { db } from '../../lib/db'
import { sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 连接数据库，执行一个简单的查询
    const result = await db.execute(sql`SELECT NOW() AS current_time, version() as pg_version`)
    return NextResponse.json({
      success: true,
      message: '链接数据库成功',
      data: {
        currentTime: result.rows[0]?.current_time,
        postgresVersion: result.rows[0]?.pg_version,
      },
    })
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    return NextResponse.json({
      success: false,
      message: '链接数据库失败',
      data: {
        error: error,
      },
    })
  }
}
