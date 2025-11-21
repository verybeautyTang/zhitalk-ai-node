import dotenv from 'dotenv'
dotenv.config()
import postgres from 'postgres'

const connectionString = process.env.DB_URL
if (!connectionString) {
  console.error('Missing DB_URL in .env')
  process.exit(1)
}

const sql = postgres(connectionString)

async function main() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id varchar(36) PRIMARY KEY,
        username varchar(255) NOT NULL UNIQUE,
        email varchar(255) NOT NULL UNIQUE,
        image text,
        intro text,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW()
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS blog (
        id varchar(36) PRIMARY KEY,
        title varchar(512) NOT NULL,
        content text NOT NULL,
        thumbup integer NOT NULL DEFAULT 0,
        user_id varchar(36) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_blog_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `

    console.log('✅ 数据表已同步到远程数据库（users, blog）')
    process.exit(0)
  } catch (err) {
    console.error('❌ 同步数据表失败:', err)
    process.exit(1)
  } finally {
    try {
      await sql.end()
    } catch (_) {}
  }
}

main()
