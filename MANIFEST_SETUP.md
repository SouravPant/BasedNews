# 🔵 Based News - Farcaster Manifest Setup

## 📋 **What You Need to Fill in the Farcaster Developer Portal**

Visit: https://farcaster.xyz/~/developers/hosted-manifests?domain=based-news-eight.vercel.app

### **App Identity & Store Presence**

- **App Name**: `Based News`
- **App Icon**: `https://based-news-eight.vercel.app/icon.png`
- **Subtitle**: `Real-time crypto news & Base ecosystem tracking`
- **Description**: `Stay ahead with real-time cryptocurrency news, Base ecosystem token tracking, and onchain analytics. Get AI-powered news summaries, explore 100+ Base tokens, and connect your wallet for portfolio tracking.`
- **Primary Category**: `news`

### **Visuals & Branding**

- **Screenshots**: 
  - `https://based-news-eight.vercel.app/screenshot1.png`
  - `https://based-news-eight.vercel.app/screenshot2.png`
  - `https://based-news-eight.vercel.app/screenshot3.png`
- **Preview Image**: `https://based-news-eight.vercel.app/preview.png`
- **Hero Image**: `https://based-news-eight.vercel.app/hero.png`
- **Splash Screen Image**: `https://based-news-eight.vercel.app/splash.png`
- **Splash Background Color**: `#0052FF`

### **Engagement & Discovery**

- **Search Tags**: `crypto, news, base, defi, blockchain, tokens, portfolio`
- **Marketing Tagline**: `Your gateway to the Base ecosystem & crypto news`
- **Button Title**: `Open Based News`
- **Social Share Title**: `Based News - Real-time Crypto News & Base Ecosystem`
- **Social Share Description**: `Stay updated with real-time crypto news, explore 100+ Base ecosystem tokens, and track your portfolio with Based News.`
- **Social Share Image**: `https://based-news-eight.vercel.app/og-image.png`
- **Cast Share URL**: `https://warpcast.com/~/compose?text=Just%20discovered%20Based%20News%20-%20the%20ultimate%20crypto%20news%20and%20Base%20ecosystem%20tracker!%20🔵%20https://based-news-eight.vercel.app`

### **Technical Configuration**

- **Home URL**: `https://based-news-eight.vercel.app`
- **Webhook URL**: `https://based-news-eight.vercel.app/api/webhook`

## 🎨 **Generate Required Images**

1. Visit: `https://based-news-eight.vercel.app/generate-images.html`
2. Click "Generate All Images"
3. Download all images
4. Upload them to your `public/` folder
5. Deploy to make them available

## 📄 **Manifest File**

The `farcaster.json` manifest is already created at `/public/farcaster.json` with all the correct configuration.

## ✅ **Steps to Complete**

1. ✅ Create `farcaster.json` manifest
2. ✅ Create webhook endpoint at `/api/webhook`
3. 🔄 Generate and upload image assets
4. 🔄 Deploy to production
5. 🔄 Register manifest on Farcaster developer portal
6. 🔄 Test manifest validation

## 🔧 **Webhook Functionality**

The webhook at `/api/webhook` handles:
- App installations/uninstallations
- Cast mentions and shares
- User interactions
- Analytics tracking

## 🚀 **After Setup**

Once registered, your mini app will be available:
- In Farcaster clients
- Via direct links
- Through search and discovery
- In the Farcaster app store

## 🔍 **Validation**

Test your manifest at:
- https://based-news-eight.vercel.app/farcaster.json
- Farcaster developer tools
- Client applications