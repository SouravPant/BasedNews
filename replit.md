# CryptoHub - Real-time Cryptocurrency Dashboard

## Overview

CryptoHub is a full-stack cryptocurrency dashboard application that provides real-time market data, news, and social media sentiment for the top cryptocurrencies. The application displays live pricing information, market statistics, crypto-related news articles, and Reddit posts from cryptocurrency communities. Built with a modern React frontend and Express.js backend, it offers a comprehensive view of the cryptocurrency market landscape.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**August 2, 2025** - Migration and Vercel Deployment Setup:
- Successfully migrated CryptoHub project from Replit Agent to Replit environment
- Created comprehensive Vercel deployment configuration
- Set up serverless API functions for external deployment
- Added README with deployment instructions
- All API endpoints tested and working correctly
- Client build system configured for production deployment

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
- **Reddit API**: Posts from cryptocurrency-related subreddits with engagement metrics
- **Neon Database**: PostgreSQL hosting service for production database

The system implements proper error handling and fallback mechanisms for API failures, including cached data serving when external services are unavailable.

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