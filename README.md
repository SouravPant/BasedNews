# CryptoHub - Cryptocurrency Dashboard

A full-stack cryptocurrency dashboard application built with React, Express.js, and TypeScript.

## Features

- Real-time cryptocurrency prices from CoinGecko API
- Crypto news aggregation 
- Reddit cryptocurrency community posts
- Interactive price charts
- Responsive dark/light theme design

## Local Development

```bash
npm install
npm run dev
```

The application will run on `http://localhost:5000`

## Vercel Deployment

This project is configured for Vercel deployment with serverless functions.

### Prerequisites

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Vercel will automatically detect the configuration from `vercel.json`

### Environment Variables

For production deployment, set these environment variables in Vercel:

- `CRYPTOPANIC_API_KEY` (optional) - For additional news sources
- `NODE_ENV=production`

### Deployment Files

- `vercel.json` - Vercel deployment configuration
- `api/*.ts` - Individual serverless API function handlers
- `build.js` - Build script for client assets

The deployment creates:
- Static frontend served from `/dist/public`
- Serverless API endpoints:
  - `/api/cryptocurrencies` - Top 10 cryptocurrency data
  - `/api/news` - Crypto news articles
  - `/api/reddit` - Reddit crypto community posts  
  - `/api/status` - API service status

## API Endpoints

- `GET /api/cryptocurrencies` - Top 10 cryptocurrencies
- `GET /api/cryptocurrencies/:id/chart` - Price chart data
- `GET /api/news` - Crypto news articles
- `GET /api/reddit` - Reddit posts from crypto communities
- `GET /api/status` - API status check

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Build**: Vite, ESBuild
- **Deployment**: Vercel (serverless)
- **APIs**: CoinGecko, CryptoPanic (optional)