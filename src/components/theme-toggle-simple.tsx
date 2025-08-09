import React from "react";

export function ThemeToggleSimple() {
  const [theme, setTheme] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'base';
    }
    return 'base';
  });
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.className = theme;
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const themes = [
    { id: 'light', name: 'Light', icon: '☀️', description: 'Clean & minimal' },
    { id: 'dark', name: 'Dark', icon: '🌙', description: 'Easy on eyes' },
    { id: 'base', name: 'Base', icon: '🔵', description: 'Base ecosystem' }
  ];

  const currentTheme = themes.find(t => t.id === theme) || themes[2];

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      zIndex: 1000
    }}>
      <div style={{ position: 'relative' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--card-foreground)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
          }}
        >
          <span style={{ fontSize: '16px' }}>{currentTheme.icon}</span>
          <span>{currentTheme.name}</span>
          <span style={{
            fontSize: '10px',
            color: 'var(--muted-foreground)',
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </span>
        </button>

        {/* Theme Dropdown */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '8px',
            backgroundColor: 'var(--popover)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '8px',
            minWidth: '200px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            backdropFilter: 'blur(16px)',
            zIndex: 1001
          }}>
            {themes.map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={() => {
                  setTheme(themeOption.id);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: theme === themeOption.id ? 'var(--accent)' : 'transparent',
                  color: theme === themeOption.id ? 'var(--accent-foreground)' : 'var(--popover-foreground)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  marginBottom: '4px'
                }}
                onMouseEnter={(e) => {
                  if (theme !== themeOption.id) {
                    e.currentTarget.style.backgroundColor = 'var(--muted)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (theme !== themeOption.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{themeOption.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '600',
                    marginBottom: '2px'
                  }}>
                    {themeOption.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--muted-foreground)',
                    opacity: 0.8
                  }}>
                    {themeOption.description}
                  </div>
                </div>
                {theme === themeOption.id && (
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--primary)',
                    fontWeight: '600'
                  }}>
                    ✓
                  </span>
                )}
              </button>
            ))}

            {/* Theme Info */}
            <div style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: 'var(--muted)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '12px',
                color: 'var(--muted-foreground)',
                lineHeight: '1.4'
              }}>
                {theme === 'base' ? (
                  <>🔵 Based on Base.org design system</>
                ) : theme === 'dark' ? (
                  <>🌙 Perfect for low-light reading</>
                ) : (
                  <>☀️ Clean and accessible design</>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}