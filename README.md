# 🔵 Based News - Base Ecosystem Mini App

> **Real-time crypto news, Base ecosystem tracking, and onchain analytics in one powerful mini app**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://based-news-eight.vercel.app/)
[![Base Network](https://img.shields.io/badge/Base-Network-0052FF?style=for-the-badge)](https://base.org/)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge)](https://reactjs.org/)

## 🚀 **Features**

### 📰 **Real-Time News Aggregation**
- **20+ Live Articles** from multiple crypto news sources
- **AI-Powered Summaries** with sentiment analysis (Bullish/Bearish/Neutral)
- **Smart Filtering** by sentiment, date, and keywords
- **News Images** automatically fetched and displayed
- **Full Article Links** with "Read More" functionality

### 🔵 **Base Ecosystem Explorer**
- **60+ Base Tokens** across all categories
- **Live Price Data** from CoinGecko API
- **Market Cap Formatting** (B/M/K notation)
- **24h Price Changes** with color-coded indicators
- **Comprehensive Coverage**:
  - Core Infrastructure (ETH, USDC, WBTC)
  - Native DeFi Protocols (Aerodrome, Seamless, Moonwell)
  - Meme & Community Tokens (DEGEN, Based Brett)
  - Gaming & NFT Projects
  - Social & Creator Economy
  - Cross-Chain Infrastructure

### 💰 **Wallet Integration**
- **Multi-Wallet Support** (MetaMask, Coinbase Wallet)
- **Base Network Auto-Switch** 
- **Real Portfolio Tracking** with live ETH prices
- **Wallet Balance Display** 
- **Connect/Disconnect Flow**

### 📊 **Interactive Charts & Modals**
- **Coin Detail Modals** with price info and descriptions
- **Error-Proof Design** with comprehensive fallbacks
- **Mobile-Optimized** touch interactions
- **Safe Data Handling** prevents crashes from invalid data

### 🎨 **Base-Branded UI/UX**
- **Official Base Themes** (Light, Dark, Base)
- **Base Color Palette** (#0052FF primary)
- **Inter Font** (Base's official typography)
- **Responsive Design** optimized for all devices
- **Professional Icons** sourced from Base documentation

## 🛠️ **Tech Stack**

### **Frontend**
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Wouter** for lightweight routing
- **Tanstack Query** for data fetching

### **Data Sources**
- **CoinGecko API** for cryptocurrency data
- **NewsAPI** for crypto news aggregation
- **Custom fallback data** for reliability

### **Deployment**
- **Vercel** for hosting and deployment
- **GitHub** for version control
- **Automatic deployments** on push

### **Error Handling**
- **React Error Boundaries** for crash prevention
- **Safe number conversion** for price data
- **Multiple API fallbacks** for reliability
- **Comprehensive console logging** for debugging

## 🏗️ **Architecture**

```
src/
├── components/           # Reusable UI components
│   ├── base-news.tsx    # Main news feed component
│   ├── simple-coin-modal.tsx # Coin detail modal
│   ├── base-wallet-connect.tsx # Wallet integration
│   ├── error-boundary.tsx # Error handling
│   └── theme-toggle-simple.tsx # Theme switching
├── pages/               # Page components
│   ├── mobile-base-coins.tsx # Base ecosystem explorer
│   ├── news-aggregator.tsx # News homepage
│   └── dashboard.tsx    # User dashboard
├── api/                 # API endpoints
│   ├── news.ts         # News aggregation
│   └── cryptocurrencies.ts # Crypto data
└── lib/                # Utilities
    ├── theme-provider.tsx # Theme management
    └── queryClient.ts  # React Query setup
```

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git

### **Installation**

```bash
# Clone the repository
git clone https://github.com/SouravPant/BasedNews.git
cd BasedNews

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:5173
```

### **Environment Setup**

Create a `.env` file in the root directory:

```env
# Optional: Add API keys for enhanced functionality
VITE_NEWS_API_KEY=your_newsapi_key
VITE_COINGECKO_API_KEY=your_coingecko_key
```

### **Build for Production**

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 📱 **Usage**

### **Navigation**
- **Homepage** (`/`) - Latest crypto news with summaries
- **Base Coins** (`/coins`) - Explore 60+ Base ecosystem tokens
- **Dashboard** (`/dashboard`) - Wallet connection and portfolio tracking

### **Key Interactions**
1. **Read News** - Tap articles for AI summaries
2. **Explore Coins** - Tap any Base token for details
3. **Connect Wallet** - Link MetaMask or Coinbase Wallet
4. **Switch Themes** - Toggle between Light/Dark/Base modes

### **Search & Filter**
- **News Search** - Filter by keywords, sentiment, or date
- **Coin Search** - Find tokens by name or symbol
- **Category Filtering** - Browse by DeFi, Gaming, Memes, etc.

## 🔧 **API Integration**

### **News Sources**
- **Primary**: NewsAPI for mainstream crypto news
- **Secondary**: CoinGecko News API for additional coverage
- **Fallback**: Curated static news for reliability

### **Cryptocurrency Data**
- **Live Prices**: CoinGecko Markets API
- **Market Data**: 24h changes, market caps, rankings
- **Token Info**: Descriptions, images, and metadata

### **Error Handling**
- **Timeout Protection** (10-second API timeout)
- **Graceful Degradation** with fallback data
- **Safe Data Processing** prevents crashes

## 🎨 **Theming**

### **Base Official Themes**
- **Light Mode** - Clean white background
- **Dark Mode** - Dark background with Base accents
- **Base Mode** - Official Base brand colors

### **Customization**
```css
/* CSS Variables for theming */
:root {
  --base-blue: #0052FF;
  --background: #ffffff;
  --foreground: #000000;
  --muted: #f1f5f9;
  --border: #e2e8f0;
}
```

## 🚢 **Deployment**

### **Vercel (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set up automatic deployments
vercel --prod
```

### **Other Platforms**
- **Netlify**: Drag and drop `dist/` folder
- **GitHub Pages**: Enable Pages in repository settings
- **Self-hosted**: Use `npm run build` output

## 🔒 **Security**

### **Wallet Integration**
- **Non-custodial** - Never stores private keys
- **Read-only** access to wallet balances
- **Base network validation** for security

### **Data Privacy**
- **No user tracking** or analytics
- **Client-side only** processing
- **No sensitive data storage**

## 🐛 **Troubleshooting**

### **Common Issues**

**Blank screen on /coins:**
- Check browser console for errors
- Verify CoinGecko API availability
- Clear browser cache and reload

**Wallet connection fails:**
- Ensure MetaMask/Coinbase Wallet is installed
- Check Base network configuration
- Try disconnecting and reconnecting

**News not loading:**
- Check internet connection
- Verify API endpoints are accessible
- Try refreshing the page

### **Debug Mode**
```bash
# Enable debug logging
VITE_DEBUG=true npm run dev
```

## 🤝 **Contributing**

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Code Standards**
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **Conventional Commits** for commit messages

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Base Team** for the amazing L2 network
- **CoinGecko** for comprehensive crypto data
- **NewsAPI** for news aggregation
- **React Community** for excellent tooling
- **Vercel** for seamless deployment

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/SouravPant/BasedNews/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SouravPant/BasedNews/discussions)
- **Base Discord**: [base.org/discord](https://base.org/discord)

---

<div align="center">

**Built with ❤️ for the Base ecosystem**

[![Base](https://img.shields.io/badge/Built%20on-Base-0052FF?style=for-the-badge)](https://base.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge)](https://typescriptlang.org/)

</div>