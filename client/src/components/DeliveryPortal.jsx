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
  Volume2,
  VolumeX,
  Layers,
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
  Sparkles
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   3D Fleet Telemetry & Holographic Speedometer Canvas
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
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 12px 32px rgba(0,0,0,0.4)'
    }}>
      <div style={{ position: 'relative', width: '180px', height: '170px' }}>
        <canvas ref={canvasRef} width={180} height={170} style={{ width: '100%', height: '100%' }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -10%)',
          textAlign: 'center'
        }}>
          <div style={{ color: '#effbe7', fontSize: '24px', fontWeight: '900', lineHeight: '1' }}>{speed}</div>
          <div style={{ color: '#f4c95d', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>KM/H</div>
        </div>
      </div>

      {/* Telemetry Metrics (Simulation Demo) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, marginLeft: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a3c2b0', fontSize: '12px' }}>
            <Radio size={14} color="#37bd78" />
            <span>GPS Satellite Lock (Demo)</span>
          </div>
          <span style={{ color: '#37bd78', fontWeight: '800', fontSize: '13px' }}>{satelliteCount} Satellites</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a3c2b0', fontSize: '12px' }}>
            <Fuel size={14} color="#f4c95d" />
            <span>Vehicle EV Range (Simulated)</span>
          </div>
          <span style={{ color: '#f4c95d', fontWeight: '800', fontSize: '13px' }}>{battery}% (142 km)</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a3c2b0', fontSize: '12px' }}>
            <TrendingUp size={14} color="#6edbd0" />
            <span>Route Optimization (Model)</span>
          </div>
          <span style={{ color: '#6edbd0', fontWeight: '800', fontSize: '13px' }}>Algorithmic Eco Mode</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3D Cold-Chain Refrigerated Cargo Chamber Component
───────────────────────────────────────────────────────────── */
function ColdChainTelemetry3D({ temp = 4.2, humidity = 88, onBoostCryo }) {
  const canvasRef = useRef(null);
  const [boostActive, setBoostActive] = useState(false);
  const [currentTemp, setCurrentTemp] = useState(temp);

  const isSafe = currentTemp >= 2.0 && currentTemp <= 8.0;

  useEffect(() => {
    const timer = setInterval(() => {
      // Natural micro-fluctuation
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

    // Frost particles
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * (canvas.width || 260),
      y: Math.random() * (canvas.height || 140),
      radius: Math.random() * 2.5 + 1,
      vy: Math.random() * 0.8 + 0.3,
      alpha: Math.random() * 0.7 + 0.2
    }));

    const render = () => {
      time += 0.02;
      const w = canvas.width || 260;
      const h = canvas.height || 140;
      ctx.clearRect(0, 0, w, h);

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, boostActive ? 'rgba(6, 44, 60, 0.95)' : 'rgba(8, 28, 36, 0.95)');
      grad.addColorStop(1, 'rgba(4, 14, 18, 0.98)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // 3D Grid floor perspective
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

      // Draw frost / chilled particles
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
      padding: '24px',
      boxShadow: !isSafe ? '0 0 35px rgba(239, 68, 68, 0.4)' : boostActive ? '0 0 35px rgba(56, 189, 248, 0.4)' : '0 12px 32px rgba(0,0,0,0.5)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      {/* SIMULATION MODE Banner (Problem 6 Rule) */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.15)',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        borderRadius: '10px',
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        fontSize: '12px',
        color: '#fef08a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={15} color="#f59e0b" />
          <strong>SIMULATION MODE — No physical IoT sensor connected</strong>
        </div>
        <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Telemetry generated via thermodynamic simulation</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', position: 'relative', zIndex: 2, flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Snowflake size={22} color="#38bdf8" />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#effbe7', fontSize: '17px', fontWeight: '800' }}>
              3D Cold-Chain Logistics Chamber
            </h3>
            <p style={{ margin: '2px 0 0 0', color: '#7dd3fc', fontSize: '11.5px', fontWeight: '700' }}>
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
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '11.5px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          <Zap size={13} color="#fef08a" />
          <span>{boostActive ? '❄️ Simulated Cryo Boost Active' : 'Test Cryo Chill Fluctuation'}</span>
        </button>
      </div>

      {/* Cold Chain Explanation Section */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '18px',
        fontSize: '12.5px',
        color: '#c0d9cb',
        lineHeight: '1.5'
      }}>
        <strong style={{ color: '#7dd3fc' }}>What is Cold Chain?</strong> Cold-chain logistics maintains unbroken temperature control during transportation to protect perishable farm produce (such as leafy vegetables, ripe tomatoes, dairy, berries, and herbs) from heat degradation, nutrient loss, and spoilage between farm harvest and customer delivery.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ height: '150px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.2)', position: 'relative' }}>
          <canvas ref={canvasRef} width={280} height={150} style={{ width: '100%', height: '100%', display: 'block' }} />
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            fontSize: '10.5px',
            color: '#bae6fd',
            fontWeight: '700',
            background: 'rgba(0,0,0,0.6)',
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            Cargo Thermal Chamber Simulation
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Temperature & Safe Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a3c2b0', fontSize: '12px' }}>
              <Thermometer size={16} color="#38bdf8" />
              <div>
                <div>Temperature: <strong style={{ color: isSafe ? '#38bdf8' : '#ef4444', fontSize: '15px' }}>{currentTemp}°C</strong></div>
                <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>Safe Range: 2.0°C – 8.0°C</div>
              </div>
            </div>
            <span style={{
              background: isSafe ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: isSafe ? '#4ade80' : '#f87171',
              border: `1px solid ${isSafe ? '#22c55e' : '#ef4444'}`,
              fontWeight: '900',
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '8px'
            }}>
              {isSafe ? 'STATUS: SAFE' : 'WARNING: TEMP ALERT'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a3c2b0', fontSize: '12px' }}>
              <Activity size={16} color="#34d399" />
              <span>Chamber Humidity</span>
            </div>
            <span style={{ color: '#34d399', fontWeight: '800', fontSize: '13px' }}>
              {humidity}% Optimal RH
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a3c2b0', fontSize: '12px' }}>
              <ShieldCheck size={16} color="#f4c95d" />
              <span>Perishable Freshness</span>
            </div>
            <span style={{ color: '#f4c95d', fontWeight: '800', fontSize: '13px' }}>
              Freshness Shield Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3D Holographic Handover & OTP Verification Modal
───────────────────────────────────────────────────────────── */
function OtpHandoverModal({ isOpen, order, onClose, onConfirmDelivery }) {
  const [enteredOtp, setEnteredOtp] = useState('');
  const [verified, setVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !order) return null;
  const orderId = String(order._id || order.id);
  const customerEmail = order.customerEmail || order.userId?.email || order.userEmail || 'customer email on record';

  const handleDispatchOtp = async () => {
    setGenerating(true);
    setErrorMsg('');
    setStatusMsg('');
    try {
      const res = await orderAPI.generateDeliveryOtp(orderId);
      setStatusMsg(res.data.message || `Secure OTP dispatched to customer's verified email (${customerEmail})`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to dispatch handover OTP to customer email.');
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
      setErrorMsg(err.response?.data?.message || 'Handover PIN verification failed');
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(4, 14, 12, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }} onClick={onClose}>
      <div
        className="responsive-modal-card"
        style={{
          maxWidth: '480px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'linear-gradient(145deg, rgba(18, 14, 8, 0.98), rgba(10, 8, 4, 0.99))',
          border: '1.5px solid rgba(244, 201, 93, 0.45)',
          borderRadius: '24px',
          padding: 'clamp(16px, 4vw, 28px)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(244,201,93,0.2)',
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
              background: 'linear-gradient(135deg, #f4c95d, #b45309)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #fef08a'
            }}>
              <KeyRound size={20} color="#092b27" />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#effbe7', fontSize: '17px', fontWeight: '800' }}>
                Customer Handover Verification
              </h3>
              <p style={{ margin: '2px 0 0 0', color: '#f4c95d', fontSize: '11px', fontWeight: '700' }}>
                Order #{String(order._id || order.id).slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={20} />
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
            <p style={{ color: '#a3c2b0', fontSize: '13px', margin: 0 }}>
              Produce securely transferred. Order marked as DELIVERED in database.
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              background: 'rgba(244, 201, 93, 0.08)',
              border: '1px solid rgba(244, 201, 93, 0.25)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '14px'
            }}>
              <p style={{ color: '#fef08a', fontSize: '12px', fontWeight: '700', margin: '0 0 4px 0' }}>
                🛡️ Verified Email Handover Flow
              </p>
              <p style={{ color: '#c0d9cb', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
                When you arrive at the delivery address, click the button below to dispatch a 6-digit one-time PIN directly to the customer's verified email (<span style={{ color: '#effbe7', fontWeight: '600' }}>{customerEmail}</span>). Ask the customer for the PIN to verify and close delivery.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDispatchOtp}
              disabled={generating}
              style={{
                width: '100%',
                background: 'rgba(244, 201, 93, 0.15)',
                border: '1px solid #f4c95d',
                color: '#f4c95d',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Send size={15} />
              <span>{generating ? 'Dispatching to Customer Email...' : 'Send Handover OTP to Customer Email'}</span>
            </button>

            {statusMsg && (
              <div style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#a7f3d0', marginBottom: '12px' }}>
                ✓ {statusMsg}
              </div>
            )}

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#fca5a5', marginBottom: '12px' }}>
                ⚠ {errorMsg}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', color: '#f4c95d', fontWeight: '800', marginBottom: '8px' }}>
                ENTER CUSTOMER DELIVERY OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={enteredOtp}
                onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1.5px solid rgba(244, 201, 93, 0.4)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: 'clamp(18px, 5vw, 22px)',
                  letterSpacing: 'clamp(4px, 2vw, 8px)',
                  textAlign: 'center',
                  color: '#effbe7',
                  fontWeight: '800',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={submitting}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                border: '1px solid #4ade80',
                color: '#fff',
                padding: '13px',
                borderRadius: '12px',
                fontSize: '14.5px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 18px rgba(22, 163, 74, 0.4)'
              }}
            >
              <CheckCircle2 size={18} />
              <span>{submitting ? 'Verifying OTP with Server...' : 'Verify OTP & Complete Delivery'}</span>
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
  const [simulating, setSimulating] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [activeNavTab, setActiveNavTab] = useState('home'); // 'home' | 'dispatch' | 'map' | 'coldchain' | 'earnings' | 'profile'
  const [deliverySubTab, setDeliverySubTab] = useState('assigned'); // 'assigned' | 'available' | 'completed'
  const [refreshing, setRefreshing] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [selectedHandoverOrder, setSelectedHandoverOrder] = useState(null);

  const isDriver = user?.role === 'delivery';
  const driverId = String(user?._id || user?.id || '');

  useEffect(() => {
    fetchDeliveryOrders();
    const interval = setInterval(fetchDeliveryOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDeliveryOrders = async () => {
    try {
      const res = await orderAPI.getOrders();
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Delivery fetch note:', err.message);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDeliveryOrders();
    setRefreshing(false);
    showToast('Delivery dispatch radar updated', 'info');
  };

  // Orders segmentation based on real DB status and driver ID
  const myAssignedOrders = orders.filter(o => String(o.deliveryId) === driverId);
  const acceptedOrders = myAssignedOrders.filter(o => o.status === 'assigned');
  const pickedUpOrders = myAssignedOrders.filter(o => o.status === 'picked_up');
  const inTransitOrders = myAssignedOrders.filter(o => o.status === 'in_transit');
  const arrivedOrders = myAssignedOrders.filter(o => o.status === 'arrived');
  const activeOrders = myAssignedOrders.filter(o => ['assigned', 'picked_up', 'in_transit', 'arrived'].includes(o.status));
  const completedOrders = myAssignedOrders.filter(o => o.status === 'delivered');

  // Available ready farm orders waiting for a courier to claim
  const availableOrders = orders.filter(o =>
    (!o.deliveryId || o.deliveryId === 'Unassigned') &&
    ['confirmed', 'accepted', 'packed'].includes(o.status)
  );

  // Today's completed runs
  const todayCompleted = completedOrders.filter(o => {
    const d = o.deliveryOtpVerifiedAt || o.updatedAt || o.createdAt;
    return d && new Date(d).toDateString() === new Date().toDateString();
  });

  // Shift earnings: Calculated strictly from real persisted deliveries
  const perDeliveryFee = 50; // ₹50 standard logistics payout per completed delivery
  const shiftEarnings = completedOrders.length * perDeliveryFee;

  const handleClaimOrder = async (orderId) => {
    if (!isDriver) {
      showToast('Only registered Delivery Drivers can claim shipments.', 'error');
      return;
    }
    try {
      const res = await orderAPI.assignDriver(orderId);
      if (res.data?.success) {
        showToast('Shipment successfully claimed! Added to your active delivery route.', 'success');
        await fetchDeliveryOrders();
        setDeliverySubTab('assigned');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to claim shipment';
      showToast(msg, 'error');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!isDriver) {
      showToast('Only registered Delivery Drivers can confirm cargo pickups and deliveries.', 'error');
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
      showToast(`Updated shipment status to ${newStatus.toUpperCase()}`, 'success');
      await fetchDeliveryOrders();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not update order';
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
      await new Promise(r => setTimeout(r, 1000));
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
    showToast('⚠️ Demo Safety Beacon Triggered (In-app simulation only — NOT connected to police or 112 emergency services). In a real emergency, dial 112 directly.', 'warning');
    setTimeout(() => setSosActive(false), 5000);
  };

  return (
    <div className="portal-layout" style={{ minHeight: 'calc(100vh - 70px)' }}>
      {/* Desktop Sidebar Navigation */}
      <aside
        className="portal-desktop-sidebar"
        style={{
          width: '260px',
          minWidth: '260px',
          background: 'rgba(18, 14, 8, 0.95)',
          borderRight: '1px solid rgba(244, 201, 93, 0.18)',
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
            <div style={{ marginBottom: '12px' }}>
              <AgriLinkLogo size="sm" showText={true} showBadge={false} interactive={false} />
            </div>
            <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#f4c95d' }}>
              FLEET DISPATCH HUB
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => setActiveNavTab('home')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeNavTab === 'home' ? 'linear-gradient(135deg, #b7835d, #8d5e34)' : 'transparent',
                color: activeNavTab === 'home' ? '#ffffff' : '#a3b899',
                fontWeight: activeNavTab === 'home' ? '700' : '600',
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease'
              }}
            >
              <Home size={18} />
              <span>Fleet Overview</span>
            </button>

            <button
              onClick={() => setActiveNavTab('dispatch')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeNavTab === 'dispatch' ? 'linear-gradient(135deg, #b7835d, #8d5e34)' : 'transparent',
                color: activeNavTab === 'dispatch' ? '#ffffff' : '#a3b899',
                fontWeight: activeNavTab === 'dispatch' ? '700' : '600',
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Truck size={18} />
                <span>Live Deliveries</span>
              </div>
              {activeOrders.length > 0 && (
                <span style={{
                  background: '#f4c95d',
                  color: '#092b27',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '2px 7px',
                  borderRadius: '10px'
                }}>
                  {activeOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveNavTab('map')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeNavTab === 'map' ? 'linear-gradient(135deg, #b7835d, #8d5e34)' : 'transparent',
                color: activeNavTab === 'map' ? '#ffffff' : '#a3b899',
                fontWeight: activeNavTab === 'map' ? '700' : '600',
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease'
              }}
            >
              <Navigation size={18} />
              <span>Waypoint Map</span>
            </button>

            <button
              onClick={() => setActiveNavTab('coldchain')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeNavTab === 'coldchain' ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'transparent',
                color: activeNavTab === 'coldchain' ? '#ffffff' : '#a3b899',
                fontWeight: activeNavTab === 'coldchain' ? '700' : '600',
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease'
              }}
            >
              <Snowflake size={18} color={activeNavTab === 'coldchain' ? '#fff' : '#38bdf8'} />
              <span>3D Cold-Chain</span>
            </button>

            <button
              onClick={() => setActiveNavTab('earnings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeNavTab === 'earnings' ? 'linear-gradient(135deg, #b7835d, #8d5e34)' : 'transparent',
                color: activeNavTab === 'earnings' ? '#ffffff' : '#a3b899',
                fontWeight: activeNavTab === 'earnings' ? '700' : '600',
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease'
              }}
            >
              <DollarSign size={18} />
              <span>Shift Earnings</span>
            </button>
          </div>

          {/* SOS Safety Button (Honestly labeled as in-app simulation) */}
          <button
            onClick={triggerSOS}
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '12px',
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

        {/* Driver Profile Summary */}
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
            background: 'linear-gradient(135deg, #b7835d, #8d5e34)',
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
            <div style={{ color: '#f4c95d', fontSize: '11px', fontWeight: '600' }}>
              ⭐ 4.95 Certified Courier
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="portal-main-content" style={{ flex: 1, padding: 'clamp(14px, 3vw, 24px)', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Top Fleet HUD & Real Performance Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '24px' }}>
          <FleetTelemetryHUD speed={simulating ? 54 : 0} battery={88} satelliteCount={11} />

          {/* Real Persisted Shift Payout */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(20, 16, 10, 0.9), rgba(12, 10, 6, 0.95))',
            border: '1.5px solid rgba(244, 201, 93, 0.35)',
            borderRadius: '20px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#f4c95d" />
                <h3 style={{ margin: 0, color: '#effbe7', fontSize: '16px', fontWeight: '800' }}>Today's Shift Payout</h3>
              </div>
              <button
                onClick={handleRefresh}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#f4c95d',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <RefreshCw size={12} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                <span>Radar Refresh</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '14px 0' }}>
              <span style={{ color: '#37bd78', fontSize: '32px', fontWeight: '900' }}>₹{shiftEarnings}</span>
              <span style={{ color: '#a3c2b0', fontSize: '13px' }}>
                from {completedOrders.length} verified run(s)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(55, 189, 120, 0.2)', color: '#8be28b', fontSize: '11.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px' }}>
                ₹{perDeliveryFee} Payout per Completed Delivery
              </span>
              <span style={{ background: 'rgba(244, 201, 93, 0.2)', color: '#f4c95d', fontSize: '11.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px' }}>
                {todayCompleted.length} Completed Today
              </span>
            </div>
          </div>
        </div>

        {/* 1. Fleet Overview Dashboard Tab */}
        {activeNavTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Operational Summary Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <div style={{ background: 'rgba(20, 16, 10, 0.85)', border: '1px solid rgba(244, 201, 93, 0.25)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ color: '#a3c2b0', fontSize: '12px', fontWeight: '600' }}>My Active Deliveries</div>
                <div style={{ color: '#effbe7', fontSize: '24px', fontWeight: '900', marginTop: '6px' }}>{activeOrders.length}</div>
                <div style={{ color: '#f4c95d', fontSize: '11px', marginTop: '4px' }}>Assigned & in route</div>
              </div>

              <div style={{ background: 'rgba(20, 16, 10, 0.85)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ color: '#a3c2b0', fontSize: '12px', fontWeight: '600' }}>Available to Claim</div>
                <div style={{ color: '#38bdf8', fontSize: '24px', fontWeight: '900', marginTop: '6px' }}>{availableOrders.length}</div>
                <div style={{ color: '#7dd3fc', fontSize: '11px', marginTop: '4px' }}>Ready at farm depots</div>
              </div>

              <div style={{ background: 'rgba(20, 16, 10, 0.85)', border: '1px solid rgba(110, 219, 208, 0.25)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ color: '#a3c2b0', fontSize: '12px', fontWeight: '600' }}>In Transit / Arrived</div>
                <div style={{ color: '#6edbd0', fontSize: '24px', fontWeight: '900', marginTop: '6px' }}>{inTransitOrders.length + arrivedOrders.length}</div>
                <div style={{ color: '#86efac', fontSize: '11px', marginTop: '4px' }}>Approaching doorstep</div>
              </div>

              <div style={{ background: 'rgba(20, 16, 10, 0.85)', border: '1px solid rgba(55, 189, 120, 0.25)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ color: '#a3c2b0', fontSize: '12px', fontWeight: '600' }}>Completed Total</div>
                <div style={{ color: '#37bd78', fontSize: '24px', fontWeight: '900', marginTop: '6px' }}>{completedOrders.length}</div>
                <div style={{ color: '#a7f3d0', fontSize: '11px', marginTop: '4px' }}>OTP authenticated</div>
              </div>
            </div>

            {/* Active Run Quick Card */}
            {activeOrders.length > 0 && (
              <div style={{
                background: 'linear-gradient(145deg, rgba(20, 16, 10, 0.9), rgba(12, 10, 6, 0.95))',
                border: '1.5px solid rgba(244, 201, 93, 0.35)',
                borderRadius: '20px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={20} color="#f4c95d" />
                    <h3 style={{ margin: 0, color: '#effbe7', fontSize: '17px', fontWeight: '800' }}>
                      Current Active Route: #{String(activeOrders[0]._id || activeOrders[0].id).slice(-8).toUpperCase()}
                    </h3>
                  </div>
                  <span style={{
                    background: 'rgba(244, 201, 93, 0.2)',
                    border: '1px solid #f4c95d',
                    color: '#f4c95d',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '800',
                    textTransform: 'uppercase'
                  }}>
                    {activeOrders[0].status?.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ color: '#effbe7', fontSize: '14px', marginBottom: '10px' }}>
                  <strong>Destination:</strong> {activeOrders[0].customerLocation?.address || activeOrders[0].customerAddress || 'Customer Address'}
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActiveNavTab('dispatch')}
                    style={{
                      padding: '9px 16px',
                      background: 'linear-gradient(135deg, #f4c95d, #ffa726)',
                      border: 'none',
                      color: '#092b27',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    Manage Active Deliveries ({activeOrders.length})
                  </button>
                  <button
                    onClick={() => setActiveNavTab('map')}
                    style={{
                      padding: '9px 16px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#effbe7',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Open Live Waypoint Map
                  </button>
                </div>
              </div>
            )}

            {/* Available Pickups Preview */}
            {availableOrders.length > 0 && (
              <div style={{
                background: 'rgba(20, 16, 10, 0.85)',
                border: '1.5px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '20px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, color: '#effbe7', fontSize: '16px', fontWeight: '800' }}>
                    📦 Regional Farm Shipments Ready for Pickup ({availableOrders.length})
                  </h3>
                  <button
                    onClick={() => { setActiveNavTab('dispatch'); setDeliverySubTab('available'); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    View All →
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  {availableOrders.slice(0, 2).map(ord => (
                    <div key={ord._id || ord.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ color: '#f4c95d', fontSize: '11px', fontWeight: '800' }}>#{String(ord._id || ord.id).slice(-8).toUpperCase()}</span>
                        <span style={{ color: '#37bd78', fontSize: '13px', fontWeight: '800' }}>₹{ord.totalAmount}</span>
                      </div>
                      <div style={{ color: '#effbe7', fontSize: '13px', fontWeight: '700' }}>Farm: {ord.farmerName}</div>
                      <div style={{ color: '#a3c2b0', fontSize: '12px', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        To: {ord.customerLocation?.address || ord.customerAddress || 'Customer Destination'}
                      </div>
                      <button
                        onClick={() => handleClaimOrder(String(ord._id || ord.id))}
                        style={{
                          marginTop: '10px',
                          width: '100%',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          border: 'none',
                          color: '#fff',
                          padding: '8px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        Claim & Accept Shipment
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Deliveries Tab (Assigned, Available, Completed) */}
        {activeNavTab === 'dispatch' && (
          <div>
            {/* Sub-tabs header */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setDeliverySubTab('assigned')}
                style={{
                  padding: '9px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(244, 201, 93, 0.4)',
                  background: deliverySubTab === 'assigned' ? 'linear-gradient(135deg, #b7835d, #8d5e34)' : 'rgba(0,0,0,0.3)',
                  color: '#effbe7',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>My Active Deliveries</span>
                <span style={{ background: '#f4c95d', color: '#092b27', fontSize: '11px', fontWeight: '800', padding: '1px 6px', borderRadius: '10px' }}>
                  {activeOrders.length}
                </span>
              </button>

              <button
                onClick={() => setDeliverySubTab('available')}
                style={{
                  padding: '9px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  background: deliverySubTab === 'available' ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(0,0,0,0.3)',
                  color: '#effbe7',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Available Farm Pickups</span>
                <span style={{ background: '#38bdf8', color: '#092b27', fontSize: '11px', fontWeight: '800', padding: '1px 6px', borderRadius: '10px' }}>
                  {availableOrders.length}
                </span>
              </button>

              <button
                onClick={() => setDeliverySubTab('completed')}
                style={{
                  padding: '9px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(55, 189, 120, 0.4)',
                  background: deliverySubTab === 'completed' ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'rgba(0,0,0,0.3)',
                  color: '#effbe7',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Delivery History</span>
                <span style={{ background: '#37bd78', color: '#092b27', fontSize: '11px', fontWeight: '800', padding: '1px 6px', borderRadius: '10px' }}>
                  {completedOrders.length}
                </span>
              </button>
            </div>

            {/* Sub-tab: My Active Deliveries */}
            {deliverySubTab === 'assigned' && (
              <div>
                {activeOrders.length === 0 ? (
                  <div style={{
                    background: 'rgba(20, 16, 10, 0.6)',
                    border: '1px dashed rgba(244, 201, 93, 0.3)',
                    borderRadius: '20px',
                    padding: '60px 20px',
                    textAlign: 'center',
                    color: '#a3b899'
                  }}>
                    <Truck size={48} color="#f4c95d" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ color: '#effbe7', margin: '0 0 8px' }}>No Active Shipments Assigned</h3>
                    <p style={{ margin: '0 0 16px', fontSize: '13.5px' }}>
                      Ready orders from regional farms are available for pickup.
                    </p>
                    <button
                      onClick={() => setDeliverySubTab('available')}
                      style={{
                        padding: '10px 18px',
                        background: 'linear-gradient(135deg, #f4c95d, #ffa726)',
                        border: 'none',
                        color: '#092b27',
                        borderRadius: '10px',
                        fontWeight: '800',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      View Available Farm Pickups ({availableOrders.length})
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    {activeOrders.map(order => {
                      const orderId = String(order._id || order.id);
                      const isCurrentSimulating = simulating && activeOrderId === orderId;

                      return (
                        <div
                          key={orderId}
                          style={{
                            background: 'rgba(20, 16, 10, 0.85)',
                            backdropFilter: 'blur(16px)',
                            border: '1.5px solid rgba(244, 201, 93, 0.3)',
                            borderRadius: '20px',
                            padding: '24px',
                            boxShadow: '0 12px 32px rgba(0,0,0,0.45)'
                          }}
                        >
                          {/* Order Header */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#f4c95d', fontSize: '12px', fontWeight: '800' }}>
                                  SHIPMENT #{orderId.slice(-8).toUpperCase()}
                                </span>
                                <span style={{
                                  background: 'rgba(244, 201, 93, 0.25)',
                                  border: '1px solid #f4c95d',
                                  color: '#f4c95d',
                                  padding: '3px 10px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  textTransform: 'uppercase'
                                }}>
                                  {order.status?.replace('_', ' ')}
                                </span>
                              </div>
                              <div style={{ color: '#effbe7', fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>
                                {order.items?.map(i => `${i.quantity}x ${i.title}`).join(', ') || 'Produce Batch'} • ₹{order.totalAmount}
                              </div>
                            </div>

                            {/* Actions & Simulation */}
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <a
                                href={`tel:${order.customerPhone || '9840012345'}`}
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: '10px',
                                  background: 'rgba(255,255,255,0.08)',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  color: '#effbe7',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  textDecoration: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <Phone size={14} color="#37bd78" />
                                <span>Call Customer</span>
                              </a>

                              <button
                                disabled={simulating}
                                onClick={() => simulateGpsMovement(order)}
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: '10px',
                                  background: isCurrentSimulating ? '#37bd78' : 'linear-gradient(135deg, #f4c95d, #ffa726)',
                                  border: 'none',
                                  color: '#092b27',
                                  fontSize: '12.5px',
                                  fontWeight: '800',
                                  cursor: simulating ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <Play size={14} />
                                <span>{isCurrentSimulating ? '🛰️ Simulating Route...' : 'Simulate Route (Test)'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Pickup & Destination Details */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '16px', background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '12px' }}>
                            <div>
                              <div style={{ color: '#f4c95d', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Farm Pickup Origin</div>
                              <div style={{ color: '#effbe7', fontSize: '13px', fontWeight: '700', marginTop: '2px' }}>{order.farmerName || 'Partner Farm'}</div>
                              <div style={{ color: '#a3c2b0', fontSize: '12px' }}>{order.farmerLocation?.address || 'Regional Depot'}</div>
                            </div>
                            <div>
                              <div style={{ color: '#38bdf8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Customer Destination</div>
                              <div style={{ color: '#effbe7', fontSize: '13px', fontWeight: '700', marginTop: '2px' }}>{order.customerName || 'Customer Residence'}</div>
                              <div style={{ color: '#a3c2b0', fontSize: '12px' }}>{order.customerLocation?.address || order.customerAddress || 'Customer Address'}</div>
                            </div>
                          </div>

                          {/* Live Tracking Map with honest status */}
                          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '18px' }}>
                            <LiveTrackingMap order={order} />
                          </div>

                          {/* Valid Status Progression Bar */}
                          <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '14px',
                            padding: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}>
                            <div style={{ fontSize: '12px', color: '#f4c95d', fontWeight: '800' }}>
                              LOGISTICS WAYPOINT CONTROLS:
                            </div>

                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {/* Step 1: Cargo Picked Up */}
                              <button
                                disabled={order.status !== 'assigned'}
                                onClick={() => handleUpdateStatus(orderId, 'picked_up')}
                                style={{
                                  flex: '1 1 140px',
                                  minHeight: '44px',
                                  padding: '10px 14px',
                                  borderRadius: '10px',
                                  border: '1px solid rgba(255,255,255,0.15)',
                                  background: order.status === 'assigned'
                                    ? 'linear-gradient(135deg, #f4c95d, #ffa726)'
                                    : ['picked_up', 'in_transit', 'arrived', 'delivered'].includes(order.status)
                                      ? 'rgba(55, 189, 120, 0.2)'
                                      : 'rgba(0,0,0,0.3)',
                                  color: order.status === 'assigned' ? '#092b27' : '#effbe7',
                                  fontSize: '12px',
                                  fontWeight: '800',
                                  cursor: order.status === 'assigned' ? 'pointer' : 'default',
                                  opacity: (order.status === 'assigned' || ['picked_up', 'in_transit', 'arrived'].includes(order.status)) ? 1 : 0.4
                                }}
                              >
                                {['picked_up', 'in_transit', 'arrived', 'delivered'].includes(order.status) ? '✓ 1. Picked Up' : '1. Confirm Picked Up'}
                              </button>

                              {/* Step 2: En Route Doorstep */}
                              <button
                                disabled={!['assigned', 'picked_up'].includes(order.status)}
                                onClick={() => handleUpdateStatus(orderId, 'in_transit')}
                                style={{
                                  flex: '1 1 140px',
                                  minHeight: '44px',
                                  padding: '10px 14px',
                                  borderRadius: '10px',
                                  border: '1px solid rgba(255,255,255,0.15)',
                                  background: order.status === 'picked_up'
                                    ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                                    : ['in_transit', 'arrived', 'delivered'].includes(order.status)
                                      ? 'rgba(55, 189, 120, 0.2)'
                                      : 'rgba(0,0,0,0.3)',
                                  color: '#effbe7',
                                  fontSize: '12px',
                                  fontWeight: '800',
                                  cursor: ['assigned', 'picked_up'].includes(order.status) ? 'pointer' : 'default',
                                  opacity: (['assigned', 'picked_up'].includes(order.status) || ['in_transit', 'arrived'].includes(order.status)) ? 1 : 0.4
                                }}
                              >
                                {['in_transit', 'arrived', 'delivered'].includes(order.status) ? '✓ 2. En Route' : '2. Start Transit'}
                              </button>

                              {/* Step 3: Arrived Doorstep */}
                              <button
                                disabled={order.status !== 'in_transit'}
                                onClick={() => handleUpdateStatus(orderId, 'arrived')}
                                style={{
                                  flex: '1 1 140px',
                                  minHeight: '44px',
                                  padding: '10px 14px',
                                  borderRadius: '10px',
                                  border: '1px solid rgba(255,255,255,0.15)',
                                  background: order.status === 'in_transit'
                                    ? 'linear-gradient(135deg, #059669, #047857)'
                                    : ['arrived', 'delivered'].includes(order.status)
                                      ? 'rgba(55, 189, 120, 0.2)'
                                      : 'rgba(0,0,0,0.3)',
                                  color: '#effbe7',
                                  fontSize: '12px',
                                  fontWeight: '800',
                                  cursor: order.status === 'in_transit' ? 'pointer' : 'default',
                                  opacity: (order.status === 'in_transit' || order.status === 'arrived') ? 1 : 0.4
                                }}
                              >
                                {['arrived', 'delivered'].includes(order.status) ? '✓ 3. Arrived' : '3. Mark Arrived'}
                              </button>

                              {/* Step 4: OTP Verification & Delivery Handover */}
                              <button
                                onClick={() => setSelectedHandoverOrder(order)}
                                style={{
                                  flex: '1 1 170px',
                                  minHeight: '44px',
                                  padding: '10px 16px',
                                  borderRadius: '10px',
                                  border: 'none',
                                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                                  color: '#ffffff',
                                  fontSize: '12.5px',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)'
                                }}
                              >
                                <KeyRound size={15} color="#f4c95d" />
                                <span>4. Verify OTP & Deliver</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Sub-tab: Available Farm Pickups */}
            {deliverySubTab === 'available' && (
              <div>
                {availableOrders.length === 0 ? (
                  <div style={{
                    background: 'rgba(20, 16, 10, 0.6)',
                    border: '1px dashed rgba(56, 189, 248, 0.3)',
                    borderRadius: '20px',
                    padding: '60px 20px',
                    textAlign: 'center',
                    color: '#a3b899'
                  }}>
                    <Package size={48} color="#38bdf8" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ color: '#effbe7', margin: '0 0 8px' }}>No Pending Farm Orders Awaiting Drivers</h3>
                    <p style={{ margin: 0, fontSize: '13.5px' }}>
                      All confirmed and packed farm shipments have already been assigned to regional couriers.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '18px' }}>
                    {availableOrders.map(order => {
                      const orderId = String(order._id || order.id);
                      return (
                        <div
                          key={orderId}
                          style={{
                            background: 'rgba(20, 16, 10, 0.85)',
                            border: '1.5px solid rgba(56, 189, 248, 0.35)',
                            borderRadius: '18px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 12px 28px rgba(0,0,0,0.4)'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <span style={{ color: '#f4c95d', fontSize: '12px', fontWeight: '800' }}>
                                ORDER #{orderId.slice(-8).toUpperCase()}
                              </span>
                              <span style={{
                                background: 'rgba(56, 189, 248, 0.2)',
                                border: '1px solid #38bdf8',
                                color: '#7dd3fc',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '10.5px',
                                fontWeight: '800',
                                textTransform: 'uppercase'
                              }}>
                                Ready: {order.status}
                              </span>
                            </div>

                            <div style={{ color: '#effbe7', fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>
                              ₹{order.totalAmount} • {order.items?.length || 1} produce line(s)
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px', marginBottom: '14px', fontSize: '12px' }}>
                              <div style={{ color: '#f4c95d', fontWeight: '700' }}>Pickup Origin:</div>
                              <div style={{ color: '#effbe7' }}>{order.farmerName}</div>
                              <div style={{ color: '#a3c2b0', fontSize: '11px' }}>{order.farmerLocation?.address || 'Farm Origin'}</div>

                              <div style={{ color: '#38bdf8', fontWeight: '700', marginTop: '6px' }}>Destination:</div>
                              <div style={{ color: '#effbe7' }}>{order.customerName}</div>
                              <div style={{ color: '#a3c2b0', fontSize: '11px' }}>{order.customerLocation?.address || order.customerAddress || 'Customer Address'}</div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleClaimOrder(orderId)}
                            style={{
                              width: '100%',
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              border: 'none',
                              color: '#ffffff',
                              padding: '11px',
                              borderRadius: '10px',
                              fontSize: '13px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                            }}
                          >
                            <Truck size={15} />
                            <span>Claim & Accept Shipment</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Sub-tab: Delivery History */}
            {deliverySubTab === 'completed' && (
              <div>
                {completedOrders.length === 0 ? (
                  <div style={{
                    background: 'rgba(20, 16, 10, 0.6)',
                    border: '1px dashed rgba(55, 189, 120, 0.3)',
                    borderRadius: '20px',
                    padding: '60px 20px',
                    textAlign: 'center',
                    color: '#a3b899'
                  }}>
                    <CheckCircle2 size={48} color="#37bd78" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ color: '#effbe7', margin: '0 0 8px' }}>No Completed Deliveries Yet</h3>
                    <p style={{ margin: 0, fontSize: '13.5px' }}>
                      Orders delivered and authenticated with customer handover OTP will appear in this ledger.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {completedOrders.map(order => {
                      const orderId = String(order._id || order.id);
                      return (
                        <div
                          key={orderId}
                          style={{
                            background: 'rgba(20, 16, 10, 0.85)',
                            border: '1px solid rgba(55, 189, 120, 0.3)',
                            borderRadius: '16px',
                            padding: '16px 20px',
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
                                #{orderId.slice(-8).toUpperCase()}
                              </span>
                              <span style={{
                                background: 'rgba(55, 189, 120, 0.2)',
                                border: '1px solid #37bd78',
                                color: '#8be28b',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '10.5px',
                                fontWeight: '800'
                              }}>
                                ✓ OTP Authenticated
                              </span>
                            </div>
                            <div style={{ color: '#effbe7', fontSize: '14px', fontWeight: '700', marginTop: '4px' }}>
                              {order.items?.map(i => `${i.quantity}x ${i.title}`).join(', ') || 'Fresh Produce'}
                            </div>
                            <div style={{ color: '#a3c2b0', fontSize: '12px', marginTop: '2px' }}>
                              Delivered to: {order.customerLocation?.address || order.customerAddress || 'Customer Address'}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#37bd78', fontSize: '18px', fontWeight: '900' }}>
                              +₹{perDeliveryFee}
                            </div>
                            <div style={{ color: '#a3c2b0', fontSize: '11px', marginTop: '2px' }}>
                              {order.deliveryOtpVerifiedAt
                                ? new Date(order.deliveryOtpVerifiedAt).toLocaleDateString()
                                : 'Completed'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. Turn-by-Turn Waypoint Map Tab */}
        {activeNavTab === 'map' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <h2 style={{ color: '#effbe7', fontSize: '22px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Navigation size={22} color="#f4c95d" />
                <span>Turn-by-Turn Delivery Waypoint</span>
              </h2>
              <p style={{ color: '#a3b899', fontSize: '13px', margin: '4px 0 0 0' }}>
                Live GPS telemetry, farm gate routing, and customer destination guidance.
              </p>
            </div>

            {activeOrders.length === 0 ? (
              <div style={{
                background: 'rgba(20, 16, 10, 0.6)',
                border: '1px dashed rgba(244, 201, 93, 0.3)',
                borderRadius: '20px',
                padding: '60px 20px',
                textAlign: 'center',
                color: '#a3b899'
              }}>
                <Truck size={48} color="#f4c95d" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ color: '#effbe7', margin: '0 0 8px' }}>No Active Route in Progress</h3>
                <p style={{ margin: 0, fontSize: '13.5px' }}>
                  Claim an available shipment from the Deliveries tab to activate turn-by-turn guidance.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ borderRadius: '18px', overflow: 'hidden', border: '1.5px solid rgba(244, 201, 93, 0.35)', boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}>
                  <LiveTrackingMap order={activeOrders[0]} />
                </div>

                <div style={{
                  background: 'rgba(20, 16, 10, 0.85)',
                  border: '1.5px solid rgba(244, 201, 93, 0.3)',
                  borderRadius: '18px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#f4c95d', fontSize: '12px', fontWeight: '800' }}>
                      CURRENT ACTIVE DESTINATION
                    </span>
                    <span style={{ background: 'rgba(244, 201, 93, 0.2)', color: '#f4c95d', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
                      {activeOrders[0].status?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ color: '#effbe7', fontSize: '15px', fontWeight: '700' }}>
                    {activeOrders[0].customerLocation?.address || activeOrders[0].customerAddress || 'Customer Address, Mandya Region'}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <a
                      href={`tel:${activeOrders[0].customerPhone || '9840012345'}`}
                      style={{
                        flex: 1,
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: 'rgba(55, 189, 120, 0.2)',
                        border: '1px solid #37bd78',
                        color: '#8be28b',
                        borderRadius: '12px',
                        fontSize: '13.5px',
                        fontWeight: '800',
                        textDecoration: 'none'
                      }}
                    >
                      <Phone size={16} />
                      <span>Call Customer</span>
                    </a>

                    <button
                      onClick={() => setSelectedHandoverOrder(activeOrders[0])}
                      style={{
                        flex: 1,
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: 'linear-gradient(135deg, #2e7d32, #1b5e20)',
                        border: 'none',
                        color: '#ffffff',
                        borderRadius: '12px',
                        fontSize: '13.5px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      <KeyRound size={16} color="#f4c95d" />
                      <span>Verify Handover OTP</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. 3D Cold-Chain Chamber Tab */}
        {activeNavTab === 'coldchain' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <h2 style={{ color: '#effbe7', fontSize: '22px', fontWeight: '800', margin: 0 }}>
              3D Cold-Chain Chamber (Interactive WebGL Simulation)
            </h2>
            <ColdChainTelemetry3D
              temp={4.1}
              humidity={89}
              onBoostCryo={() => showToast('❄️ Simulated Cryo-Chill Boost activated (demo temperature drop to 2.8°C).', 'info')}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'rgba(20, 16, 10, 0.85)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '20px' }}>
                <h4 style={{ color: '#7dd3fc', margin: '0 0 8px 0', fontSize: '15px' }}>Perishable Containment Chamber</h4>
                <p style={{ color: '#c0d9cb', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                  Educational WebGL representation of refrigerated cargo containment. IoT hardware probe integration pending.
                </p>
              </div>
              <div style={{ background: 'rgba(20, 16, 10, 0.85)', border: '1px solid rgba(74, 222, 128, 0.3)', borderRadius: '16px', padding: '20px' }}>
                <h4 style={{ color: '#86efac', margin: '0 0 8px 0', fontSize: '15px' }}>Freshness Retention Standard</h4>
                <p style={{ color: '#c0d9cb', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                  Insulated thermal containment ensures fresh harvest from farm gate reaches customer without spoilage.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. Shift Earnings Tab */}
        {activeNavTab === 'earnings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: 'rgba(20, 16, 10, 0.85)',
              border: '1.5px solid rgba(244, 201, 93, 0.35)',
              borderRadius: '20px',
              padding: '24px'
            }}>
              <h3 style={{ color: '#effbe7', fontSize: '20px', margin: '0 0 16px' }}>Shift Payout Ledger</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ color: '#a3b899', fontSize: '12px' }}>Total Shift Balance</div>
                  <div style={{ color: '#37bd78', fontSize: '26px', fontWeight: '900', marginTop: '4px' }}>₹{shiftEarnings}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ color: '#a3b899', fontSize: '12px' }}>Verified Deliveries</div>
                  <div style={{ color: '#effbe7', fontSize: '26px', fontWeight: '900', marginTop: '4px' }}>{completedOrders.length}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ color: '#a3b899', fontSize: '12px' }}>Rate per Completed Delivery</div>
                  <div style={{ color: '#f4c95d', fontSize: '26px', fontWeight: '900', marginTop: '4px' }}>₹{perDeliveryFee}</div>
                </div>
              </div>

              <h4 style={{ color: '#effbe7', fontSize: '15px', margin: '0 0 12px' }}>Persisted Delivery Records</h4>
              {completedOrders.length === 0 ? (
                <div style={{ color: '#a3c2b0', fontSize: '13px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                  No completed deliveries recorded yet for this driver. Completed deliveries with verified customer handover OTP will automatically appear here.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {completedOrders.map(o => (
                    <div key={o._id || o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '10px' }}>
                      <div>
                        <div style={{ color: '#f4c95d', fontSize: '12px', fontWeight: '700' }}>#{String(o._id || o.id).slice(-8).toUpperCase()}</div>
                        <div style={{ color: '#effbe7', fontSize: '13px' }}>{o.customerLocation?.address || o.customerAddress || 'Customer Destination'}</div>
                      </div>
                      <div style={{ color: '#37bd78', fontWeight: '900', fontSize: '16px' }}>+₹{perDeliveryFee}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. Driver Profile Tab */}
        {activeNavTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ color: '#effbe7', fontSize: '22px', fontWeight: '800', margin: 0 }}>
              Fleet Operator Profile
            </h2>

            <div style={{
              background: 'rgba(20, 16, 10, 0.85)',
              border: '1.5px solid rgba(244, 201, 93, 0.3)',
              borderRadius: '20px',
              padding: '22px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #b7835d, #8d5e34)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#effbe7',
                  fontWeight: '900',
                  fontSize: '22px',
                  boxShadow: '0 0 20px rgba(183, 131, 93, 0.4)'
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
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '12px' }}>
                  <div style={{ color: '#a3b899', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Phone</div>
                  <div style={{ color: '#effbe7', fontSize: '13px', fontWeight: '600', marginTop: '3px' }}>{user?.phone || '+91 98400 12345'}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '12px' }}>
                  <div style={{ color: '#a3b899', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Email</div>
                  <div style={{ color: '#effbe7', fontSize: '13px', fontWeight: '600', marginTop: '3px' }}>{user?.email || 'driver@agrilink.in'}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '12px' }}>
                  <div style={{ color: '#a3b899', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Deliveries Completed</div>
                  <div style={{ color: '#37bd78', fontSize: '14px', fontWeight: '800', marginTop: '3px' }}>{completedOrders.length} Shift Dispatches</div>
                </div>
              </div>

              {/* SOS Emergency Button with Honest Warning */}
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

        {/* 3D Customer Handover OTP Modal */}
        <OtpHandoverModal
          isOpen={Boolean(selectedHandoverOrder)}
          order={selectedHandoverOrder}
          onClose={() => setSelectedHandoverOrder(null)}
          onConfirmDelivery={(id) => handleUpdateStatus(id, 'delivered')}
        />
      </main>

      {/* Mobile Bottom Navigation Bar (Home | Deliveries | Map | Earnings | Profile) */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-btn ${activeNavTab === 'home' ? 'active' : ''}`}
          onClick={() => {
            setActiveNavTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Home size={20} />
          <span>Home</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeNavTab === 'dispatch' ? 'active' : ''}`}
          onClick={() => {
            setActiveNavTab('dispatch');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Truck size={20} />
            {activeOrders.length > 0 && <span className="mobile-nav-badge">{activeOrders.length}</span>}
          </div>
          <span>Deliveries</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeNavTab === 'map' ? 'active' : ''}`}
          onClick={() => {
            setActiveNavTab('map');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Navigation size={20} />
          <span>Map</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeNavTab === 'earnings' ? 'active' : ''}`}
          onClick={() => {
            setActiveNavTab('earnings');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <DollarSign size={20} />
          <span>Earnings</span>
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
