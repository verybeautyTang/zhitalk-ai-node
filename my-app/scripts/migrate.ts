import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// 加载 .env 文件
dotenv.config();

if (!process.env.DB_URL) {
  throw new Error('DB_URL environment variable is not set');
}

async function runMigrations() {
  console.log('开始运行数据库迁移...');
  
  const client = postgres(process.env.DB_URL!, { max: 1 });
  const db = drizzle(client);

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ 数据库迁移完成！');
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error);
    throw error;
  } finally {
    await client.end();
  }
}

runMigrations().catch(console.error);