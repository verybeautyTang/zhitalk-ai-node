import { pgTable, varchar, text, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { InferModel } from 'drizzle-orm'

export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 36 }).primaryKey(), // 使用 UUID 字符串
    username: varchar('username', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    image: text('image'),
    intro: text('intro'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    usernameIdx: uniqueIndex('users_username_idx').on(table.username),
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
  })
)

export const blog = pgTable('blog', {
  id: varchar('id', { length: 36 }).primaryKey(),
  title: varchar('title', { length: 512 }).notNull(),
  content: text('content').notNull(),
  thumbup: integer('thumbup').default(0).notNull(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type User = InferModel<typeof users>
export type NewUser = InferModel<typeof users, 'insert'>

export type Blog = InferModel<typeof blog>
export type NewBlog = InferModel<typeof blog, 'insert'>
```// filepath: /Users/beautytang/Desktop/code/zhitalk-ai-node/my-app/app/lib/schema.ts
import { pgTable, varchar, text, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { InferModel } from 'drizzle-orm'

export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 36 }).primaryKey(), // 使用 UUID 字符串
    username: varchar('username', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    image: text('image'),
    intro: text('intro'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    usernameIdx: uniqueIndex('users_username_idx').on(table.username),
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
  })
)

export const blog = pgTable('blog', {
  id: varchar('id', { length: 36 }).primaryKey(),
  title: varchar('title', { length: 512 }).notNull(),
  content: text('content').notNull(),
  thumbup: integer('thumbup').default(0).notNull(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type User = InferModel<typeof users>
export type NewUser = InferModel<typeof users, 'insert'>

export type Blog = InferModel<typeof blog>
export type NewBlog = InferModel<typeof blog, 'insert'>