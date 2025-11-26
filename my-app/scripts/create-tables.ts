+49
Lines changed: 49 additions & 0 deletions
Original file line number	Original file line	Diff line number	Diff line change
@@ -0,0 +1,49 @@
import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
// 加载 .env 文件
dotenv.config();
async function createTables() {
  console.log('开始创建数据表...');
  try {
    // 创建 users3 表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users3 (
        id TEXT PRIMARY KEY NOT NULL,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        image TEXT,
        intro TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✅ users3 表创建成功');
    // 创建 blog 表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS blog (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        thumbup INTEGER NOT NULL DEFAULT 0,
        user_id TEXT NOT NULL REFERENCES users3(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✅ blog 表创建成功');
    console.log('🎉 所有数据表创建完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 创建数据表失败:', error);
    process.exit(1);
  }
}
createTables();