import React from 'react';

export function FarcasterLoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #0000FF 0%, #0033FF 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      zIndex: 9999
    }}>
      {/* Base Logo */}
      <div style={{
        width: '80px',
        height: '80px',
        background: 'white',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        animation: 'pulse 2s infinite'
      }}>
        <div style={{
          fontSize: '32px',
          fontWeight: '900',
          color: '#0000FF'
        }}>
          ⬜
        </div>
      </div>

      {/* App Title */}
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '800',
        margin: '0 0 12px 0',
        letterSpacing: '-0.02em'
      }}>
        Based News
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: '1.1rem',
        opacity: 0.9,
        margin: '0 0 32px 0',
        textAlign: 'center'
      }}>
        Loading your crypto news experience...
      </p>

      {/* Loading Spinner */}
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid rgba(255, 255, 255, 0.3)',
        borderTop: '3px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>

      {/* Loading Text */}
      <p style={{
        fontSize: '0.9rem',
        opacity: 0.7,
        margin: '16px 0 0 0',
        animation: 'fade 1.5s ease-in-out infinite alternate'
      }}>
        Connecting to Base ecosystem...
      </p>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.9; }
          }
          
          @keyframes fade {
            0% { opacity: 0.7; }
            100% { opacity: 1; }
          }
        `
      }} />
    </div>
  );
}