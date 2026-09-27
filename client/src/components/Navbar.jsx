import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sprout, LogOut, Database, ArrowLeft, ShieldCheck, Truck, ShoppingBag, Smartphone, Sparkles, Activity } from 'lucide-react';
import AgriLinkLogo from './AgriLinkLogo';

export default function Navbar({ selectedRole, onResetPortal, onLogout }) {
  const { user, logout, dbStatus } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsStandalone(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("📱 Install AgriLink Mobile App:\n\n• Android: Tap browser menu (⋮) -> 'Install App' or 'Add to Home screen'\n• iPhone (iOS): Tap the Share button (⎋) -> 'Add to Home Screen'");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'farmer':
        return <Sprout size={16} color="#4ade80" />;
      case 'delivery':
        return <Truck size={16} color="#fbbf24" />;
      case 'customer':
      default:
        return <ShoppingBag size={16} color="#2dd4bf" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'farmer':
        return '🌾 Farmer Dedicated Portal';
      case 'delivery':
        return '🚚 Delivery Logistics Hub';
      case 'customer':
        return '🛒 Customer Marketplace';
      default:
        return 'AgriLink Ecosystem';
    }
  };

  return (
    <header className="app-nav-header" style={{
      position: 'sticky',
      top: '12px',
      zIndex: 100,
      width: '100%',
      padding: '0 20px',
      pointerEvents: 'none'
    }}>
      <nav className="app-nav-bar" style={{
        maxWidth: '1360px',
        margin: '0 auto',
        pointerEvents: 'auto',
        background: 'rgba(6, 24, 21, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(74, 222, 128, 0.28)',
        borderRadius: '22px',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.55), 0 0 25px rgba(74, 222, 128, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
        transition: 'all 0.3s ease'
      }}>
        {/* Brand Section with Proprietary 3D AgriLink Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: !user && onResetPortal ? 'pointer' : 'default',
            userSelect: 'none',
            flexShrink: 0
          }}
          onClick={!user && onResetPortal ? onResetPortal : undefined}
          title={!user && onResetPortal ? 'Click to switch portal variant' : undefined}
        >
          <AgriLinkLogo size="md" showText={true} showBadge={false} interactive={true} />
        </div>

        {/* Center: Interactive Portal / State Indicator */}
        <div className="nav-center-showcase" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(20, 83, 45, 0.55)',
              border: '1px solid rgba(74, 222, 128, 0.4)',
              borderRadius: '30px',
              padding: '6px 18px',
              fontWeight: '800',
              fontSize: '13px',
              color: '#86efac',
              boxShadow: '0 0 16px rgba(74, 222, 128, 0.2)'
            }}>
              {getRoleIcon(user.role)}
              <span>{getRoleLabel(user.role)}</span>
            </div>
          ) : selectedRole ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(245, 158, 11, 0.16)',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                borderRadius: '30px',
                padding: '6px 16px',
                fontWeight: '800',
                fontSize: '12.5px',
                color: '#fef08a'
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 8px #fbbf24' }} />
                <span>Portal: <strong style={{ letterSpacing: '0.5px' }}>{selectedRole.toUpperCase()}</strong></span>
              </div>

              {onResetPortal && (
                <button
                  type="button"
                  onClick={onResetPortal}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#effbe7',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                >
                  <ArrowLeft size={13} />
                  <span>Switch Role</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{
              fontSize: '12.5px',
              fontWeight: '800',
              color: '#86efac',
              background: 'rgba(20, 83, 45, 0.4)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              padding: '6px 16px',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: '0 0 15px rgba(74, 222, 128, 0.15)'
            }}>
              <Sparkles size={14} color="#fbbf24" />
              <span>3D Unified Agriculture & Logistics</span>
            </div>
          )}
        </div>

        {/* Right Section: System Telemetry & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Cloud Database Pill */}
          <div className="nav-pill-telemetry" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: dbStatus?.connected ? '#86efac' : '#fde047',
            background: 'rgba(4, 20, 18, 0.7)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontWeight: '700',
            border: `1px solid ${dbStatus?.connected ? 'rgba(74, 222, 128, 0.35)' : 'rgba(251, 191, 36, 0.35)'}`
          }}>
            <Database size={13} color={dbStatus?.connected ? '#4ade80' : '#fbbf24'} />
            <span>{dbStatus?.connected ? 'MongoDB Online' : 'Memory Store'}</span>
          </div>

          {/* OTP Security Pill */}
          <div className="nav-pill-telemetry" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#86efac',
            background: 'rgba(20, 83, 45, 0.35)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontWeight: '700',
            border: '1px solid rgba(74, 222, 128, 0.35)'
          }}>
            <ShieldCheck size={14} color="#4ade80" />
            <span>Email OTP Active</span>
          </div>

          {/* PWA Mobile Install */}
          {!isStandalone && (
            <button
              onClick={handleInstallClick}
              className="nav-install-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: '#ffffff',
                background: 'linear-gradient(135deg, #16a34a, #0d9488)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: '800',
                border: '1px solid rgba(134, 239, 172, 0.4)',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(34, 197, 94, 0.35)',
                transition: 'transform 0.15s ease'
              }}
              title="Install AgriLink as a Mobile App"
            >
              <Smartphone size={13} />
              <span>Install App</span>
            </button>
          )}

          {/* User Profile / Logout */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#effbe7' }}>
                  {user.firstName} {user.lastName}
                </div>
                <div style={{ fontSize: '11px', color: '#9db5aa', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  <span style={{ fontSize: '9.5px', padding: '1px 6px', borderRadius: '6px', background: 'rgba(74, 222, 128, 0.2)', color: '#86efac', fontWeight: '800' }}>
                    {user.role?.toUpperCase()}
                  </span>
                  <span className="nav-user-meta-detail">• {user.email || user.phone}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="nav-logout-btn"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.18)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s ease'
                }}
                title="Sign out of AgriLink"
              >
                <LogOut size={14} color="#ef4444" />
                <span>Logout</span>
              </button>
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  );
}