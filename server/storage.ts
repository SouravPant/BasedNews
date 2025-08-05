import { 
  type User, 
  type UpsertUser,
  type InsertUser, 
  type Cryptocurrency, 
  type InsertCryptocurrency,
  type NewsArticle,
  type InsertNewsArticle,
  type RedditPost,
  type InsertRedditPost,
  type PriceHistory,
  type InsertPriceHistory,
  type UserWatchlist,
  type InsertUserWatchlist,
  type UserPortfolio,
  type InsertUserPortfolio,
  type UserAlert,
  type InsertUserAlert,
  users,
  cryptocurrencies,
  newsArticles,
  redditPosts,
  priceHistory,
  userWatchlists,
  userPortfolios,
  userAlerts
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, or, ilike } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (Replit Auth compatible)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Legacy user operations for backward compatibility
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Cryptocurrency operations
  getCryptocurrencies(limit?: number): Promise<Cryptocurrency[]>;
  getCryptocurrency(id: string): Promise<Cryptocurrency | undefined>;
  upsertCryptocurrency(crypto: InsertCryptocurrency): Promise<Cryptocurrency>;
  searchCryptocurrencies(query: string): Promise<Cryptocurrency[]>;
  
  // Price history operations
  getPriceHistory(cryptocurrencyId: string, timeframe: string): Promise<PriceHistory[]>;
  addPriceHistory(priceData: InsertPriceHistory): Promise<PriceHistory>;
  
  // News operations
  getNewsArticles(options?: { limit?: number; category?: string; sentiment?: string; featured?: boolean }): Promise<NewsArticle[]>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  searchNews(query: string): Promise<NewsArticle[]>;
  
  // Reddit operations
  getRedditPosts(subreddit?: string, limit?: number): Promise<RedditPost[]>;
  createRedditPost(post: InsertRedditPost): Promise<RedditPost>;
  
  // User personalization
  getUserWatchlist(userId: string): Promise<UserWatchlist[]>;
  addToWatchlist(watchlistItem: InsertUserWatchlist): Promise<UserWatchlist>;
  removeFromWatchlist(userId: string, cryptocurrencyId: string): Promise<void>;
  
  // Portfolio tracking
  getUserPortfolio(userId: string): Promise<UserPortfolio[]>;
  addPortfolioItem(portfolioItem: InsertUserPortfolio): Promise<UserPortfolio>;
  updatePortfolioItem(id: string, updates: Partial<InsertUserPortfolio>): Promise<UserPortfolio>;
  removePortfolioItem(id: string): Promise<void>;
  
  // User alerts
  getUserAlerts(userId: string, active?: boolean): Promise<UserAlert[]>;
  createAlert(alert: InsertUserAlert): Promise<UserAlert>;
  updateAlert(id: string, updates: Partial<InsertUserAlert>): Promise<UserAlert>;
  deleteAlert(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (Replit Auth compatible)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Legacy user operations for backward compatibility
  async getUserByUsername(username: string): Promise<User | undefined> {
    // This method is now deprecated since we use Replit Auth
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Cryptocurrency operations
  async getCryptocurrencies(limit: number = 50): Promise<Cryptocurrency[]> {
    return await db
      .select()
      .from(cryptocurrencies)
      .orderBy(cryptocurrencies.marketCapRank)
      .limit(limit);
  }

  async getCryptocurrency(id: string): Promise<Cryptocurrency | undefined> {
    const [crypto] = await db
      .select()
      .from(cryptocurrencies)
      .where(eq(cryptocurrencies.id, id));
    return crypto;
  }

  async upsertCryptocurrency(crypto: InsertCryptocurrency): Promise<Cryptocurrency> {
    const [cryptocurrency] = await db
      .insert(cryptocurrencies)
      .values({
        ...crypto,
        lastUpdated: new Date(),
      })
      .onConflictDoUpdate({
        target: cryptocurrencies.id,
        set: {
          ...crypto,
          lastUpdated: new Date(),
        },
      })
      .returning();
    return cryptocurrency;
  }

  async searchCryptocurrencies(query: string): Promise<Cryptocurrency[]> {
    return await db
      .select()
      .from(cryptocurrencies)
      .where(
        or(
          ilike(cryptocurrencies.name, `%${query}%`),
          ilike(cryptocurrencies.symbol, `%${query}%`)
        )
      )
      .orderBy(cryptocurrencies.marketCapRank)
      .limit(20);
  }

  // Price history operations
  async getPriceHistory(cryptocurrencyId: string, timeframe: string): Promise<PriceHistory[]> {
    const timeframeHours = {
      '1h': 1,
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30,
      '1y': 24 * 365
    }[timeframe] || 24;

    const fromDate = new Date(Date.now() - timeframeHours * 60 * 60 * 1000);

    return await db
      .select()
      .from(priceHistory)
      .where(
        and(
          eq(priceHistory.cryptocurrencyId, cryptocurrencyId),
          eq(priceHistory.timeframe, timeframe),
          gte(priceHistory.timestamp, fromDate)
        )
      )
      .orderBy(priceHistory.timestamp);
  }

  async addPriceHistory(priceData: InsertPriceHistory): Promise<PriceHistory> {
    const [price] = await db
      .insert(priceHistory)
      .values(priceData)
      .returning();
    return price;
  }

  // News operations
  async getNewsArticles(options: { limit?: number; category?: string; sentiment?: string; featured?: boolean } = {}): Promise<NewsArticle[]> {
    const { limit = 30, category, sentiment, featured } = options;
    
    let query = db.select().from(newsArticles);
    const conditions = [];

    if (category && category !== 'all') {
      conditions.push(eq(newsArticles.category, category));
    }
    if (sentiment && sentiment !== 'all') {
      conditions.push(eq(newsArticles.sentiment, sentiment));
    }
    if (featured !== undefined) {
      conditions.push(eq(newsArticles.featured, featured));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query
      .orderBy(desc(newsArticles.publishedAt))
      .limit(limit);
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const [newsArticle] = await db
      .insert(newsArticles)
      .values(article)
      .returning();
    return newsArticle;
  }

  async searchNews(query: string): Promise<NewsArticle[]> {
    return await db
      .select()
      .from(newsArticles)
      .where(
        or(
          ilike(newsArticles.title, `%${query}%`),
          ilike(newsArticles.description, `%${query}%`)
        )
      )
      .orderBy(desc(newsArticles.publishedAt))
      .limit(20);
  }

  // Reddit operations
  async getRedditPosts(subreddit?: string, limit: number = 10): Promise<RedditPost[]> {
    let query = db.select().from(redditPosts);
    
    if (subreddit) {
      query = query.where(eq(redditPosts.subreddit, subreddit));
    }

    return await query
      .orderBy(desc(redditPosts.createdAt))
      .limit(limit);
  }

  async createRedditPost(post: InsertRedditPost): Promise<RedditPost> {
    const [redditPost] = await db
      .insert(redditPosts)
      .values(post)
      .onConflictDoUpdate({
        target: redditPosts.id,
        set: {
          upvotes: post.upvotes,
          comments: post.comments,
          createdAt: post.createdAt,
        },
      })
      .returning();
    return redditPost;
  }

  // User personalization
  async getUserWatchlist(userId: string): Promise<UserWatchlist[]> {
    return await db
      .select()
      .from(userWatchlists)
      .where(eq(userWatchlists.userId, userId))
      .orderBy(desc(userWatchlists.addedAt));
  }

  async addToWatchlist(watchlistItem: InsertUserWatchlist): Promise<UserWatchlist> {
    const [item] = await db
      .insert(userWatchlists)
      .values(watchlistItem)
      .returning();
    return item;
  }

  async removeFromWatchlist(userId: string, cryptocurrencyId: string): Promise<void> {
    await db
      .delete(userWatchlists)
      .where(
        and(
          eq(userWatchlists.userId, userId),
          eq(userWatchlists.cryptocurrencyId, cryptocurrencyId)
        )
      );
  }

  // Portfolio tracking
  async getUserPortfolio(userId: string): Promise<UserPortfolio[]> {
    return await db
      .select()
      .from(userPortfolios)
      .where(eq(userPortfolios.userId, userId))
      .orderBy(desc(userPortfolios.updatedAt));
  }

  async addPortfolioItem(portfolioItem: InsertUserPortfolio): Promise<UserPortfolio> {
    const [item] = await db
      .insert(userPortfolios)
      .values(portfolioItem)
      .returning();
    return item;
  }

  async updatePortfolioItem(id: string, updates: Partial<InsertUserPortfolio>): Promise<UserPortfolio> {
    const [item] = await db
      .update(userPortfolios)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userPortfolios.id, id))
      .returning();
    return item;
  }

  async removePortfolioItem(id: string): Promise<void> {
    await db
      .delete(userPortfolios)
      .where(eq(userPortfolios.id, id));
  }

  // User alerts
  async getUserAlerts(userId: string, active?: boolean): Promise<UserAlert[]> {
    let query = db
      .select()
      .from(userAlerts)
      .where(eq(userAlerts.userId, userId));

    if (active !== undefined) {
      query = query.where(
        and(
          eq(userAlerts.userId, userId),
          eq(userAlerts.isActive, active)
        )
      );
    }

    return await query.orderBy(desc(userAlerts.createdAt));
  }

  async createAlert(alert: InsertUserAlert): Promise<UserAlert> {
    const [userAlert] = await db
      .insert(userAlerts)
      .values(alert)
      .returning();
    return userAlert;
  }

  async updateAlert(id: string, updates: Partial<InsertUserAlert>): Promise<UserAlert> {
    const [alert] = await db
      .update(userAlerts)
      .set(updates)
      .where(eq(userAlerts.id, id))
      .returning();
    return alert;
  }

  async deleteAlert(id: string): Promise<void> {
    await db
      .delete(userAlerts)
      .where(eq(userAlerts.id, id));
  }
}

export const storage = new DatabaseStorage();
