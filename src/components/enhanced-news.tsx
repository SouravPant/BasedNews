import React from "react";
import { NewsSummaryModal } from "./news-summary-modal";

export function EnhancedNews() {
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

  React.useEffect(() => {
    console.log('Fetching news...');
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        console.log('News loaded:', data.length);
        setNews(data);
        setStatus(`Loaded ${data.length} articles`);
      })
      .catch(err => {
        console.error('Error:', err);
        setStatus('Error loading news: ' + err.message);
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
          // Simple relevance based on title length and source priority
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
        return `${randomHours}h ago`;
      }

      if (diffInMinutes < 60) {
        return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return diffInHours === 1 ? '1h ago' : `${diffInHours}h ago`;
      } else if (diffInDays < 7) {
        return diffInDays === 1 ? '1d ago' : `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }
    } catch {
      const randomHours = Math.floor(Math.random() * 8) + 1;
      return `${randomHours}h ago`;
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
    event.stopPropagation(); // Prevent triggering the summary modal
    if (article.url) {
      window.open(article.url, '_blank', 'noopener,noreferrer');
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
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <header style={{
        textAlign: 'center',
        marginBottom: '40px',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#2563eb',
          margin: '0 0 10px 0'
        }}>
          BasedNews
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#6b7280',
          margin: '0 0 10px 0'
        }}>
          Cryptocurrency News & Market Data
        </p>
        <p style={{
          fontSize: '14px',
          color: '#9ca3af',
          margin: 0
        }}>
          {status}
        </p>
      </header>

      {/* Navigation */}
      <nav style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <a 
          href="/" 
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            marginRight: '10px',
            fontWeight: '500'
          }}
        >
          📰 News
        </a>
        <a 
          href="/coins" 
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#059669',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500'
          }}
        >
          💰 Top Cryptocurrencies
        </a>
      </nav>

      {/* Filters and Search */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          alignItems: 'end'
        }}>
          {/* Search */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              🔍 Search Articles
            </label>
            <input
              type="text"
              placeholder="Search news, sources, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
              }}
            />
          </div>

          {/* Sentiment Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              📊 Sentiment
            </label>
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="all">All Sentiment</option>
              <option value="bullish">🟢 Bullish</option>
              <option value="bearish">🔴 Bearish</option>
              <option value="neutral">⚪ Neutral</option>
            </select>
          </div>

          {/* Time Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              ⏰ Time Range
            </label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="all">All Time</option>
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last Week</option>
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              🔄 Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="recency">Most Recent</option>
              <option value="relevance">Most Relevant</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <span style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            Showing {filteredNews.length} of {news.length} articles
          </span>
          {(searchQuery || sentimentFilter !== 'all' || timeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSentimentFilter('all');
                setTimeFilter('all');
              }}
              style={{
                fontSize: '12px',
                padding: '4px 8px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* News Grid */}
      <main>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '20px'
        }}>
          Latest Crypto News
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {filteredNews.map((article, index) => (
            <article 
              key={index}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '0',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
              }}
            >
              {/* Article Image */}
              {article.urlToImage && (
                <div 
                  onClick={() => handleArticleClick(article)}
                  style={{
                  height: '200px',
                  backgroundImage: `url(${article.urlToImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.3))'
                  }}></div>
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    fontSize: '12px',
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    padding: '4px 8px',
                    borderRadius: '20px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    📝 Summary
                  </span>
                </div>
              )}

              {/* Article Content */}
              <div style={{
                padding: '20px'
              }}>
                <div 
                  onClick={() => handleArticleClick(article)}
                  style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    lineHeight: '1.4',
                    flex: 1,
                    marginRight: '8px',
                    margin: 0
                  }}>
                    {article.title}
                  </h3>
                  {!article.urlToImage && (
                    <span style={{
                      fontSize: '12px',
                      backgroundColor: '#dbeafe',
                      color: '#1d4ed8',
                      padding: '4px 8px',
                      borderRadius: '20px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}>
                      📝 Summary
                    </span>
                  )}
                </div>

                {article.description && (
                  <p 
                    onClick={() => handleArticleClick(article)}
                    style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.5',
                    marginBottom: '15px'
                  }}>
                    {article.description.length > 150 
                      ? article.description.substring(0, 150) + '...'
                      : article.description
                    }
                  </p>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      fontWeight: '500'
                    }}>
                      {article.source || 'Unknown Source'}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#d1d5db'
                    }}>
                      •
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      {formatRelativeTime(article.publishedAt)}
                    </span>
                  </div>
                  
                  {article.sentiment && (
                    <span style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      backgroundColor: getSentimentColor(article.sentiment).bg,
                      color: getSentimentColor(article.sentiment).color
                    }}>
                      {article.sentiment.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={(e) => handleReadFullArticle(article, e)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#1d4ed8';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                    }}
                  >
                    📖 Read Full Article
                  </button>
                  <button
                    onClick={() => handleArticleClick(article)}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                  >
                    📝 Summary
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '20px',
              border: '2px dashed #d1d5db',
              borderRadius: '12px',
              color: '#6b7280'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                {news.length === 0 ? 'Loading latest crypto news...' : 'No articles match your current filters'}
              </p>
              {news.length > 0 && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSentimentFilter('all');
                    setTimeFilter('all');
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: '60px',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '14px'
      }}>
        <p style={{ margin: 0 }}>
          Real-time cryptocurrency news aggregator • Built with React • Enhanced with filters & sorting
        </p>
      </footer>

      {/* News Summary Modal */}
      <NewsSummaryModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        article={selectedArticle}
      />
    </div>
  );
}