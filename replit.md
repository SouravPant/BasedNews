# BasedHub - Cryptocurrency Dashboard

## Overview
BasedHub is a full-stack cryptocurrency dashboard application focused on providing real-time market data, news, and social media sentiment for top cryptocurrencies. It aims to offer a comprehensive view of the cryptocurrency market landscape, with a modern design and responsive UI, supporting both light and dark modes. The project has evolved to specifically function as a focused crypto news aggregator, capable of integrating as a Base Mini App for enhanced wallet connectivity and social features.

## Recent Changes
- **Migration Completed (Aug 8, 2025)**: Successfully migrated from Replit Agent to standard Replit environment
- **Database Setup**: Provisioned PostgreSQL database with complete schema deployment
- **Vercel Configuration**: Ready for deployment with serverless API functions and automated news cron jobs
- **Build System**: Optimized for both development on Replit and production deployment on Vercel

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built using React with TypeScript, following a component-based architecture. It utilizes React 18 for the UI, Tailwind CSS for styling with custom crypto-themed color variables and shadcn/ui components. State management is handled by TanStack Query (React Query) for server state and caching, while Wouter provides lightweight client-side routing. Vite is used for fast development and optimized production builds. The design is dashboard-centric, focusing on cryptocurrency prices and news articles.

### Backend Architecture
The backend follows a RESTful API design pattern using Node.js with Express.js and TypeScript. It provides API endpoints for cryptocurrency data and news. Key features include centralized error middleware with proper HTTP status codes and custom request/response logging. The backend is structured to serve both API endpoints and static assets, with separate configurations for development and production environments.

### Data Storage Solutions
The application employs a dual storage approach: PostgreSQL as the primary database managed with Drizzle ORM for data modeling and migrations, and an in-memory `MemStorage` class for development and testing. Shared TypeScript schemas between frontend and backend are maintained using Drizzle-Zod.

### Authentication and Authorization
A basic user authentication system is implemented using username/password. Session handling is managed via Express sessions with a PostgreSQL session store (connect-pg-simple). Input validation and type safety are enforced using Zod schemas.

### Base Mini App Features
The application is designed to function as a Base Mini App, supporting seamless native authentication with Base App user accounts, one-click social sharing to Farcaster for portfolios, news, and watchlists, and frame management including saving to Base App, notification setup, and deep linking. It is ready for Base wallet connectivity and onchain interactions, operating both as a standalone web app and a Base Mini App with feature detection.

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: For PostgreSQL connection with Neon database.
- **drizzle-orm** and **drizzle-kit**: Type-safe ORM and migration tools.
- **express**: Web application framework for the backend.
- **vite**: Frontend build tool and development server.
- **@tanstack/react-query**: Data fetching and caching library.

### UI and Styling Dependencies
- **@radix-ui/***: Headless UI components.
- **tailwindcss**: Utility-first CSS framework.
- **class-variance-authority**: Type-safe variant API for component styling.
- **lucide-react**: Icon library.

### External APIs
- **CoinGecko API**: Real-time cryptocurrency market data.
- **News APIs**: For crypto-related news aggregation.
- **OpenAI API**: Used for AI-powered news summaries.
- **Base MiniKit SDK**: For integration with the Base App ecosystem.
- **Farcaster Frame SDK**: For native Farcaster integration and social sharing.

### Database Hosting
- **Neon Database**: PostgreSQL hosting service.
```