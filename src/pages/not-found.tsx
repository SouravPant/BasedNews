import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    // Log 404 for debugging
    console.log('🔵 Based News: 404 Page Loaded', {
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent.substring(0, 100),
      isIframe: window !== window.parent,
      timestamp: new Date().toISOString()
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
          ⬜
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Based News</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist, but Based News is still here for you!
        </p>
        
        <div className="space-y-3">
          <a 
            href="/" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </a>
          
          <div className="text-sm text-gray-500">
            <p>Real-time crypto news & Base ecosystem tracking</p>
          </div>
        </div>
        
        {/* Debug info for iframe context */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left text-xs">
          <p><strong>URL:</strong> {window.location.href}</p>
          <p><strong>Referrer:</strong> {document.referrer || 'Direct'}</p>
          <p><strong>In iframe:</strong> {window !== window.parent ? 'Yes' : 'No'}</p>
          <p><strong>Time:</strong> {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  );
}
