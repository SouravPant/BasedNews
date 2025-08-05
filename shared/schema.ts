import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, json, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enhanced users table with authentication and personalization
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  preferences: json("preferences"), // Dashboard layout, watchlist, themes, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced cryptocurrencies table with comprehensive data
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
  circulatingSupply: decimal("circulating_supply", { precision: 20, scale: 2 }),
  totalSupply: decimal("total_supply", { precision: 20, scale: 2 }),
  maxSupply: decimal("max_supply", { precision: 20, scale: 2 }),
  ath: decimal("ath", { precision: 20, scale: 8 }), // All-time high
  athDate: timestamp("ath_date"),
  atl: decimal("atl", { precision: 20, scale: 8 }), // All-time low
  atlDate: timestamp("atl_date"),
  image: text("image"),
  description: text("description"), // Project description
  website: text("website"), // Official website URL
  whitepaper: text("whitepaper"), // Whitepaper URL
  socialMedia: json("social_media"), // Twitter, Discord, Telegram, etc.
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Price history for charting
export const priceHistory = pgTable("price_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cryptocurrencyId: varchar("cryptocurrency_id").notNull(),
  price: decimal("price", { precision: 20, scale: 8 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  timeframe: text("timeframe").notNull(), // '1h', '24h', '7d', '30d', '1y'
});

// User watchlists for personalization
export const userWatchlists = pgTable("user_watchlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  cryptocurrencyId: varchar("cryptocurrency_id").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

// Enhanced news articles with better categorization
export const newsArticles = pgTable("news_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"), // Full article content for reader mode
  url: text("url").notNull(),
  source: text("source").notNull(),
  author: text("author"),
  publishedAt: timestamp("published_at"),
  imageUrl: text("image_url"),
  sentiment: text("sentiment"), // bullish, bearish, neutral
  category: text("category"), // DeFi, NFT, Regulation, Technology, etc.
  tags: json("tags"), // Array of relevant tags
  summary: text("summary"), // AI-generated summary
  readingTime: integer("reading_time"), // Estimated reading time in minutes
  engagement: json("engagement"), // Views, shares, likes from source
  featured: boolean("featured").default(false), // Featured articles
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced Reddit posts with better metadata
export const redditPosts = pgTable("reddit_posts", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  subreddit: text("subreddit").notNull(),
  url: text("url").notNull(),
  content: text("content"), // Post content/selftext
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  comments: integer("comments").default(0),
  awards: integer("awards").default(0),
  flair: text("flair"), // Post flair
  sentiment: text("sentiment"), // bullish, bearish, neutral
  createdAt: timestamp("created_at"),
});

// User portfolio tracking
export const userPortfolios = pgTable("user_portfolios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  cryptocurrencyId: varchar("cryptocurrency_id").notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  averagePrice: decimal("average_price", { precision: 20, scale: 8 }),
  notes: text("notes"),
  addedAt: timestamp("added_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Market alerts for users
export const userAlerts = pgTable("user_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  cryptocurrencyId: varchar("cryptocurrency_id").notNull(),
  alertType: text("alert_type").notNull(), // 'price_above', 'price_below', 'percent_change'
  targetValue: decimal("target_value", { precision: 20, scale: 8 }).notNull(),
  isActive: boolean("is_active").default(true),
  triggered: boolean("triggered").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema validations
export const insertUserSchema = createInsertSchema(users);
export const upsertUserSchema = createInsertSchema(users);
export const insertCryptocurrencySchema = createInsertSchema(cryptocurrencies);
export const insertNewsArticleSchema = createInsertSchema(newsArticles);
export const insertRedditPostSchema = createInsertSchema(redditPosts);
export const insertPriceHistorySchema = createInsertSchema(priceHistory);
export const insertUserWatchlistSchema = createInsertSchema(userWatchlists);
export const insertUserPortfolioSchema = createInsertSchema(userPortfolios);
export const insertUserAlertSchema = createInsertSchema(userAlerts);

// Type exports
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Cryptocurrency = typeof cryptocurrencies.$inferSelect;
export type NewsArticle = typeof newsArticles.$inferSelect;
export type RedditPost = typeof redditPosts.$inferSelect;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type UserWatchlist = typeof userWatchlists.$inferSelect;
export type UserPortfolio = typeof userPortfolios.$inferSelect;
export type UserAlert = typeof userAlerts.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCryptocurrency = z.infer<typeof insertCryptocurrencySchema>;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type InsertRedditPost = z.infer<typeof insertRedditPostSchema>;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
export type InsertUserWatchlist = z.infer<typeof insertUserWatchlistSchema>;
export type InsertUserPortfolio = z.infer<typeof insertUserPortfolioSchema>;
export type InsertUserAlert = z.infer<typeof insertUserAlertSchema>;
