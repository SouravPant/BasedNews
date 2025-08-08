import React from "react";

interface NewsSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
    urlToImage?: string;
    content?: string;
  } | null;
}

export function NewsSummaryModal({ isOpen, onClose, article }: NewsSummaryModalProps) {
  const [summary, setSummary] = React.useState<string>("");
  const [isGeneratingSummary, setIsGeneratingSummary] = React.useState(false);
  const [showFullArticle, setShowFullArticle] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && article) {
      generateSummary(article);
      setShowFullArticle(false);
    }
  }, [isOpen, article]);

  const generateSummary = (article: any) => {
    setIsGeneratingSummary(true);
    
    // Create a smart summary from available content
    const content = article.content || article.description || "";
    const title = article.title || "";
    
    // Simple extractive summarization
    if (content.length > 200) {
      // Extract key sentences (simple approach)
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
      const keySentences = sentences.slice(0, 3).join('. ') + '.';
      setSummary(keySentences);
    } else {
      setSummary(content || "Summary not available for this article.");
    }
    
    setIsGeneratingSummary(false);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleReadFullArticle = () => {
    if (article?.url) {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen || !article) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '0',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Image */}
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
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))'
            }}></div>
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: '#374151',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Content */}
        <div style={{
          padding: '24px'
        }}>
          {/* Close button when no image */}
          {!article.urlToImage && (
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#f3f4f6',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: '#374151'
              }}
            >
              ×
            </button>
          )}

          {/* Article Title */}
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '12px',
            lineHeight: '1.3',
            paddingRight: '40px'
          }}>
            {article.title}
          </h1>

          {/* Article Meta */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            <span style={{
              backgroundColor: '#dbeafe',
              color: '#1d4ed8',
              padding: '4px 8px',
              borderRadius: '6px',
              fontWeight: '600'
            }}>
              {article.source}
            </span>
            <span>📅 {formatDate(article.publishedAt)}</span>
          </div>

          {/* Summary Section */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderLeft: '4px solid #0052ff',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '16px' }}>📝</span>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                margin: 0
              }}>
                Article Summary
              </h3>
            </div>
            
            {isGeneratingSummary ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#6b7280'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #e5e7eb',
                  borderTop: '2px solid #0052ff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Generating summary...
              </div>
            ) : (
              <p style={{
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#374151',
                margin: 0
              }}>
                {summary}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
          }}>
            <button
              onClick={handleReadFullArticle}
              style={{
                backgroundColor: '#0052ff',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#0066ff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#0052ff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>📖</span>
              Read Full Article
            </button>
            
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Loading Animation CSS */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}