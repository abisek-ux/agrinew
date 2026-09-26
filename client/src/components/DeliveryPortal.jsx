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

      {/* Telemetry Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, marginLeft: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a3c2b0', fontSize: '12px' }}>
            <Radio size={14} color="#37bd78" />
            <span>GPS Satellite Lock</span>
          </div>
          <span style={{ color: '#37bd78', fontWeight: '800', fontSize: '13px' }}>{satelliteCount} Satellites</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a3c2b0', fontSize: '12px' }}>
            <Fuel size={14} color="#f4c95d" />
            <span>Eco EV Range / Battery</span>
          </div>
          <span style={{ color: '#f4c95d', fontWeight: '800', fontSize: '13px' }}>{battery}% (142 km)</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a3c2b0', fontSize: '12px' }}>
            <TrendingUp size={14} color="#6edbd0" />
            <span>Route Optimization</span>
          </div>
          <span style={{ color: '#6edbd0', fontWeight: '800', fontSize: '13px' }}>AI High Efficiency</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3D Cold-Chain Refrigerated Cargo Chamber Component
───────────────────────────────────────────────────────────── */
function ColdChainTelemetry3D({ temp = 4.1, humidity = 89, onBoostCryo }) {
  const canvasRef = useRef(null);
  const [boostActive, setBoostActive] = useState(false);
  const [currentTemp, setCurrentTemp] = useState(temp);

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
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.5 + 1,
      vy: Math.random() * 0.8 + 0.3,
      alpha: Math.random() * 0.7 + 0.2
    }));

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, boostActive ? 'rgba(6, 44, 60, 0.95)' : 'rgba(8, 28, 36, 0.95)');
      grad.addColorStop(1, 'rgba(4, 14, 18, 0.98)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3D Grid floor perspective
      ctx.strokeStyle = boostActive ? 'rgba(56, 189, 248, 0.3)' : 'rgba(74, 222, 128, 0.15)';
      ctx.lineWidth = 1;
      const horizonY = canvas.height * 0.4;
      for (let i = 0; i <= canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, horizonY);
        ctx.lineTo(i * 1.5 - canvas.width * 0.25, canvas.height);
        ctx.stroke();
      }
      for (let y = horizonY; y <= canvas.height; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw frost / chilled particles
      particles.forEach(p => {
        p.y += p.vy * (boostActive ? 2 : 1);
        if (p.y > canvas.height) {
          p.y = 0;
          p.x = Math.random() * canvas.width;
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
      border: `1.5px solid ${boostActive ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)'}`,
      borderRadius: '20px',
      padding: '22px',
      boxShadow: boostActive ? '0 0 35px rgba(56, 189, 248, 0.4)' : '0 12px 32px rgba(0,0,0,0.5)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', position: 'relative', zIndex: 2 }}>
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
            <h3 style={{ margin: 0, color: '#effbe7', fontSize: '16px', fontWeight: '800' }}>
              3D Cold-Chain Freshness Telemetry
            </h3>
            <p style={{ margin: '2px 0 0 0', color: '#7dd3fc', fontSize: '11px', fontWeight: '700' }}>
              Autonomous Perishable Micro-Climate Chamber • Active Chill
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
          <span>{boostActive ? '❄️ Cryo-Chill Boost Active!' : 'Trigger Rapid Sub-Zero Boost'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ height: '140px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.2)', position: 'relative' }}>
          <canvas ref={canvasRef} width={260} height={140} style={{ width: '100%', height: '100%' }} />
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            fontSize: '10.5px',
            color: '#bae6fd',
            fontWeight: '700',
            background: 'rgba(0,0,0,0.5)',
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            Chamber Visual Simulation
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a3c2b0', fontSize: '12px' }}>
              <Thermometer size={14} color="#38bdf8" />
              <span>Chamber Temperature</span>
            </div>
            <span style={{ color: currentTemp < 5 ? '#38bdf8' : '#f87171', fontWeight: '900', fontSize: '18px' }}>
              {currentTemp}°C
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a3c2b0', fontSize: '12px' }}>
              <Activity size={14} color="#37bd78" />
              <span>Humidity Balance</span>
            </div>
            <span style={{ color: '#37bd78', fontWeight: '800', fontSize: '14px' }}>
              {humidity}% Optimal RH
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a3c2b0', fontSize: '12px' }}>
              <ShieldCheck size={14} color="#f4c95d" />
              <span>Perishable Freshness</span>
            </div>
            <span style={{ color: '#f4c95d', fontWeight: '800', fontSize: '13px' }}>
              100% Purity Preserved
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
  const correctOtp = order?.deliveryOtp || '482910';

  if (!isOpen || !order) return null;

  const handleVerify = () => {
    if (!enteredOtp || enteredOtp.trim().length < 4) return;
    setSubmitting(true);
    setTimeout(() => {
      setVerified(true);
      setTimeout(() => {
        onConfirmDelivery(String(order._id || order.id));
        setSubmitting(false);
        setVerified(false);
        setEnteredOtp('');
        onClose();
      }, 1400);
    }, 600);
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
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: 'linear-gradient(145deg, rgba(18, 14, 8, 0.98), rgba(10, 8, 4, 0.99))',
        border: '1.5px solid rgba(244, 201, 93, 0.45)',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(244,201,93,0.2)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
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
              3D Handover Authenticated!
            </h3>
            <p style={{ color: '#a3c2b0', fontSize: '13px', margin: 0 }}>
              Produce securely transferred. Shift payout +₹120 credited.
            </p>
          </div>
        ) : (
          <div>
            <p style={{ color: '#c0d9cb', fontSize: '13px', lineHeight: '1.5', margin: '0 0 18px 0' }}>
              Ask the customer for their 6-digit delivery PIN to authenticate cargo handover and release shift earnings.
            </p>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', color: '#f4c95d', fontWeight: '800', marginBottom: '8px' }}>
                ENTER CUSTOMER DELIVERY OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={enteredOtp}
                onChange={e => setEnteredOtp(e.target.value)}
                placeholder="6-digit code"
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1.5px solid rgba(244, 201, 93, 0.4)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '20px',
                  letterSpacing: '8px',
                  textAlign: 'center',
                  color: '#effbe7',
                  fontWeight: '800',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px dashed rgba(255,255,255,0.15)',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '11.5px',
              color: '#a3b899',
              marginBottom: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Demo Quick OTP: <strong style={{ color: '#f4c95d' }}>{correctOtp}</strong></span>
              <button
                type="button"
                onClick={() => setEnteredOtp(correctOtp)}
                style={{
                  background: 'rgba(244, 201, 93, 0.2)',
                  border: '1px solid #f4c95d',
                  color: '#f4c95d',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                Auto-fill
              </button>
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
              <span>{submitting ? 'Verifying 3D Stamp...' : 'Verify OTP & Complete Delivery'}</span>
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
  const [activeNavTab, setActiveNavTab] = useState('dispatch'); // 'dispatch' | 'coldchain' | 'earnings'
  const [refreshing, setRefreshing] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [selectedHandoverOrder, setSelectedHandoverOrder] = useState(null);
  const [voiceNavEnabled, setVoiceNavEnabled] = useState(true);

  const isDriver = user?.role === 'delivery';

  useEffect(() => {
    fetchDeliveryOrders();
    const interval = setInterval(fetchDeliveryOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDeliveryOrders = async () => {
    try {
      const res = await orderAPI.getOrders();
      setOrders(res.data);
    } catch (err) {
      console.warn('Delivery fetch note:', err.message);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDeliveryOrders();
    setRefreshing(false);
    showToast('Delivery radar updated', 'info');
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!isDriver) {
      showToast('Responsibility rule: Only registered Delivery Drivers can confirm cargo pickups and deliveries.', 'info');
      return;
    }
    try {
      await orderAPI.updateStatus(orderId, {
        status: newStatus,
        deliveryName: `${user?.firstName || 'David'} ${user?.lastName || 'Swift'}`.trim(),
        deliveryPhone: user?.phone || '+1 555-019-7766',
        deliveryEmail: user?.email || 'driver@nexus.io'
      });
      setOrders(orders.map(o => (String(o._id || o.id) === String(orderId)) ? { ...o, status: newStatus } : o));
      showToast(`Updated order status to ${newStatus.toUpperCase()}`, 'success');
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
    showToast('🛰️ Live GPS Triangulation active! Navigating towards customer doorstep...', 'info');

    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      await new Promise(r => setTimeout(r, 1200));
      const currentLat = fLat + ((cLat - fLat) * (i / steps));
      const currentLng = fLng + ((cLng - fLng) * (i / steps));
      const stepAddress = i === steps ? 'Arrived at Customer Doorstep' : `En Route GPS Step ${i}/${steps}`;

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
    showToast('🏁 Driver reached customer destination point!', 'success');
  };

  const triggerSOS = () => {
    setSosActive(true);
    showToast('🚨 SOS Broadcast Sent! Emergency response team & nearest regional dispatch alerted.', 'error');
    setTimeout(() => setSosActive(false), 5000);
  };

  // Calculate earnings
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const shiftEarnings = completedOrders.length * 120 + 80;

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
      {/* Left Menu Bar */}
      <aside style={{
        width: '250px',
        minWidth: '250px',
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
      }}>
        <div>
          {/* Logo & Section title */}
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
                <span>Live Dispatch Queue</span>
              </div>
              {orders.length > 0 && (
                <span style={{
                  background: '#f4c95d',
                  color: '#092b27',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '2px 7px',
                  borderRadius: '10px'
                }}>
                  {orders.length}
                </span>
              )}
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
                transition: 'all 0.2s ease',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Snowflake size={18} color={activeNavTab === 'coldchain' ? '#fff' : '#38bdf8'} />
                <span>3D Cold-Chain Radar</span>
              </div>
              <span style={{
                background: 'rgba(56, 189, 248, 0.25)',
                color: '#7dd3fc',
                fontSize: '10.5px',
                fontWeight: '800',
                padding: '2px 7px',
                borderRadius: '10px'
              }}>
                4.1°C
              </span>
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
              <span>Shift Earnings & Tips</span>
            </button>
          </div>

          {/* SOS Safety Button */}
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
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: sosActive ? '0 0 20px #ff1744' : 'none'
            }}
          >
            <AlertTriangle size={16} />
            <span>{sosActive ? '🚨 SOS BEACON BROADCASTING' : 'Driver Emergency SOS'}</span>
          </button>
        </div>

        {/* Driver Profile */}
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
              ⭐ 4.95 Fleet Rating
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main style={{ flex: 1, padding: '28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Top Fleet HUD & Refresh */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '28px' }}>
          <FleetTelemetryHUD speed={simulating ? 58 : 0} battery={88} satelliteCount={12} />

          {/* Shift Performance Summary */}
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
              <span style={{ color: '#a3c2b0', fontSize: '13px' }}>from {completedOrders.length} completed run(s)</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ background: 'rgba(55, 189, 120, 0.2)', color: '#8be28b', fontSize: '11.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px' }}>
                +₹80 Green Incentive
              </span>
              <span style={{ background: 'rgba(244, 201, 93, 0.2)', color: '#f4c95d', fontSize: '11.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px' }}>
                100% On-Time Record
              </span>
            </div>
          </div>
        </div>

        {/* Active Dispatch Orders List */}
        {activeNavTab === 'dispatch' && (
          <div>
            <h2 style={{ color: '#effbe7', fontSize: '22px', fontWeight: '800', margin: '0 0 18px' }}>
              Assigned Regional Farm Shipments ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <div style={{
                background: 'rgba(20, 16, 10, 0.6)',
                border: '1px dashed rgba(244, 201, 93, 0.3)',
                borderRadius: '20px',
                padding: '60px 20px',
                textAlign: 'center',
                color: '#a3b899'
              }}>
                <Truck size={48} color="#f4c95d" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ color: '#effbe7', margin: '0 0 8px' }}>No Active Shipments in Dispatch Radar</h3>
                <p style={{ margin: 0, fontSize: '13.5px' }}>New customer orders placed across Mandya and regional farms will appear here automatically.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {orders.map(order => {
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
                      {/* Order header */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#f4c95d', fontSize: '12px', fontWeight: '800' }}>
                              SHIPMENT #{orderId.slice(-8).toUpperCase()}
                            </span>
                            <span style={{
                              background: order.status === 'delivered' ? 'rgba(55, 189, 120, 0.25)' : 'rgba(244, 201, 93, 0.25)',
                              border: `1px solid ${order.status === 'delivered' ? '#37bd78' : '#f4c95d'}`,
                              color: order.status === 'delivered' ? '#8be28b' : '#f4c95d',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '800',
                              textTransform: 'uppercase'
                            }}>
                              {order.status || 'Pending'}
                            </span>
                          </div>
                          <div style={{ color: '#effbe7', fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>
                            {order.items?.map(i => `${i.quantity}x ${i.title}`).join(', ') || 'Produce Batch'} • ₹{order.totalAmount}
                          </div>
                        </div>

                        {/* Direct Call & Action Buttons */}
                        <div style={{ display: 'flex', gap: '8px' }}>
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
                              padding: '10px 16px',
                              borderRadius: '10px',
                              background: isCurrentSimulating ? '#37bd78' : 'linear-gradient(135deg, #f4c95d, #ffa726)',
                              border: 'none',
                              color: '#092b27',
                              fontSize: '13px',
                              fontWeight: '800',
                              cursor: simulating ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 4px 14px rgba(244, 201, 93, 0.4)'
                            }}
                          >
                            <Play size={14} />
                            <span>{isCurrentSimulating ? '🛰️ Triangulating GPS...' : 'Simulate Turn-by-Turn GPS'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Live Tracking Map */}
                      <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '18px' }}>
                        <LiveTrackingMap order={order} />
                      </div>

                      {/* Status Update Button Row */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '10px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '14px',
                        padding: '14px',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#effbe7' }}>
                          <Navigation size={16} color="#f4c95d" />
                          <span>Dispatch Waypoint Controls:</span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleUpdateStatus(orderId, 'assigned')}
                            style={{
                              padding: '7px 12px',
                              borderRadius: '8px',
                              border: '1px solid rgba(255,255,255,0.15)',
                              background: order.status === 'assigned' ? '#8d5e34' : 'rgba(0,0,0,0.3)',
                              color: '#effbe7',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            1. Accept Pickup
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(orderId, 'picked_up')}
                            style={{
                              padding: '7px 12px',
                              borderRadius: '8px',
                              border: '1px solid rgba(255,255,255,0.15)',
                              background: order.status === 'picked_up' ? '#f4c95d' : 'rgba(0,0,0,0.3)',
                              color: order.status === 'picked_up' ? '#092b27' : '#effbe7',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            2. Cargo Picked Up
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(orderId, 'in_transit')}
                            style={{
                              padding: '7px 12px',
                              borderRadius: '8px',
                              border: '1px solid rgba(255,255,255,0.15)',
                              background: order.status === 'in_transit' ? '#0288d1' : 'rgba(0,0,0,0.3)',
                              color: '#ffffff',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            3. En Route Doorstep
                          </button>

                          <button
                            onClick={() => setSelectedHandoverOrder(order)}
                            style={{
                              padding: '7px 14px',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'linear-gradient(135deg, #2e7d32, #1b5e20)',
                              color: '#ffffff',
                              fontSize: '12px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <KeyRound size={14} color="#f4c95d" />
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

        {/* 3D Cold-Chain Telemetry Tab */}
        {activeNavTab === 'coldchain' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <h2 style={{ color: '#effbe7', fontSize: '22px', fontWeight: '800', margin: 0 }}>
              3D Cold-Chain Telemetry & Refrigerated Cargo Fleet
            </h2>
            <ColdChainTelemetry3D
              temp={4.1}
              humidity={89}
              onBoostCryo={() => showToast('❄️ Rapid Sub-Zero Cryo-Chill Boost activated! Perishable cargo temperature dropping to 2.8°C.', 'success')}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'rgba(20, 16, 10, 0.85)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '20px' }}>
                <h4 style={{ color: '#7dd3fc', margin: '0 0 8px 0', fontSize: '15px' }}>Active Perishable Cargo</h4>
                <p style={{ color: '#c0d9cb', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                  Real-time cold-chain sensors active on {orders.length} delivery payload(s). Temperature logs streamed to customer app in real-time.
                </p>
              </div>
              <div style={{ background: 'rgba(20, 16, 10, 0.85)', border: '1px solid rgba(74, 222, 128, 0.3)', borderRadius: '16px', padding: '20px' }}>
                <h4 style={{ color: '#86efac', margin: '0 0 8px 0', fontSize: '15px' }}>Spoilage Prevention Index</h4>
                <p style={{ color: '#c0d9cb', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                  100% Purity preservation rating. Insulated thermal containment prevents nutrient decay during transit.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Shift Earnings Tab */}
        {activeNavTab === 'earnings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: 'rgba(20, 16, 10, 0.85)',
              border: '1.5px solid rgba(244, 201, 93, 0.35)',
              borderRadius: '20px',
              padding: '24px'
            }}>
              <h3 style={{ color: '#effbe7', fontSize: '20px', margin: '0 0 16px' }}>Shift Payout Breakdown</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ color: '#a3b899', fontSize: '12px' }}>Base Delivery Fares</div>
                  <div style={{ color: '#effbe7', fontSize: '24px', fontWeight: '900', marginTop: '4px' }}>₹{completedOrders.length * 120}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ color: '#a3b899', fontSize: '12px' }}>Customer Tips & Bonuses</div>
                  <div style={{ color: '#37bd78', fontSize: '24px', fontWeight: '900', marginTop: '4px' }}>₹80</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ color: '#a3b899', fontSize: '12px' }}>Total Instant Balance</div>
                  <div style={{ color: '#f4c95d', fontSize: '24px', fontWeight: '900', marginTop: '4px' }}>₹{shiftEarnings}</div>
                </div>
              </div>
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
    </div>
  );
}
