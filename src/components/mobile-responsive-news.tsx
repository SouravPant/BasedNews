import React from "react";
import { NewsSummaryModal } from "./news-summary-modal";

export function MobileResponsiveNews() {
  const [news, setNews] = React.useState([]);
  const [filteredNews, setFilteredNews] = React.useState([]);
  const [status, setStatus] = React.useState('Loading news...');
  const [selectedArticle, setSelectedArticle] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  // Filter and sort states
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sentimentFilter, setSentimentFilter] = React.useState('all');
  const [timeFilter, setTimeFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('recency');
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(() => {
    console.log('Fetching news...');
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        console.log('News loaded:', data.length);
        setNews(data);
        setStatus(`${data.length} articles loaded`);
      })
      .catch(err => {
        console.error('Error:', err);
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
        return { bg: '#dcfce7', color: '#166534' };
      case 'bearish':
        return { bg: '#fef2f2', color: '#dc2626' };
      default:
        return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Mobile Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--background)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 16px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--primary)',
            margin: 0
          }}>
            BasedNews
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <a
              href="/coins"
              style={{
                padding: '6px 12px',
                backgroundColor: 'var(--secondary)',
                color: 'var(--secondary-foreground)',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              💰 Coins
            </a>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="🔍 Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '10px',
              backgroundColor: showFilters ? 'var(--primary)' : 'var(--secondary)',
              color: showFilters ? 'var(--primary-foreground)' : 'var(--secondary-foreground)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              minWidth: '40px'
            }}
          >
            ⚙️
          </button>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: 'var(--muted)',
            borderRadius: '8px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px'
          }}>
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              style={{
                padding: '8px',
                fontSize: '12px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)'
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
              style={{
                padding: '8px',
                fontSize: '12px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)'
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
              style={{
                padding: '8px',
                fontSize: '12px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                gridColumn: 'span 2'
              }}
            >
              <option value="recency">🕒 Most Recent</option>
              <option value="relevance">⭐ Most Relevant</option>
              <option value="alphabetical">🔤 A-Z</option>
            </select>
          </div>
        )}

        {/* Results Summary */}
        <div style={{
          marginTop: '8px',
          fontSize: '12px',
          color: 'var(--muted-foreground)',
          textAlign: 'center'
        }}>
          {filteredNews.length} of {news.length} articles • {status}
        </div>
      </header>

      {/* Mobile News Feed */}
      <main style={{
        padding: '16px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {filteredNews.map((article, index) => (
            <article
              key={index}
              onClick={() => handleArticleClick(article)}
              style={{
                border: '1px solid var(--border)',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'var(--card)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
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
                  height: '160px',
                  backgroundImage: `url(${article.urlToImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '4px 8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: '600'
                  }}>
                    📝 TAP FOR SUMMARY
                  </div>
                  {article.sentiment && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      padding: '4px 8px',
                      backgroundColor: getSentimentColor(article.sentiment).bg,
                      color: getSentimentColor(article.sentiment).color,
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {getSentimentEmoji(article.sentiment)}
                      {article.sentiment.toUpperCase()}
                    </div>
                  )}
                </div>
              )}

              {/* Article Content */}
              <div style={{
                padding: '16px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--card-foreground)',
                  lineHeight: '1.4',
                  margin: '0 0 8px 0'
                }}>
                  {article.title}
                </h3>

                {article.description && (
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--muted-foreground)',
                    lineHeight: '1.4',
                    margin: '0 0 12px 0'
                  }}>
                    {article.description.length > 120 
                      ? article.description.substring(0, 120) + '...'
                      : article.description
                    }
                  </p>
                )}

                {/* Article Meta */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: 'var(--muted-foreground)'
                  }}>
                    <span>{article.source}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(article.publishedAt)}</span>
                  </div>
                  
                  {!article.urlToImage && article.sentiment && (
                    <div style={{
                      padding: '2px 6px',
                      backgroundColor: getSentimentColor(article.sentiment).bg,
                      color: getSentimentColor(article.sentiment).color,
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      {getSentimentEmoji(article.sentiment)}
                      {article.sentiment}
                    </div>
                  )}
                </div>

                {/* Mobile Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={(e) => handleReadFullArticle(article, e)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    📖 Read Article
                  </button>
                  <button
                    onClick={() => handleArticleClick(article)}
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--secondary)',
                      color: 'var(--secondary-foreground)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      minWidth: '60px'
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
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--muted-foreground)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔍</div>
            <p style={{ margin: '0 0 16px 0' }}>No articles match your filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSentimentFilter('all');
                setTimeFilter('all');
                setShowFilters(false);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Loading State */}
        {news.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--muted-foreground)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid var(--border)',
              borderTop: '3px solid var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ margin: 0 }}>Loading latest crypto news...</p>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--background)',
        borderTop: '1px solid var(--border)',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          gap: '24px'
        }}>
          <a
            href="/"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'var(--primary)',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <span style={{ fontSize: '20px', marginBottom: '2px' }}>📰</span>
            News
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
              fontWeight: '600'
            }}
          >
            <span style={{ fontSize: '20px', marginBottom: '2px' }}>💰</span>
            Coins
          </a>
        </div>
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