import dotenv from 'dotenv'
dotenv.config()
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// 确保 .env 中有 DB_URL
const connectionString = process.env.DB_URL
if (!connectionString) {
  throw new Error('Missing DB_URL in environment (.env DB_URL)')
}

// 访问postgres 客户端
const client = postgres(connectionString)

// 创建drizzle 实体
export const db = drizzle(client)
