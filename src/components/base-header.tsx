import React from "react";

interface BaseHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  actions?: React.ReactNode;
}

export function BaseHeader({ title, subtitle, showLogo = true, actions }: BaseHeaderProps) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--background)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)'
    }}>
      <div style={{
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'flex-start', // Changed to flex-start for better mobile layout
        justifyContent: 'space-between',
        maxWidth: '100%',
        gap: '8px'
      }}>
        {/* Left side - Logo and Title */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start', // Changed to flex-start
          gap: '8px',
          minWidth: 0,
          flex: 1
        }}>
          {showLogo && (
            <div className="base-logo" style={{
              background: 'var(--base-blue)',
              color: 'white',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '14px',
              fontFamily: '"Inter", system-ui, sans-serif',
              flexShrink: 0 // Prevent logo from shrinking
            }}>
              B
            </div>
          )}
          
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 className="base-heading" style={{
              fontSize: '18px', // Slightly larger but still compact
              fontWeight: '700',
              color: 'var(--foreground)',
              margin: 0,
              letterSpacing: '-0.01em',
              lineHeight: '1.1'
            }}>
              {title}
            </h1>
            {subtitle && (
              <p className="base-subtitle" style={{
                fontSize: '11px',
                color: 'var(--muted-foreground)',
                margin: '2px 0 0 0',
                fontWeight: '400',
                lineHeight: '1.2'
              }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        {actions && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
            marginTop: '2px' // Small offset to align better with title
          }}>
            {actions}
          </div>
        )}
      </div>

      {/* Base-style gradient border */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, var(--base-blue) 50%, transparent 100%)',
        opacity: 0.3
      }} />
    </header>
  );
}

export function BaseStatusBadge({ 
  status, 
  children 
}: { 
  status: 'online' | 'warning' | 'error';
  children: React.ReactNode;
}) {
  const getStatusStyles = () => {
    switch (status) {
      case 'online':
        return {
          background: 'var(--success)',
          color: 'white'
        };
      case 'warning':
        return {
          background: 'var(--warning)',
          color: 'white'
        };
      case 'error':
        return {
          background: 'var(--error)',
          color: 'white'
        };
    }
  };

  return (
    <span style={{
      ...getStatusStyles(),
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      {children}
    </span>
  );
}

export function BaseNetworkBadge() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px', // Reduced gap
      padding: '4px 8px', // Reduced padding
      background: 'var(--base-blue)',
      color: 'white',
      borderRadius: '6px', // Smaller radius
      fontSize: '10px', // Smaller font
      fontWeight: '600'
    }}>
      <div style={{
        width: '6px', // Smaller dot
        height: '6px',
        borderRadius: '50%',
        background: '#00ff00',
        animation: 'basePulse 1s ease-in-out infinite'
      }} />
      Base
    </div>
  );
}