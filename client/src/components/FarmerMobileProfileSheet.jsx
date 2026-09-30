import React from 'react';
import {
  User,
  MapPin,
  Package,
  Settings,
  LogOut,
  X,
  ShieldCheck,
  ChevronRight,
  Sprout
} from 'lucide-react';

export default function FarmerMobileProfileSheet({
  isOpen,
  onClose,
  farmerName,
  farmerCity,
  onNavigate,
  onLogout
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99995,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'linear-gradient(180deg, #0d2820 0%, #061814 100%)',
          borderTop: '2px solid rgba(74, 222, 128, 0.45)',
          borderTopLeftRadius: '26px',
          borderTopRightRadius: '26px',
          padding: '24px 20px 34px 20px',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
          color: '#effbe7',
          animation: 'slideUpSheet 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{
          width: '42px',
          height: '4px',
          background: 'rgba(255,255,255,0.25)',
          borderRadius: '4px',
          margin: '0 auto 16px auto'
        }} />

        {/* Farmer Header Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981, #047857)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: '900',
              color: '#ffffff',
              boxShadow: '0 0 18px rgba(16, 185, 129, 0.45)'
            }}>
              {farmerName?.[0]?.toUpperCase() || 'F'}
            </div>
            <div>
              <h3 style={{ margin: '0 0 3px 0', fontSize: '18px', fontWeight: '900', color: '#effbe7' }}>
                👤 {farmerName || 'Farmer'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399', fontSize: '12px', fontWeight: '700' }}>
                <MapPin size={12} />
                <span>{farmerCity || 'Mandya, Karnataka'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <button
            onClick={() => {
              onClose();
              onNavigate('profile');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '48px',
              padding: '12px 16px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#effbe7',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <User size={18} color="#34d399" />
              <span>Profile</span>
            </div>
            <ChevronRight size={16} color="#9db5aa" />
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigate('products');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '48px',
              padding: '12px 16px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#effbe7',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Package size={18} color="#fbbf24" />
              <span>My Farm Produce</span>
            </div>
            <ChevronRight size={16} color="#9db5aa" />
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigate('settings');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '48px',
              padding: '12px 16px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#effbe7',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Settings size={18} color="#60a5fa" />
              <span>Account Settings</span>
            </div>
            <ChevronRight size={16} color="#9db5aa" />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.12)', marginBottom: '18px' }} />

        {/* Prominent Accessible Logout Button */}
        <button
          onClick={() => {
            onClose();
            onLogout();
          }}
          style={{
            width: '100%',
            minHeight: '50px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
            border: 'none',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: '900',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 6px 20px rgba(220, 38, 38, 0.45)'
          }}
        >
          <LogOut size={18} />
          <span>🚪 Logout</span>
        </button>
      </div>
    </div>
  );
}
