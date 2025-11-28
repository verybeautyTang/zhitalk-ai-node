import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core'

// users 用户表
export const users = pgTable('users', {
  id: text('id').primaryKey().notNull(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  image: text('image'),
  intro: text('intro'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// blog 博客列表
export const blog = pgTable('blog', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  thumbup: integer('thumbup').notNull().default(0),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
