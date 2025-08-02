import { 
  type User, 
  type InsertUser, 
  type Cryptocurrency, 
  type InsertCryptocurrency,
  type NewsArticle,
  type InsertNewsArticle,
  type RedditPost,
  type InsertRedditPost
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCryptocurrencies(): Promise<Cryptocurrency[]>;
  getCryptocurrency(id: string): Promise<Cryptocurrency | undefined>;
  upsertCryptocurrency(crypto: InsertCryptocurrency): Promise<Cryptocurrency>;
  
  getNewsArticles(limit?: number): Promise<NewsArticle[]>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  
  getRedditPosts(subreddit?: string, limit?: number): Promise<RedditPost[]>;
  createRedditPost(post: InsertRedditPost): Promise<RedditPost>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cryptocurrencies: Map<string, Cryptocurrency>;
  private newsArticles: Map<string, NewsArticle>;
  private redditPosts: Map<string, RedditPost>;

  constructor() {
    this.users = new Map();
    this.cryptocurrencies = new Map();
    this.newsArticles = new Map();
    this.redditPosts = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCryptocurrencies(): Promise<Cryptocurrency[]> {
    return Array.from(this.cryptocurrencies.values())
      .sort((a, b) => (a.marketCapRank || 999) - (b.marketCapRank || 999));
  }

  async getCryptocurrency(id: string): Promise<Cryptocurrency | undefined> {
    return this.cryptocurrencies.get(id);
  }

  async upsertCryptocurrency(crypto: InsertCryptocurrency): Promise<Cryptocurrency> {
    const cryptocurrency: Cryptocurrency = {
      ...crypto,
      image: crypto.image ?? null,
      currentPrice: crypto.currentPrice ?? null,
      priceChange24h: crypto.priceChange24h ?? null,
      priceChangePercentage24h: crypto.priceChangePercentage24h ?? null,
      marketCap: crypto.marketCap ?? null,
      volume24h: crypto.volume24h ?? null,
      marketCapRank: crypto.marketCapRank ?? null,
      lastUpdated: new Date(),
    };
    this.cryptocurrencies.set(crypto.id, cryptocurrency);
    return cryptocurrency;
  }

  async getNewsArticles(limit: number = 20): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values())
      .sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0))
      .slice(0, limit);
  }

  async createNewsArticle(insertArticle: InsertNewsArticle): Promise<NewsArticle> {
    const id = randomUUID();
    const article: NewsArticle = { 
      ...insertArticle, 
      id,
      description: insertArticle.description ?? null,
      author: insertArticle.author ?? null,
      publishedAt: insertArticle.publishedAt ?? null,
      imageUrl: insertArticle.imageUrl ?? null,
      sentiment: insertArticle.sentiment ?? null,
      createdAt: new Date()
    };
    this.newsArticles.set(id, article);
    return article;
  }

  async getRedditPosts(subreddit?: string, limit: number = 10): Promise<RedditPost[]> {
    let posts = Array.from(this.redditPosts.values());
    
    if (subreddit) {
      posts = posts.filter(post => post.subreddit === subreddit);
    }
    
    return posts
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async createRedditPost(insertPost: InsertRedditPost): Promise<RedditPost> {
    const post: RedditPost = {
      ...insertPost,
      upvotes: insertPost.upvotes ?? null,
      comments: insertPost.comments ?? null,
      createdAt: insertPost.createdAt || new Date()
    };
    this.redditPosts.set(post.id, post);
    return post;
  }
}

export const storage = new MemStorage();
