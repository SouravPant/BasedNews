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
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '100%'
      }}>
        {/* Left side - Logo and Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: 0,
          flex: 1
        }}>
          {showLogo && (
            <div className="base-logo" style={{
              background: 'var(--base-blue)',
              color: 'white',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '20px',
              fontFamily: '"Inter", system-ui, sans-serif'
            }}>
              B
            </div>
          )}
          
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 className="base-heading" style={{
              fontSize: '24px',
              fontWeight: '800',
              color: 'var(--foreground)',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: '1.2'
            }}>
              {title}
            </h1>
            {subtitle && (
              <p className="base-subtitle" style={{
                fontSize: '14px',
                color: 'var(--muted-foreground)',
                margin: '2px 0 0 0',
                fontWeight: '500'
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
            gap: '8px',
            marginLeft: '16px'
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
      gap: '8px',
      padding: '6px 12px',
      background: 'var(--base-blue)',
      color: 'white',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '600'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#00ff00',
        animation: 'basePulse 1s ease-in-out infinite'
      }} />
      Base Mainnet
    </div>
  );
}