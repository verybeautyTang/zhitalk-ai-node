import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DB_URL) {
  throw new Error('DB_URL environment variable is not set');
}

// 创建 postgres 客户端
const client = postgres(process.env.DB_URL);

// 创建 drizzle 实例，传入 schema
export const db = drizzle(client, { schema });