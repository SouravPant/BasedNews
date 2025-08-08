import { createRoot } from "react-dom/client";
import React from "react";
import "./index.css";
import { EnhancedCoins } from "./pages/enhanced-coins";
import { ThemeToggleSimple } from "./components/theme-toggle-simple";
import { WalletConnect } from "./components/wallet-connect";
import { NewsSummaryModal } from "./components/news-summary-modal";

function WorkingNewsApp() {
  const [news, setNews] = React.useState([]);
  const [status, setStatus] = React.useState('Loading news...');
  const [selectedArticle, setSelectedArticle] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    console.log('Fetching news...');
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        console.log('News loaded:', data.length, 'articles');
        setNews(Array.isArray(data) ? data.slice(0, 6) : []);
        setStatus(`Successfully loaded ${Array.isArray(data) ? data.length : 0} articles`);
      })
      .catch(err => {
        console.error('Error:', err);
        setStatus('Error loading news: ' + err.message);
      });
  }, []);

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
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
          💰 Top 100 Coins
        </a>
      </nav>

      {/* News Grid */}
      <main>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '20px'
        }}>
          Latest Crypto News ({news.length} articles)
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {news.map((article, index) => (
            <article 
              key={index}
              onClick={() => handleArticleClick(article)}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
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
              <div style={{
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
              </div>

              {article.description && (
                <p style={{
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
                marginBottom: '12px'
              }}>
                <span style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  fontWeight: '500'
                }}>
                  {article.source || 'Unknown Source'}
                </span>
                
                {article.sentiment && (
                  <span style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    backgroundColor: 
                      article.sentiment === 'bullish' ? '#dcfce7' :
                      article.sentiment === 'bearish' ? '#fef2f2' : '#f3f4f6',
                    color:
                      article.sentiment === 'bullish' ? '#166534' :
                      article.sentiment === 'bearish' ? '#dc2626' : '#374151'
                  }}>
                    {article.sentiment.toUpperCase()}
                  </span>
                )}
              </div>

              {article.url && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    fontSize: '14px',
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontWeight: '500',
                    borderBottom: '1px solid transparent',
                    transition: 'border-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderBottomColor = '#2563eb';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }}
                >
                  Read Full Article →
                </a>
              )}
            </article>
          ))}
        </div>

        {news.length === 0 && status.includes('Loading') && (
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
              <p style={{ margin: 0, fontSize: '16px' }}>Loading latest crypto news...</p>
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
          Real-time cryptocurrency news aggregator • Built with React
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

function App() {
  const [currentPage, setCurrentPage] = React.useState('news');

  React.useEffect(() => {
    // Simple routing based on URL path
    const path = window.location.pathname;
    if (path === '/coins') {
      setCurrentPage('coins');
    } else {
      setCurrentPage('news');
    }

    // Handle navigation
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/coins') {
        setCurrentPage('coins');
      } else {
        setCurrentPage('news');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle navigation clicks
  React.useEffect(() => {
    const handleNavClick = (e) => {
      const link = e.target.closest('a');
      if (link && (link.href.endsWith('/') || link.href.endsWith('/coins'))) {
        e.preventDefault();
        const path = new URL(link.href).pathname;
        window.history.pushState({}, '', path);
        
        if (path === '/coins') {
          setCurrentPage('coins');
        } else {
          setCurrentPage('news');
        }
      }
    };

    document.addEventListener('click', handleNavClick);
    return () => document.removeEventListener('click', handleNavClick);
  }, []);

  if (currentPage === 'coins') {
    return (
      <>
        <ThemeToggleSimple />
        <WalletConnect />
        <EnhancedCoins />
      </>
    );
  }

  return (
    <>
      <ThemeToggleSimple />
      <WalletConnect />
      <WorkingNewsApp />
    </>
  );
}

console.log('Starting App...');
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
console.log('App rendered!');
