import React from "react";

export function ThemeToggleSimple() {
  const [theme, setTheme] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'base';
    }
    return 'base';
  });
  const [isOpen, setIsOpen] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.className = theme;
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  // Handle scroll to show/hide theme toggle
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show when at very top (0-50px) or scrolling up
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY + 10) {
        // Scrolling down with some threshold
        setIsVisible(false);
        setIsOpen(false); // Close dropdown when hiding
      }
      
      setLastScrollY(currentScrollY);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [lastScrollY]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const themes = [
    { id: 'light', name: 'Light', icon: '☀️', description: 'Clean Base experience' },
    { id: 'dark', name: 'Dark', icon: '🌙', description: 'Dark Base theme' },
    { id: 'base', name: 'Base', icon: 'B', description: 'Official Base blue' }
  ];

  const currentTheme = themes.find(t => t.id === theme) || themes[2];

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      zIndex: 1000,
      transform: `translateY(${isVisible ? '0' : '-100px'})`,
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.3s ease-in-out',
      pointerEvents: isVisible ? 'auto' : 'none'
    }}>
      <div style={{ position: 'relative' }}>
        {/* Base-style Theme Toggle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="base-button-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--card-foreground)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            fontFamily: '"Inter", system-ui, sans-serif'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 255, 0.15)';
            e.currentTarget.style.borderColor = 'var(--base-blue)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          {/* Theme Icon */}
          <div style={{
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            background: currentTheme.id === 'base' ? 'var(--base-blue)' : 'transparent',
            color: currentTheme.id === 'base' ? 'white' : 'var(--foreground)',
            fontSize: currentTheme.id === 'base' ? '12px' : '16px',
            fontWeight: currentTheme.id === 'base' ? '900' : '400'
          }}>
            {currentTheme.icon}
          </div>
          <span>{currentTheme.name}</span>
          <div style={{
            fontSize: '10px',
            color: 'var(--muted-foreground)',
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </div>
        </button>

        {/* Base-style Theme Dropdown */}
        {isOpen && (
          <div 
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '8px',
              background: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '8px',
              minWidth: '220px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              zIndex: 1001,
              animation: 'dropdownFadeIn 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {themes.map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setTheme(themeOption.id);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px',
                  background: theme === themeOption.id ? 'var(--base-blue)' : 'transparent',
                  color: theme === themeOption.id ? 'white' : 'var(--popover-foreground)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  marginBottom: '4px',
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  if (theme !== themeOption.id) {
                    e.currentTarget.style.background = 'var(--muted)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (theme !== themeOption.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {/* Theme Icon */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  background: themeOption.id === 'base' ? 
                    (theme === themeOption.id ? 'rgba(255,255,255,0.2)' : 'var(--base-blue)') : 
                    'transparent',
                  color: themeOption.id === 'base' ? 'white' : (theme === themeOption.id ? 'white' : 'var(--foreground)'),
                  fontSize: themeOption.id === 'base' ? '14px' : '18px',
                  fontWeight: themeOption.id === 'base' ? '900' : '400'
                }}>
                  {themeOption.icon}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '600',
                    marginBottom: '2px'
                  }}>
                    {themeOption.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: theme === themeOption.id ? 'rgba(255,255,255,0.8)' : 'var(--muted-foreground)',
                    opacity: 0.9
                  }}>
                    {themeOption.description}
                  </div>
                </div>
                
                {theme === themeOption.id && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: 'var(--base-blue)',
                    fontWeight: '900'
                  }}>
                    ✓
                  </div>
                )}
              </button>
            ))}

            {/* Base branding footer */}
            <div style={{
              marginTop: '8px',
              padding: '12px',
              background: 'var(--muted)',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid var(--border)'
            }}>
              <div style={{
                fontSize: '12px',
                color: 'var(--muted-foreground)',
                lineHeight: '1.4',
                fontWeight: '500'
              }}>
                {theme === 'base' ? (
                  <>
                    <div style={{ color: 'var(--base-blue)', fontWeight: '600', marginBottom: '2px' }}>
                      🔵 Official Base Theme
                    </div>
                    Powered by Base's design system
                  </>
                ) : theme === 'dark' ? (
                  <>Perfect for onchain experiences at night</> 
                ) : (
                  <>Clean Base interface for all conditions</>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}