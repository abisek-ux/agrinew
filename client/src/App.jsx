import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PortalSelection from './components/PortalSelection';
import LandscapeAuth from './components/LandscapeAuth';
import CustomerPortal from './components/CustomerPortal';
import FarmerPortal from './components/FarmerPortal';
import DeliveryPortal from './components/DeliveryPortal';
import NotificationToast from './components/NotificationToast';

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
        />
      )}

      <main style={{ flex: 1 }}>
        {!user ? (
          !selectedRole ? (
            /* First page contains only the selection of the variant (Farmer, Delivery, Customer) */
            <PortalSelection onSelectRole={(role) => setSelectedRole(role)} />
          ) : (
            /* Auth page pre-locked to the chosen variant */
            <LandscapeAuth
              selectedRole={selectedRole}
              onBack={() => setSelectedRole(null)}
            />
          )
        ) : (
          /* Strictly Separated Role Pages: Logged-in user is routed only to their dedicated portal */
          <div>
            {userRole === 'customer' && <CustomerPortal />}
            {userRole === 'farmer' && <FarmerPortal onLogout={handleLogout} />}
            {userRole === 'delivery' && <DeliveryPortal />}
            {!['customer', 'farmer', 'delivery'].includes(userRole) && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#f3f4f6' }}>
                <p style={{ marginBottom: '16px', color: '#9ca3af' }}>Unrecognized user session ({String(user.role)}). Please reset to select your portal variant:</p>
                <button onClick={handleLogout} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Reset & Sign In
                </button>
              </div>
            )}
          </div>
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

      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
