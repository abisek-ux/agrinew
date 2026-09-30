import React, { useState, useEffect } from 'react';
import { Mail, KeyRound, Check, AlertCircle, RefreshCw, X, ShieldCheck, Lock } from 'lucide-react';
import { authAPI } from '../services/api';

/**
 * ProfileEmailOtpModal
 * Secure Email OTP verification modal for profile email changes across Farmer, Customer, and Delivery portals.
 * Enforces:
 * - 6-digit OTP
 * - 60s resend cooldown
 * - 10-minute expiry
 * - Server-side verification
 * - 7-day profile modification lock feedback
 */
export default function ProfileEmailOtpModal({ isOpen, onClose, currentEmail, onEmailUpdated, showToast }) {
  const [step, setStep] = useState('request'); // 'request' | 'verify'
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setStep('request');
      setNewEmail('');
      setOtp('');
      setErrorMsg('');
      setCooldown(0);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    const clean = newEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (clean === (currentEmail || '').trim().toLowerCase()) {
      setErrorMsg('New email must be different from your current email.');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.requestEmailOtp({ newEmail: clean });
      if (res.data.success) {
        setMaskedEmail(res.data.maskedEmail || clean);
        setStep('verify');
        setCooldown(60);
        if (showToast) showToast(`Verification code sent to ${clean}`, 'success');
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.locked) {
        setErrorMsg(err.response.data.message || 'Profile changes are locked.');
      } else if (err.response?.status === 429 && err.response?.data?.cooldownRemainingSeconds) {
        setCooldown(err.response.data.cooldownRemainingSeconds);
        setErrorMsg(err.response.data.message || 'Please wait before requesting another code.');
      } else {
        setErrorMsg(err.response?.data?.message || 'Unable to send verification code. Please check email address.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setErrorMsg('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.verifyEmailOtp({ otp: cleanOtp });
      if (res.data.success) {
        if (showToast) showToast(res.data.message || 'Email updated successfully!', 'success');
        if (onEmailUpdated) onEmailUpdated(res.data.user);
        onClose();
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.locked) {
        setErrorMsg(err.response.data.message || 'Profile changes are locked.');
      } else {
        setErrorMsg(err.response?.data?.message || 'Invalid or expired verification code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100000,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }} onClick={onClose}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: 'linear-gradient(145deg, #0c261e, #061914)',
        border: '1.5px solid rgba(74, 222, 128, 0.4)',
        borderRadius: '22px',
        padding: '24px',
        color: '#effbe7',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(52, 211, 153, 0.15)',
            border: '1px solid rgba(52, 211, 153, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Mail size={22} color="#34d399" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#effbe7' }}>
              {step === 'request' ? 'Change Email Address' : 'Verify Email OTP'}
            </h3>
            <span style={{ fontSize: '11.5px', color: '#9db5aa' }}>
              {step === 'request' ? 'Requires 2-step verification code' : `Dispatched to ${maskedEmail}`}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '10px',
            padding: '10px 12px',
            color: '#fca5a5',
            fontSize: '12.5px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestOtp}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: '#a3c2b0', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                Current Email Address
              </label>
              <input
                type="email"
                value={currentEmail || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#9ca3af',
                  fontSize: '13.5px',
                  boxSizing: 'border-box',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '12px', color: '#a3c2b0', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                New Email Address
              </label>
              <input
                type="email"
                placeholder="Enter new email address"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.45)',
                  border: '1.5px solid rgba(52, 211, 153, 0.4)',
                  color: '#effbe7',
                  fontSize: '13.5px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.25)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '11.5px',
              color: '#fde68a',
              marginBottom: '18px',
              display: 'flex',
              gap: '8px'
            }}>
              <Lock size={15} color="#fbbf24" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>
                <strong>7-Day Lock Notice:</strong> After updating your email, profile modifications will be locked for 7 days as an account security safeguard.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              style={{
                width: '100%',
                minHeight: '46px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontWeight: '800',
                fontSize: '14px',
                cursor: (loading || cooldown > 0) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : cooldown > 0 ? (
                <span>Wait {cooldown}s before resend</span>
              ) : (
                <span>Send 6-Digit OTP</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#a3c2b0', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                maxLength="6"
                placeholder="• • • • • •"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                autoFocus
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '2px solid #34d399',
                  color: '#34d399',
                  fontSize: '22px',
                  fontWeight: '900',
                  letterSpacing: '10px',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', fontSize: '12px' }}>
              <span style={{ color: '#9db5aa' }}>Didn't receive code?</span>
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={cooldown > 0 || loading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: cooldown > 0 ? '#6b7280' : '#34d399',
                  fontWeight: '700',
                  cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStep('request')}
                style={{
                  flex: 1,
                  minHeight: '46px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  color: '#d1d5db',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                style={{
                  flex: 2,
                  minHeight: '46px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Verify & Save</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
