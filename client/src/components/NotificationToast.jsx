import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function NotificationToast() {
  const { toast } = useAuth();
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      background: isSuccess ? 'rgba(16, 185, 129, 0.95)' : isError ? 'rgba(239, 68, 68, 0.95)' : 'rgba(6, 182, 212, 0.95)',
      color: '#ffffff',
      padding: '12px 20px',
      borderRadius: '14px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '13px',
      fontWeight: '600',
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {isSuccess && <CheckCircle2 size={18} />}
      {isError && <AlertCircle size={18} />}
      {!isSuccess && !isError && <Info size={18} />}
      <span>{toast.message}</span>
    </div>
  );
}
