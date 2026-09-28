import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Clock,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Send,
  Phone,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { notificationAPI } from '../services/api';

export default function OtpNotificationModal({
  isOpen,
  onClose,
  notification = null,
  onVerified = null,
  showToast = () => {}
}) {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 mins
  const [mobileNumber, setMobileNumber] = useState('9943558866');
  const [dispatchedTarget, setDispatchedTarget] = useState('');
  const [backupOtp, setBackupOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const inputRefs = useRef([]);

  // When modal opens, populate user phone from local storage and trigger SMS OTP
  useEffect(() => {
    if (isOpen) {
      try {
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (savedUser?.phone) {
          setMobileNumber(savedUser.phone.replace('+91', '').trim());
        }
      } catch (e) {}

      setOtpDigits(['', '', '', '', '', '']);
      setErrorMsg('');
      setSuccessMsg('');
      setTimerSeconds(300);
      setBackupOtp('');
      handleSendOtp();
    }
  }, [isOpen, notification]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, timerSeconds]);

  const handleSendOtp = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Normalize phone number to include +91
    let formattedPhone = mobileNumber.trim();
    if (/^\d{10}$/.test(formattedPhone)) {
      formattedPhone = `+91 ${formattedPhone}`;
    }

    try {
      const res = await notificationAPI.generateOtp({
        notificationId: notification?.id || 'alert_direct_verify',
        actionType: notification?.otpType || 'GENERAL_VERIFICATION',
        mobileNumber: formattedPhone,
        deliveryChannel: 'sms'
      });

      setOtpSent(true);
      setTimerSeconds(300);
      const targetSent = res.data?.sentTo || formattedPhone;
      setDispatchedTarget(targetSent);
      if (res.data?.otpCode) {
        setBackupOtp(res.data.otpCode);
      }

      showToast(`✓ 6-Digit OTP passcode dispatched to mobile: ${targetSent}`, 'success');
    } catch (err) {
      setOtpSent(true);
      setDispatchedTarget(formattedPhone);
      showToast('OTP passcode generated for your mobile number.', 'info');
    } finally {
      setLoading(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    }
  };

  const handleDigitChange = (index, value) => {
    if (value.length > 1) {
      // Paste handling
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((d, idx) => {
        if (idx < 6) newDigits[idx] = d;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(5, pasted.length);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const cleaned = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleaned;
    setOtpDigits(newDigits);

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleAutoFill = () => {
    if (!backupOtp) return;
    const digits = backupOtp.toString().slice(0, 6).split('');
    setOtpDigits(digits);
    if (inputRefs.current[5]) inputRefs.current[5].focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter all 6 numeric digits sent to your mobile phone.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await notificationAPI.verifyOtp({
        notificationId: notification?.id || 'alert_direct_verify',
        actionType: notification?.otpType || 'GENERAL_VERIFICATION',
        otpCode: fullCode,
        mobileNumber: mobileNumber,
        deliveryChannel: 'sms'
      });

      if (res.data?.verified || res.data?.success) {
        setSuccessMsg(res.data.message || 'Mobile OTP Verified Successfully!');
        showToast('✓ Security Verification Confirmed via SMS OTP!', 'success');
        setTimeout(() => {
          if (onVerified) onVerified(notification?.id);
          onClose();
        }, 1000);
      } else {
        setErrorMsg(res.data?.message || 'Invalid code. Please check your SMS and retry.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Verification failed. Please check the code received.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #092019 0%, #031410 100%)',
        border: '1.5px solid rgba(55, 189, 120, 0.45)',
        borderRadius: '24px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85), 0 0 35px rgba(16, 185, 129, 0.25)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
            }}>
              <KeyRound size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
                Mobile OTP Verification
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Enter the passcode received on your mobile phone
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Notification Context */}
          {notification && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(55, 189, 120, 0.25)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#f3f4f6' }}>
                  {notification.title}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: notification.priority === 'CRITICAL' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                  color: notification.priority === 'CRITICAL' ? '#f87171' : '#fbbf24',
                  border: `1px solid ${notification.priority === 'CRITICAL' ? '#f87171' : '#fbbf24'}`
                }}>
                  {notification.priority || 'ACTION REQUIRED'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                {notification.message}
              </p>
            </div>
          )}

          {/* Mobile Number Input & Send Button */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px' }}>
              Farmer Mobile Number:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Phone size={14} color="#34d399" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.45)',
                    border: '1px solid rgba(55, 189, 120, 0.35)',
                    borderRadius: '10px',
                    padding: '10px 12px 10px 36px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Send size={13} /> {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </div>

          {/* Status Delivery Box */}
          {otpSent && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#f3f4f6', fontWeight: '700' }}>
                  <Smartphone size={16} color="#34d399" />
                  <span>SMS Dispatched to Mobile:</span>
                  <span style={{ color: '#38bdf8' }}>{dispatchedTarget || mobileNumber}</span>
                </div>
              </div>

              {backupOtp && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  marginTop: '6px'
                }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Passcode: <span style={{ color: '#10b981', fontWeight: '800', letterSpacing: '2px', fontFamily: 'monospace', fontSize: '14px' }}>{backupOtp}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    style={{
                      background: 'rgba(16, 185, 129, 0.25)',
                      border: '1px solid #10b981',
                      borderRadius: '6px',
                      color: '#34d399',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Sparkles size={11} /> Auto-Fill Code
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 6-Digit PIN Boxes */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#cbd5e1', marginBottom: '10px', textAlign: 'center' }}>
              Enter the 6-Digit Code Received:
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  style={{
                    width: '48px',
                    height: '56px',
                    borderRadius: '12px',
                    background: 'rgba(0, 0, 0, 0.65)',
                    border: digit ? '2px solid #10b981' : '1.5px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: '22px',
                    fontWeight: '800',
                    textAlign: 'center',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: digit ? '0 0 12px rgba(16, 185, 129, 0.35)' : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              color: '#f87171',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertTriangle size={15} /> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              color: '#34d399',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={15} /> {successMsg}
            </div>
          )}

          {/* Timer & Resend Option */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '12px', color: '#94a3b8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="#f59e0b" /> Code expires in: <strong style={{ color: timerSeconds < 30 ? '#ef4444' : '#ffffff' }}>{formattedTime}</strong>
            </span>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading || timerSeconds > 260}
              style={{
                background: 'transparent',
                border: 'none',
                color: timerSeconds > 260 ? '#64748b' : '#34d399',
                fontSize: '12px',
                fontWeight: '700',
                cursor: timerSeconds > 260 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Resend OTP to Mobile
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading || otpDigits.join('').length !== 6}
              style={{
                flex: 2,
                background: otpDigits.join('').length === 6 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '13.5px',
                fontWeight: '800',
                cursor: otpDigits.join('').length === 6 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: otpDigits.join('').length === 6 ? '0 4px 16px rgba(16, 185, 129, 0.4)' : 'none'
              }}
            >
              <ShieldCheck size={18} />
              {loading ? 'Verifying...' : 'Verify Code & Proceed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
