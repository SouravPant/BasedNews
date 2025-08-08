console.log('=== MAIN.TSX STARTING ===');

// Test 1: Direct DOM manipulation
const root = document.getElementById("root");
console.log('Root element:', root);

if (root) {
  // Test 2: Add basic content immediately
  root.innerHTML = `
    <div style="padding: 20px; font-family: Arial; background: white; min-height: 100vh;">
      <h1 style="color: #2563eb; text-align: center;">BasedNews - Loading...</h1>
      <p style="text-align: center; color: #666;">Testing JavaScript execution...</p>
      <div id="status" style="text-align: center; color: #999; margin-top: 20px;">DOM manipulation working</div>
    </div>
  `;
  
  console.log('Basic HTML injected');
  
  // Test 3: Try React after DOM is ready
  setTimeout(() => {
    console.log('=== STARTING REACT ===');
    
    try {
      // Dynamic import to avoid initial load issues
      import('react').then(React => {
        import('react-dom/client').then(ReactDOM => {
          console.log('React modules loaded:', { React, ReactDOM });
          
          const TestComponent = () => {
            const [news, setNews] = React.useState([]);
            const [status, setStatus] = React.useState('Loading news...');
            
            React.useEffect(() => {
              console.log('TestComponent mounted, fetching news...');
              
              fetch('/api/news')
                .then(res => {
                  console.log('News API response:', res.status);
                  return res.json();
                })
                .then(data => {
                  console.log('News data received:', data);
                  setNews(Array.isArray(data) ? data.slice(0, 3) : []);
                  setStatus(`Loaded ${Array.isArray(data) ? data.length : 0} articles`);
                })
                .catch(err => {
                  console.error('News fetch error:', err);
                  setStatus('Failed to load news: ' + err.message);
                });
            }, []);
            
            return React.createElement('div', {
              style: { 
                padding: '20px', 
                fontFamily: 'Arial', 
                background: 'white', 
                minHeight: '100vh',
                maxWidth: '1000px',
                margin: '0 auto'
              }
            }, [
              React.createElement('h1', {
                key: 'title',
                style: { color: '#2563eb', textAlign: 'center', marginBottom: '20px' }
              }, 'BasedNews - Crypto News'),
              
              React.createElement('p', {
                key: 'status',
                style: { textAlign: 'center', color: '#666', marginBottom: '30px' }
              }, status),
              
              React.createElement('div', {
                key: 'articles',
                style: { display: 'grid', gap: '15px' }
              }, news.map((article, i) => 
                React.createElement('div', {
                  key: i,
                  style: {
                    border: '1px solid #ddd',
                    padding: '15px',
                    borderRadius: '8px',
                    background: '#fafafa'
                  }
                }, [
                  React.createElement('h3', { 
                    key: 'title',
                    style: { margin: '0 0 10px 0', color: '#333' } 
                  }, article.title || 'No title'),
                  React.createElement('p', { 
                    key: 'source',
                    style: { margin: 0, color: '#666', fontSize: '14px' } 
                  }, `Source: ${article.source || 'Unknown'}`)
                ])
              ))
            ]);
          };
          
          console.log('Creating React root...');
          const reactRoot = ReactDOM.createRoot(root);
          console.log('React root created, rendering...');
          reactRoot.render(React.createElement(TestComponent));
          console.log('React render called');
          
        }).catch(err => {
          console.error('Failed to load ReactDOM:', err);
          root.innerHTML += '<p style="color: red;">Failed to load ReactDOM: ' + err.message + '</p>';
        });
      }).catch(err => {
        console.error('Failed to load React:', err);
        root.innerHTML += '<p style="color: red;">Failed to load React: ' + err.message + '</p>';
      });
      
    } catch (err) {
      console.error('React setup error:', err);
      root.innerHTML += '<p style="color: red;">React setup error: ' + err.message + '</p>';
    }
  }, 1000);
  
} else {
  console.error('Root element not found!');
}

console.log('=== MAIN.TSX COMPLETE ===');
