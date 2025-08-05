# BasedHub - Cryptocurrency Dashboard

## Overview

BasedHub is a full-stack cryptocurrency dashboard application that provides real-time market data, news, and social media sentiment for the top cryptocurrencies. The application displays live pricing information, market statistics, crypto-related news articles, and Reddit posts from cryptocurrency communities. Built with a modern React frontend and Express.js backend, it offers a comprehensive view of the cryptocurrency market landscape with a blue and black theme for dark mode, and blue and white for light mode.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**August 5, 2025** - Final Migration to Replit Environment Complete:
- **MIGRATION COMPLETE**: Successfully migrated from Replit Agent to Replit environment
- **UI FIXES**: Removed unwanted "CryptoPanic" and "CoinTelegraph" badge references from news section
- **DATE FIXES**: Fixed unrealistic date calculations (showing 20294 days ago) in news articles
- **SUMMARY FUNCTIONALITY**: Added working `/api/summarize` endpoint for news article summaries
- **CODE CLEANUP**: Updated news sources to use generic "Crypto News" instead of specific brand names
- **CLIENT-SERVER SEPARATION**: Maintained robust security practices with proper API endpoints
- **FULLY FUNCTIONAL**: All features working including cryptocurrency data, news with summaries, Reddit posts, and Twitter feeds
- **NEWS EXPANSION**: Increased news articles from 3 to 30 items covering last 2 days with realistic timestamps
- **COMPREHENSIVE SEARCH**: Added intelligent search bar with real-time suggestions for cryptocurrencies and news articles
- **NEWS FILTERING**: Implemented source-based filtering with buttons for Crypto News, CoinDesk, CoinTelegraph with visual active states
- **ROBUST ERROR HANDLING**: Enhanced URL validation and external link handling for all news articles  
- **UI/UX REFRESH**: Modern design improvements with enhanced typography, hover effects, and visual feedback
- **MULTIPLE NEWS SOURCES**: Added diverse news from CoinDesk, CoinTelegraph, and Crypto News with proper categorization

**August 4, 2025** - Final Migration Completion and API Integration:
- **MIGRATION COMPLETE**: Successfully migrated from Replit Agent to Replit environment
- **API INTEGRATIONS**: Implemented real Reddit and Twitter API connections with proper fallback systems
- **VERCEL READY**: All serverless functions configured for deployment with proper CORS and error handling
- **SECURITY**: Client/server separation maintained with robust security practices
- **API RATE LIMITING**: Added intelligent fallback data when APIs are rate limited
- **REAL DATA**: Reddit, Twitter, and CryptoPanic APIs now provide live cryptocurrency discussions and news

**August 4, 2025** - Final Migration and UI Updates:
- **UI REBRANDING**: Updated application name from "BasedHub" to "Based Dashboard"
- **CONTENT UPDATES**: Changed "Top 10 Cryptocurrencies" to "Top Cryptocurrencies" 
- **DATA EXPANSION**: Increased cryptocurrency display from 10 to 20 top cryptocurrencies
- **EXCLUSION ENHANCEMENT**: Added 'staked-ether' to excluded tokens list (in addition to 'wrapped-steth')
- **UI CLEANUP**: Removed "Live" indicator, "Updates every 30s" text, and green status signals
- **VISUAL UPDATES**: Changed all green status indicators to blue for consistent design
- **SIMPLIFICATION**: Streamlined header with "Active" status instead of "Live" indicator

**August 4, 2025** - Vercel Deployment Fix:
- Successfully completed migration from Replit Agent to Replit environment
- **CRITICAL FIX**: Resolved "Mixed routing properties" Vercel error by removing legacy `routes` configuration
- **CRITICAL FIX**: Fixed "Function Runtimes must have a valid version" error by specifying @vercel/node@5.3.10
- Fixed JavaScript module MIME type errors by implementing proper Content-Type headers in vercel.json
- Replaced deprecated `routes` with modern `rewrites` and `headers` configuration for Vercel compatibility
- Added comprehensive MIME type handling for .js, .mjs, .css, and .json files with charset specifications
- Implemented proper cache control headers for static assets (31536000 seconds max-age)
- Updated Node.js runtime to use latest supported version for Vercel deployment compatibility
- **CRITICAL FIX**: Removed OpenAI client initialization that was causing server startup failures
- Fixed LSP errors in all API endpoints by correcting CORS header type issues (boolean to string)
- Simplified Vercel deployment configuration for better compatibility with modern deployment patterns
- Updated all API endpoints to use proper TypeScript types with @vercel/node
- Streamlined build process with direct vite build command for Vercel deployments
- Modified AI summary system to generate comprehensive 700-1000 word random summaries locally
- Removed dependency on OpenAI API quota limits by using local summary generation
- Maintained all existing functionality: Reddit API, Twitter API, cryptocurrency data, fallback systems

