import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const cryptocurrencies = pgTable("cryptocurrencies", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  currentPrice: decimal("current_price", { precision: 20, scale: 8 }),
  priceChange24h: decimal("price_change_24h", { precision: 10, scale: 2 }),
  priceChangePercentage24h: decimal("price_change_percentage_24h", { precision: 10, scale: 2 }),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }),
  volume24h: decimal("volume_24h", { precision: 20, scale: 2 }),
  marketCapRank: integer("market_cap_rank"),
  image: text("image"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const newsArticles = pgTable("news_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  source: text("source").notNull(),
  author: text("author"),
  publishedAt: timestamp("published_at"),
  imageUrl: text("image_url"),
  sentiment: text("sentiment"), // bullish, bearish, neutral
  summary: text("summary"), // Pre-generated article summary
  createdAt: timestamp("created_at").defaultNow(),
});

export const redditPosts = pgTable("reddit_posts", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  subreddit: text("subreddit").notNull(),
  url: text("url").notNull(),
  upvotes: integer("upvotes").default(0),
  comments: integer("comments").default(0),
  createdAt: timestamp("created_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCryptocurrencySchema = createInsertSchema(cryptocurrencies);
export const insertNewsArticleSchema = createInsertSchema(newsArticles);
export const insertRedditPostSchema = createInsertSchema(redditPosts);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Cryptocurrency = typeof cryptocurrencies.$inferSelect;
export type NewsArticle = typeof newsArticles.$inferSelect;
export type RedditPost = typeof redditPosts.$inferSelect;
export type InsertCryptocurrency = z.infer<typeof insertCryptocurrencySchema>;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type InsertRedditPost = z.infer<typeof insertRedditPostSchema>;
