import React, { useState, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import PortalSelection from './components/PortalSelection';
import LandscapeAuth from './components/LandscapeAuth';
import NotificationToast from './components/NotificationToast';
const CustomerPortal = lazy(() => import('./components/CustomerPortal'));
const FarmerPortal = lazy(() => import('./components/FarmerPortal'));
const DeliveryPortal = lazy(() => import('./components/DeliveryPortal'));
const AgriLinkMobileApp = lazy(() => import('./components/AgriLinkMobileApp'));

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('AgriLink UI Error caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#071a1d', color: '#f3f4f6' }}>
          <div style={{ maxWidth: '520px', width: '100%', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '16px', padding: '28px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌾</div>
            <h2 style={{ color: '#ef4444', fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0' }}>Display Refresh Required</h2>
            <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              {this.state.error?.message || 'A transient display issue occurred.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
              >
                Reset Session & Home
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
              >
                Reload View
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { user, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null); // 'farmer' | 'delivery' | 'customer' | null
  const [showMobileApp, setShowMobileApp] = useState(() => {
    return window.innerWidth <= 640 || localStorage.getItem('agrilink_mobile_mode') === 'true';
  });

  const handleLogout = () => {
    logout();
    setSelectedRole(null);
  };

  const userRole = user?.role ? String(user.role).toLowerCase() : '';
  const isFarmer = userRole === 'farmer';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {!isFarmer && (
        <Navbar
          selectedRole={selectedRole}
          onResetPortal={() => setSelectedRole(null)}
          onLogout={handleLogout}
          onOpenMobileApp={() => {
            setShowMobileApp(true);
            localStorage.setItem('agrilink_mobile_mode', 'true');
          }}
        />
      )}

      <main style={{ flex: 1 }}>
        {!user ? (
          !selectedRole ? (
            /* First page contains only the selection of the variant (Farmer, Delivery, Customer) */
            <PortalSelection
              onSelectRole={(role) => setSelectedRole(role)}
              onOpenMobileApp={() => {
                setShowMobileApp(true);
                localStorage.setItem('agrilink_mobile_mode', 'true');
              }}
            />
          ) : (
            /* Auth page pre-locked to the chosen variant */
            <LandscapeAuth
              selectedRole={selectedRole}
              onBack={() => setSelectedRole(null)}
            />
          )
        ) : (
          /* Strictly Separated Role Pages: Logged-in user is routed only to their dedicated portal */
          <Suspense fallback={
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: '#10b981' }}>
              <div style={{ width: '42px', height: '42px', border: '3px solid rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#9db5aa', letterSpacing: '0.5px' }}>Loading Portal Experience...</div>
            </div>
          }>
            {userRole === 'customer' && <CustomerPortal onLogout={handleLogout} />}
            {userRole === 'farmer' && <FarmerPortal onLogout={handleLogout} />}
            {userRole === 'delivery' && <DeliveryPortal onLogout={handleLogout} />}
            {!['customer', 'farmer', 'delivery'].includes(userRole) && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#f3f4f6' }}>
                <p style={{ marginBottom: '16px', color: '#9ca3af' }}>Unrecognized user session ({String(user.role)}). Please reset to select your portal variant:</p>
                <button onClick={handleLogout} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Reset & Sign In
                </button>
              </div>
            )}
          </Suspense>
        )}
      </main>

      {!isFarmer && (
        <footer
          style={{
            textAlign: 'center',
            padding: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '12px',
            color: '#9ca3af',
            background: 'rgba(9, 13, 22, 0.9)',
          }}
        >
          AgriLink MERN Platform &copy; 2026 • Farm-to-Table & Real-Time Logistics Ecosystem
        </footer>
      )}

      {/* Persistent Floating 3D Mobile App Toggle */}
      <button
        onClick={() => {
          setShowMobileApp(true);
          localStorage.setItem('agrilink_mobile_mode', 'true');
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 998,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #0d9488 100%)',
          color: '#ffffff',
          border: '1.5px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '30px',
          padding: '10px 18px',
          fontSize: '13px',
          fontWeight: '800',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 8px 30px rgba(16, 185, 129, 0.5), 0 0 15px rgba(52, 211, 153, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        title="Experience AgriLink Flagship 3D Mobile App"
      >
        <span style={{ fontSize: '16px' }}>📱</span>
        <span>3D Mobile App</span>
        <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.25)', padding: '2px 6px', borderRadius: '10px' }}>PRO</span>
      </button>

      {/* Flagship 3D Mobile Application Suite Modal / Screen */}
      {showMobileApp && (
        <Suspense fallback={null}>
          <AgriLinkMobileApp
            onClose={() => {
              setShowMobileApp(false);
              localStorage.setItem('agrilink_mobile_mode', 'false');
            }}
            initialRole={selectedRole || userRole || 'customer'}
            onSelectRole={(role) => {
              setSelectedRole(role);
              setShowMobileApp(false);
            }}
          />
        </Suspense>
      )}

      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
