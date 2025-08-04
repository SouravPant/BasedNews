import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Simple error boundary to catch any rendering issues
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>;
  } catch (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>BasedHub - Error Detected</h1>
        <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      </div>
    );
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
