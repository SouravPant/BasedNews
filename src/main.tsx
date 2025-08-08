import { createRoot } from "react-dom/client";
import React, { useState, useEffect } from "react";
import "./index.css";

// Minimal news app
function SimpleNewsApp() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        setNews(Array.isArray(data) ? data.slice(0, 6) : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>BasedNews</h1>
        <p>Loading news...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>BasedNews</h1>
        <p style={{ color: 'red' }}>Error loading news: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <header style={{ 
        borderBottom: '2px solid #eee', 
        paddingBottom: '20px', 
        marginBottom: '30px' 
      }}>
        <h1 style={{ 
          color: '#2563eb', 
          fontSize: '36px', 
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          BasedNews
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: '18px',
          textAlign: 'center'
        }}>
          Cryptocurrency News Aggregator
        </p>
      </header>

      <main>
        <h2 style={{ 
          color: '#1f2937', 
          fontSize: '24px', 
          marginBottom: '20px' 
        }}>
          Latest News ({news.length} articles)
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gap: '20px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'
        }}>
          {news.map((article, index) => (
            <article key={index} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                color: '#1f2937',
                fontSize: '18px',
                marginBottom: '10px',
                lineHeight: '1.4'
              }}>
                {article.title}
              </h3>
              
              {article.description && (
                <p style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '15px'
                }}>
                  {article.description.substring(0, 150)}...
                </p>
              )}
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: '#9ca3af'
              }}>
                <span>{article.source}</span>
                {article.sentiment && (
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: article.sentiment === 'bullish' ? '#dcfce7' : 
                                   article.sentiment === 'bearish' ? '#fef2f2' : '#f3f4f6',
                    color: article.sentiment === 'bullish' ? '#166534' : 
                           article.sentiment === 'bearish' ? '#dc2626' : '#374151'
                  }}>
                    {article.sentiment}
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
                    marginTop: '10px',
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}
                >
                  Read more →
                </a>
              )}
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<SimpleNewsApp />);
