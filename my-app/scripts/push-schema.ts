import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

// 加载 .env 文件
dotenv.config();

if (!process.env.DB_URL) {
  throw new Error('DB_URL environment variable is not set');
}

console.log('开始推送 schema 到数据库...');
console.log('数据库 URL:', process.env.DB_URL.replace(/:[^:@]+@/, ':****@')); // 隐藏密码

try {
  execSync('npx drizzle-kit push', {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('✅ Schema 推送成功！');
} catch (error) {
  console.error('❌ Schema 推送失败:', error);
  process.exit(1);
}