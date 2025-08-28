import { createRoot } from "react-dom/client";
import React from "react";
import "./index.css";
import { MobileBaseCoins } from "./pages/mobile-base-coins";
import { BaseNews } from "./components/base-news";
import { MiniAppDashboard } from "./components/mini-app-dashboard";
import { TestDashboard } from "./components/test-dashboard";
import { ThemeToggleSimple } from "./components/theme-toggle-simple";
import { BaseWalletProvider } from "./providers/BaseWalletProvider";
import { MiniKitProvider } from "./providers/MiniKitProvider";
import { sdk } from '@farcaster/miniapp-sdk';
import { useBatchRelativeTime } from './lib/timeUtils';

// Immediate Farcaster SDK Ready Signal - Call ASAP
const sendImmediateReadySignal = async () => {
  try {
    console.log('🚀 IMMEDIATE: Sending Farcaster ready signal...');
    
    // Try SDK ready first
    try {
      const isInMiniApp = await sdk.isInMiniApp();
      console.log('📱 IMMEDIATE: Is in Mini App context:', isInMiniApp);
      
      if (isInMiniApp) {
        console.log('🎯 IMMEDIATE: Calling sdk.actions.ready()...');
        await sdk.actions.ready();
        console.log('✅ IMMEDIATE: SDK ready signal sent successfully');
        return true;
      }
    } catch (sdkError) {
      console.log('⚠️ IMMEDIATE: SDK failed, trying fallbacks...', sdkError);
    }
    
    // Fallback ready signals for all cases
    if (window.parent && window.parent !== window) {
      console.log('🔄 IMMEDIATE: Sending fallback ready signals...');
      const signals = [
        { type: 'sdk.ready', data: {} },
        { type: 'frame.ready', data: {} },
        { type: 'sdk_ready' },
        { type: 'miniapp-ready' },
        { type: 'ready' },
        { type: 'farcaster-ready' }
      ];
      
      signals.forEach(signal => {
        try {
          window.parent.postMessage(signal, '*');
        } catch (e) {
          console.log('Failed to send signal:', signal.type);
        }
      });
      console.log('✅ IMMEDIATE: Fallback ready signals sent');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ IMMEDIATE: Error sending ready signal:', error);
    return false;
  }
};

// Call immediately when script loads
sendImmediateReadySignal();

// Farcaster SDK Ready Signal Hook
const useFarcasterReady = () => {
  React.useEffect(() => {
    let readySent = false;
    
    const sendReadySignal = async () => {
      if (readySent) return;
      
      try {
        console.log('🎯 HOOK: Sending Farcaster ready signal...');
        
        // Check if we're in a Mini App context
        const isInMiniApp = await sdk.isInMiniApp();
        console.log('📱 HOOK: Is in Mini App context:', isInMiniApp);
        
        if (isInMiniApp) {
          console.log('🚀 HOOK: Calling sdk.actions.ready()...');
          await sdk.actions.ready();
          console.log('✅ HOOK: SDK ready signal sent successfully');
          readySent = true;
        } else {
          console.log('ℹ️ HOOK: Not in Mini App context, trying fallbacks');
          
          // For development/testing outside of Farcaster
          if (window.parent && window.parent !== window) {
            console.log('🔧 HOOK: Sending fallback ready signals...');
            const signals = [
              { type: 'sdk.ready', data: {} },
              { type: 'frame.ready', data: {} },
              { type: 'sdk_ready' },
              { type: 'miniapp-ready' },
              { type: 'ready' }
            ];
            
            signals.forEach(signal => {
              window.parent.postMessage(signal, '*');
            });
            readySent = true;
          }
        }
      } catch (error) {
        console.error('❌ HOOK: Error with Farcaster SDK ready signal:', error);
        
        // Fallback for cases where SDK fails
        if (window.parent && window.parent !== window && !readySent) {
          console.log('🔄 HOOK: Falling back to manual ready signals...');
          try {
            const fallbackSignals = [
              { type: 'sdk.ready', data: {} },
              { type: 'frame.ready', data: {} },
              { type: 'sdk_ready' },
              { type: 'miniapp-ready' },
              { type: 'ready' },
              { type: 'farcaster-ready' }
            ];
            
            fallbackSignals.forEach(signal => {
              window.parent.postMessage(signal, '*');
            });
            console.log('✅ HOOK: Fallback ready signals sent');
            readySent = true;
          } catch (fallbackError) {
            console.error('❌ HOOK: Fallback ready signals also failed:', fallbackError);
          }
        }
      }
    };

    // Multiple timing strategies
    sendReadySignal(); // Immediate
    setTimeout(sendReadySignal, 50);   // Very quick
    setTimeout(sendReadySignal, 100);  // Quick
    setTimeout(sendReadySignal, 500);  // Medium
    setTimeout(sendReadySignal, 1000); // Slower fallback

    // Also send after page load events
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', sendReadySignal);
    }
    window.addEventListener('load', sendReadySignal);

    return () => {
      document.removeEventListener('DOMContentLoaded', sendReadySignal);
      window.removeEventListener('load', sendReadySignal);
    };
  }, []);
};

