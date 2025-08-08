import { createRoot } from "react-dom/client";
import React from "react";
import "./index.css";

// Ultra-minimal app with zero dependencies
function MinimalApp() {
  const [news, setNews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    console.log('MinimalApp mounted');
    fetch('/api/news')
      .then(res => {
        console.log('API response:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('News data:', data);
        setNews(Array.isArray(data) ? data.slice(0, 5) : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('API error:', err);
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    console.log('News state updated:', news.length, 'articles');
  }, [news]);

  console.log('Rendering MinimalApp, loading:', loading, 'news count:', news.length);

  if (loading) {
    return React.createElement('div', {
      style: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        background: '#ffffff',
        minHeight: '100vh'
      }
    }, React.createElement('h1', { style: { color: '#2563eb' } }, 'BasedNews'), React.createElement('p', null, 'Loading news...'));
  }

  return React.createElement('div', {
    style: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      background: '#ffffff',
      minHeight: '100vh',
      maxWidth: '1200px',
      margin: '0 auto'
    }
  }, [
    React.createElement('h1', { 
      key: 'title',
      style: { 
        color: '#2563eb', 
        textAlign: 'center',
        marginBottom: '30px'
      } 
    }, 'BasedNews - Crypto News'),
    React.createElement('p', {
      key: 'subtitle',
      style: {
        textAlign: 'center',
        color: '#666',
        marginBottom: '40px'
      }
    }, `Found ${news.length} articles`),
    React.createElement('div', {
      key: 'articles',
      style: {
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'
      }
    }, news.map((article, index) => 
      React.createElement('div', {
        key: index,
        style: {
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }
      }, [
        React.createElement('h3', {
          key: 'title',
          style: {
            color: '#1f2937',
            fontSize: '16px',
            marginBottom: '10px',
            lineHeight: '1.4'
          }
        }, article.title || 'No title'),
        article.description && React.createElement('p', {
          key: 'desc',
          style: {
            color: '#6b7280',
            fontSize: '14px',
            marginBottom: '10px'
          }
        }, article.description.substring(0, 100) + '...'),
        React.createElement('small', {
          key: 'source',
          style: { color: '#9ca3af' }
        }, article.source || 'Unknown source')
      ])
    ))
  ]);
}

console.log('Script loaded, creating root...');
const root = createRoot(document.getElementById("root")!);
console.log('Root created, rendering...');
root.render(React.createElement(MinimalApp));
console.log('Render called');
