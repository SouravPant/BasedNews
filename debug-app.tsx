// Simple debug version to test deployment
function DebugApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>BasedHub Debug</h1>
      <p>If you can see this, the React app is working!</p>
      <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '20px' }}>
        <h2>API Test</h2>
        <button onClick={() => {
          fetch('/api/status')
            .then(res => res.json())
            .then(data => {
              document.getElementById('api-result')!.innerHTML = JSON.stringify(data, null, 2);
            })
            .catch(err => {
              document.getElementById('api-result')!.innerHTML = 'Error: ' + err.message;
            });
        }}>
          Test API Status
        </button>
        <pre id="api-result" style={{ background: '#f5f5f5', padding: '10px', marginTop: '10px' }}>
          Click button to test API
        </pre>
      </div>
    </div>
  );
}

export default DebugApp;