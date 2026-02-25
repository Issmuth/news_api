import { pgTable, uuid, varchar, text, timestamp, integer, date, pgEnum, unique } from 'drizzle-orm/pg-core';

// Enums
export const roleEnum = pgEnum('role', ['author', 'reader']);
export const statusEnum = pgEnum('status', ['Draft', 'Published']); 

// User Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(), 
  email: varchar('email', { length: 255 }).notNull().unique(), 
  password: text('password').notNull(),
  role: roleEnum('role').notNull(),
});

// Article Table
export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(), 
  title: varchar('title', { length: 150 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  status: statusEnum('status').default('Draft').notNull(),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

// ReadLog Table (Raw Event Data)
export const readLogs = pgTable('read_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').references(() => articles.id).notNull(),
  readerId: uuid('reader_id').references(() => users.id),
  readAt: timestamp('read_at').defaultNow().notNull(), 
});

// DailyAnalytics Table (Aggregated Data)
export const dailyAnalytics = pgTable('daily_analytics', {
  id: uuid('id').primaryKey().defaultRandom(), 
  articleId: uuid('article_id').references(() => articles.id).notNull(), 
  viewCount: integer('view_count').notNull().default(0), 
  date: date('date').notNull(), 
}, (t) => ({
  uniqueArticleDate: unique().on(t.articleId, t.date), 
}));