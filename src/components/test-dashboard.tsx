import React from "react";

export function TestDashboard() {
  console.log('🧪 TestDashboard loaded - NO CACHE VERSION');
  console.log('📦 Test timestamp:', Date.now());
  
  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      backgroundColor: '#e0f2fe',
      borderRadius: '8px',
      margin: '20px',
      border: '2px solid #0052ff'
    }}>
      <h1>🧪 TEST DASHBOARD v2.2.0</h1>
      <p>✅ This is a completely new component!</p>
      <p>📦 Timestamp: {Date.now()}</p>
      <p>🎯 If you see this, cache is cleared!</p>
      
      <button
        onClick={() => {
          alert('✅ Button works! Cache is cleared!');
          console.log('🎉 Test button clicked successfully!');
        }}
        style={{
          padding: '16px 32px',
          backgroundColor: '#0052ff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
          margin: '20px'
        }}
      >
        🎉 Test Button - Click Me!
      </button>
      
      <div style={{ 
        marginTop: '20px', 
        fontSize: '14px', 
        color: '#666' 
      }}>
        If you see old MiniKit errors, Vercel cache is still active.
        <br />
        This component has ZERO MiniKit dependencies.
      </div>
    </div>
  );
}