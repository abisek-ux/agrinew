import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import LiveTrackingMap from './LiveTrackingMap';
import AgriLinkLogo from './AgriLinkLogo';
import {
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
  Home,
  Navigation,
  Play,
  CheckCircle2,
  RotateCw,
  Package,
  Clock,
  ShieldCheck,
  Info,
  Zap,
  Activity,
  Award,
  DollarSign,
  AlertTriangle,
  Radio,
  Compass,
  ChevronRight,
  TrendingUp,
  Fuel,
  RefreshCw,
  Send,
  Snowflake,
  Thermometer,
  KeyRound,
  X,
  Check,
  Sparkles,
  ArrowRight,
  Map
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Skeleton Shimmer Loader for Deliveries
───────────────────────────────────────────────────────────── */
function SkeletonDeliveryCard() {
  return (
    <div style={{
      background: 'rgba(20, 16, 10, 0.75)',
      border: '1px solid rgba(244, 201, 93, 0.2)',
      borderRadius: '20px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton-box" style={{ width: '130px', height: '20px' }} />
        <div className="skeleton-box" style={{ width: '90px', height: '24px', borderRadius: '12px' }} />
      </div>
      <div className="skeleton-box" style={{ width: '80%', height: '24px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="skeleton-box" style={{ height: '54px', borderRadius: '10px' }} />
        <div className="skeleton-box" style={{ height: '54px', borderRadius: '10px' }} />
      </div>
      <div className="skeleton-box" style={{ width: '100%', height: '48px', borderRadius: '12px' }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3D Fleet Telemetry & Holographic Speedometer Canvas (Preserved)
───────────────────────────────────────────────────────────── */
function FleetTelemetryHUD({ speed = 48, battery = 88, satelliteCount = 11 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let angle = 0;
    let animId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Glow backdrop
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 110);
      bgGrad.addColorStop(0, 'rgba(244, 201, 93, 0.18)');
      bgGrad.addColorStop(1, 'rgba(10, 8, 4, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Rotating Radar Ring
      ctx.save();
      ctx.translate(cx, cy);

      // Radar Arc
      ctx.beginPath();
      ctx.arc(0, 0, 75, Math.PI * 0.75, Math.PI * 2.25);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Active Speed Arc
      const speedPct = Math.min(1, speed / 100);
      const speedAngle = Math.PI * 0.75 + speedPct * (Math.PI * 1.5);
      ctx.beginPath();
      ctx.arc(0, 0, 75, Math.PI * 0.75, speedAngle);
      ctx.strokeStyle = '#f4c95d';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#f4c95d';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Scanning Needle
      const needleAngle = Math.PI * 0.75 + (angle * 0.05) % (Math.PI * 1.5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(needleAngle) * 65, Math.sin(needleAngle) * 65);
      ctx.strokeStyle = 'rgba(244, 201, 93, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Center Hub
      ctx.fillStyle = '#092b27';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f4c95d';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      angle++;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [speed]);

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(20, 16, 10, 0.9), rgba(12, 10, 6, 0.95))',
      border: '1.5px solid rgba(244, 201, 93, 0.35)',
      borderRadius: '20px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
      flexWrap: 'wrap',
      gap: '14px'
    }}>
      <div style={{ position: 'relative', width: '150px', height: '140px', margin: '0 auto' }}>
        <canvas ref={canvasRef} width={150} height={140} style={{ width: '100%', height: '100%' }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -10%)',
          textAlign: 'center'
        }}>
          <div style={{ color: '#effbe7', fontSize: '22px', fontWeight: '900', lineHeight: '1' }}>{speed}</div>
          <div style={{ color: '#f4c95d', fontSize: '9px', fontWeight: '800', textTransform: 'uppercase' }}>KM/H</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a3c2b0', fontSize: '11.5px' }}>
            <Radio size={14} color="#37bd78" />
            <span>GPS Satellite Lock</span>
          </div>
          <span style={{ color: '#37bd78', fontWeight: '800', fontSize: '12px' }}>{satelliteCount} Satellites</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a3c2b0', fontSize: '11.5px' }}>
            <Fuel size={14} color="#f4c95d" />
            <span>Vehicle EV Range</span>
          </div>
          <span style={{ color: '#f4c95d', fontWeight: '800', fontSize: '12px' }}>{battery}% (142 km)</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a3c2b0', fontSize: '11.5px' }}>
            <TrendingUp size={14} color="#6edbd0" />
            <span>Route Optimization</span>
          </div>
          <span style={{ color: '#6edbd0', fontWeight: '800', fontSize: '12px' }}>Algorithmic Eco Mode</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3D Cold-Chain Refrigerated Cargo Chamber (Preserved)
───────────────────────────────────────────────────────────── */
function ColdChainTelemetry3D({ temp = 4.2, humidity = 88, onBoostCryo }) {
  const canvasRef = useRef(null);
  const [boostActive, setBoostActive] = useState(false);
  const [currentTemp, setCurrentTemp] = useState(temp);

  const isSafe = currentTemp >= 2.0 && currentTemp <= 8.0;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTemp(prev => {
        const delta = (Math.random() - 0.48) * 0.1;
        return parseFloat((prev + delta).toFixed(1));
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleBoost = () => {
    setBoostActive(true);
    setCurrentTemp(2.8);
    if (onBoostCryo) onBoostCryo();
    setTimeout(() => setBoostActive(false), 5000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let time = 0;

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * (canvas.width || 260),
      y: Math.random() * (canvas.height || 140),
      radius: Math.random() * 2 + 1,
      vy: Math.random() * 0.8 + 0.3,
      alpha: Math.random() * 0.7 + 0.2
    }));

    const render = () => {
      time += 0.02;
      const w = canvas.width || 260;
      const h = canvas.height || 140;
      ctx.clearRect(0, 0, w, h);

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, boostActive ? 'rgba(6, 44, 60, 0.95)' : 'rgba(8, 28, 36, 0.95)');
      grad.addColorStop(1, 'rgba(4, 14, 18, 0.98)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = boostActive ? 'rgba(56, 189, 248, 0.3)' : 'rgba(74, 222, 128, 0.15)';
      ctx.lineWidth = 1;
      const horizonY = h * 0.4;
      for (let i = 0; i <= w; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, horizonY);
        ctx.lineTo(i * 1.5 - w * 0.25, h);
        ctx.stroke();
      }
      for (let y = horizonY; y <= h; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      particles.forEach(p => {
        p.y += p.vy * (boostActive ? 2 : 1);
        if (p.y > h) {
          p.y = 0;
          p.x = Math.random() * w;
        }
        ctx.fillStyle = boostActive ? `rgba(186, 230, 253, ${p.alpha})` : `rgba(167, 243, 208, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [boostActive]);

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(8, 28, 36, 0.95), rgba(4, 14, 18, 0.98))',
      border: `1.5px solid ${!isSafe ? '#ef4444' : boostActive ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)'}`,
      borderRadius: '20px',
      padding: '20px',
      boxShadow: !isSafe ? '0 0 35px rgba(239, 68, 68, 0.4)' : '0 12px 32px rgba(0,0,0,0.5)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        background: 'rgba(245, 158, 11, 0.15)',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        borderRadius: '10px',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        fontSize: '11.5px',
        color: '#fef08a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={15} color="#f59e0b" />
          <strong>SIMULATION MODE — Educational Demonstration</strong>
        </div>
        <span style={{ fontSize: '10.5px', color: '#cbd5e1' }}>Simulated Cryo Container</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Snowflake size={20} color="#38bdf8" />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#effbe7', fontSize: '16px', fontWeight: '800' }}>
              Cold-Chain Logistics Chamber
            </h3>
            <p style={{ margin: '2px 0 0 0', color: '#7dd3fc', fontSize: '11px', fontWeight: '700' }}>
              Refrigerated Cargo Container • Safe Range: 2.0°C – 8.0°C
            </p>
          </div>
        </div>

        <button
          onClick={handleBoost}
          disabled={boostActive}
          style={{
            background: boostActive ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(56, 189, 248, 0.2)',
            border: '1px solid rgba(56, 189, 248, 0.5)',
            color: '#effbe7',
            padding: '7px 14px',
            borderRadius: '20px',
            fontSize: '11.5px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Zap size={13} color="#fef08a" />
          <span>{boostActive ? '❄️ Cryo Boost Active' : 'Test Cryo Chill Fluctuation'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'center' }}>
        <div style={{ height: '140px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.2)', position: 'relative' }}>
          <canvas ref={canvasRef} width={260} height={140} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a3c2b0', fontSize: '12px' }}>
              <Thermometer size={16} color="#38bdf8" />
              <span>Temp: <strong style={{ color: isSafe ? '#38bdf8' : '#ef4444' }}>{currentTemp}°C</strong></span>
            </div>
            <span style={{ color: isSafe ? '#4ade80' : '#f87171', fontWeight: '800', fontSize: '11px' }}>
              {isSafe ? 'SAFE' : 'ALERT'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a3c2b0', fontSize: '12px' }}>
              <Activity size={16} color="#34d399" />
              <span>Chamber Humidity</span>
            </div>
            <span style={{ color: '#34d399', fontWeight: '800', fontSize: '12px' }}>{humidity}% RH</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a3c2b0', fontSize: '12px' }}>
              <ShieldCheck size={16} color="#f4c95d" />
              <span>Freshness Retention</span>
            </div>
            <span style={{ color: '#f4c95d', fontWeight: '800', fontSize: '12px' }}>Optimal</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   OTP Handover Verification Modal
───────────────────────────────────────────────────────────── */
function OtpHandoverModal({ isOpen, order, onClose, onConfirmDelivery }) {
  const [enteredOtp, setEnteredOtp] = useState('');
  const [verified, setVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen || !order) return null;
  const orderId = String(order._id || order.id);
  const customerEmail = order.customerEmail || order.userId?.email || 'customer email on record';
  const customerPhone = order.customerPhone || 'registered phone';

  const handleDispatchOtp = async () => {
    setGenerating(true);
    setErrorMsg('');
    setStatusMsg('');
    try {
      const res = await orderAPI.generateDeliveryOtp(orderId);
      setStatusMsg(res.data.message || `Secure OTP dispatched to customer's email (${customerEmail})`);
      setCooldown(60);
    } catch (err) {
      if (err.response?.status === 429 && err.response.data?.cooldownSeconds) {
        setCooldown(err.response.data.cooldownSeconds);
        setErrorMsg(`Please wait ${err.response.data.cooldownSeconds}s before requesting a new PIN.`);
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to dispatch handover OTP to customer.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleVerify = async () => {
    const entered = enteredOtp.trim();
    if (!entered || entered.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit customer handover PIN');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      await orderAPI.verifyDeliveryOtp(orderId, { otp: entered });
      setVerified(true);
      setTimeout(() => {
        onConfirmDelivery(orderId);
        setSubmitting(false);
        setVerified(false);
        setEnteredOtp('');
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Handover PIN verification failed. Please ask customer to check email/SMS.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(4, 14, 12, 0.88)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }} onClick={onClose}>
      <div
        className="responsive-modal-card"
        style={{
          maxWidth: '460px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'linear-gradient(145deg, rgba(16, 26, 22, 0.99), rgba(8, 18, 15, 0.99))',
          border: '1.5px solid rgba(74, 222, 128, 0.45)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #37bd78, #15803d)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #8be28b'
            }}>
              <KeyRound size={22} color="#092b27" />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#effbe7', fontSize: '18px', fontWeight: '800' }}>
                Customer Handover PIN
              </h3>
              <p style={{ margin: '2px 0 0 0', color: '#f4c95d', fontSize: '12px', fontWeight: '700' }}>
                Order #{String(order.orderId || orderId).slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {verified ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 0 30px #10b981'
            }}>
              <Check size={44} color="#fff" />
            </div>
            <h3 style={{ color: '#86efac', fontSize: '20px', fontWeight: '900', margin: '0 0 6px 0' }}>
              Handover Authenticated!
            </h3>
            <p style={{ color: '#a3c2b0', fontSize: '13.5px', margin: 0 }}>
              Produce securely transferred. Order marked as <strong>DELIVERED</strong>.
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              background: 'rgba(244, 201, 93, 0.08)',
              border: '1px solid rgba(244, 201, 93, 0.25)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '16px'
            }}>
              <p style={{ color: '#fef08a', fontSize: '12px', fontWeight: '700', margin: '0 0 4px 0' }}>
                🛡️ Verified Doorstep Handover
              </p>
              <p style={{ color: '#c0d9cb', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
                When standing at the customer's door, ask for their 6-digit confirmation PIN. If the customer has not received it, tap the dispatch button below to send it to <strong style={{ color: '#effbe7' }}>{customerEmail}</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDispatchOtp}
              disabled={generating || cooldown > 0}
              style={{
                width: '100%',
                minHeight: '48px',
                background: 'rgba(244, 201, 93, 0.12)',
                border: '1.5px solid #f4c95d',
                color: '#f4c95d',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: (generating || cooldown > 0) ? 'not-allowed' : 'pointer',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Send size={16} />
              <span>
                {generating
                  ? 'Dispatching PIN...'
                  : cooldown > 0
                  ? `Resend Available in ${cooldown}s`
                  : 'Send Handover PIN to Customer Email'}
              </span>
            </button>

            {statusMsg && (
              <div style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', borderRadius: '10px', padding: '10px 12px', fontSize: '12.5px', color: '#a7f3d0', marginBottom: '14px' }}>
                ✓ {statusMsg}
              </div>
            )}

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '10px', padding: '10px 12px', fontSize: '12.5px', color: '#fca5a5', marginBottom: '14px' }}>
                ⚠ {errorMsg}
              </div>
            )}

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#effbe7', fontWeight: '800', marginBottom: '8px', letterSpacing: '0.5px' }}>
                ENTER 6-DIGIT CUSTOMER PIN:
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={enteredOtp}
                onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                style={{
                  width: '100%',
                  minHeight: '52px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '2px solid rgba(74, 222, 128, 0.5)',
                  borderRadius: '14px',
                  padding: '10px 14px',
                  fontSize: '24px',
                  letterSpacing: '12px',
                  textAlign: 'center',
                  color: '#effbe7',
                  fontWeight: '900',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={submitting || enteredOtp.length !== 6}
              style={{
                width: '100%',
                minHeight: '50px',
                background: enteredOtp.length === 6 ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'rgba(255,255,255,0.08)',
                border: enteredOtp.length === 6 ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.15)',
                color: enteredOtp.length === 6 ? '#ffffff' : '#9ca3af',
                padding: '12px',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: '800',
                cursor: (submitting || enteredOtp.length !== 6) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: enteredOtp.length === 6 ? '0 4px 18px rgba(22, 163, 74, 0.4)' : 'none'
              }}
            >
              <CheckCircle2 size={19} />
              <span>{submitting ? 'Verifying PIN...' : 'Verify PIN & Complete Delivery'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Delivery Portal Component
───────────────────────────────────────────────────────────── */
export default function DeliveryPortal() {
  const { user, showToast } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [activeNavTab, setActiveNavTab] = useState('active'); // 'active' | 'available' | 'history' | 'profile' | 'telemetry'
  const [refreshing, setRefreshing] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [selectedHandoverOrder, setSelectedHandoverOrder] = useState(null);

  const isDriver = user?.role === 'delivery';
  const driverId = String(user?._id || user?.id || '');

  useEffect(() => {
    fetchDeliveryOrders(true);
    const interval = setInterval(() => fetchDeliveryOrders(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDeliveryOrders = async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const res = await orderAPI.getOrders();
      const list = Array.isArray(res.data) ? res.data : (res.data?.orders || []);
      setOrders(list);
    } catch (err) {
      console.warn('Delivery fetch note:', err.message);
    } finally {
      if (initial) setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDeliveryOrders(false);
    setRefreshing(false);
    showToast('Delivery radar refreshed', 'info');
  };

  // Orders segmentation based on real DB status and driver ID
  const myAssignedOrders = orders.filter(o => String(o.deliveryId) === driverId);
  const activeOrders = myAssignedOrders.filter(o => ['assigned', 'picked_up', 'in_transit', 'arrived'].includes(o.status));
  const completedOrders = myAssignedOrders.filter(o => o.status === 'delivered');

  // Available ready farm orders waiting for courier to claim
  const availableOrders = orders.filter(o =>
    (!o.deliveryId || o.deliveryId === 'Unassigned') &&
    ['confirmed', 'accepted', 'packed'].includes(o.status)
  );

  // Today's completed runs
  const todayCompleted = completedOrders.filter(o => {
    const d = o.deliveryOtpVerifiedAt || o.updatedAt || o.createdAt;
    return d && new Date(d).toDateString() === new Date().toDateString();
  });

  // Shift earnings: ₹50 standard logistics payout per completed delivery
  const perDeliveryFee = 50;
  const shiftEarnings = completedOrders.length * perDeliveryFee;

  // Selected active delivery (or first in active run)
  const currentActiveOrder = activeOrders.length > 0 ? activeOrders[0] : null;

  const handleClaimOrder = async (orderId) => {
    if (!isDriver) {
      showToast('Only registered Delivery Drivers can claim shipments.', 'error');
      return;
    }
    try {
      const res = await orderAPI.assignDriver(orderId);
      if (res.data?.success || res.status === 200) {
        showToast('Shipment successfully claimed! Added to your active delivery route.', 'success');
        await fetchDeliveryOrders(false);
        setActiveNavTab('active');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to claim shipment';
      showToast(msg, 'error');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!isDriver) {
      showToast('Only registered Delivery Drivers can update delivery milestones.', 'error');
      return;
    }
    try {
      await orderAPI.updateStatus(orderId, {
        status: newStatus,
        deliveryName: `${user?.firstName || 'David'} ${user?.lastName || 'Swift'}`.trim(),
        deliveryPhone: user?.phone || '+91 98400 12345',
        deliveryEmail: user?.email || 'driver@agrilink.in'
      });
      setOrders(orders.map(o => (String(o._id || o.id) === String(orderId)) ? { ...o, status: newStatus } : o));
      showToast(`Updated shipment status to ${newStatus.toUpperCase().replace('_', ' ')}`, 'success');
      await fetchDeliveryOrders(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not update order status';
      showToast(msg, 'error');
    }
  };

  const simulateGpsMovement = async (order) => {
    const orderId = String(order._id || order.id);
    const fLat = order.farmerLocation?.lat || 12.5222;
    const fLng = order.farmerLocation?.lng || 76.9004;
    const cLat = order.customerLocation?.lat || 12.9716;
    const cLng = order.customerLocation?.lng || 77.5946;

    setSimulating(true);
    setActiveOrderId(orderId);
    showToast('🛰️ Simulating route navigation towards customer doorstep...', 'info');

    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      await new Promise(r => setTimeout(r, 800));
      const currentLat = fLat + ((cLat - fLat) * (i / steps));
      const currentLng = fLng + ((cLng - fLng) * (i / steps));
      const stepAddress = i === steps ? 'Arrived at Customer Doorstep' : `En Route Waypoint ${i}/${steps}`;

      try {
        await orderAPI.updateLocation(orderId, {
          lat: currentLat,
          lng: currentLng,
          address: stepAddress
        });

        setOrders(prev => prev.map(o => (String(o._id || o.id) === String(orderId))
          ? { ...o, deliveryLocation: { lat: currentLat, lng: currentLng, address: stepAddress } }
          : o
        ));
      } catch (err) {
        console.warn('GPS step update note:', err.message);
      }
    }

    setSimulating(false);
    setActiveOrderId(null);
    showToast('🏁 Route simulation reached destination waypoint!', 'success');
  };

  const triggerSOS = () => {
    setSosActive(true);
    showToast('⚠️ Demo Safety Beacon Triggered (In-app simulation only — NOT connected to emergency 112 services). In a real emergency, dial 112 directly.', 'warning');
    setTimeout(() => setSosActive(false), 5000);
  };

  // Helper for workflow milestone steps
  const getWorkflowSteps = (status) => {
    const stages = [
      { key: 'assigned', label: '1. Assigned' },
      { key: 'picked_up', label: '2. Picked Up' },
      { key: 'in_transit', label: '3. In Transit' },
      { key: 'arrived', label: '4. Arrived' },
      { key: 'delivered', label: '5. Delivered' }
    ];
    const currentIndex = stages.findIndex(s => s.key === status);
    return { stages, currentIndex: currentIndex >= 0 ? currentIndex : 0 };
  };

  return (
    <div className="portal-layout" style={{ minHeight: 'calc(100vh - 70px)' }}>
      {/* Desktop Sidebar Navigation */}
      <aside
        className="portal-desktop-sidebar"
        style={{
          width: '260px',
          minWidth: '260px',
          background: 'rgba(12, 24, 20, 0.95)',
          borderRight: '1px solid rgba(74, 222, 128, 0.2)',
          padding: '24px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'sticky',
          top: '70px',
          height: 'calc(100vh - 70px)',
          boxSizing: 'border-box'
        }}
      >
        <div>
          <div style={{ padding: '0 8px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
            <div style={{ marginBottom: '10px' }}>
              <AgriLinkLogo size="sm" showText={true} showBadge={false} interactive={false} />
            </div>
            <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#4ade80' }}>
              DELIVERY PARTNER PORTAL
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* 1. Active Delivery Tab */}
            <button
              onClick={() => setActiveNavTab('active')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeNavTab === 'active' ? 'linear-gradient(135deg, #2e7d32, #1b5e20)' : 'transparent',
                color: activeNavTab === 'active' ? '#ffffff' : '#a3b899',
                fontWeight: activeNavTab === 'active' ? '800' : '600',
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Truck size={18} />
                <span>Active Delivery</span>
              </div>
              {activeOrders.length > 0 && (
                <span style={{
                  background: '#f4c95d',
                  color: '#092b27',
                  fontSize: '11px',
                  fontWeight: '900',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  {activeOrders.length}
                </span>
              )}
            </button>

            {/* 2. Available Pickups Tab */}
            <button
              onClick={() => setActiveNavTab('available')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeNavTab === 'available' ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'transparent',
                color: activeNavTab === 'available' ? '#ffffff' : '#a3b899',
                fontWeight: activeNavTab === 'available' ? '800' : '600',
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={18} />
                <span>Available Pickups</span>
              </div>
              {availableOrders.length > 0 && (
                <span style={{
                  background: '#38bdf8',
                  color: '#092b27',
                  fontSize: '11px',
                  fontWeight: '900',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  {availableOrders.length}
                </span>
              )}
            </button>

            {/* 3. Delivery History & Earnings Tab */}
            <button
              onClick={() => setActiveNavTab('history')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeNavTab === 'history' ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'transparent',
                color: activeNavTab === 'history' ? '#ffffff' : '#a3b899',
                fontWeight: activeNavTab === 'history' ? '800' : '600',
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease'
              }}
            >
              <CheckCircle2 size={18} />
              <span>History & Earnings</span>
            </button>

            {/* 4. Telemetry & Cold-Chain (Preserved) */}
            <button
              onClick={() => setActiveNavTab('telemetry')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeNavTab === 'telemetry' ? 'linear-gradient(135deg, #0f766e, #115e59)' : 'transparent',
                color: activeNavTab === 'telemetry' ? '#ffffff' : '#a3b899',
                fontWeight: activeNavTab === 'telemetry' ? '800' : '600',
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease'
              }}
            >
              <Snowflake size={18} color={activeNavTab === 'telemetry' ? '#fff' : '#6edbd0'} />
              <span>Cold-Chain Telemetry</span>
            </button>

            {/* 5. Driver Profile Tab */}
            <button
              onClick={() => setActiveNavTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeNavTab === 'profile' ? 'linear-gradient(135deg, #475569, #334155)' : 'transparent',
                color: activeNavTab === 'profile' ? '#ffffff' : '#a3b899',
                fontWeight: activeNavTab === 'profile' ? '800' : '600',
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease'
              }}
            >
              <User size={18} />
              <span>Courier Profile</span>
            </button>
          </div>

          {/* SOS Safety Button */}
          <button
            onClick={triggerSOS}
            style={{
              marginTop: '20px',
              width: '100%',
              minHeight: '44px',
              padding: '10px',
              borderRadius: '12px',
              background: sosActive ? '#ff1744' : 'rgba(255, 23, 68, 0.15)',
              border: '1.5px solid #ff1744',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: sosActive ? '0 0 20px #ff1744' : 'none'
            }}
          >
            <AlertTriangle size={15} />
            <span>{sosActive ? '🚨 BEACON ACTIVE (DEMO)' : 'Demo Safety Beacon'}</span>
          </button>
        </div>

        {/* Driver Profile Summary Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #37bd78, #15803d)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#effbe7',
            fontWeight: '800',
            fontSize: '14px'
          }}>
            {user?.firstName?.[0]?.toUpperCase() || 'D'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#effbe7', fontSize: '13px', fontWeight: '700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ color: '#f4c95d', fontSize: '11px', fontWeight: '700' }}>
              ⭐ 4.95 Certified Courier
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="portal-main-content" style={{ flex: 1, padding: 'clamp(12px, 3vw, 24px)', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Top Shift Status & Quick Metrics Bar */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(16, 32, 26, 0.95), rgba(8, 20, 16, 0.98))',
          border: '1.5px solid rgba(74, 222, 128, 0.25)',
          borderRadius: '18px',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#37bd78',
              boxShadow: '0 0 10px #37bd78'
            }} />
            <div>
              <div style={{ color: '#effbe7', fontSize: '14px', fontWeight: '800' }}>
                {user?.firstName || 'Courier'} • Active On Duty
              </div>
              <div style={{ color: '#a3c2b0', fontSize: '11.5px' }}>
                Live GPS Dispatch Radar
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>
                Today's Payout
              </div>
              <div style={{ color: '#37bd78', fontSize: '18px', fontWeight: '900' }}>
                ₹{shiftEarnings} <span style={{ fontSize: '11.5px', color: '#a3c2b0', fontWeight: '500' }}>({completedOrders.length} runs)</span>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              aria-label="Refresh Radar"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#effbe7',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
           TAB 1: ACTIVE DELIVERY (The Driver's Main Focus)
        ───────────────────────────────────────────────────────────── */}
        {activeNavTab === 'active' && (
          <div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <SkeletonDeliveryCard />
                <SkeletonDeliveryCard />
              </div>
            ) : !currentActiveOrder ? (
              <div style={{
                background: 'rgba(16, 32, 26, 0.75)',
                border: '1.5px dashed rgba(74, 222, 128, 0.3)',
                borderRadius: '24px',
                padding: '50px 20px',
                textAlign: 'center',
                color: '#a3c2b0'
              }}>
                <Truck size={48} color="#f4c95d" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ color: '#effbe7', fontSize: '20px', fontWeight: '800', margin: '0 0 8px' }}>
                  No Active Delivery in Progress
                </h3>
                <p style={{ margin: '0 0 20px', fontSize: '14px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                  You currently have no assigned shipments. Check available regional farm pickups to claim your next delivery.
                </p>
                <button
                  onClick={() => setActiveNavTab('available')}
                  style={{
                    minHeight: '48px',
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #37bd78, #15803d)',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(55, 189, 120, 0.4)'
                  }}
                >
                  <Package size={17} />
                  <span>View Available Farm Pickups ({availableOrders.length})</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* 1. Milestone Status Bar (Visual Progress Tracker) */}
                {(() => {
                  const { stages, currentIndex } = getWorkflowSteps(currentActiveOrder.status);
                  return (
                    <div style={{
                      background: 'rgba(16, 32, 26, 0.95)',
                      border: '1.5px solid rgba(74, 222, 128, 0.35)',
                      borderRadius: '18px',
                      padding: '16px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <span style={{ color: '#f4c95d', fontSize: '11.5px', fontWeight: '800', textTransform: 'uppercase' }}>
                            ACTIVE RUN #{String(currentActiveOrder.orderId || currentActiveOrder._id || currentActiveOrder.id).slice(-8).toUpperCase()}
                          </span>
                          <h2 style={{ margin: '2px 0 0 0', color: '#effbe7', fontSize: '18px', fontWeight: '800' }}>
                            Status: <span style={{ color: '#37bd78' }}>{currentActiveOrder.status?.replace('_', ' ').toUpperCase()}</span>
                          </h2>
                        </div>
                        <span style={{
                          background: 'rgba(55, 189, 120, 0.2)',
                          border: '1px solid #37bd78',
                          color: '#8be28b',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '800'
                        }}>
                          Step {currentIndex + 1} of 5
                        </span>
                      </div>

                      {/* Visual Progress Steps */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', marginTop: '10px' }}>
                        {stages.map((stg, idx) => {
                          const isDone = idx < currentIndex;
                          const isCurrent = idx === currentIndex;
                          return (
                            <div key={stg.key} style={{ textAlign: 'center' }}>
                              <div style={{
                                height: '6px',
                                borderRadius: '3px',
                                background: isDone || isCurrent ? '#37bd78' : 'rgba(255,255,255,0.12)',
                                boxShadow: isCurrent ? '0 0 8px #37bd78' : 'none',
                                marginBottom: '6px'
                              }} />
                              <div style={{
                                fontSize: '10px',
                                fontWeight: isCurrent ? '800' : '600',
                                color: isCurrent ? '#37bd78' : isDone ? '#8be28b' : '#6b7280',
                                textTransform: 'uppercase',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {stg.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Destination & Pickup Routing Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {/* Farm Origin */}
                  <div style={{
                    background: 'rgba(16, 32, 26, 0.85)',
                    border: '1px solid rgba(244, 201, 93, 0.3)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f4c95d', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>
                        <MapPin size={13} color="#f4c95d" />
                        <span>1. Farm Pickup Origin</span>
                      </div>
                      <div style={{ color: '#effbe7', fontSize: '15px', fontWeight: '800' }}>
                        {currentActiveOrder.farmerName || 'Partner Farm Depot'}
                      </div>
                      <div style={{ color: '#a3c2b0', fontSize: '12.5px', marginTop: '4px', lineHeight: '1.4' }}>
                        {currentActiveOrder.farmerLocation?.address || 'Direct Farm Packing Depot'}
                      </div>
                    </div>

                    {currentActiveOrder.farmerPhone && (
                      <a
                        href={`tel:${currentActiveOrder.farmerPhone}`}
                        style={{
                          marginTop: '12px',
                          minHeight: '44px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: 'rgba(244, 201, 93, 0.12)',
                          border: '1px solid rgba(244, 201, 93, 0.4)',
                          color: '#f4c95d',
                          borderRadius: '10px',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          textDecoration: 'none'
                        }}
                      >
                        <Phone size={14} />
                        <span>Call Farmer ({currentActiveOrder.farmerPhone})</span>
                      </a>
                    )}
                  </div>

                  {/* Customer Destination */}
                  <div style={{
                    background: 'rgba(16, 32, 26, 0.85)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>
                        <Navigation size={13} color="#38bdf8" />
                        <span>2. Customer Destination</span>
                      </div>
                      <div style={{ color: '#effbe7', fontSize: '15px', fontWeight: '800' }}>
                        {currentActiveOrder.customerName || 'Customer Residence'}
                      </div>
                      <div style={{ color: '#a3c2b0', fontSize: '12.5px', marginTop: '4px', lineHeight: '1.4' }}>
                        {currentActiveOrder.customerLocation?.address || currentActiveOrder.customerAddress || 'Customer Address'}
                      </div>
                    </div>

                    <a
                      href={`tel:${currentActiveOrder.customerPhone || '9840012345'}`}
                      style={{
                        marginTop: '12px',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        color: '#7dd3fc',
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        textDecoration: 'none'
                      }}
                    >
                      <Phone size={14} />
                      <span>Call Customer ({currentActiveOrder.customerPhone || 'Direct'})</span>
                    </a>
                  </div>
                </div>

                {/* 3. Live Navigation Map & Telemetry Control */}
                <div style={{
                  background: 'rgba(16, 32, 26, 0.85)',
                  border: '1.5px solid rgba(74, 222, 128, 0.25)',
                  borderRadius: '18px',
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#effbe7', fontSize: '13px', fontWeight: '800' }}>
                      <Map size={16} color="#37bd78" />
                      <span>Live GPS Route Radar</span>
                    </div>

                    <button
                      disabled={simulating}
                      onClick={() => simulateGpsMovement(currentActiveOrder)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: simulating ? '#37bd78' : 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#effbe7',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        cursor: simulating ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Play size={12} />
                      <span>{simulating ? 'Simulating...' : 'Test Route Telemetry'}</span>
                    </button>
                  </div>

                  <LiveTrackingMap order={currentActiveOrder} />
                </div>

                {/* 4. Produce Order Summary */}
                <div style={{
                  background: 'rgba(16, 32, 26, 0.85)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ color: '#effbe7', fontSize: '14px', fontWeight: '800' }}>
                      Produce Cargo Manifest ({currentActiveOrder.items?.length || 1} item)
                    </div>
                    <div style={{ color: '#37bd78', fontSize: '16px', fontWeight: '900' }}>
                      Collect: ₹{currentActiveOrder.totalAmount}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(currentActiveOrder.items || []).map((itm, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}>
                        <span style={{ color: '#effbe7', fontWeight: '700' }}>
                          {itm.quantity} {itm.unit || 'kg'} × {itm.title}
                        </span>
                        <span style={{ color: '#a3c2b0' }}>
                          ₹{Number(itm.price) * itm.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '11.5px', color: '#f4c95d', fontWeight: '600' }}>
                    ℹ️ Payment: Cash on Delivery / UPI upon Handover
                  </div>
                </div>

                {/* 5. Primary Next Action Button (In-page) */}
                <div style={{ marginTop: '6px' }}>
                  {currentActiveOrder.status === 'assigned' && (
                    <button
                      onClick={() => handleUpdateStatus(currentActiveOrder._id || currentActiveOrder.id, 'picked_up')}
                      style={{
                        width: '100%',
                        minHeight: '52px',
                        background: 'linear-gradient(135deg, #f4c95d, #ffa726)',
                        border: 'none',
                        color: '#092b27',
                        borderRadius: '14px',
                        fontSize: '15px',
                        fontWeight: '900',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 18px rgba(244, 201, 93, 0.4)'
                      }}
                    >
                      <Package size={20} />
                      <span>1. Confirm Cargo Picked Up from Farm</span>
                    </button>
                  )}

                  {currentActiveOrder.status === 'picked_up' && (
                    <button
                      onClick={() => handleUpdateStatus(currentActiveOrder._id || currentActiveOrder.id, 'in_transit')}
                      style={{
                        width: '100%',
                        minHeight: '52px',
                        background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                        border: 'none',
                        color: '#ffffff',
                        borderRadius: '14px',
                        fontSize: '15px',
                        fontWeight: '900',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 18px rgba(2, 132, 199, 0.4)'
                      }}
                    >
                      <Truck size={20} />
                      <span>2. Start Transit to Customer Doorstep</span>
                    </button>
                  )}

                  {currentActiveOrder.status === 'in_transit' && (
                    <button
                      onClick={() => handleUpdateStatus(currentActiveOrder._id || currentActiveOrder.id, 'arrived')}
                      style={{
                        width: '100%',
                        minHeight: '52px',
                        background: 'linear-gradient(135deg, #059669, #047857)',
                        border: 'none',
                        color: '#ffffff',
                        borderRadius: '14px',
                        fontSize: '15px',
                        fontWeight: '900',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 18px rgba(5, 150, 105, 0.4)'
                      }}
                    >
                      <MapPin size={20} />
                      <span>3. Mark Arrived at Customer Doorstep</span>
                    </button>
                  )}

                  {currentActiveOrder.status === 'arrived' && (
                    <button
                      onClick={() => setSelectedHandoverOrder(currentActiveOrder)}
                      style={{
                        width: '100%',
                        minHeight: '52px',
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                        border: '1px solid #4ade80',
                        color: '#ffffff',
                        borderRadius: '14px',
                        fontSize: '15px',
                        fontWeight: '900',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 20px rgba(22, 163, 74, 0.5)'
                      }}
                    >
                      <KeyRound size={20} color="#f4c95d" />
                      <span>4. Enter Customer PIN & Complete Delivery</span>
                    </button>
                  )}
                </div>

                {/* Sticky Mobile Action Footer for quick thumb access */}
                <div className="delivery-sticky-action-bar">
                  {currentActiveOrder.status === 'assigned' && (
                    <button
                      onClick={() => handleUpdateStatus(currentActiveOrder._id || currentActiveOrder.id, 'picked_up')}
                      style={{
                        width: '100%',
                        minHeight: '48px',
                        background: 'linear-gradient(135deg, #f4c95d, #ffa726)',
                        border: 'none',
                        color: '#092b27',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '900',
                        cursor: 'pointer'
                      }}
                    >
                      1. Confirm Picked Up from Farm
                    </button>
                  )}

                  {currentActiveOrder.status === 'picked_up' && (
                    <button
                      onClick={() => handleUpdateStatus(currentActiveOrder._id || currentActiveOrder.id, 'in_transit')}
                      style={{
                        width: '100%',
                        minHeight: '48px',
                        background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                        border: 'none',
                        color: '#ffffff',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '900',
                        cursor: 'pointer'
                      }}
                    >
                      2. Start Transit to Customer
                    </button>
                  )}

                  {currentActiveOrder.status === 'in_transit' && (
                    <button
                      onClick={() => handleUpdateStatus(currentActiveOrder._id || currentActiveOrder.id, 'arrived')}
                      style={{
                        width: '100%',
                        minHeight: '48px',
                        background: 'linear-gradient(135deg, #059669, #047857)',
                        border: 'none',
                        color: '#ffffff',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '900',
                        cursor: 'pointer'
                      }}
                    >
                      3. Mark Arrived at Doorstep
                    </button>
                  )}

                  {currentActiveOrder.status === 'arrived' && (
                    <button
                      onClick={() => setSelectedHandoverOrder(currentActiveOrder)}
                      style={{
                        width: '100%',
                        minHeight: '48px',
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                        border: '1px solid #4ade80',
                        color: '#ffffff',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '900',
                        cursor: 'pointer'
                      }}
                    >
                      4. Verify Handover PIN
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
           TAB 2: AVAILABLE FARM PICKUPS
        ───────────────────────────────────────────────────────────── */}
        {activeNavTab === 'available' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ color: '#effbe7', fontSize: '20px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={20} color="#38bdf8" />
                <span>Available Farm Shipments ({availableOrders.length})</span>
              </h2>
              <p style={{ color: '#a3c2b0', fontSize: '13px', margin: '4px 0 0 0' }}>
                Orders confirmed and packed by regional farmers ready for courier dispatch.
              </p>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '16px' }}>
                <SkeletonDeliveryCard />
                <SkeletonDeliveryCard />
              </div>
            ) : availableOrders.length === 0 ? (
              <div style={{
                background: 'rgba(16, 32, 26, 0.75)',
                border: '1.5px dashed rgba(56, 189, 248, 0.3)',
                borderRadius: '24px',
                padding: '60px 20px',
                textAlign: 'center',
                color: '#a3c2b0'
              }}>
                <CheckCircle2 size={48} color="#38bdf8" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ color: '#effbe7', fontSize: '18px', fontWeight: '800', margin: '0 0 6px' }}>
                  All Farm Orders Currently Dispatched
                </h3>
                <p style={{ margin: 0, fontSize: '13.5px' }}>
                  There are no unassigned farm shipments at this time. New packed harvest orders will appear automatically.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '16px' }}>
                {availableOrders.map(order => {
                  const orderId = String(order._id || order.id);
                  return (
                    <div
                      key={orderId}
                      style={{
                        background: 'linear-gradient(145deg, rgba(16, 32, 26, 0.95), rgba(8, 20, 16, 0.98))',
                        border: '1.5px solid rgba(56, 189, 248, 0.35)',
                        borderRadius: '20px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ color: '#f4c95d', fontSize: '12px', fontWeight: '800' }}>
                            #{String(order.orderId || orderId).slice(-8).toUpperCase()}
                          </span>
                          <span style={{
                            background: 'rgba(56, 189, 248, 0.2)',
                            border: '1px solid #38bdf8',
                            color: '#7dd3fc',
                            padding: '3px 10px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '800',
                            textTransform: 'uppercase'
                          }}>
                            {order.status}
                          </span>
                        </div>

                        <div style={{ color: '#effbe7', fontSize: '17px', fontWeight: '800', marginBottom: '8px' }}>
                          ₹{order.totalAmount} • {order.items?.length || 1} produce line(s)
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '12.5px' }}>
                          <div style={{ color: '#f4c95d', fontWeight: '700' }}>1. Pickup Origin:</div>
                          <div style={{ color: '#effbe7', fontWeight: '600' }}>{order.farmerName}</div>
                          <div style={{ color: '#a3c2b0', fontSize: '11.5px', marginBottom: '8px' }}>{order.farmerLocation?.address || 'Farm Origin'}</div>

                          <div style={{ color: '#38bdf8', fontWeight: '700' }}>2. Customer Destination:</div>
                          <div style={{ color: '#effbe7', fontWeight: '600' }}>{order.customerName}</div>
                          <div style={{ color: '#a3c2b0', fontSize: '11.5px' }}>{order.customerLocation?.address || order.customerAddress || 'Customer Address'}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleClaimOrder(orderId)}
                        style={{
                          width: '100%',
                          minHeight: '48px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          border: 'none',
                          color: '#ffffff',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                        }}
                      >
                        <Truck size={17} />
                        <span>Claim & Accept Shipment</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
           TAB 3: DELIVERY HISTORY & EARNINGS
        ───────────────────────────────────────────────────────────── */}
        {activeNavTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Shift Payout Ledger Summary */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(16, 32, 26, 0.95), rgba(8, 20, 16, 0.98))',
              border: '1.5px solid rgba(74, 222, 128, 0.35)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
            }}>
              <h3 style={{ color: '#effbe7', fontSize: '18px', fontWeight: '800', margin: '0 0 16px' }}>
                Shift Payout Ledger
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ color: '#a3c2b0', fontSize: '12px', fontWeight: '600' }}>Total Shift Earnings</div>
                  <div style={{ color: '#37bd78', fontSize: '28px', fontWeight: '900', marginTop: '4px' }}>₹{shiftEarnings}</div>
                  <div style={{ color: '#8be28b', fontSize: '11px', marginTop: '4px' }}>Verified & credited</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ color: '#a3c2b0', fontSize: '12px', fontWeight: '600' }}>Verified Deliveries</div>
                  <div style={{ color: '#effbe7', fontSize: '28px', fontWeight: '900', marginTop: '4px' }}>{completedOrders.length}</div>
                  <div style={{ color: '#f4c95d', fontSize: '11px', marginTop: '4px' }}>OTP authenticated runs</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ color: '#a3c2b0', fontSize: '12px', fontWeight: '600' }}>Standard Courier Rate</div>
                  <div style={{ color: '#f4c95d', fontSize: '28px', fontWeight: '900', marginTop: '4px' }}>₹{perDeliveryFee}</div>
                  <div style={{ color: '#cbd5e1', fontSize: '11px', marginTop: '4px' }}>Per completed delivery</div>
                </div>
              </div>

              <h4 style={{ color: '#effbe7', fontSize: '15px', fontWeight: '800', margin: '0 0 12px' }}>
                Completed Delivery Records ({completedOrders.length})
              </h4>

              {completedOrders.length === 0 ? (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#a3c2b0',
                  fontSize: '13.5px'
                }}>
                  No completed deliveries recorded yet for your account. Once an active order is delivered and verified with the customer's 6-digit PIN, it will appear here.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {completedOrders.map(order => {
                    const orderId = String(order._id || order.id);
                    return (
                      <div
                        key={orderId}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(55, 189, 120, 0.25)',
                          borderRadius: '14px',
                          padding: '16px',
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#f4c95d', fontSize: '12px', fontWeight: '800' }}>
                              #{String(order.orderId || orderId).slice(-8).toUpperCase()}
                            </span>
                            <span style={{
                              background: 'rgba(55, 189, 120, 0.2)',
                              border: '1px solid #37bd78',
                              color: '#8be28b',
                              padding: '2px 8px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '800'
                            }}>
                              ✓ OTP Verified & Delivered
                            </span>
                          </div>

                          <div style={{ color: '#effbe7', fontSize: '14px', fontWeight: '700', marginTop: '6px' }}>
                            {order.farmerName || 'Farm Depot'} → {order.customerName || 'Customer'}
                          </div>

                          <div style={{ color: '#a3c2b0', fontSize: '12px', marginTop: '2px' }}>
                            {order.items?.map(i => `${i.quantity}x ${i.title}`).join(', ') || 'Produce Batch'}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#37bd78', fontSize: '18px', fontWeight: '900' }}>
                            +₹{perDeliveryFee}
                          </div>
                          <div style={{ color: '#a3c2b0', fontSize: '11.5px', marginTop: '2px' }}>
                            {order.deliveryOtpVerifiedAt
                              ? new Date(order.deliveryOtpVerifiedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                              : 'Completed'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
           TAB 4: COLD-CHAIN TELEMETRY (Preserved & Cleanly Organized)
        ───────────────────────────────────────────────────────────── */}
        {activeNavTab === 'telemetry' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ color: '#effbe7', fontSize: '20px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Snowflake size={20} color="#38bdf8" />
                <span>Cold-Chain & Fleet Telemetry (Simulation)</span>
              </h2>
              <p style={{ color: '#a3c2b0', fontSize: '13px', margin: '4px 0 0 0' }}>
                Thermodynamic temperature containment simulation for perishable farm produce.
              </p>
            </div>

            <FleetTelemetryHUD speed={simulating ? 52 : 0} battery={88} satelliteCount={11} />

            <ColdChainTelemetry3D
              temp={4.1}
              humidity={89}
              onBoostCryo={() => showToast('❄️ Simulated Cryo-Chill Boost activated (demo temperature drop to 2.8°C).', 'info')}
            />
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
           TAB 5: COURIER PROFILE
        ───────────────────────────────────────────────────────────── */}
        {activeNavTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ color: '#effbe7', fontSize: '20px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="#37bd78" />
                <span>Courier Operator Profile</span>
              </h2>
              <p style={{ color: '#a3c2b0', fontSize: '13px', margin: '4px 0 0 0' }}>
                Verified fleet partner credentials and safety controls.
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(145deg, rgba(16, 32, 26, 0.95), rgba(8, 20, 16, 0.98))',
              border: '1.5px solid rgba(74, 222, 128, 0.35)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #37bd78, #15803d)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#effbe7',
                  fontWeight: '900',
                  fontSize: '22px'
                }}>
                  {user?.firstName?.[0]?.toUpperCase() || 'D'}
                </div>
                <div>
                  <div style={{ color: '#effbe7', fontSize: '18px', fontWeight: '800' }}>
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div style={{ color: '#f4c95d', fontSize: '12.5px', fontWeight: '700', marginTop: '2px' }}>
                    ⭐ 4.95 Certified AgriLink Logistics Carrier
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Contact Phone</div>
                  <div style={{ color: '#effbe7', fontSize: '14px', fontWeight: '600', marginTop: '3px' }}>{user?.phone || '+91 98400 12345'}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Registered Email</div>
                  <div style={{ color: '#effbe7', fontSize: '14px', fontWeight: '600', marginTop: '3px' }}>{user?.email || 'driver@agrilink.in'}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Completed Deliveries</div>
                  <div style={{ color: '#37bd78', fontSize: '15px', fontWeight: '800', marginTop: '3px' }}>{completedOrders.length} Verified Runs</div>
                </div>
              </div>

              <button
                onClick={triggerSOS}
                style={{
                  width: '100%',
                  minHeight: '48px',
                  borderRadius: '12px',
                  background: sosActive ? '#ff1744' : 'rgba(255, 23, 68, 0.15)',
                  border: '1.5px solid #ff1744',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: sosActive ? '0 0 20px #ff1744' : 'none'
                }}
              >
                <AlertTriangle size={18} />
                <span>{sosActive ? '🚨 DEMO BEACON BROADCASTING' : 'Demo Safety Beacon (Not connected to 112/emergency services)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Customer Handover OTP Modal */}
        <OtpHandoverModal
          isOpen={Boolean(selectedHandoverOrder)}
          order={selectedHandoverOrder}
          onClose={() => setSelectedHandoverOrder(null)}
          onConfirmDelivery={(id) => handleUpdateStatus(id, 'delivered')}
        />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-btn ${activeNavTab === 'active' ? 'active' : ''}`}
          onClick={() => {
            setActiveNavTab('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Truck size={20} />
            {activeOrders.length > 0 && <span className="mobile-nav-badge">{activeOrders.length}</span>}
          </div>
          <span>Active</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeNavTab === 'available' ? 'active' : ''}`}
          onClick={() => {
            setActiveNavTab('available');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Package size={20} />
            {availableOrders.length > 0 && (
              <span className="mobile-nav-badge" style={{ background: '#38bdf8' }}>{availableOrders.length}</span>
            )}
          </div>
          <span>Pickups</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeNavTab === 'history' ? 'active' : ''}`}
          onClick={() => {
            setActiveNavTab('history');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <CheckCircle2 size={20} />
          <span>Earnings</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeNavTab === 'telemetry' ? 'active' : ''}`}
          onClick={() => {
            setActiveNavTab('telemetry');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Snowflake size={20} />
          <span>Cold-Chain</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeNavTab === 'profile' ? 'active' : ''}`}
          onClick={() => {
            setActiveNavTab('profile');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}
