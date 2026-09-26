import React, { useState } from 'react';

/**
 * AgriLink Custom Proprietary 3D Brand Logo
 * Features:
 * - Interlocking 3D organic sprout leaf & digital logistic link rings
 * - Radiant emerald (#10b981) and harvest gold (#f59e0b) gradient layers
 * - Ambient volumetric glow & specular highlights
 * - Interactive 3D perspective tilt on hover
 */
export default function AgriLinkLogo({
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showText = true,
  showBadge = true,
  interactive = true,
  onClick
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Dimension scaling
  const dimensions = {
    sm: { icon: 32, text: 16, sub: 9, badge: 8, gap: 8 },
    md: { icon: 44, text: 20, sub: 10, badge: 9, gap: 12 },
    lg: { icon: 56, text: 26, sub: 11.5, badge: 10, gap: 14 },
    xl: { icon: 72, text: 34, sub: 13, badge: 11, gap: 18 }
  }[size] || { icon: 44, text: 20, sub: 10, badge: 9, gap: 12 };

  const handleMouseMove = (e) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${dimensions.gap}px`,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        perspective: '800px',
        transition: 'transform 0.25s ease'
      }}
    >
      {/* ─── 3D HOLOGRAPHIC LOGO EMBLEM ─── */}
      <div
        style={{
          width: `${dimensions.icon}px`,
          height: `${dimensions.icon}px`,
          position: 'relative',
          transform: isHovered
            ? `perspective(600px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale3d(1.08, 1.08, 1.08)`
            : 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          transformStyle: 'preserve-3d',
          flexShrink: 0
        }}
      >
        {/* Ambient Backlight Glow */}
        <div
          style={{
            position: 'absolute',
            inset: '-15%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74, 222, 128, 0.45) 0%, rgba(245, 158, 11, 0.25) 50%, transparent 75%)',
            filter: 'blur(10px)',
            opacity: isHovered ? 1 : 0.65,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none'
          }}
        />

        {/* 3D Glass Shield Container */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: `${dimensions.icon * 0.32}px`,
            background: 'linear-gradient(135deg, rgba(6, 40, 28, 0.9) 0%, rgba(2, 20, 14, 0.95) 100%)',
            border: '1.5px solid rgba(74, 222, 128, 0.5)',
            boxShadow: `
              0 8px 24px rgba(0, 0, 0, 0.55),
              0 0 20px rgba(34, 197, 94, 0.3),
              inset 0 1px 2px rgba(255, 255, 255, 0.45),
              inset 0 -1px 2px rgba(0, 0, 0, 0.6)
            `,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Internal Specular Bevel Highlight */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '45%',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 100%)',
              borderTopLeftRadius: `${dimensions.icon * 0.32}px`,
              borderTopRightRadius: `${dimensions.icon * 0.32}px`,
              pointerEvents: 'none'
            }}
          />

          {/* SVG Vector Artwork: 3D Sprout Leaf + Interlocking Logistics Link */}
          <svg
            viewBox="0 0 100 100"
            style={{
              width: '74%',
              height: '74%',
              filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.6))'
            }}
          >
            <defs>
              {/* Primary Leaf Emerald Gradient */}
              <linearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="50%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#86efac" />
              </linearGradient>

              {/* Secondary Golden Grain / Sun Gradient */}
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="45%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>

              {/* High-Tech Link Ring Gradient */}
              <linearGradient id="linkGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>

              {/* Glowing Seed Node Filter */}
              <filter id="seedGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Base Logistics Orbit Link (Symbolizing Chain & Triangulation) */}
            <path
              d="M 28,68 C 18,52 24,34 40,24 C 48,19 60,18 70,24"
              fill="none"
              stroke="url(#linkGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="1 0"
              opacity="0.8"
            />

            {/* Primary Natural Sprout Leaf (Rising towards light) */}
            <path
              d="M 50,85 C 50,85 54,65 72,50 C 82,41 85,26 85,26 C 85,26 70,26 56,36 C 42,46 46,70 50,85 Z"
              fill="url(#leafGrad)"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1.2"
            />

            {/* Central Leaf Vein (Dynamic Curve) */}
            <path
              d="M 51,82 C 54,66 65,47 78,32"
              fill="none"
              stroke="#dcfce7"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.9"
            />

            {/* Left Golden Seed Grain (Representing Harvest / Direct Trade) */}
            <path
              d="M 48,82 C 48,82 34,74 27,60 C 22,50 24,36 30,30 C 37,24 50,30 52,44 C 54,58 48,82 48,82 Z"
              fill="url(#goldGrad)"
              stroke="rgba(254, 240, 138, 0.6)"
              strokeWidth="1.2"
              opacity="0.92"
            />

            {/* Golden Specular Glimmer on Seed */}
            <ellipse
              cx="33"
              cy="42"
              rx="4"
              ry="8"
              transform="rotate(-25 33 42)"
              fill="#ffffff"
              opacity="0.75"
            />

            {/* Interconnected Digital Logistics Nodes (3 Points: Farmer, Partner, Customer) */}
            {/* Node 1: Farmer (Bottom Root) */}
            <circle cx="50" cy="85" r="4.5" fill="#22c55e" stroke="#ffffff" strokeWidth="1.5" filter="url(#seedGlow)" />
            {/* Node 2: Delivery Link (Top Right Apex) */}
            <circle cx="83" cy="27" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" filter="url(#seedGlow)" />
            {/* Node 3: Consumer (Top Left) */}
            <circle cx="30" cy="30" r="3.5" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" filter="url(#seedGlow)" />
          </svg>
        </div>
      </div>

      {/* ─── BRAND TYPOGRAPHY & TAGLINE ─── */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: `${dimensions.text}px`,
                fontWeight: '900',
                letterSpacing: '-0.6px',
                lineHeight: 1.1,
                background: 'linear-gradient(135deg, #ffffff 30%, #86efac 75%, #fbbf24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 14px rgba(74, 222, 128, 0.3)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              AGRILINK
            </span>

            {showBadge && (
              <span
                style={{
                  fontSize: `${dimensions.badge}px`,
                  fontWeight: '800',
                  color: '#86efac',
                  background: 'rgba(22, 101, 52, 0.65)',
                  border: '1px solid rgba(74, 222, 128, 0.45)',
                  padding: '1.5px 7px',
                  borderRadius: '6px',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
                }}
              >
                3D PLATFORM
              </span>
            )}
          </div>

          <span
            style={{
              fontSize: `${dimensions.sub}px`,
              color: '#9db5aa',
              fontWeight: '600',
              marginTop: '2px',
              letterSpacing: '0.2px',
              lineHeight: 1.2
            }}
          >
            Farm-to-Table & Real-Time Logistics
          </span>
        </div>
      )}
    </div>
  );
}