function WorkingNewsApp() {
  const [news, setNews] = React.useState([]);
  const [status, setStatus] = React.useState('Loading news...');
  const [selectedArticle, setSelectedArticle] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Use the new batch relative time hook for auto-updating times
  const articleTimestamps = news.map(article => article.publishedAt);
  const relativeTimes = useBatchRelativeTime(articleTimestamps);

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

  // Remove the old formatRelativeTime function - now using centralized utility

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
                <div style={{
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
                    {relativeTimes[index]}
                  </span>
                </div>
                
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
              </div>
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
  // Initialize Farcaster Ready Signal
  useFarcasterReady();

  // Initialize currentPage based on current URL path
  const getInitialPage = () => {
    const path = window.location.pathname;
    console.log('Initial path:', path);
    if (path === '/coins') {
      return 'coins';
    } else if (path === '/dashboard') {
      return 'dashboard';
    } else {
      return 'news';
    }
  };

  const [currentPage, setCurrentPage] = React.useState(getInitialPage);

  React.useEffect(() => {
    console.log('Current page state:', currentPage);
    
    // Handle navigation
    const handlePopState = () => {
      const path = window.location.pathname;
      console.log('Navigation to:', path);
      if (path === '/coins') {
        setCurrentPage('coins');
      } else if (path === '/dashboard') {
        setCurrentPage('dashboard');
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
      if (link && (link.href.endsWith('/') || link.href.endsWith('/coins') || link.href.endsWith('/dashboard'))) {
        e.preventDefault();
        const path = new URL(link.href).pathname;
        console.log('Navigating to:', path);
        window.history.pushState({}, '', path);
        
        if (path === '/coins') {
          setCurrentPage('coins');
        } else if (path === '/dashboard') {
          setCurrentPage('dashboard');
        } else {
          setCurrentPage('news');
        }
      }
    };

    document.addEventListener('click', handleNavClick);
    return () => document.removeEventListener('click', handleNavClick);
  }, []);

  console.log('Rendering page:', currentPage);

  if (currentPage === 'coins') {
    return (
      <>
        <ThemeToggleSimple />
        <MobileBaseCoins />
      </>
    );
  }

  if (currentPage === 'dashboard') {
    return (
      <>
        <ThemeToggleSimple />
        <TestDashboard />
      </>
    );
  }

  return (
    <>
      <BaseNews />
    </>
  );
}

console.log('Starting App...');
const root = createRoot(document.getElementById("root")!);
root.render(
  <MiniKitProvider>
    <BaseWalletProvider>
      <App />
    </BaseWalletProvider>
  </MiniKitProvider>
);
console.log('App rendered!');
// Farcaster SDK integration complete
