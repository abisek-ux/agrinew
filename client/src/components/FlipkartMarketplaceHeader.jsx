import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import {
  Search, Sparkles, MapPin, Zap, ChevronLeft, ChevronRight,
  Flame, Clock, Tag, Mic, X, Award, ShieldCheck, Heart
} from 'lucide-react';

export default function FlipkartMarketplaceHeader({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  userLocation,
  activeDealsCount = 12
}) {
  const { t } = useLanguage();

  // Rotating search placeholder text
  const searchPlaceholders = [
    t('search_placeholder', 'Search fresh produce, mangoes, seeds, vegetables...'),
    'Search fresh Alphonso Mangoes, Salem...',
    'Search organic vine-ripened tomatoes, Namakkal...',
    'Search certified hybrid wheat seeds...',
    'Search farm-fresh milk & A2 cow ghee...'
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % searchPlaceholders.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Flash Sale Countdown (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 42, seconds: 18 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Flipkart Hero Carousel Banners
  const banners = [
    {
      id: 1,
      badge: 'MEGA HARVEST UTSAV 🌾',
      title: 'Direct Farm-to-Doorstep Festival',
      subtitle: 'Up to 45% OFF Direct From Mandya, Mysuru & Ooty Organic Farmers • 0% Broker Fee',
      coupon: 'USE CODE: HARVEST45',
      bg: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f172a 100%)',
      accent: '#34d399',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 2,
      badge: '⚡ SAME-DAY DISPATCH',
      title: 'Fresh Harvest In < 4 Hours',
      subtitle: 'Harvested at 5:00 AM, delivered to your kitchen before lunch with real-time GPS tracking',
      coupon: 'FREE DELIVERY ON ALL ORDERS',
      bg: 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 50%, #064e3b 100%)',
      accent: '#38bdf8',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 3,
      badge: '100% ORGANIC CERTIFIED 🌱',
      title: 'Lab-Tested Zero Residue Produce',
      subtitle: 'Direct certified natural farms • No synthetic chemicals or waxes • Pure health guarantee',
      coupon: 'EXTRA 15% AGRICOINS BACK',
      bg: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #065f46 100%)',
      accent: '#fbbf24',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=700&q=80'
    }
  ];

  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Categories list (Flipkart style with icon & color)
  const categories = [
    { id: 'all', label: t('cat_all', 'All Farm'), icon: '🌾', color: '#10b981' },
    { id: 'fruit', label: t('cat_fruits', 'Fruits'), icon: '🥭', color: '#f59e0b' },
    { id: 'vegetable', label: t('cat_veggies', 'Veggies'), icon: '🥬', color: '#22c55e' },
    { id: 'seed', label: t('cat_seeds', 'Seeds'), icon: '🌱', color: '#14b8a6' },
    { id: 'dairy', label: t('cat_dairy', 'Dairy & Ghee'), icon: '🥛', color: '#38bdf8' },
    { id: 'medicine', label: t('cat_bio', 'Bio Hub'), icon: '💊', color: '#8b5cf6' },
    { id: 'deals', label: t('cat_deals', 'Flash Deals'), icon: '⚡', color: '#ef4444' }
  ];

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* ── FLIPKART STYLE TOP UTILITY STRIP ── */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(6, 78, 59, 0.85), rgba(4, 47, 46, 0.9))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '16px',
          padding: '8px 16px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
        }}
      >
        {/* Deliver to address pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <MapPin size={15} color="#34d399" />
          <span style={{ color: '#9db5aa' }}>Deliver to:</span>
          <span style={{ color: '#effbe7', fontWeight: '800' }}>
            {userLocation?.placeName || userLocation?.address?.split(',')[0] || 'Bengaluru 560001'}
          </span>
          <span
            style={{
              background: 'rgba(16, 185, 129, 0.25)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              color: '#6ee7b7',
              fontSize: '10.5px',
              fontWeight: '800',
              padding: '2px 8px',
              borderRadius: '20px'
            }}
          >
            ⚡ Express 2-Hr Harvest
          </span>
        </div>

        {/* SuperCoins & Zero Broker Badge & Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fcd34d',
              padding: '3px 10px',
              borderRadius: '14px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🪙 140 AgriCoins</span>
            <span style={{ color: '#9ca3af', fontSize: '10px' }}>(Save ₹70)</span>
          </div>

          <div style={{ color: '#6ee7b7', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={14} color="#34d399" />
            <span>{t('zero_broker_fee', '0% Broker Fee • 100% to Farmers')}</span>
          </div>

          {/* Top Page Language Selector */}
          <LanguageSelector compact={true} variant="pill" />
        </div>
      </div>

      {/* ── FLIPKART STYLE STICKY SEARCH & VOICE SEARCH BAR ── */}
      <div
        style={{
          background: 'rgba(9, 32, 28, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(52, 211, 153, 0.35)',
          borderRadius: '18px',
          padding: '8px 12px 8px 18px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.35)'
        }}
      >
        <Search size={20} color="#34d399" style={{ flexShrink: 0 }} />

        <input
          id="flipkart-search-input"
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={searchPlaceholders[placeholderIndex]}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#effbe7',
            fontSize: '14px',
            outline: 'none',
            fontWeight: '500'
          }}
        />

        {searchQuery ? (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#9ca3af',
              borderRadius: '50%',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={14} />
          </button>
        ) : (
          <button
            type="button"
            title="Voice Search"
            onClick={() => {
              setSearchQuery('Mangoes');
            }}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: '#34d399',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Mic size={16} />
          </button>
        )}

        <button
          onClick={() => {
            const el = document.getElementById('flipkart-search-input');
            if (el) el.focus();
          }}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
          }}
        >
          Search
        </button>
      </div>

      {/* ── FLIPKART STYLE HORIZONTAL CATEGORY ICON RAIL ── */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '16px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="category-scroll-rail"
      >
        {categories.map(cat => {
          const isActive = filterCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id === 'deals' ? 'all' : cat.id)}
              style={{
                flexShrink: 0,
                background: isActive ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.28), rgba(6, 78, 59, 0.4))' : 'rgba(9, 32, 28, 0.65)',
                border: `1.5px solid ${isActive ? '#34d399' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '16px',
                padding: '10px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                minWidth: '78px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? '0 8px 20px rgba(16, 185, 129, 0.25)' : 'none'
              }}
            >
              <span style={{ fontSize: '22px' }}>{cat.icon}</span>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: isActive ? '800' : '600',
                  color: isActive ? '#34d399' : '#cbd5e1',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── FLIPKART HERO BANNER CAROUSEL ── */}
      <div
        style={{
          position: 'relative',
          borderRadius: '22px',
          overflow: 'hidden',
          marginBottom: '16px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.5)',
          border: '1.5px solid rgba(52, 211, 153, 0.3)'
        }}
      >
        {banners.map((b, idx) => {
          const isCurrent = activeBanner === idx;
          if (!isCurrent) return null;
          return (
            <div
              key={b.id}
              style={{
                background: b.bg,
                padding: 'clamp(20px, 4vw, 36px)',
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr',
                gap: '20px',
                alignItems: 'center',
                minHeight: '190px'
              }}
              className="flipkart-hero-grid"
            >
              {/* Left Content */}
              <div>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    color: b.accent,
                    fontSize: '11px',
                    fontWeight: '900',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    letterSpacing: '0.6px',
                    display: 'inline-block',
                    marginBottom: '10px'
                  }}
                >
                  {b.badge}
                </span>

                <h2
                  style={{
                    fontSize: 'clamp(20px, 3.2vw, 30px)',
                    fontWeight: '900',
                    color: '#ffffff',
                    margin: '0 0 8px 0',
                    lineHeight: '1.2'
                  }}
                >
                  {b.title}
                </h2>

                <p
                  style={{
                    fontSize: '13px',
                    color: '#e2e8f0',
                    margin: '0 0 14px 0',
                    maxWidth: '460px',
                    lineHeight: '1.45'
                  }}
                >
                  {b.subtitle}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: `1px dashed ${b.accent}`,
                      color: b.accent,
                      fontSize: '12px',
                      fontWeight: '800',
                      padding: '6px 14px',
                      borderRadius: '8px'
                    }}
                  >
                    {b.coupon}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    ⚡ Instant Farm Checkout
                  </span>
                </div>
              </div>

              {/* Right Visual Image */}
              <div
                style={{
                  position: 'relative',
                  height: '100%',
                  minHeight: '140px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={b.image}
                  alt={b.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    maxHeight: '160px',
                    objectFit: 'cover',
                    borderRadius: '16px'
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Carousel Arrow Controls */}
        <button
          onClick={() => setActiveBanner(prev => (prev - 1 + banners.length) % banners.length)}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => setActiveBanner(prev => (prev + 1) % banners.length)}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <ChevronRight size={18} />
        </button>

        {/* Carousel Dots */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '6px'
          }}
        >
          {banners.map((_, i) => (
            <div
              key={i}
              onClick={() => setActiveBanner(i)}
              style={{
                width: activeBanner === i ? '22px' : '7px',
                height: '7px',
                borderRadius: '4px',
                background: activeBanner === i ? '#34d399' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>

      {/* ── FLIPKART DEAL OF THE DAY / FLASH SALE TICKER ── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #991b1b, #b91c1c, #7f1d1d)',
          borderRadius: '16px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 6px 20px rgba(185, 28, 28, 0.35)',
          border: '1px solid rgba(248, 113, 113, 0.4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Flame size={18} color="#dc2626" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '900', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>FLASH HARVEST SALE</span>
              <span style={{ fontSize: '11px', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '12px' }}>
                {activeDealsCount} items on discount
              </span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#fecaca' }}>
              Direct farmer harvest stock selling fast at mandi bulk pricing
            </div>
          </div>
        </div>

        {/* Live Countdown Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={16} color="#fef08a" />
          <span style={{ fontSize: '12px', color: '#fef08a', fontWeight: '700' }}>Ends in:</span>
          <div style={{ display: 'flex', gap: '4px', fontFamily: 'monospace', fontWeight: '900' }}>
            <span style={{ background: 'rgba(0,0,0,0.4)', padding: '3px 6px', borderRadius: '6px', color: '#fff', fontSize: '13px' }}>
              {String(timeLeft.hours).padStart(2, '0')}h
            </span>
            <span style={{ color: '#fff' }}>:</span>
            <span style={{ background: 'rgba(0,0,0,0.4)', padding: '3px 6px', borderRadius: '6px', color: '#fff', fontSize: '13px' }}>
              {String(timeLeft.minutes).padStart(2, '0')}m
            </span>
            <span style={{ color: '#fff' }}>:</span>
            <span style={{ background: 'rgba(0,0,0,0.4)', padding: '3px 6px', borderRadius: '6px', color: '#fff', fontSize: '13px' }}>
              {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
