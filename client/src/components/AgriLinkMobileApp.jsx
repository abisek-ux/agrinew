import React, { useState, useEffect, useRef } from 'react';
import {
  Sprout, ShoppingBag, Truck, Sparkles, Activity, Layers, RotateCw, ZoomIn, ZoomOut,
  Droplets, Sun, Wind, ShieldCheck, Heart, Mic, MicOff, Volume2, VolumeX, Smartphone,
  ChevronRight, CheckCircle2, AlertTriangle, ArrowRight, X, Phone, DollarSign, BarChart3,
  Scan, RefreshCw, Navigation, MapPin, Zap, Info, Play, Pause, Maximize2, Filter,
  Search, Award, Compass, ArrowLeft, ArrowUpRight, TrendingUp, Calendar, Clock,
  CreditCard, QrCode, Cpu, Radio, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { productAPI, aiAPI, orderAPI } from '../services/api';
import AgriLinkLogo from './AgriLinkLogo';
import {
  playHapticTone,
  CropDoctor3DCanvas,
  WeatherSphere3DCanvas,
  ColdChainVan3DCanvas,
  Produce3DCanvas
} from './ThreeDCanvases';

export {
  playHapticTone,
  CropDoctor3DCanvas,
  WeatherSphere3DCanvas,
  ColdChainVan3DCanvas,
  Produce3DCanvas
};
/* ─────────────────────────────────────────────────────────────
   2. MAIN AGRI-LINK MOBILE APPLICATION SUITE
   ───────────────────────────────────────────────────────────── */

export default function AgriLinkMobileApp({
  onClose,
  initialRole = 'customer',
  onSelectRole = null
}) {
  const { user, logout } = useAuth();
  const { t, currentLanguage, changeLanguage } = useLanguage();

  // Active Bottom Dock Tab
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'ar_studio' | 'logistics' | 'wallet' | 'profile'

  // Dynamic Island Alert Pill state
  const [islandAlertIndex, setIslandAlertIndex] = useState(0);
  const islandAlerts = [
    { icon: '🌾', text: 'Daily Harvest: Suresh listed 400kg Organic Tomatoes', color: '#34d399' },
    { icon: '🚚', text: 'Cold-Chain Van #AL-802 at 2.4 km (ETA 12m)', color: '#38bdf8' },
    { icon: '☀️', text: 'Agronomy Alert: High humidity, ideal for neem spray', color: '#fbbf24' },
    { icon: '📈', text: 'APMC Mandi: Wheat up +4.2% across North Zone', color: '#a7f3d0' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIslandAlertIndex((prev) => (prev + 1) % islandAlerts.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [islandAlerts.length]);

  // Audio / Sound FX toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 3D Crop Doctor State
  const [selectedDisease, setSelectedDisease] = useState('blight'); // 'blight' | 'rust' | 'mildew'
  const [isSpraying, setIsSpraying] = useState(false);
  const [cropViewMode, setCropViewMode] = useState('realistic'); // 'realistic' | 'heatmap' | 'wireframe'

  // Voice AI Assistant State
  const [showVoiceDrawer, setShowVoiceDrawer] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceAnswer, setVoiceAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Mobile Device Simulator Frame Mode (for desktop view testing)
  const [isDeviceFrameMode, setIsDeviceFrameMode] = useState(false);

  // Live APMC Mandi Rates Sample Data
  const mandiRates = [
    { crop: 'Desi Wheat (Sharbati)', mandi: 'Karnal APMC', price: '₹2,680 / qtl', change: '+3.8%', trend: 'up' },
    { crop: 'Hybrid Red Tomato', mandi: 'Nashik APMC', price: '₹1,950 / qtl', change: '+5.4%', trend: 'up' },
    { crop: 'Basmati Rice (1121)', mandi: 'Amritsar APMC', price: '₹4,320 / qtl', change: '-1.2%', trend: 'down' },
    { crop: 'Nashik Red Onion', mandi: 'Lasalgaon APMC', price: '₹1,820 / qtl', change: '+2.1%', trend: 'up' },
    { crop: 'Bt Cotton Long Staple', mandi: 'Rajkot APMC', price: '₹7,150 / qtl', change: '+0.8%', trend: 'up' }
  ];

  // Daily Farm Stories / Harvest Reels
  const farmStories = [
    { id: 1, farmer: 'Suresh Kumar', farm: 'Green Valley Organic', crop: 'Tomatoes', avatar: '👨‍🌾', unread: true },
    { id: 2, farmer: 'Maya Patel', farm: 'Sahyadri Honeycomb', crop: 'Wild Honey', avatar: '👩‍🌾', unread: true },
    { id: 3, farmer: 'Rameshwar', farm: 'Punjab Golden Fields', crop: 'Wheat Grains', avatar: '🚜', unread: false },
    { id: 4, farmer: 'Ananya Roy', farm: 'Darjeeling Berries', crop: 'Hydroponic', avatar: '🌿', unread: false }
  ];

  // Mobile Marketplace Products
  const [products, setProducts] = useState([
    {
      id: 'p1',
      title: 'Farm-Fresh Vine Tomatoes',
      price: '₹38 / kg',
      farmer: 'Suresh Kumar',
      distance: '3.2 km away',
      harvestAge: 'Harvested 3h ago',
      rating: 4.9,
      type: 'tomato',
      stock: '180 kg left'
    },
    {
      id: 'p2',
      title: 'Golden Sharbati Wheat',
      price: '₹45 / kg',
      farmer: 'Rameshwar Singh',
      distance: '6.8 km away',
      harvestAge: 'Harvested Yesterday',
      rating: 4.8,
      type: 'grain',
      stock: '650 kg left'
    },
    {
      id: 'p3',
      title: 'Crisp Organic Fuji Apples',
      price: '₹140 / kg',
      farmer: 'Kinnaur Orchards',
      distance: 'Next Day Logistics',
      harvestAge: 'Grade-A Export',
      rating: 5.0,
      type: 'apple',
      stock: '95 kg left'
    }
  ]);

  // Cart & Order tracking demo state
  const [cartCount, setCartCount] = useState(2);
  const [selectedProduct3D, setSelectedProduct3D] = useState(null);

  // Mandi Profit Calculator States
  const [calcAcreage, setCalcAcreage] = useState(5);
  const [calcCrop, setCalcCrop] = useState('wheat');
  const [estimatedProfit, setEstimatedProfit] = useState(94500);

  useEffect(() => {
    const basePerAcre = calcCrop === 'wheat' ? 18900 : calcCrop === 'tomato' ? 34200 : 26500;
    setEstimatedProfit(calcAcreage * basePerAcre);
  }, [calcAcreage, calcCrop]);

  // Voice AI prompt submission
  const handleVoiceSubmit = async (queryText) => {
    const prompt = queryText || voiceQuery;
    if (!prompt.trim()) return;
    setIsAiThinking(true);
    setVoiceAnswer('');

    if (soundEnabled) playHapticTone(600, 'triangle', 0.1);

    try {
      const res = await aiAPI.askAgriLinkAi({ query: prompt, context: 'mobile_quick_assistant' });
      const answer = res.data?.answer || res.data?.response || 'Optimal agricultural conditions detected. Recommended treatment: apply bio-fungicide at 2ml/L water.';
      setVoiceAnswer(answer);

      // Speak answer using Web Speech API if supported
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(answer.substring(0, 160));
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      setVoiceAnswer('AgriLink Smart Advisor: Temperature is 26°C with 64% soil moisture. Excellent sowing window today.');
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (soundEnabled) playHapticTone(520, 'sine', 0.05);
  };

  // Interactive content rendered inside the mobile viewport
  const mobileContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: '#04120f',
        color: '#e2f1ea',
        fontFamily: "'Inter', system-ui, sans-serif",
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* ─── A. MOBILE STATUS BAR (iOS / Android Dynamic Island Header) ─── */}
      <header
        style={{
          background: 'rgba(4, 18, 15, 0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(52, 211, 153, 0.15)',
          padding: '8px 14px 6px 14px',
          zIndex: 40,
          flexShrink: 0
        }}
      >
        {/* Top Hardware Row: Clock, Battery, Signal, Voice Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#9cb5aa' }}>
            <span>9:41</span>
            <span style={{ fontSize: '9px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', padding: '1px 5px', borderRadius: '6px' }}>5G</span>
          </div>

          {/* Dynamic Island Animated Capsule */}
          <div
            onClick={() => handleTabChange('explore')}
            style={{
              background: 'rgba(10, 36, 30, 0.85)',
              border: `1px solid ${islandAlerts[islandAlertIndex].color}55`,
              borderRadius: '24px',
              padding: '3px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              maxWidth: '220px',
              cursor: 'pointer',
              boxShadow: `0 0 12px ${islandAlerts[islandAlertIndex].color}25`,
              transition: 'all 0.3s ease'
            }}
          >
            <span style={{ fontSize: '12px' }}>{islandAlerts[islandAlertIndex].icon}</span>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: '600',
                color: '#f3f4f6',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {islandAlerts[islandAlertIndex].text}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{ background: 'transparent', border: 'none', color: soundEnabled ? '#34d399' : '#6b7280', cursor: 'pointer', padding: '2px' }}
              title="Toggle tactile sound"
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#e2f1ea',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Exit Mobile View"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Brand Bar with Logo, Role Switcher, and Voice AI Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AgriLinkLogo size="sm" showText={true} showBadge={false} />
            <span
              style={{
                fontSize: '9px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                padding: '2px 6px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px'
              }}
            >
              3D APP
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setShowVoiceDrawer(true)}
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.35), rgba(236, 72, 153, 0.35))',
                border: '1.2px solid rgba(167, 139, 250, 0.6)',
                borderRadius: '16px',
                padding: '4px 10px',
                color: '#f5d0fe',
                fontSize: '11px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(139, 92, 246, 0.35)'
              }}
            >
              <Mic size={12} className="animate-pulse" color="#ec4899" />
              <span>AI Voice</span>
            </button>

            {onSelectRole && (
              <button
                onClick={() => onSelectRole('farmer')}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  padding: '4px 8px',
                  color: '#9cb5aa',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                Roles ▾
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─── B. SCROLLABLE TAB CONTENT ─── */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '12px 14px 80px 14px',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* ── TAB 1: EXPLORE / 3D MARKETPLACE HUB ── */}
        {activeTab === 'explore' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 3D Interactive Hero Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.35) 0%, rgba(6, 182, 212, 0.25) 50%, rgba(16, 185, 129, 0.35) 100%)',
                borderRadius: '22px',
                border: '1.5px solid rgba(167, 139, 250, 0.5)',
                padding: '16px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 12px 35px rgba(139, 92, 246, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
              }}
            >
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(16, 185, 129, 0.25)', padding: '3px 9px', borderRadius: '12px', fontSize: '10.5px', color: '#6ee7b7', fontWeight: '800', marginBottom: '8px' }}>
                  <Sparkles size={11} /> 100% FARMER DIRECT
                </div>
                <h2 style={{ fontSize: '19px', fontWeight: '900', color: '#ffffff', lineHeight: 1.2, margin: '0 0 6px 0' }}>
                  Next-Gen 3D Fresh Market
                </h2>
                <p style={{ fontSize: '12px', color: '#a7f3d0', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                  Zero middlemen. Real-time temperature verified cold-chain delivery right to your kitchen.
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleTabChange('ar_studio')}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '12px',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    <Scan size={13} /> 3D AR Studio
                  </button>

                  <button
                    onClick={() => handleTabChange('logistics')}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#e2f1ea',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    <Truck size={13} color="#38bdf8" /> Cold-Chain
                  </button>
                </div>
              </div>
            </div>

            {/* Daily Harvest Stories / Reels Carousel */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#f3f4f6' }}>🌾 Daily Harvest Stories</span>
                <span style={{ fontSize: '11px', color: '#34d399', fontWeight: '700' }}>Live Updates</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  overflowX: 'auto',
                  paddingBottom: '6px',
                  scrollbarWidth: 'none'
                }}
              >
                {farmStories.map((story) => (
                  <div
                    key={story.id}
                    onClick={() => {
                      if (soundEnabled) playHapticTone(650, 'sine', 0.06);
                      alert(`🌾 Live Farm Reel: ${story.farmer} (${story.farm}) just harvested prime ${story.crop} at 6:30 AM!`);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        padding: '2.5px',
                        background: story.unread ? 'linear-gradient(45deg, #10b981, #f59e0b, #06b6d4)' : 'rgba(255,255,255,0.2)',
                        boxShadow: story.unread ? '0 0 12px rgba(16, 185, 129, 0.5)' : 'none'
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background: '#06261f',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '22px'
                        }}
                      >
                        {story.avatar}
                      </div>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '600', color: '#d1fae5', maxWidth: '58px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {story.farmer.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live APMC Mandi Ticker Pill Matrix */}
            <div
              style={{
                background: 'rgba(6, 28, 22, 0.75)',
                border: '1px solid rgba(52, 211, 153, 0.25)',
                borderRadius: '16px',
                padding: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={15} color="#34d399" />
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff' }}>Live Mandi APMC Benchmark</span>
                </div>
                <button
                  onClick={() => handleTabChange('wallet')}
                  style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Profit Tool ➔
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {mandiRates.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '6px 10px',
                      borderRadius: '10px',
                      fontSize: '11px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', color: '#e2f1ea' }}>{item.crop}</div>
                      <div style={{ fontSize: '9.5px', color: '#9cb5aa' }}>{item.mandi}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', color: '#34d399' }}>{item.price}</div>
                      <div style={{ fontSize: '10px', fontWeight: '700', color: item.trend === 'up' ? '#4ade80' : '#f87171' }}>
                        {item.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Farm Produce Cards with 3D Preview */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff' }}>Fresh Harvest Listings</span>
                <span style={{ fontSize: '11px', color: '#9cb5aa' }}>3 Verified Nearby</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {products.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: 'rgba(6, 26, 21, 0.8)',
                      border: '1px solid rgba(52, 211, 153, 0.22)',
                      borderRadius: '16px',
                      padding: '12px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <div
                      onClick={() => setSelectedProduct3D(p)}
                      style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '12px',
                        background: 'radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.25), rgba(4, 20, 16, 0.8))',
                        border: '1px solid rgba(52, 211, 153, 0.35)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      title="Tap to preview 3D model"
                    >
                      <span style={{ fontSize: '28px' }}>{p.type === 'tomato' ? '🍅' : p.type === 'apple' ? '🍎' : '🌾'}</span>
                      <span style={{ position: 'absolute', bottom: '2px', fontSize: '8px', color: '#34d399', fontWeight: '800' }}>3D VIEW</span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '9px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', padding: '1px 5px', borderRadius: '4px', fontWeight: '700' }}>
                          {p.harvestAge}
                        </span>
                        <span style={{ fontSize: '9.5px', color: '#9cb5aa' }}>• {p.distance}</span>
                      </div>
                      <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', margin: '0 0 3px 0' }}>{p.title}</h4>
                      <div style={{ fontSize: '11px', color: '#9cb5aa', marginBottom: '6px' }}>By {p.farmer}</div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: '900', color: '#34d399' }}>{p.price}</span>
                        <button
                          onClick={() => {
                            setCartCount((c) => c + 1);
                            if (soundEnabled) playHapticTone(700, 'sine', 0.08);
                            alert(`🛒 Added 1 kg of ${p.title} to your mobile cart!`);
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #059669, #047857)',
                            border: 'none',
                            color: '#ffffff',
                            borderRadius: '8px',
                            padding: '5px 12px',
                            fontSize: '11px',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          + Add Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: 3D AR STUDIO & PLANT DOCTOR ── */}
        {activeTab === 'ar_studio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#ffffff', margin: 0 }}>
                  🌿 3D AR Agronomy Studio
                </h3>
                <p style={{ fontSize: '11px', color: '#9cb5aa', margin: 0 }}>
                  Interactive 3D Crop Doctor, Satellite Weather Sphere & Produce AR
                </p>
              </div>
            </div>

            {/* 3D Crop Doctor Section */}
            <div
              style={{
                background: 'rgba(6, 26, 21, 0.75)',
                border: '1px solid rgba(52, 211, 153, 0.25)',
                borderRadius: '18px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#6ee7b7' }}>
                  🔬 3D Leaf Inspector (Crop Health: 72%)
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['realistic', 'heatmap', 'wireframe'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setCropViewMode(mode)}
                      style={{
                        background: cropViewMode === mode ? '#10b981' : 'rgba(255,255,255,0.08)',
                        color: cropViewMode === mode ? '#ffffff' : '#9cb5aa',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '3px 7px',
                        fontSize: '9.5px',
                        fontWeight: '700',
                        textTransform: 'capitalize',
                        cursor: 'pointer'
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Canvas Engine for Leaf */}
              <CropDoctor3DCanvas disease={selectedDisease} isSpraying={isSpraying} viewMode={cropViewMode} />

              {/* Diagnostic Controls */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setIsSpraying(true);
                    if (soundEnabled) playHapticTone(480, 'sawtooth', 0.15);
                    setTimeout(() => setIsSpraying(false), 2200);
                  }}
                  disabled={isSpraying}
                  style={{
                    flex: 1,
                    background: isSpraying ? 'rgba(56, 189, 248, 0.3)' : 'linear-gradient(135deg, #0284c7, #0369a1)',
                    border: '1px solid #38bdf8',
                    color: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontSize: '11.5px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Droplets size={13} color="#38bdf8" />
                  {isSpraying ? 'Applying Bio-Shield...' : 'Spray Bio-Shield (3D)'}
                </button>

                <button
                  onClick={() => {
                    if (soundEnabled) playHapticTone(600, 'sine', 0.08);
                    alert('🌾 AI Recommendation: Apply Copper Oxychloride 50% WP @ 2.5g/L water + Trichoderma viride biological spray. Water intake: Morning only.');
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#f3f4f6',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  AI Rx
                </button>
              </div>
            </div>

            {/* 3D Micro-Climate Globe Section */}
            <div
              style={{
                background: 'rgba(6, 26, 21, 0.75)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '18px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#38bdf8' }}>
                  🛰️ Soil & Micro-Climate Satellite Sphere
                </span>
                <span style={{ fontSize: '10px', color: '#a7f3d0' }}>Live Radar: 26°C / 64% RH</span>
              </div>

              <WeatherSphere3DCanvas />

              {/* NPK & Soil Moisture Gauges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '9.5px', color: '#9cb5aa' }}>Nitrogen (N)</div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#34d399' }}>142 ppm</div>
                  <div style={{ fontSize: '8.5px', color: '#4ade80' }}>Optimal</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '9.5px', color: '#9cb5aa' }}>Phosphorus (P)</div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#fbbf24' }}>28 ppm</div>
                  <div style={{ fontSize: '8.5px', color: '#fbbf24' }}>Moderate</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '9.5px', color: '#9cb5aa' }}>Soil Moisture</div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#38bdf8' }}>68%</div>
                  <div style={{ fontSize: '8.5px', color: '#38bdf8' }}>Irrigated</div>
                </div>
              </div>
            </div>

            {/* 3D Produce Model Showcase */}
            <div
              style={{
                background: 'rgba(6, 26, 21, 0.75)',
                border: '1px solid rgba(52, 211, 153, 0.25)',
                borderRadius: '18px',
                padding: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#ffffff' }}>
                  🍎 3D Freshness Verification Lens
                </span>
                <span style={{ fontSize: '10px', color: '#34d399', fontWeight: '700' }}>Lab Verified 0.00 ppm</span>
              </div>
              <Produce3DCanvas itemType="tomato" />
            </div>
          </div>
        )}

        {/* ── TAB 3: 3D LOGISTICS & FLEET RADAR ── */}
        {activeTab === 'logistics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#ffffff', margin: 0 }}>
                🚚 Cold-Chain Fleet & Live Telemetry
              </h3>
              <p style={{ fontSize: '11px', color: '#9cb5aa', margin: 0 }}>
                Real-time -4°C temperature monitoring and digital delivery OTP shield
              </p>
            </div>

            {/* 3D Cold Chain Truck Canvas */}
            <div
              style={{
                background: 'rgba(6, 26, 21, 0.85)',
                borderRadius: '18px',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <ColdChainVan3DCanvas internalTemp="-4.2°C" />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#9cb5aa' }}>Driver: Vikram Singh</div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff' }}>Reefer Truck #DL-01-AG-409</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#34d399' }}>● Satellite Locked</div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#38bdf8' }}>ETA: 14 mins</div>
                </div>
              </div>
            </div>

            {/* Live Order Delivery Card with OTP */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.4), rgba(4, 25, 20, 0.9))',
                borderRadius: '16px',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#6ee7b7' }}>ORDER #AG-88219</span>
                <span style={{ fontSize: '10.5px', background: 'rgba(16, 185, 129, 0.25)', color: '#34d399', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                  DISPATCHED
                </span>
              </div>

              {/* Progress Milestones */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10b981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: '11px' }}>✓</div>
                  <span style={{ fontSize: '9.5px', color: '#d1fae5' }}>Harvest</span>
                </div>
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10b981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: '11px' }}>✓</div>
                  <span style={{ fontSize: '9.5px', color: '#d1fae5' }}>Cold Store</span>
                </div>
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#38bdf8', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: '11px', animation: 'pulse 1.5s infinite' }}>●</div>
                  <span style={{ fontSize: '9.5px', color: '#38bdf8', fontWeight: '700' }}>En-Route</span>
                </div>
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: '11px' }}>○</div>
                  <span style={{ fontSize: '9.5px', color: '#9ca3af' }}>Doorstep</span>
                </div>
              </div>

              {/* Secure Delivery OTP Box */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px dashed #34d399',
                  borderRadius: '12px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', color: '#9cb5aa' }}>Handover OTP for Driver</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '4px', color: '#34d399' }}>
                    4 9 1 8
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => alert('📞 Calling Driver Vikram Singh (+91 98765 43210)...')}
                    style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Phone size={12} /> Call
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: AGRI-WALLET & MANDI PROFIT CALCULATOR ── */}
        {activeTab === 'wallet' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#ffffff', margin: 0 }}>
                💰 AgriWallet & Direct Mandi Profit
              </h3>
              <p style={{ fontSize: '11px', color: '#9cb5aa', margin: 0 }}>
                DBT direct subsidy settlement & real-time MSP margin calculator
              </p>
            </div>

            {/* 3D Holographic Payment Card */}
            <div
              style={{
                height: '175px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #0d9488 100%)',
                border: '1.5px solid rgba(52, 211, 153, 0.5)',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 15px 35px rgba(4, 120, 87, 0.4), inset 0 1px 2px rgba(255,255,255,0.4)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Card Holographic Sheen */}
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.18)',
                  filter: 'blur(30px)'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#d1fae5', letterSpacing: '1px' }}>
                  AGRILINK KISAN CARD
                </span>
                <span style={{ fontSize: '18px' }}>🌾</span>
              </div>

              <div style={{ zIndex: 1 }}>
                <div style={{ fontSize: '10px', color: '#a7f3d0' }}>Available Digital Balance</div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#ffffff', letterSpacing: '0.5px' }}>
                  ₹ 48,250.00
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 1 }}>
                <div>
                  <div style={{ fontSize: '9px', color: '#a7f3d0' }}>BENEFICIARY</div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>
                    {user?.name || 'Suresh Kumar'}
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#ffffff', fontWeight: '700' }}>
                  DBT Verified ✓
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                onClick={() => alert('📲 UPI QR Generated for direct Mandi payout')}
                style={{ background: 'rgba(6, 26, 21, 0.75)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '12px', padding: '10px 6px', color: '#e2f1ea', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <QrCode size={18} color="#34d399" />
                <span style={{ fontSize: '10px', fontWeight: '700' }}>Receive UPI</span>
              </button>
              <button
                onClick={() => alert('🏦 Direct Bank DBT Subsidy: ₹6,000 credited under PM-KISAN')}
                style={{ background: 'rgba(6, 26, 21, 0.75)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '12px', padding: '10px 6px', color: '#e2f1ea', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <CreditCard size={18} color="#38bdf8" />
                <span style={{ fontSize: '10px', fontWeight: '700' }}>DBT Subsidy</span>
              </button>
              <button
                onClick={() => alert('📄 Mandi e-Invoicing synced with GST / APMC Gate Pass')}
                style={{ background: 'rgba(6, 26, 21, 0.75)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '12px', padding: '10px 6px', color: '#e2f1ea', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <BarChart3 size={18} color="#fbbf24" />
                <span style={{ fontSize: '10px', fontWeight: '700' }}>Mandi Invoices</span>
              </button>
            </div>

            {/* Interactive Mandi Profit Calculator */}
            <div
              style={{
                background: 'rgba(6, 26, 21, 0.85)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                borderRadius: '16px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#34d399' }}>
                🧮 Interactive Mandi Profit Estimator
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '10px', color: '#9cb5aa', display: 'block', marginBottom: '3px' }}>Select Crop</label>
                  <select
                    value={calcCrop}
                    onChange={(e) => setCalcCrop(e.target.value)}
                    style={{ width: '100%', background: '#08241b', color: '#ffffff', border: '1px solid #34d399', borderRadius: '8px', padding: '6px 8px', fontSize: '11.5px' }}
                  >
                    <option value="wheat">🌾 Desi Wheat (Sharbati)</option>
                    <option value="tomato">🍅 Hybrid Red Tomato</option>
                    <option value="rice">🍚 Basmati Rice (1121)</option>
                  </select>
                </div>

                <div style={{ width: '100px' }}>
                  <label style={{ fontSize: '10px', color: '#9cb5aa', display: 'block', marginBottom: '3px' }}>Farm Acres</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={calcAcreage}
                    onChange={(e) => setCalcAcreage(Math.max(1, Number(e.target.value)))}
                    style={{ width: '100%', background: '#08241b', color: '#ffffff', border: '1px solid #34d399', borderRadius: '8px', padding: '6px 8px', fontSize: '11.5px', textAlign: 'center' }}
                  />
                </div>
              </div>

              {/* Estimated Profit Display */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 78, 59, 0.4))',
                  border: '1px solid #10b981',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', color: '#a7f3d0' }}>Estimated Net Mandi Return</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#34d399' }}>
                    ₹ {estimatedProfit.toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '10px', color: '#6ee7b7' }}>
                  <div>+18% higher than MSP</div>
                  <div>Zero middleman cuts</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: PROFILE & COMMAND HUB ── */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                background: 'rgba(6, 26, 21, 0.85)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                borderRadius: '18px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px'
                }}
              >
                {user?.role === 'farmer' ? '👨‍🌾' : user?.role === 'delivery' ? '🚚' : '🛒'}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', margin: '0 0 2px 0' }}>
                  {user?.name || 'AgriLink User'}
                </h3>
                <div style={{ fontSize: '11px', color: '#34d399', fontWeight: '600' }}>
                  {user?.phone || user?.email || '+91 98765 43210'}
                </div>
                <div style={{ fontSize: '10px', color: '#9cb5aa' }}>
                  Active Role: {String(user?.role || 'Customer').toUpperCase()}
                </div>
              </div>
            </div>

            {/* Role Switcher */}
            <div
              style={{
                background: 'rgba(6, 26, 21, 0.75)',
                border: '1px solid rgba(52, 211, 153, 0.25)',
                borderRadius: '16px',
                padding: '14px'
              }}
            >
              <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#ffffff', display: 'block', marginBottom: '8px' }}>
                🔄 Instant Role Switcher (Mobile Sandbox)
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { role: 'farmer', label: 'Farmer', icon: '🌾' },
                  { role: 'customer', label: 'Customer', icon: '🛒' },
                  { role: 'delivery', label: 'Delivery', icon: '🚚' }
                ].map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      if (onSelectRole) onSelectRole(item.role);
                      if (soundEnabled) playHapticTone(620, 'sine', 0.08);
                    }}
                    style={{
                      background: user?.role === item.role ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '8px 4px',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div
              style={{
                background: 'rgba(6, 26, 21, 0.75)',
                border: '1px solid rgba(52, 211, 153, 0.25)',
                borderRadius: '16px',
                padding: '14px'
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff', display: 'block', marginBottom: '8px' }}>
                🌐 Agricultural Language Support
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिन्दी' },
                  { code: 'ta', label: 'தமிழ்' },
                  { code: 'te', label: 'తెలుగు' },
                  { code: 'kn', label: 'ಕನ್ನಡ' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    style={{
                      background: currentLanguage === lang.code ? '#10b981' : 'rgba(255, 255, 255, 0.06)',
                      color: currentLanguage === lang.code ? '#ffffff' : '#9cb5aa',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Kisan Emergency SOS Button */}
            <button
              onClick={() => alert('🌾 Dialing Kisan Call Centre Helpline: 1551 (Toll-Free Direct Agriculture Agronomist Support)')}
              style={{
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                padding: '12px',
                fontSize: '12.5px',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(220, 38, 38, 0.4)'
              }}
            >
              <Phone size={15} /> KISAN EMERGENCY SOS (1551)
            </button>
          </div>
        )}
      </main>

      {/* ─── C. ULTRA-MODERN 3D MOBILE BOTTOM DOCK ─── */}
      <nav
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(3, 16, 13, 0.95)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderTop: '1px solid rgba(52, 211, 153, 0.25)',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          padding: '6px 4px 8px 4px',
          zIndex: 40,
          boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.6)'
        }}
      >
        {[
          { id: 'explore', label: 'Farm Hub', icon: Sprout },
          { id: 'ar_studio', label: '3D Studio', icon: Scan },
          { id: 'logistics', label: 'Radar', icon: Truck },
          { id: 'wallet', label: 'Mandi/₹', icon: DollarSign },
          { id: 'profile', label: 'Profile', icon: Heart }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isActive ? '#34d399' : '#9cb5aa',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                padding: '4px 2px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: isActive ? '800' : '600' }}>
                {tab.label}
              </span>
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    width: '16px',
                    height: '2.5px',
                    borderRadius: '2px',
                    background: '#34d399'
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* ─── D. AGRIVOICE AI ASSISTANT SLIDE-UP DRAWER ─── */}
      {showVoiceDrawer && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end'
          }}
        >
          <div
            style={{
              background: '#06201a',
              borderTop: '1.5px solid #34d399',
              borderRadius: '24px 24px 0 0',
              padding: '20px 16px 28px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              maxHeight: '80%'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mic size={16} color="#fff" />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#fff', margin: 0 }}>AgriVoice AI Assistant</h4>
                  <span style={{ fontSize: '10px', color: '#34d399' }}>Multilingual Farm Agronomist</span>
                </div>
              </div>
              <button
                onClick={() => setShowVoiceDrawer(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Animated Sound Waveform Indicator */}
            <div
              style={{
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              {[20, 35, 15, 40, 25, 45, 30, 20, 38, 18, 30].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: '3px',
                    height: isAiThinking ? `${h}px` : '8px',
                    background: '#34d399',
                    borderRadius: '2px',
                    transition: 'height 0.15s ease'
                  }}
                />
              ))}
            </div>

            {/* AI Response Display */}
            {voiceAnswer && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '12px', padding: '12px', fontSize: '12px', color: '#e2f1ea', lineHeight: 1.4 }}>
                {voiceAnswer}
              </div>
            )}

            {/* Quick Voice Prompts */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                "Today's Tomato Mandi Rate?",
                "How to treat Early Blight?",
                "Track cold chain truck"
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setVoiceQuery(q);
                    handleVoiceSubmit(q);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(52, 211, 153, 0.25)',
                    borderRadius: '16px',
                    padding: '5px 10px',
                    fontSize: '10.5px',
                    color: '#d1fae5',
                    cursor: 'pointer'
                  }}
                >
                  "{q}"
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={voiceQuery}
                onChange={(e) => setVoiceQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVoiceSubmit()}
                placeholder="Ask in English, हिन्दी, தமிழ்..."
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid #34d399',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '12px'
                }}
              />
              <button
                onClick={() => handleVoiceSubmit()}
                disabled={isAiThinking}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '0 16px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                {isAiThinking ? '...' : 'Ask'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#020b08',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Background Ambience on Desktop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 20% 30%, rgba(5, 150, 105, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(56, 189, 248, 0.15) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}
      />

      {/* Top Floating Control Bar for Desktop Users */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(6, 26, 21, 0.88)',
          border: '1px solid rgba(52, 211, 153, 0.35)',
          borderRadius: '30px',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 100,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: '#34d399' }}>
          <Smartphone size={15} /> AgriLink 3D Flagship Mobile App
        </div>

        <button
          onClick={() => setIsDeviceFrameMode(!isDeviceFrameMode)}
          style={{
            background: isDeviceFrameMode ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '16px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          {isDeviceFrameMode ? '📱 Frame: iPhone 16 Pro' : '⛶ Fullscreen Mobile'}
        </button>

        <button
          onClick={onClose}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            borderRadius: '16px',
            padding: '4px 12px',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          ← Back to Main Hub
        </button>
      </div>

      {/* Mobile Screen Container */}
      <div
        style={
          isDeviceFrameMode
            ? {
                width: '390px',
                height: '810px',
                borderRadius: '50px',
                border: '12px solid #1e293b',
                boxShadow: '0 30px 90px rgba(0, 0, 0, 0.9), 0 0 40px rgba(52, 211, 153, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                marginTop: '40px',
                background: '#04120f'
              }
            : {
                width: '100%',
                maxWidth: '480px',
                height: '100%',
                maxHeight: '100vh',
                position: 'relative',
                overflow: 'hidden',
                background: '#04120f'
              }
        }
      >
        {mobileContent}
      </div>
    </div>
  );
}