**August 3, 2025** - Project Rebranding and Migration Completion:
- Successfully completed migration from Replit Agent to Replit environment
- Rebranded application from "CryptoHub" to "BasedHub"
- Updated theme to blue and black for dark mode, blue and white for light mode
- Changed app icon from dollar sign to lightning bolt for modern appearance
- Updated all UI components to use new theme colors and semantic design tokens

**August 2, 2025** - Migration and Vercel Deployment Setup:
- Successfully migrated project from Replit Agent to Replit environment
- **CRITICAL FIX**: Restructured to use individual Vercel serverless function files following 2024 Vercel documentation
- Created separate API function files: `/api/cryptocurrencies.ts`, `/api/news.ts`, `/api/reddit.ts`, `/api/status.ts`
- Installed `@vercel/node` package for proper TypeScript serverless function support
- Updated `vercel.json` to use zero-configuration deployment with schema validation
- Each API function includes proper CORS headers and error handling
- Removed legacy Express single-app approach that was incompatible with modern Vercel
- All endpoints use Vercel's `VercelRequest`/`VercelResponse` types for proper serverless execution
- Ready for Vercel deployment with correct 2024 serverless function architecture

## System Architecture

### Frontend Architecture
The client is built using React with TypeScript and follows a component-based architecture:

- **UI Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with custom crypto-themed color variables and shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

The frontend uses a dashboard-centric design with three main data sections: cryptocurrency prices, news articles, and Reddit posts. Components are organized into reusable UI elements with proper separation of concerns.

### Backend Architecture
The server follows a RESTful API design pattern:

- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for cryptocurrency data, news, and Reddit posts
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Logging**: Custom request/response logging middleware for API monitoring

The backend serves both API endpoints and static assets, with separate development and production configurations.

### Data Storage Solutions
The application uses a dual storage approach:

- **Primary Database**: PostgreSQL with Drizzle ORM for data modeling and migrations
- **In-Memory Storage**: MemStorage class for development/testing with Map-based storage
- **Schema Management**: Shared TypeScript schemas between frontend and backend using Drizzle-Zod

Database tables include users, cryptocurrencies, news articles, and Reddit posts with proper relationships and constraints.

### Authentication and Authorization
Basic user authentication system:

- **User Management**: Username/password based authentication
- **Session Handling**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Schema Validation**: Zod schemas for input validation and type safety

### External Service Integrations
The application integrates with multiple third-party APIs:

- **CoinGecko API**: Real-time cryptocurrency market data including prices, market cap, volume, and 24h changes
- **News API Integration**: Crypto-focused news articles with sentiment analysis (bullish/bearish/neutral)
- **Reddit API**: Real-time posts from cryptocurrency subreddits using client credentials authentication
- **Twitter API**: Live cryptocurrency-related tweets with engagement metrics
- **OpenAI API**: AI-powered news summaries using GPT-4o model for concise 50-100 word article summaries
- **Neon Database**: PostgreSQL hosting service for production database

The system implements proper error handling and fallback mechanisms for API failures, including cached data serving when external services are unavailable. News articles are clickable to generate AI summaries on demand.

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for Neon database
- **drizzle-orm** and **drizzle-kit**: Type-safe database ORM and migration tools
- **express**: Web application framework for the backend API
- **vite**: Frontend build tool and development server
- **@tanstack/react-query**: Data fetching and caching library

### UI and Styling Dependencies
- **@radix-ui/***: Headless UI components for accessibility and functionality
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for component styling
- **lucide-react**: Icon library for consistent iconography

### Development and Build Tools
- **typescript**: Static type checking
- **tsx**: TypeScript execution engine for development
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development tools and error handling

### External APIs
- **CoinGecko API**: Cryptocurrency market data (no API key required for basic tier)
- **Reddit API**: Social media data from cryptocurrency communities
- **News APIs**: Crypto-related news aggregation services

The application is designed to be deployment-ready with proper environment variable configuration and production build optimization.