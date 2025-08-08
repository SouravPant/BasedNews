import React from "react";

export function ThemeToggleSimple() {
  const [theme, setTheme] = React.useState('light');
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('basedhub-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.remove('light', 'dark', 'base');
    document.documentElement.classList.add(savedTheme);
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark', 'base');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('basedhub-theme', newTheme);
    setIsOpen(false);
  };

  const themes = [
    { id: 'light', name: 'Light', icon: '☀️', description: 'Clean and bright' },
    { id: 'dark', name: 'Dark', icon: '🌙', description: 'Easy on the eyes' },
    { id: 'base', name: 'Base', icon: '🔵', description: 'Base.org official theme' }
  ];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          padding: '12px',
          backgroundColor: theme === 'light' ? '#ffffff' : theme === 'dark' ? '#1f2937' : '#0052ff',
          border: `2px solid ${theme === 'light' ? '#e5e7eb' : theme === 'dark' ? '#374151' : '#0066ff'}`,
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '18px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: theme === 'light' ? '#1f2937' : '#ffffff'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
      >
        <span>{themes.find(t => t.id === theme)?.icon}</span>
        <span style={{ fontSize: '14px', fontWeight: '600' }}>
          {themes.find(t => t.id === theme)?.name}
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            left: '20px',
            zIndex: 1001,
            backgroundColor: theme === 'light' ? '#ffffff' : theme === 'dark' ? '#1f2937' : '#001a66',
            border: `1px solid ${theme === 'light' ? '#e5e7eb' : theme === 'dark' ? '#374151' : '#0066ff'}`,
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            minWidth: '200px'
          }}
        >
          {themes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => handleThemeChange(themeOption.id)}
              style={{
                width: '100%',
                padding: '16px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: theme === 'light' ? '#1f2937' : '#ffffff',
                transition: 'all 0.2s ease',
                borderBottom: themeOption.id !== 'base' ? `1px solid ${theme === 'light' ? '#f3f4f6' : '#374151'}` : 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'light' ? '#f9fafb' : theme === 'dark' ? '#374151' : '#0066ff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ fontSize: '20px' }}>{themeOption.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>
                  {themeOption.name}
                  {theme === themeOption.id && (
                    <span style={{ marginLeft: '8px', color: '#22c55e' }}>✓</span>
                  )}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: theme === 'light' ? '#6b7280' : '#9ca3af',
                  marginTop: '2px'
                }}>
                  {themeOption.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            backgroundColor: 'transparent'
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}