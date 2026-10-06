import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import MapPicker from './MapPicker';
import { authAPI } from '../services/api';
import LanguageSelector from './LanguageSelector';
import {
  Lock, Mail, Phone, User, MapPin, Eye, EyeOff, ArrowRight,
  ShieldCheck, KeyRound, Sparkles, Truck, Sprout, Search, Loader2, CheckCircle, AlertTriangle
} from 'lucide-react';
import AgriLinkLogo from './AgriLinkLogo';

/* ─── 3D CSS Nature Scene Component ─── */
function NatureScene3D({ mode }) {
  return (
    <div className="nature-3d-world" aria-hidden="true">
      <div className="sky-layer sky-back" />
      <div className="sky-layer sky-mid" />

      {/* Animated Sun */}
      <div className="sun-orb">
        <div className="sun-core" />
        <div className="sun-halo" />
        {[1, 2, 3, 4, 5, 6].map(n => <div key={n} className={`sun-ray sun-ray-${n}`} />)}
      </div>

      {/* Clouds */}
      <div className="cloud cloud-1"><span /><span /><span /></div>
      <div className="cloud cloud-2"><span /><span /><span /></div>
      <div className="cloud cloud-3"><span /><span /></div>

      {/* Mountains */}
      <div className="mountain-range mountain-far" />
      <div className="mountain-range mountain-mid" />

      {/* Background Trees */}
      <div className="tree-row tree-row-far">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`tree-3d tree-pine sz-${['sm', 'md', 'lg'][i % 3]} ${i > 4 ? `delay-${i % 3}` : ''}`}>
            <div className="tree-trunk" />
            <div className="tree-canopy canopy-l3" />
            <div className="tree-canopy canopy-l2" />
            <div className="tree-canopy canopy-l1" />
          </div>
        ))}
      </div>

      {/* Mid-ground Trees */}
      <div className="tree-row tree-row-mid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`tree-3d tree-oak sz-${['lg', 'xl', 'md'][i % 3]} ${i > 2 ? `delay-${i % 3}` : ''}`}>
            <div className="tree-trunk" />
            <div className="tree-canopy canopy-round" />
          </div>
        ))}
      </div>

      {/* Ground Planes */}
      <div className="ground-plane ground-back" />
      <div className="ground-plane ground-front" />

      {/* Field Furrows */}
      <div className="field-rows">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="field-furrow" style={{ '--fi': i }} />
        ))}
      </div>

      {/* Grass Patches */}
      <div className="grass-patch grass-left">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="grass-blade" style={{ '--gi': i }} />
        ))}
      </div>
      <div className="grass-patch grass-right">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="grass-blade" style={{ '--gi': i }} />
        ))}
      </div>

      {/* Farmer Character + Seed Throwing Scene */}
      <div className={`farmer-scene farmer-${mode}`}>
        <div className="farmer-character">
          <div className="farmer-shadow" />
          <div className="farmer-hat">
            <div className="hat-brim" />
            <div className="hat-crown" />
            <div className="hat-band" />
          </div>
          <div className="farmer-head">
            <div className="farmer-eye eye-left" />
            <div className="farmer-eye eye-right" />
            <div className="farmer-smile" />
          </div>
          <div className="farmer-neck" />
          <div className="farmer-body">
            <div className="shirt-pocket" />
            <div className="shirt-button sb-1" />
            <div className="shirt-button sb-2" />
          </div>
          <div className="overall-strap strap-left" />
          <div className="overall-strap strap-right" />
          <div className={`farmer-arm arm-right arm-${mode}`}>
            <div className="arm-forearm" />
            <div className="arm-hand" />
          </div>
          <div className="farmer-arm arm-left">
            <div className="arm-forearm" />
            <div className="arm-hand" />
          </div>
          <div className="farmer-legs">
            <div className="farmer-leg leg-left"><div className="leg-shoe" /></div>
            <div className="farmer-leg leg-right"><div className="leg-shoe" /></div>
          </div>
        </div>

        {/* Seed Sack */}
        <div className={`seed-sack sack-${mode}`}>
          <div className="sack-body">
            <div className="sack-tie" />
            <div className="sack-label">SEEDS</div>
            <div className="sack-line sl-1" />
            <div className="sack-line sl-2" />
          </div>
        </div>

        {/* Continuous sowing loop keeps the field alive while the form is open. */}
        <div className="seeds-in-flight">
          {[...Array(18)].map((_, i) => (
            <div key={i} className={`flying-seed seed-fly-${i % 9}`} style={{ '--si': i }} />
          ))}
        </div>

        <div className="seed-impact" />

        {/* Sprouts from Ground */}
        <div className="sprout-row">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`sprout sprout-${i} ${mode === 'register' ? 'sprout-grow' : ''}`} style={{ '--spi': i }}>
              <div className="sprout-stem" />
              <div className="sprout-leaf sprout-leaf-l" />
              <div className="sprout-leaf sprout-leaf-r" />
            </div>
          ))}
        </div>
      </div>

      {/* Floating Nature Particles */}
      <div className="particle-field">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="nature-particle"
            style={{
              '--pi': i,
              '--px': `${(i * 37 + 11) % 100}%`,
              '--pd': `${2 + (i * 0.7) % 8}s`
            }}
          />
        ))}
      </div>

      {/* Birds */}
      <div className="bird bird-1"><span /><span /></div>
      <div className="bird bird-2"><span /><span /></div>
      <div className="bird bird-3"><span /><span /></div>

      {/* Fireflies */}
      <div className="firefly-field">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="firefly"
            style={{
              '--fi': i,
              '--fx': `${(i * 13 + 7) % 90 + 5}%`,
              '--fy': `${(i * 19 + 11) % 40 + 45}%`
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Auth Component ─── */
export default function LandscapeAuth({ selectedRole, onBack, onNavigateToReset }) {
  const { login, register, showToast } = useAuth();
  const cardRef = useRef(null);

  // Mode State
  const [mode, setMode] = useState('login');
  const [activeSlide, setActiveSlide] = useState(0);

  // Login/Forgot Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(selectedRole || 'customer');
  const [roleMismatchError, setRoleMismatchError] = useState(null);

  useEffect(() => {
    if (selectedRole) {
      setRole(selectedRole);
    }
    setRoleMismatchError(null);
  }, [selectedRole]);

  const [nativePlace, setNativePlace] = useState('');
  const [location, setLocation] = useState({
    lat: 10.8605,
    lng: 78.1104,
    address: 'India',
    placeName: 'India'
  });
  const [searchingPlace, setSearchingPlace] = useState(false);

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState(1);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [deliveryChannel, setDeliveryChannel] = useState('email');
  const [resendAvailableIn, setResendAvailableIn] = useState(0);
  const [loading, setLoading] = useState(false);

  // Registration OTP Verification States (Phone & Email)
  const [verificationChannel, setVerificationChannel] = useState('phone'); // 'phone' | 'email'
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneVerificationToken, setPhoneVerificationToken] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  useEffect(() => {
    if (otpCooldown <= 0) return undefined;
    const timer = setInterval(() => setOtpCooldown(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Feature Slides (Synchronized with Title Page)
  const slides = [
    {
      title: '🌾 Farmer AI Studio: 100% Direct Farm-to-Table',
      subtitle: 'Autonomous Sowing & Direct Harvest. Manage harvest inventory, set your own fair prices without middleman cuts, and receive direct customer orders.',
      badge: 'FARMER STUDIO • 0% BROKER FEE',
      icon: <Sprout size={36} color="#F1F8E9" />,
      bgGradient: 'linear-gradient(135deg, #1B5E20, #2E7D32)'
    },
    {
      title: '🛒 Direct Farm Marketplace: Organic Produce',
      subtitle: 'Pure certified organic produce direct from farmers. Negotiate bulk prices directly, inspect crop batches, and enjoy guaranteed fair trades.',
      badge: 'CUSTOMER PORTAL • 100% ORGANIC',
      icon: <ShieldCheck size={36} color="#F1F8E9" />,
      bgGradient: 'linear-gradient(135deg, #0d9488, #115e59)'
    },
    {
      title: '🚚 Autonomous Fleet Logistics: GPS Dispatch',
      subtitle: 'Cold-chain refrigerated transport with real-time GPS telemetry radar, route dispatch optimization, and instant shift earnings.',
      badge: 'DELIVERY FLEET • QUANTUM GPS',
      icon: <Truck size={36} color="#F1F8E9" />,
      bgGradient: 'linear-gradient(135deg, #b45309, #d97706)'
    }
  ];

  // 3D Card Tilt Effect
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const onMove = (e) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const mx = ((e.clientX - left) / width - 0.5) * 14;
      const my = ((e.clientY - top) / height - 0.5) * -9;
      card.style.transform = `perspective(1600px) rotateX(${my}deg) rotateY(${mx}deg) translateZ(16px)`;
    };

    const onLeave = () => {
      card.style.transform = 'perspective(1600px) rotateX(0) rotateY(0) translateZ(0)';
    };

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);

    return () => {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // Auto-rotate Slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Handle Location Selection
  const handleLocationSelect = (selectedLoc) => {
    setLocation(selectedLoc);
    if (selectedLoc.placeName) {
      setNativePlace(selectedLoc.placeName);
    } else if (selectedLoc.address && !selectedLoc.address.startsWith('GPS:')) {
      setNativePlace(selectedLoc.address);
    }
  };

  // Search Hometown on Map
  const handleLocateHometownOnMap = async (e) => {
    e?.preventDefault();
    if (!nativePlace.trim()) {
      showToast('Please enter your hometown to locate on the map', 'info');
      return;
    }

    setSearchingPlace(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(nativePlace.trim())}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();

      if (data?.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setLocation({
          lat,
          lng,
          address: data[0].display_name,
          placeName: nativePlace.trim()
        });
        showToast(`Located "${nativePlace.trim()}" on map!`, 'success');
      } else {
        showToast(`Could not find "${nativePlace}" on map`, 'error');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      showToast('Could not search location on map', 'error');
    } finally {
      setSearchingPlace(false);
    }
  };

  // Login Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      showToast('Please enter Email/Phone and Password', 'error');
      return;
    }

    setRoleMismatchError(null);
    setLoading(true);
    try {
      const activeRole = selectedRole || role;
      const res = await login(identifier.trim(), password, activeRole);
      if (!res.success && res.registeredRole) {
        setRoleMismatchError({
          message: res.error,
          detectedRole: res.registeredRole
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login Handler
  const handleQuickDemo = async (demoRole, demoId, demoPass) => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setRole(demoRole);
    setRoleMismatchError(null);
    setLoading(true);
    try {
      const res = await login(demoId, demoPass, demoRole);
      if (!res.success && res.registeredRole) {
        setRoleMismatchError({
          message: res.error,
          detectedRole: res.registeredRole
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Instant Switch to Registered Role and Login
  const handleSwitchRoleAndLogin = async (targetRole) => {
    setRole(targetRole);
    setRoleMismatchError(null);
    setLoading(true);
    try {
      await login(identifier.trim(), password, targetRole);
    } finally {
      setLoading(false);
    }
  };


  // Send Phone OTP for Registration
  const handleSendPhoneOtp = async (e) => {
    e?.preventDefault();
    const cleanPh = phone.replace(/[\s\-()]/g, '');
    if (!cleanPh || cleanPh.length < 10) {
      showToast('Please enter a valid 10-digit mobile number first', 'error');
      return;
    }
    setSendingOtp(true);
    try {
      const res = await authAPI.requestPhoneOtp({
        phone: cleanPh,
        purpose: 'registration'
      });
      if (res.data.success) {
        setOtpSent(true);
        setOtpCooldown(res.data.resendAvailableInSeconds || 60);
        setPhoneOtp('');
        const demoNote = res.data.demoOtp ? ` [Demo OTP: ${res.data.demoOtp}]` : '';
        showToast((res.data.message || 'OTP sent to mobile phone!') + demoNote, 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not send SMS verification code';
      const cooldown = err.response?.data?.resendAvailableInSeconds;
      if (cooldown) setOtpCooldown(cooldown);
      showToast(msg, 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify Phone OTP for Registration
  const handleVerifyPhoneOtp = async (e) => {
    e?.preventDefault();
    if (!phoneOtp.trim() || phoneOtp.trim().length !== 6) {
      showToast('Please enter the 6-digit OTP code received on your phone', 'error');
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await authAPI.verifyPhoneOtp({
        phone: phone.trim(),
        otp: phoneOtp.trim(),
        purpose: 'registration'
      });
      if (res.data.verified) {
        setOtpVerified(true);
        setPhoneVerificationToken(res.data.verificationToken || '');
        showToast('Mobile number verified successfully! ✅ You can now complete registration.', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP';
      showToast(msg, 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Send Email OTP for Registration
  const handleSendRegisterOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid email address first', 'error');
      return;
    }
    setSendingOtp(true);
    try {
      const res = await authAPI.sendRegisterOtp({
        email: email.trim().toLowerCase(),
        firstName: firstName.trim() || 'Member'
      });
      if (res.data.success) {
        setOtpSent(true);
        setOtpCooldown(60);
        setEmailOtp('');
        showToast(res.data.message || `Verification OTP sent to ${email.trim()}! Please check your email inbox.`, 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not send verification OTP';
      showToast(msg, 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify Email OTP for Registration
  const handleVerifyRegisterOtp = async (e) => {
    e?.preventDefault();
    if (!emailOtp.trim() || emailOtp.trim().length !== 6) {
      showToast('Please enter the 6-digit OTP code received in your email', 'error');
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await authAPI.verifyRegisterOtp({
        email: email.trim().toLowerCase(),
        otp: emailOtp.trim()
      });
      if (res.data.verified) {
        setOtpVerified(true);
        showToast('Email verified successfully! ✅ You can now complete registration.', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP';
      showToast(msg, 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Register Handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password || !nativePlace.trim()) {
      showToast('Please fill out all registration fields', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (!otpVerified) {
      if (!otpSent) {
        showToast(`Please click "Send OTP" to verify your ${verificationChannel === 'phone' ? 'phone number' : 'email address'} before registering`, 'error');
        return;
      }
      showToast(`Please complete the 6-digit ${verificationChannel === 'phone' ? 'Phone' : 'Email'} OTP verification step`, 'error');
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role,
        nativePlace: nativePlace.trim(),
        location,
        phoneVerificationToken: verificationChannel === 'phone' ? phoneVerificationToken : undefined,
        emailOtp: verificationChannel === 'email' ? emailOtp.trim() : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  // Request OTP (Forgot Password)
  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    if (!identifier.trim()) {
      showToast('Enter your registered Email or Phone number', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ identifier: identifier.trim() });
      if (res.data.success) {
        const isSms = res.data.deliveryChannel === 'sms';
        setDeliveryChannel(isSms ? 'sms' : 'email');
        if (isSms) {
          setMaskedPhone(res.data.maskedPhone || '');
        } else {
          setMaskedEmail(res.data.maskedEmail || '');
        }
        setResendAvailableIn(res.data.resendAvailableInSeconds || 0);
        setResetToken('');
        const demoNote = res.data.demoOtp ? ` [Demo OTP: ${res.data.demoOtp}]` : '';
        showToast((res.data.message || 'Verification code sent!') + demoNote, 'success');
        setForgotStep(2);
      }
    } catch (err) {
      const retryAfter = err.response?.data?.resendAvailableInSeconds;
      if (retryAfter) setResendAvailableIn(retryAfter);
      showToast(err.response?.data?.message || 'Unable to send a reset code', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();

    if (!resetToken.trim() || !newPassword) {
      showToast('Enter OTP code and new password', 'error');
      return;
    }

    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.resetPassword({
        identifier: identifier.trim(),
        resetToken: resetToken.trim(),
        newPassword
      });

      if (res.data.success) {
        showToast('Password changed successfully. Please log in with your new password.', 'success');
        setMode('login');
        setForgotStep(1);
        setIdentifier('');
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
        setMaskedPhone('');
        setMaskedEmail('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Password reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resendAvailableIn <= 0) return undefined;
    const timer = setInterval(() => setResendAvailableIn(seconds => Math.max(0, seconds - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendAvailableIn]);

  return (
    <div className="la-stage">
      {/* Full-screen 3D Nature Background */}
      <NatureScene3D mode={mode} />
      <div className="la-vignette" />

      {/* Centered Auth Card Container */}
      <div className="la-card-wrap">
        <div className="la-card" ref={cardRef}>

          {/* ── LEFT PANEL: Feature Showcase ── */}
          <div className="la-left" style={{ background: slides[activeSlide].bgGradient }}>
            <div className="la-left-ring" />
            <div className="la-left-glow" />

            <div className="la-left-content">
              {/* Badge */}
              <div className="la-badge">
                <Sparkles size={12} color="#F9A825" />
                {slides[activeSlide].badge}
              </div>

              {/* Icon */}
              <div className="la-slide-icon">{slides[activeSlide].icon}</div>

              {/* Title & Subtitle */}
              <h1 className="la-slide-title">{slides[activeSlide].title}</h1>
              <p className="la-slide-sub">{slides[activeSlide].subtitle}</p>

              {/* Slide Indicator Dots */}
              <div className="la-dots">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`la-dot ${activeSlide === idx ? 'la-dot-active' : ''}`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL: Auth Forms ── */}
          <div className="la-right">
            <div className="la-right-seeds" aria-hidden="true">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="la-seed-motif" style={{ '--rsi': i }} />
              ))}
            </div>

            <div className="la-form-wrap">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <LanguageSelector compact={true} variant="pill" />
              </div>
              <div className="la-mobile-brand">
                <AgriLinkLogo size="sm" showText={true} showBadge={true} interactive={false} />
              </div>
              <div className="la-form-header">
                <div className="la-form-icon">
                  {mode === 'login' && <Sprout size={22} />}
                  {mode === 'register' && <User size={22} />}
                  {mode === 'forgot' && <KeyRound size={22} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                    {onBack && (
                      <button
                        type="button"
                        onClick={onBack}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#8be28b',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        ← Switch Role
                      </button>
                    )}
                    {selectedRole && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        color: selectedRole === 'farmer' ? '#4ade80' : selectedRole === 'delivery' ? '#fbbf24' : '#2dd4bf',
                        background: 'rgba(6, 24, 21, 0.75)',
                        border: `1px solid ${selectedRole === 'farmer' ? 'rgba(74, 222, 128, 0.4)' : selectedRole === 'delivery' ? 'rgba(251, 191, 36, 0.4)' : 'rgba(45, 212, 191, 0.4)'}`,
                        padding: '3px 9px',
                        borderRadius: '12px',
                        letterSpacing: '0.6px',
                        textTransform: 'uppercase'
                      }}>
                        🔒 {selectedRole} Portal Locked
                      </span>
                    )}
                  </div>
                  <h2 className="la-form-title">
                    {mode === 'login' && (selectedRole ? `${selectedRole.toUpperCase()} Portal Sign In` : 'Sign in to AgriLink')}
                    {mode === 'register' && (selectedRole ? `Register as ${selectedRole.toUpperCase()}` : 'Create Your Account')}
                    {mode === 'forgot' && 'Reset Password'}
                  </h2>
                  <p className="la-form-sub">
                    {mode === 'login' && (selectedRole ? `Strict role protection: Enter credentials registered as ${selectedRole}` : 'Enter your Email or Phone Number with password')}
                    {mode === 'register' && (selectedRole ? `Join AgriLink as a verified ${selectedRole}` : 'Join as a Customer, Farmer, or Delivery Driver')}
                    {mode === 'forgot' && 'We will send a 6-digit verification code to your registered email address'}
                  </p>
                </div>
              </div>

              {/* LOGIN FORM */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="la-form">
                  {/* ─── 1-CLICK INSTANT DEMO PORTALS (FROM TITLE PAGE) ─── */}
                  <div
                    style={{
                      background: 'linear-gradient(145deg, rgba(6, 28, 22, 0.85) 0%, rgba(4, 18, 15, 0.95) 100%)',
                      border: '1.5px solid rgba(52, 211, 153, 0.4)',
                      borderRadius: '16px',
                      padding: '14px',
                      marginBottom: '18px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={14} color="#fbbf24" />
                        <span style={{ fontSize: '11.5px', fontWeight: '900', color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                          ⚡ 1-Click Demo Portals
                        </span>
                      </div>
                      <span style={{ fontSize: '10.5px', color: '#9db5aa', fontWeight: '600' }}>
                        Instant Test Access • No Password Needed
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '8px' }}>
                      {/* Farmer Demo Portal */}
                      <button
                        type="button"
                        onClick={() => handleQuickDemo('farmer', 'mgowres@gmail.com', 'Password123!')}
                        style={{
                          background: selectedRole === 'farmer' ? 'linear-gradient(135deg, rgba(22, 163, 74, 0.4), rgba(21, 128, 61, 0.6))' : 'rgba(255, 255, 255, 0.04)',
                          border: `1.5px solid ${selectedRole === 'farmer' ? '#4ade80' : 'rgba(74, 222, 128, 0.3)'}`,
                          borderRadius: '12px',
                          padding: '10px 8px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#86efac' }}>🌾 Farmer AI Studio</span>
                          <span style={{ fontSize: '9px', background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', padding: '1px 5px', borderRadius: '8px', fontWeight: '800' }}>0% FEE</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#c0d9cb', lineHeight: '1.3' }}>
                          Autonomous Sowing & Direct Harvest
                        </div>
                        <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#4ade80', marginTop: '4px' }}>
                          Launch Demo ➔
                        </div>
                      </button>

                      {/* Customer Demo Portal */}
                      <button
                        type="button"
                        onClick={() => handleQuickDemo('customer', 'alex@nexus.io', 'Password123!')}
                        style={{
                          background: (selectedRole === 'customer' || !selectedRole) ? 'linear-gradient(135deg, rgba(13, 148, 136, 0.4), rgba(15, 118, 110, 0.6))' : 'rgba(255, 255, 255, 0.04)',
                          border: `1.5px solid ${(selectedRole === 'customer' || !selectedRole) ? '#2dd4bf' : 'rgba(45, 212, 191, 0.3)'}`,
                          borderRadius: '12px',
                          padding: '10px 8px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#5eead4' }}>🛒 Farm Marketplace</span>
                          <span style={{ fontSize: '9px', background: 'rgba(45, 212, 191, 0.2)', color: '#2dd4bf', padding: '1px 5px', borderRadius: '8px', fontWeight: '800' }}>ORGANIC</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#c0d9cb', lineHeight: '1.3' }}>
                          Direct Organic Produce Catalog
                        </div>
                        <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#2dd4bf', marginTop: '4px' }}>
                          Launch Demo ➔
                        </div>
                      </button>

                      {/* Delivery Driver Demo Portal */}
                      <button
                        type="button"
                        onClick={() => handleQuickDemo('delivery', 'driver@nexus.io', 'Password123!')}
                        style={{
                          background: selectedRole === 'delivery' ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.4), rgba(180, 83, 9, 0.6))' : 'rgba(255, 255, 255, 0.04)',
                          border: `1.5px solid ${selectedRole === 'delivery' ? '#fbbf24' : 'rgba(251, 191, 36, 0.3)'}`,
                          borderRadius: '12px',
                          padding: '10px 8px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#fde047' }}>🚚 Fleet Logistics</span>
                          <span style={{ fontSize: '9px', background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', padding: '1px 5px', borderRadius: '8px', fontWeight: '800' }}>GPS RADAR</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#c0d9cb', lineHeight: '1.3' }}>
                          Cold-Chain Real-Time Delivery
                        </div>
                        <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#fbbf24', marginTop: '4px' }}>
                          Launch Demo ➔
                        </div>
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0 4px', gap: '8px' }}>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                      <span style={{ fontSize: '10px', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' }}>
                        Or Enter Your Credentials
                      </span>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                    </div>
                  </div>

                  {roleMismatchError && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.16)',
                      border: '1.5px solid rgba(239, 68, 68, 0.55)',
                      borderRadius: '14px',
                      padding: '14px',
                      marginBottom: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: '0 4px 18px rgba(239, 68, 68, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '12.5px', color: '#fecaca', lineHeight: '1.45', fontWeight: '600' }}>
                          {roleMismatchError.message}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => handleSwitchRoleAndLogin(roleMismatchError.detectedRole)}
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            color: '#ffffff',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            fontSize: '11.5px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                          }}
                        >
                          👉 Switch to {roleMismatchError.detectedRole?.toUpperCase()} Portal & Sign In
                        </button>
                        {onBack && (
                          <button
                            type="button"
                            onClick={onBack}
                            style={{
                              background: 'rgba(255,255,255,0.1)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              color: '#cbd5e1',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '11.5px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="la-field">
                    <label className="la-label">Email Address or Phone Number</label>
                    <div className="la-input-wrap">
                      <span className="la-input-icon">
                        {identifier.includes('@') ? <Mail size={16} /> : <Phone size={16} />}
                      </span>
                      <input
                        type="text"
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        placeholder="Enter your email or phone number"
                        className="la-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="la-field">
                    <div className="la-label-row">
                      <label className="la-label">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          if (onNavigateToReset) {
                            onNavigateToReset();
                          } else {
                            setMode('forgot');
                            setForgotStep(1);
                          }
                        }}
                        className="la-link"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="la-input-wrap">
                      <span className="la-input-icon"><Lock size={16} /></span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="la-input"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="la-eye"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="la-btn-primary">
                    {loading ? (
                      <>
                        <Loader2 size={16} className="la-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Sign In <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <p className="la-switch">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => setMode('register')} className="la-link">
                      Register Now
                    </button>
                  </p>
                </form>
              )}

              {/* REGISTER FORM */}
              {mode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="la-form">
                  <div className="la-field">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label className="la-label" style={{ margin: 0 }}>
                        Role {selectedRole ? `(Locked to ${selectedRole.toUpperCase()})` : ''}
                      </label>
                      {selectedRole && onBack && (
                        <button
                          type="button"
                          onClick={onBack}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#8be28b',
                            fontSize: '11px',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          Change Role
                        </button>
                      )}
                    </div>
                    <div className="la-role-tabs">
                      {(!selectedRole || selectedRole === 'customer') && (
                        <button
                          type="button"
                          className={`la-role-tab ${role === 'customer' ? 'active' : ''}`}
                          onClick={() => setRole('customer')}
                        >
                          🛒 Customer
                        </button>
                      )}
                      {(!selectedRole || selectedRole === 'farmer') && (
                        <button
                          type="button"
                          className={`la-role-tab ${role === 'farmer' ? 'active' : ''}`}
                          onClick={() => setRole('farmer')}
                        >
                          🌾 Farmer
                        </button>
                      )}
                      {(!selectedRole || selectedRole === 'delivery') && (
                        <button
                          type="button"
                          className={`la-role-tab ${role === 'delivery' ? 'active' : ''}`}
                          onClick={() => setRole('delivery')}
                        >
                          🚚 Driver
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="la-grid-2">
                    <div className="la-field">
                      <label className="la-label">First Name</label>
                      <div className="la-input-wrap">
                        <span className="la-input-icon"><User size={14} /></span>
                        <input
                          type="text"
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                          placeholder="First name"
                          className="la-input"
                          required
                        />
                      </div>
                    </div>
                    <div className="la-field">
                      <label className="la-label">Last Name</label>
                      <div className="la-input-wrap">
                        <span className="la-input-icon"><User size={14} /></span>
                        <input
                          type="text"
                          value={lastName}
                          onChange={e => setLastName(e.target.value)}
                          placeholder="Last name"
                          className="la-input"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="la-grid-2">
                    <div className="la-field">
                      <label className="la-label">Email</label>
                      <div className="la-input-wrap">
                        <span className="la-input-icon"><Mail size={14} /></span>
                        <input
                          type="email"
                          value={email}
                          onChange={e => {
                            setEmail(e.target.value);
                            if (otpVerified) setOtpVerified(false);
                          }}
                          placeholder="Your email"
                          className="la-input"
                          required
                        />
                      </div>
                    </div>
                    <div className="la-field">
                      <label className="la-label">Phone</label>
                      <div className="la-input-wrap">
                        <span className="la-input-icon"><Phone size={14} /></span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="Phone number"
                          className="la-input"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dual Phone SMS / Email OTP Verification Section */}
                  <div style={{
                    background: otpVerified
                      ? 'rgba(46, 125, 50, 0.18)'
                      : otpSent
                      ? 'rgba(21, 101, 192, 0.15)'
                      : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${
                      otpVerified
                        ? 'rgba(76, 175, 80, 0.55)'
                        : otpSent
                        ? 'rgba(33, 150, 243, 0.45)'
                        : 'rgba(255, 255, 255, 0.12)'
                    }`,
                    borderRadius: '12px',
                    padding: '12px 14px',
                    marginBottom: '14px'
                  }}>
                    {/* Channel Selector Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={16} color={otpVerified ? '#4caf50' : '#8be28b'} />
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#effbe7' }}>
                          {otpVerified
                            ? `${verificationChannel === 'phone' ? 'Phone' : 'Email'} Verified Successfully ✅`
                            : 'Security Verification (Required)'}
                        </span>
                      </div>

                      {!otpVerified && (
                        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '2px', gap: '3px' }}>
                          <button
                            type="button"
                            onClick={() => { setVerificationChannel('phone'); setOtpSent(false); }}
                            style={{
                              background: verificationChannel === 'phone' ? '#2e7d32' : 'transparent',
                              border: 'none',
                              color: verificationChannel === 'phone' ? '#fff' : '#9db5aa',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '10.5px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            📱 Phone SMS
                          </button>
                          <button
                            type="button"
                            onClick={() => { setVerificationChannel('email'); setOtpSent(false); }}
                            style={{
                              background: verificationChannel === 'email' ? '#2e7d32' : 'transparent',
                              border: 'none',
                              color: verificationChannel === 'email' ? '#fff' : '#9db5aa',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '10.5px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            📧 Email
                          </button>
                        </div>
                      )}
                    </div>

                    {!otpVerified && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: otpSent ? '10px' : '0' }}>
                        <button
                          type="button"
                          onClick={verificationChannel === 'phone' ? handleSendPhoneOtp : handleSendRegisterOtp}
                          disabled={sendingOtp || otpCooldown > 0}
                          style={{
                            background: otpCooldown > 0 ? 'rgba(255, 255, 255, 0.08)' : 'linear-gradient(135deg, #2e7d32, #1b5e20)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#ffffff',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: otpCooldown > 0 || sendingOtp ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          {sendingOtp ? (
                            <>
                              <Loader2 size={12} className="la-spin" />
                              Sending OTP...
                            </>
                          ) : otpCooldown > 0 ? (
                            `Resend in ${otpCooldown}s`
                          ) : otpSent ? (
                            'Resend Code'
                          ) : (
                            `Send OTP to ${verificationChannel === 'phone' ? 'Phone' : 'Email'}`
                          )}
                        </button>
                      </div>
                    )}

                    {otpSent && !otpVerified && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <input
                            type="text"
                            maxLength={6}
                            value={verificationChannel === 'phone' ? phoneOtp : emailOtp}
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '');
                              if (verificationChannel === 'phone') setPhoneOtp(val);
                              else setEmailOtp(val);
                            }}
                            placeholder={`Enter 6-digit ${verificationChannel === 'phone' ? 'SMS' : 'Email'} OTP`}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: 'rgba(0, 0, 0, 0.4)',
                              border: '1px solid rgba(76, 175, 80, 0.5)',
                              color: '#effbe7',
                              fontSize: '14px',
                              letterSpacing: '3px',
                              fontWeight: '800',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={verificationChannel === 'phone' ? handleVerifyPhoneOtp : handleVerifyRegisterOtp}
                          disabled={verifyingOtp || (verificationChannel === 'phone' ? phoneOtp.length !== 6 : emailOtp.length !== 6)}
                          style={{
                            background: ((verificationChannel === 'phone' ? phoneOtp.length : emailOtp.length) === 6)
                              ? 'linear-gradient(135deg, #00897b, #004d40)'
                              : 'rgba(255, 255, 255, 0.08)',
                            border: 'none',
                            color: '#ffffff',
                            padding: '9px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: ((verificationChannel === 'phone' ? phoneOtp.length : emailOtp.length) === 6) ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {verifyingOtp ? <Loader2 size={12} className="la-spin" /> : <CheckCircle size={14} />}
                          Verify Code
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="la-grid-2">
                    <div className="la-field">
                      <div className="la-label-row">
                        <label className="la-label">Native / Hometown</label>
                        <button
                          type="button"
                          onClick={handleLocateHometownOnMap}
                          disabled={searchingPlace}
                          className="la-link"
                          title="Search hometown on map"
                        >
                          {searchingPlace ? <Loader2 size={10} className="la-spin" /> : <Search size={10} />}
                          Find on map
                        </button>
                      </div>
                      <div className="la-input-wrap">
                        <span className="la-input-icon"><MapPin size={14} /></span>
                        <input
                          type="text"
                          value={nativePlace}
                          onChange={e => setNativePlace(e.target.value)}
                          placeholder="Enter hometown"
                          className="la-input"
                          required
                        />
                      </div>
                    </div>
                    <div className="la-field">
                      <label className="la-label">Password</label>
                      <div className="la-input-wrap">
                        <span className="la-input-icon"><Lock size={14} /></span>
                        <input
                          type="password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="la-input"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="la-field">
                    <label className="la-label">
                      📍 Location: <strong>{location.placeName || location.address}</strong>
                    </label>
                    <MapPicker location={location} onSelectLocation={handleLocationSelect} height="150px" />
                  </div>

                  <button type="submit" disabled={loading} className="la-btn-primary">
                    {loading ? (
                      <>
                        <Loader2 size={16} className="la-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Register as {role.toUpperCase()} <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <p className="la-switch">
                    Already registered?{' '}
                    <button type="button" onClick={() => setMode('login')} className="la-link">
                      Sign In
                    </button>
                  </p>
                </form>
              )}

              {/* FORGOT PASSWORD FORM */}
              {mode === 'forgot' && (
                <div className="la-form">
                  {forgotStep === 1 ? (
                    <form onSubmit={handleRequestOtp} className="la-form">
                      <div className="la-field">
                        <label className="la-label">Registered Email Address</label>
                        <div className="la-input-wrap">
                          <span className="la-input-icon"><Mail size={16} /></span>
                          <input
                            type="text"
                            value={identifier}
                            onChange={e => setIdentifier(e.target.value)}
                            placeholder="Enter registered email address"
                            className="la-input"
                            required
                          />
                        </div>
                      </div>
                      <button type="submit" disabled={loading} className="la-btn-primary">
                        {loading ? (
                          <>
                            <Loader2 size={16} className="la-spin" />
                            Sending Email OTP...
                          </>
                        ) : (
                          'Send OTP to Email'
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPasswordSubmit} className="la-form">
                      <div className="la-info-box">
                        <Mail size={16} />
                        <span>OTP sent to <strong>{maskedEmail || identifier}</strong> by Email.</span>
                      </div>

                      <div style={{
                        background: 'rgba(34, 197, 94, 0.12)',
                        border: '1px solid rgba(74, 222, 128, 0.3)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <Mail size={18} color="#4ade80" style={{ flexShrink: 0 }} />
                        <div style={{ fontSize: '12px', color: '#c8e6c9', lineHeight: '1.4' }}>
                          We have sent a 6-digit verification code to <strong>{maskedEmail || identifier}</strong>. Please check your email inbox and enter the code below.
                        </div>
                      </div>

                      <div className="la-field">
                        <div className="la-label-row">
                          <label className="la-label">Enter 6-Digit OTP Code</label>
                          <button
                            type="button"
                            onClick={handleRequestOtp}
                            disabled={loading || resendAvailableIn > 0}
                            className="la-link"
                          >
                            {resendAvailableIn > 0 ? `Resend in ${resendAvailableIn}s` : 'Resend Code'}
                          </button>
                        </div>
                        <div className="la-input-wrap">
                          <span className="la-input-icon"><KeyRound size={16} /></span>
                          <input
                            type="text"
                            value={resetToken}
                            onChange={e => setResetToken(e.target.value)}
                            placeholder="6-digit OTP"
                            className="la-input"
                            maxLength={6}
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            required
                          />
                        </div>
                      </div>

                      <div className="la-field">
                        <label className="la-label">New Password</label>
                        <div className="la-input-wrap">
                          <span className="la-input-icon"><Lock size={16} /></span>
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="New password (min 8 chars)"
                            className="la-input"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                            tabIndex={-1}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#9ca3af',
                              cursor: 'pointer',
                              padding: '0 8px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                          Password must be at least 8 characters long
                        </div>
                      </div>

                      <div className="la-field">
                        <label className="la-label">Confirm Password</label>
                        <div className="la-input-wrap">
                          <span className="la-input-icon"><Lock size={16} /></span>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            className="la-input"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            tabIndex={-1}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#9ca3af',
                              cursor: 'pointer',
                              padding: '0 8px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                          <div style={{ fontSize: '11px', color: '#f87171', marginTop: '4px', fontWeight: '600' }}>
                            Passwords do not match.
                          </div>
                        )}
                      </div>

                      <button type="submit" disabled={loading} className="la-btn-primary">
                        {loading ? (
                          <>
                            <Loader2 size={16} className="la-spin" />
                            Updating...
                          </>
                        ) : (
                          'Verify OTP & Reset Password'
                        )}
                      </button>
                    </form>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setForgotStep(1);
                      setIdentifier('');
                    }}
                    className="la-btn-secondary"
                  >
                    ← Back to Login
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
