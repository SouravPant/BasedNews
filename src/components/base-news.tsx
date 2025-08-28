import React from "react";
import { BaseHeader, BaseStatusBadge, BaseNetworkBadge } from "./base-header";
import { NewsSummaryModal } from "./news-summary-modal";
import { ThemeToggleSimple } from "./theme-toggle-simple";
import { sdk } from '@farcaster/miniapp-sdk';
import { useBaseSocial } from '../hooks/useMiniKit';

export function BaseNews() {
  const [news, setNews] = React.useState([]);
  const [filteredNews, setFilteredNews] = React.useState([]);
  const [status, setStatus] = React.useState('Loading news...');
  const [selectedArticle, setSelectedArticle] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  // Farcaster sharing hook
  const { shareToFarcaster } = useBaseSocial();
  
  // Filter and sort states
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sentimentFilter, setSentimentFilter] = React.useState('all');
  const [timeFilter, setTimeFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('recency');
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(() => {
    console.log('🔍 Fetching news...');
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        console.log('📰 Raw API Response:', {
          total: data.length,
          first: data[0]?.title,
          last: data[data.length - 1]?.title
        });
        setNews(data);
        setStatus(`${data.length} articles loaded`);
      })
      .catch(err => {
        console.error('❌ Error:', err);
        setStatus('Error loading news');
      });
  }, []);

  React.useEffect(() => {
    let filtered = news;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title?.toLowerCase().includes(query) ||
        article.description?.toLowerCase().includes(query) ||
        article.source?.toLowerCase().includes(query)
      );
    }

    // Sentiment filter
    if (sentimentFilter !== 'all') {
      filtered = filtered.filter(article => article.sentiment === sentimentFilter);
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const timeThreshold = {
        '1h': 1 * 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000
      };

      filtered = filtered.filter(article => {
        const articleTime = new Date(article.publishedAt).getTime();
        return (now.getTime() - articleTime) <= timeThreshold[timeFilter];
      });
    }

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recency':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'relevance':
          const scoreA = (a.title?.length || 0) + (a.source === 'Cointelegraph' ? 100 : 0);
          const scoreB = (b.title?.length || 0) + (b.source === 'Cointelegraph' ? 100 : 0);
          return scoreB - scoreA;
        case 'alphabetical':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

    console.log('🔍 Filter Results:', {
      original: news.length,
      afterSearch: searchQuery ? 'applied' : 'skipped',
      afterSentiment: sentimentFilter !== 'all' ? sentimentFilter : 'all',
      afterTime: timeFilter !== 'all' ? timeFilter : 'all',
      final: filtered.length
    });
    setFilteredNews(filtered);
  }, [news, searchQuery, sentimentFilter, timeFilter, sortBy]);

  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

      if (diffInMs < 0 || date.getFullYear() < 2000) {
        const randomHours = Math.floor(Math.random() * 12) + 1;
        return `${randomHours}h`;
      }

      if (diffInMinutes < 60) {
        return diffInMinutes <= 1 ? 'now' : `${diffInMinutes}m`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h`;
      } else if (diffInDays < 7) {
        return `${diffInDays}d`;
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }
    } catch {
      const randomHours = Math.floor(Math.random() * 8) + 1;
      return `${randomHours}h`;
    }
  };

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const handleReadFullArticle = (article, event) => {
    event.stopPropagation();
    if (article.url) {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShareArticle = async (article, event) => {
    event.stopPropagation();
    console.log('📢 Share button clicked for article:', article.title);
    
    // Extract the main title without extra text (like "Derivatives Average, Tops ETH and SOL Liquidity in CoinDesk Report")
    const mainTitle = article.title || 'Check out this article';
    const shareText = `${mainTitle}\n\nSee more at ${window.location.origin}`;
    
    try {
      console.log('🎯 Using Farcaster SDK composeCast for article sharing');
      const result = await sdk.actions.composeCast({
        text: shareText,
        embeds: [window.location.origin]
      });
      
      if (result?.cast) {
        console.log('✅ Article shared successfully:', result.cast.hash);
      } else {
        console.log('ℹ️ User canceled article sharing');
      }
    } catch (error) {
      console.error('❌ SDK composeCast failed, using fallback:', error);
      
      // Fallback to shareToFarcaster hook
      try {
        const shareResult = await shareToFarcaster(shareText, [window.location.origin]);
        console.log('✅ Fallback share result:', shareResult);
      } catch (fallbackError) {
        console.error('❌ All sharing methods failed:', fallbackError);
        // Final fallback - clipboard
        try {
          await navigator.clipboard.writeText(shareText);
          alert('📋 Article text copied to clipboard!');
        } catch (clipboardError) {
          console.error('❌ Even clipboard failed:', clipboardError);
        }
      }
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment) {
      case 'bullish': return '📈';
      case 'bearish': return '📉';
      default: return '📊';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'bullish':
        return { bg: 'var(--success)', color: 'white' };
      case 'bearish':
        return { bg: 'var(--error)', color: 'white' };
      default:
        return { bg: 'var(--muted)', color: 'var(--muted-foreground)' };
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      color: 'var(--foreground)',
      fontFamily: '"Inter", system-ui, sans-serif',
      paddingBottom: '80px' // Space for bottom nav
    }}>
      {/* Base Header */}
      <BaseHeader 
        title="Based News" 
        subtitle="Latest onchain updates"
        actions={
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}> {/* Reduced gap from 12px to 6px */}
            <ThemeToggleSimple inlineMode={true} />
            <BaseNetworkBadge />
          </div>
        }
      />

      

        {/* Search and Filters */}
        <div style={{
          padding: '16px 20px',
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)'
        }}>
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
          <input
            type="text"
            placeholder="🔍 Search Base news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="base-input"
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: '16px',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              outline: 'none',
              background: 'var(--background)',
              color: 'var(--foreground)',
              fontFamily: '"Inter", system-ui, sans-serif'
            }}
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="base-button-secondary"
            style={{
              padding: '12px',
              background: showFilters ? 'var(--base-blue)' : 'var(--secondary)',
              color: showFilters ? 'white' : 'var(--secondary-foreground)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontSize: '16px',
              cursor: 'pointer',
              minWidth: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ⚙️
          </button>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="base-card" style={{
            marginTop: '8px',
            padding: '16px',
            background: 'var(--muted)',
            borderRadius: '12px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            border: '1px solid var(--border)'
          }}>
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="base-input"
              style={{
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--background)',
                color: 'var(--foreground)',
                fontFamily: '"Inter", system-ui, sans-serif'
              }}
            >
              <option value="all">All Sentiment</option>
              <option value="bullish">📈 Bullish</option>
              <option value="bearish">📉 Bearish</option>
              <option value="neutral">📊 Neutral</option>
            </select>

            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="base-input"
              style={{
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--background)',
                color: 'var(--foreground)',
                fontFamily: '"Inter", system-ui, sans-serif'
              }}
            >
              <option value="all">All Time</option>
              <option value="1h">1 Hour</option>
              <option value="6h">6 Hours</option>
              <option value="24h">24 Hours</option>
              <option value="7d">Week</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="base-input"
              style={{
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--background)',
                color: 'var(--foreground)',
                gridColumn: 'span 2',
                fontFamily: '"Inter", system-ui, sans-serif'
              }}
            >
              <option value="recency">🕒 Most Recent</option>
              <option value="relevance">⭐ Most Relevant</option>
              <option value="alphabetical">🔤 A-Z</option>
            </select>
          </div>
        )}
      </div>

      {/* News Feed */}
      <main style={{
        padding: '16px 20px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Debug: Articles to render */}
          <div style={{ display: 'none' }}>
            {console.log('🎯 Rendering', filteredNews.length, 'articles on screen')}
          </div>
          {filteredNews.map((article, index) => (
            <article
              key={index}
              onClick={() => handleArticleClick(article)}
              className="base-card"
              style={{
                border: '1px solid var(--border)',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'var(--card)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: '0'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {/* Article Image */}
              {article.urlToImage && (
                <div style={{
                  height: '180px',
                  backgroundImage: `url(${article.urlToImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    padding: '6px 12px',
                    background: 'var(--base-blue)',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backdropFilter: 'blur(20px)'
                  }}>
                    📝 Tap for Summary
                  </div>
                  {article.sentiment && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      padding: '6px 12px',
                      background: getSentimentColor(article.sentiment).bg,
                      color: getSentimentColor(article.sentiment).color,
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backdropFilter: 'blur(20px)'
                    }}>
                      {getSentimentEmoji(article.sentiment)}
                      {article.sentiment.toUpperCase()}
                    </div>
                  )}
                </div>
              )}

              {/* Article Content */}
              <div style={{
                padding: '20px'
              }}>
                <h3 className="base-heading" style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'var(--card-foreground)',
                  lineHeight: '1.4',
                  margin: '0 0 12px 0',
                  letterSpacing: '-0.01em'
                }}>
                  {article.title}
                </h3>

                {article.description && (
                  <p className="base-text" style={{
                    fontSize: '14px',
                    color: 'var(--muted-foreground)',
                    lineHeight: '1.5',
                    margin: '0 0 16px 0'
                  }}>
                    {article.description.length > 140 
                      ? article.description.substring(0, 140) + '...'
                      : article.description
                    }
                  </p>
                )}

                {/* Article Meta */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: 'var(--muted-foreground)',
                    fontWeight: '500'
                  }}>
                    <span style={{
                      padding: '4px 8px',
                      background: 'var(--muted)',
                      borderRadius: '6px',
                      fontWeight: '600'
                    }}>
                      {article.source}
                    </span>
                    <span>•</span>
                    <span>{formatRelativeTime(article.publishedAt)}</span>
                  </div>
                  
                  {!article.urlToImage && article.sentiment && (
                    <div style={{
                      padding: '4px 8px',
                      background: getSentimentColor(article.sentiment).bg,
                      color: getSentimentColor(article.sentiment).color,
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {getSentimentEmoji(article.sentiment)}
                      {article.sentiment}
                    </div>
                  )}
                </div>

                {/* Base-style Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '12px'
                }}>
                  <button
                    onClick={(e) => handleReadFullArticle(article, e)}
                    className="base-button"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'var(--base-blue)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontFamily: '"Inter", system-ui, sans-serif'
                    }}
                  >
                    📖 Read Article
                  </button>
                  <button
                    onClick={(e) => handleShareArticle(article, e)}
                    className="base-button-share"
                    style={{
                      padding: '12px',
                      background: '#8a63d2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      minWidth: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(138, 99, 210, 0.2)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#7a52c4';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(138, 99, 210, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#8a63d2';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(138, 99, 210, 0.2)';
                    }}
                    title="Share on Farcaster"
                  >
                    📢
                  </button>
                  <button
                    onClick={() => handleArticleClick(article)}
                    className="base-button-secondary"
                    style={{
                      padding: '12px',
                      background: 'var(--secondary)',
                      color: 'var(--secondary-foreground)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      minWidth: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    📝
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredNews.length === 0 && news.length > 0 && (
          <div className="base-card" style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--card)',
            borderRadius: '16px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 className="base-heading" style={{ 
              fontSize: '18px', 
              marginBottom: '8px',
              color: 'var(--foreground)' 
            }}>
              No articles match your filters
            </h3>
            <p className="base-text" style={{ 
              color: 'var(--muted-foreground)', 
              marginBottom: '20px' 
            }}>
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSentimentFilter('all');
                setTimeFilter('all');
                setShowFilters(false);
              }}
              className="base-button"
              style={{
                padding: '12px 24px',
                background: 'var(--base-blue)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Loading State */}
        {news.length === 0 && (
          <div className="base-card" style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--card)',
            borderRadius: '16px',
            border: '1px solid var(--border)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--border)',
              borderTop: '3px solid var(--base-blue)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p className="base-text" style={{ 
              margin: 0, 
              color: 'var(--muted-foreground)' 
            }}>
              Loading latest Base ecosystem news...
            </p>
          </div>
        )}

      </main>

      

             {/* Base Bottom Navigation */}
       <nav style={{
         position: 'fixed',
         bottom: 0,
         left: 0,
         right: 0,
         background: 'var(--background)',
         borderTop: '1px solid var(--border)',
         padding: '12px 20px',
         display: 'flex',
         justifyContent: 'space-around',
         backdropFilter: 'blur(20px)',
         WebkitBackdropFilter: 'blur(20px)'
       }}>
         <a
           href="/"
           style={{
             display: 'flex',
             flexDirection: 'column',
             alignItems: 'center',
             textDecoration: 'none',
             color: 'var(--base-blue)',
             fontSize: '12px',
             fontWeight: '600',
             fontFamily: '"Inter", system-ui, sans-serif'
           }}
         >
           <svg style={{ width: '20px', height: '20px', marginBottom: '4px', fill: 'var(--base-blue)' }} viewBox="0 0 24 24">
             <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
           </svg>
           News
         </a>
         <a
           href="/dashboard"
           style={{
             display: 'flex',
             flexDirection: 'column',
             alignItems: 'center',
             textDecoration: 'none',
             color: 'var(--muted-foreground)',
             fontSize: '12px',
             fontWeight: '600',
             fontFamily: '"Inter", system-ui, sans-serif'
           }}
         >
           <svg style={{ width: '20px', height: '20px', marginBottom: '4px', fill: 'var(--muted-foreground)' }} viewBox="0 0 24 24">
             <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
           </svg>
           Dashboard
         </a>
         <a
           href="/coins"
           style={{
             display: 'flex',
             flexDirection: 'column',
             alignItems: 'center',
             textDecoration: 'none',
             color: 'var(--muted-foreground)',
             fontSize: '12px',
             fontWeight: '600',
             fontFamily: '"Inter", system-ui, sans-serif'
           }}
         >
           <div style={{
             width: '20px',
             height: '20px',
             background: 'var(--muted-foreground)',
             borderRadius: '4px',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             fontSize: '10px',
             fontWeight: '900',
             color: 'var(--background)',
             marginBottom: '4px'
           }}>
             B
           </div>
           Base Coins
         </a>
       </nav>

      {/* News Summary Modal */}
      <NewsSummaryModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        article={selectedArticle}
      />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}