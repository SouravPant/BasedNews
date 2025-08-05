// Google Analytics 4 implementation
export const GA_TRACKING_ID = 'G-XXXXXXXXXX'; // Replace with your actual GA4 tracking ID

// Initialize GA4
export const initGA = () => {
  if (typeof window === 'undefined') return;

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_TRACKING_ID, {
    send_page_view: false // We'll handle page views manually
  });
};

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('config', GA_TRACKING_ID, {
    page_location: url,
  });
};

// Track custom events
export const trackEvent = (
  eventName: string,
  parameters: {
    event_category?: string;
    event_label?: string;
    value?: number;
    [key: string]: any;
  } = {}
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', eventName, {
    event_category: parameters.event_category || 'General',
    event_label: parameters.event_label,
    value: parameters.value,
    ...parameters
  });
};

// Specific tracking functions for the crypto dashboard
export const trackCryptoCardClick = (cryptoSymbol: string, cryptoName: string) => {
  trackEvent('crypto_card_click', {
    event_category: 'Cryptocurrency Interaction',
    event_label: `${cryptoName} (${cryptoSymbol})`,
    crypto_symbol: cryptoSymbol,
    crypto_name: cryptoName
  });
};

export const trackNewsArticleClick = (articleId: string, source: string, sentiment?: string) => {
  trackEvent('news_article_click', {
    event_category: 'News Interaction',
    event_label: source,
    article_id: articleId,
    news_source: source,
    news_sentiment: sentiment
  });
};

export const trackSearchQuery = (query: string, resultsCount: number, filters?: any) => {
  trackEvent('search_performed', {
    event_category: 'Search',
    event_label: query,
    search_term: query,
    results_count: resultsCount,
    search_filters: JSON.stringify(filters)
  });
};

export const trackNewsFilterUsage = (filterType: string, filterValue: string) => {
  trackEvent('news_filter_used', {
    event_category: 'Filter Usage',
    event_label: `${filterType}: ${filterValue}`,
    filter_type: filterType,
    filter_value: filterValue
  });
};

export const trackChartInteraction = (cryptoSymbol: string, action: string, timeframe?: string) => {
  trackEvent('chart_interaction', {
    event_category: 'Chart Usage',
    event_label: `${action} - ${cryptoSymbol}`,
    crypto_symbol: cryptoSymbol,
    chart_action: action,
    timeframe: timeframe
  });
};

export const trackSummaryGeneration = (contentType: 'news' | 'reddit' | 'twitter', contentId: string) => {
  trackEvent('summary_generated', {
    event_category: 'AI Summary',
    event_label: contentType,
    content_type: contentType,
    content_id: contentId
  });
};

// Declare global gtag function
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}