import { createRoot } from "react-dom/client";
import React from "react";
import "./index.css";

// Extremely basic test component
function TestApp() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      background: '#ffffff'
    }}>
      <h1 style={{ color: '#000', fontSize: '32px', marginBottom: '20px' }}>
        BasedNews Test Page
      </h1>
      <p style={{ color: '#333', fontSize: '18px', marginBottom: '20px' }}>
        If you can see this, React is working correctly.
      </p>
      <div style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}>
        <h2 style={{ color: '#000', fontSize: '24px', marginBottom: '10px' }}>
          Debug Information:
        </h2>
        <p style={{ color: '#666', margin: '5px 0' }}>
          • React version: {React.version}
        </p>
        <p style={{ color: '#666', margin: '5px 0' }}>
          • Environment: {process.env.NODE_ENV || 'development'}
        </p>
        <p style={{ color: '#666', margin: '5px 0' }}>
          • Timestamp: {new Date().toISOString()}
        </p>
      </div>
    </div>
  );
}

// Error boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          fontFamily: 'Arial, sans-serif',
          background: '#ffe6e6',
          color: '#cc0000',
          minHeight: '100vh'
        }}>
          <h1>React Error Detected</h1>
          <p>Error: {this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              padding: '10px 20px', 
              background: '#cc0000', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <ErrorBoundary>
    <TestApp />
  </ErrorBoundary>
);
