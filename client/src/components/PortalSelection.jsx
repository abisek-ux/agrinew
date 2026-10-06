import React, { useState, useEffect, useRef } from 'react';
import {
  Sprout, Truck, ShoppingBag, ArrowRight, Sparkles, CheckCircle,
  Play, Pause, Film, Volume2, VolumeX, Maximize2, X, Award, ShieldCheck, Heart, Users,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import AgriLinkLogo from './AgriLinkLogo';
import { playHapticTone } from './ThreeDCanvases';

/**
 * 3D Golden Rice Seed & Spore Particle Simulation Canvas
 * Simulates realistic 3D rice grains and bio-spores scattering in natural wind breeze,
 * responding dynamically to cursor movements (farmer casting seeds into the wind).
 */
function NatureSeed3DCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse wind interaction state
    const mouse = { x: width / 2, y: height / 2, vx: 0, vy: 0, lastX: width / 2, lastY: height / 2 };

    const handleMouseMove = (e) => {
      mouse.vx = (e.clientX - mouse.lastX) * 0.3;
      mouse.vy = (e.clientY - mouse.lastY) * 0.3;
      mouse.lastX = mouse.x = e.clientX;
      mouse.lastY = mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Particle pool: Golden Rice Seeds and Glowing Bio-Spores
    const SEED_COUNT = 65;
    const particles = Array.from({ length: SEED_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 800 + 200, // 3D depth
      vx: (Math.random() - 0.45) * 0.8,
      vy: (Math.random() - 0.7) * 1.2, // Natural upward & drift motion
      length: Math.random() * 8 + 6,   // Rice seed elongation
      width: Math.random() * 3 + 2,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      type: Math.random() > 0.3 ? 'seed' : 'spore', // 70% golden seeds, 30% emerald spores
      hue: Math.random() > 0.4 ? 43 : 142, // Gold / Emerald
      brightness: Math.random() * 20 + 80,
      opacity: Math.random() * 0.6 + 0.35
    }));

    let time = 0;
    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Decaying mouse velocity
      mouse.vx *= 0.92;
      mouse.vy *= 0.92;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 3D Perspective scaling
        const fov = 600;
        const scale = fov / (fov + p.z);
        const screenX = (p.x - width / 2) * scale + width / 2;
        const screenY = (p.y - height / 2) * scale + height / 2;

        // Interaction with cursor wind
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220) {
          const force = (1 - dist / 220) * 4;
          p.vx += (dx / dist) * force + mouse.vx * 0.15;
          p.vy += (dy / dist) * force + mouse.vy * 0.15;
        }

        // Natural organic wind turbulence
        p.vx += Math.sin(time + p.y * 0.005) * 0.03;
        p.vy -= 0.04; // Gentle upward thermal lift
        p.angle += p.rotationSpeed;

        // Apply friction
        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around 3D boundary
        if (p.x < -60) p.x = width + 60;
        if (p.x > width + 60) p.x = -60;
        if (p.y < -60) {
          p.y = height + 60;
          p.x = Math.random() * width;
        }
        if (p.y > height + 60) p.y = -60;

        // Draw particle
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(p.angle);
        ctx.scale(scale, scale);

        if (p.type === 'seed') {
          // Realistic 3D Elliptical Golden Rice Grain
          const gradient = ctx.createLinearGradient(-p.length / 2, -p.width / 2, p.length / 2, p.width / 2);
          gradient.addColorStop(0, `hsla(45, 95%, 72%, ${p.opacity})`);
          gradient.addColorStop(0.5, `hsla(38, 90%, 55%, ${p.opacity * 0.9})`);
          gradient.addColorStop(1, `hsla(32, 85%, 42%, ${p.opacity * 0.7})`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.length / 2, p.width / 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Golden Specular Highlight on Seed
          ctx.fillStyle = `hsla(50, 100%, 95%, ${p.opacity * 0.8})`;
          ctx.beginPath();
          ctx.ellipse(-p.length * 0.15, -p.width * 0.2, p.length * 0.25, p.width * 0.2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Glowing Bio-Spore
          const sporeRadius = p.width * 1.5;
          const radialGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, sporeRadius * 2);
          radialGlow.addColorStop(0, `hsla(145, 90%, 70%, ${p.opacity})`);
          radialGlow.addColorStop(0.5, `hsla(140, 80%, 50%, ${p.opacity * 0.5})`);
          radialGlow.addColorStop(1, 'transparent');

          ctx.fillStyle = radialGlow;
          ctx.beginPath();
          ctx.arc(0, 0, sporeRadius * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      if (document.visibilityState === 'visible') {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2
      }}
    />
  );
}

/**
 * High Performance 3D Interactive Tilt Card
 * Supports true 3D gyroscope perspective, specular glare tracking, and multi-layer depth pop.
 */
function Portal3DCard({ portal, isHovered, onHover, onSelect }) {
  const { t } = useLanguage();
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12; // Max 12 deg tilt
    const rotateY = ((x - centerX) / centerX) * 12;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, glareX, glareY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
    onHover(null);
  };

  return (
    <div
      ref={cardRef}
      style={{
        perspective: '1200px',
        height: '100%',
        cursor: 'pointer'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => onHover(portal.role)}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(portal.role)}
    >
      <div
        style={{
          height: '100%',
          borderRadius: '28px',
          background: portal.cardBg,
          backdropFilter: 'blur(30px) saturate(190%)',
          WebkitBackdropFilter: 'blur(30px) saturate(190%)',
          border: `1.5px solid ${isHovered ? portal.borderGlow : 'rgba(255, 255, 255, 0.22)'}`,
          borderTop: `1.5px solid ${isHovered ? portal.borderGlow : 'rgba(255, 255, 255, 0.5)'}`,
          borderLeft: `1.5px solid ${isHovered ? portal.borderGlow : 'rgba(255, 255, 255, 0.35)'}`,
          padding: 'clamp(20px, 4vw, 34px) clamp(16px, 3.5vw, 28px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          transformStyle: 'preserve-3d',
          transform: isHovered
            ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.03, 1.03, 1.03) translateZ(12px)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)',
          transition: isHovered
            ? 'transform 0.08s ease-out, border-color 0.3s ease, box-shadow 0.3s ease'
            : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease',
          boxShadow: isHovered
            ? `0 35px 70px -10px rgba(0, 0, 0, 0.65), 0 0 40px ${portal.borderGlow}55, inset 0 1.5px 2px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.25)`
            : '0 20px 45px -12px rgba(0, 0, 0, 0.5), inset 0 1.2px 1.5px rgba(255,255,255,0.32), inset 0 -1px 1px rgba(0,0,0,0.18)'
        }}
      >
        {/* Glass Prismatic Reflection Sheen */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.03) 30%, transparent 65%)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Dynamic 3D Cursor Light Glare / Specular Sheen */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle 280px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, ${isHovered ? 0.28 : 0.08}), transparent 75%)`,
            pointerEvents: 'none',
            zIndex: 1,
            transition: 'opacity 0.2s ease'
          }}
        />

        {/* Ambient Corner Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: portal.borderGlow,
            filter: 'blur(60px)',
            opacity: isHovered ? 0.4 : 0.18,
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease'
          }}
        />

        {/* Card Content Top (3D Elevated Layer) */}
        <div style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d', zIndex: 2 }}>
          {/* Header Icon + Role Badge with Glassmorphism */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1.5px solid ${isHovered ? portal.borderGlow : 'rgba(255, 255, 255, 0.32)'}`,
                borderTop: '1.5px solid rgba(255, 255, 255, 0.6)',
                boxShadow: isHovered
                  ? `0 0 28px ${portal.borderGlow}55, inset 0 1px 1px rgba(255,255,255,0.4)`
                  : '0 8px 20px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255,255,255,0.25)',
                transform: 'translateZ(35px)',
                transition: 'all 0.3s ease'
              }}
            >
              {portal.icon}
            </div>

            <span
              style={{
                fontSize: '11.5px',
                fontWeight: '800',
                color: '#f0fdf4',
                background: 'rgba(255, 255, 255, 0.09)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: `1.2px solid ${isHovered ? portal.borderGlow : 'rgba(255, 255, 255, 0.25)'}`,
                borderTop: '1.2px solid rgba(255, 255, 255, 0.5)',
                padding: '7px 16px',
                borderRadius: '24px',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                transform: 'translateZ(25px)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255, 255, 255, 0.35)'
              }}
            >
              {portal.badge}
            </span>
          </div>

          {/* Title & Tagline */}
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '900',
              color: '#effbe7',
              margin: '0 0 6px 0',
              letterSpacing: '-0.5px',
              transform: 'translateZ(25px)',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)'
            }}
          >
            {portal.title}
          </h2>

          <div
            style={{
              fontSize: '14px',
              fontWeight: '700',
              color: portal.borderGlow,
              marginBottom: '16px',
              transform: 'translateZ(20px)'
            }}
          >
            {portal.tagline}
          </div>

          <p
            style={{
              fontSize: '13.5px',
              color: '#c0d9cb',
              lineHeight: '1.6',
              margin: '0 0 24px 0',
              transform: 'translateZ(15px)'
            }}
          >
            {portal.description}
          </p>

          {/* Feature Highlights with Frosted Glass Chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px', transform: 'translateZ(20px)' }}>
            {portal.highlights.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '11px',
                  fontSize: '13px',
                  color: '#effbe7',
                  lineHeight: '1.4',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderLeft: `3px solid ${portal.borderGlow}`,
                  borderRadius: '12px',
                  padding: '10px 14px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}
              >
                <CheckCircle size={16} color={portal.borderGlow} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card Action Button (3D Glass Pop) */}
        <div style={{ transform: 'translateZ(30px)', zIndex: 2 }}>
          <button
            type="button"
            style={{
              width: '100%',
              padding: '15px 22px',
              borderRadius: '16px',
              background: isHovered ? portal.btnBgHover : portal.btnBg,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              color: '#ffffff',
              border: '1.2px solid rgba(255, 255, 255, 0.35)',
              borderTop: '1.5px solid rgba(255, 255, 255, 0.65)',
              fontSize: '15.5px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: isHovered
                ? `0 14px 28px rgba(0, 0, 0, 0.45), 0 0 25px ${portal.borderGlow}66, inset 0 1px 2px rgba(255, 255, 255, 0.5)`
                : `0 8px 22px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.35)`,
              transform: isHovered ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.25s ease'
            }}
          >
            <span>{t('launch_experience', 'Explore Now')} {portal.title.replace(/Portal/gi, '').trim()}</span>
            <ArrowRight size={19} style={{ transform: isHovered ? 'translateX(4px)' : 'translateX(0)', transition: 'transform 0.25s ease' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 3D Cinematic Farmer Video Theater Modal
 */
function FarmerVideoTheaterModal({ isOpen, onClose, onSelectRole }) {
  const [activeClipIndex, setActiveClipIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const modalVideoRef = useRef(null);

  const videoClips = [
    {
      title: 'Harvesting & Field Work',
      desc: 'Real footage of organic farmers harvesting crops at dawn with sustainable methods.',
      src: '/videos/cam-greenhouse.mp4',
      duration: '4K Ultra HD',
      farmer: 'Ramesh Patel, Punjab Organic Collective'
    },
    {
      title: 'Golden Wheat Quality Check',
      desc: 'Inspecting pure ripe wheat ears before direct customer packaging.',
      src: '/videos/cam-orchard.mp4',
      duration: '1080p HD',
      farmer: 'Gurdeep Singh, Certified Grain Specialist'
    },
    {
      title: 'Lush Agricultural Valley',
      desc: 'Aerial view of chemical-free bio-fields connected directly to AgriLink delivery routes.',
      src: '/videos/cam-polyhouse.mp4',
      duration: 'Drone 4K',
      farmer: 'Southern Plateau Cooperative, Karnataka'
    }
  ];

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 10, 8, 0.88)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: '960px',
          width: '100%',
          background: 'linear-gradient(145deg, rgba(8, 28, 22, 0.98), rgba(4, 16, 13, 0.99))',
          border: '1.5px solid rgba(74, 222, 128, 0.4)',
          borderRadius: '26px',
          overflow: 'hidden',
          boxShadow: '0 25px 70px rgba(0,0,0,0.8), 0 0 40px rgba(74,222,128,0.2)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(5, 20, 16, 0.6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AgriLinkLogo size="sm" showText={false} interactive={false} />
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#effbe7' }}>
                AgriLink Farmer Stories & Live Field Documentary
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#86efac' }}>
                Direct Farm-to-Table Ecosystem • 100% Fair Price • 0% Broker Fee
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#effbe7',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Player Box */}
        <div style={{ position: 'relative', width: '100%', height: '400px', backgroundColor: '#000' }}>
          <video
            ref={modalVideoRef}
            key={videoClips[activeClipIndex].src}
            src={videoClips[activeClipIndex].src}
            autoPlay
            loop
            muted={isMuted}
            controls
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          {/* Sound Toggle Floating Badge */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(5, 20, 18, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(74, 222, 128, 0.5)',
              borderRadius: '20px',
              padding: '6px 14px',
              color: '#effbe7',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              zIndex: 5
            }}
          >
            {isMuted ? <VolumeX size={15} color="#f87171" /> : <Volume2 size={15} color="#4ade80" />}
            <span>{isMuted ? 'Click to Unmute' : 'Audio On'}</span>
          </button>
        </div>

        {/* Clip Selector Tabs */}
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '14px 24px',
          background: 'rgba(4, 18, 14, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          overflowX: 'auto'
        }}>
          {videoClips.map((clip, idx) => (
            <button
              key={idx}
              onClick={() => setActiveClipIndex(idx)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '10px 14px',
                borderRadius: '12px',
                border: activeClipIndex === idx ? '1.5px solid #4ade80' : '1px solid rgba(255,255,255,0.1)',
                background: activeClipIndex === idx ? 'rgba(22, 101, 52, 0.45)' : 'rgba(255,255,255,0.03)',
                color: activeClipIndex === idx ? '#effbe7' : '#9ca3af',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Play size={11} color={activeClipIndex === idx ? '#4ade80' : '#9ca3af'} />
                <span>{clip.title}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#86efac', marginTop: '3px' }}>
                {clip.farmer}
              </div>
            </button>
          ))}
        </div>

        {/* Impact Bar & Quick Action */}
        <div style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700' }}>Direct Benefit</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#4ade80' }}>100% Price To Farmers</div>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700' }}>Doorstep Speed</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#fbbf24' }}>&lt; 4 Hours Harvest</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => { onClose(); onSelectRole('farmer'); }}
              style={{
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#fff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              🌾 Join as Farmer
            </button>
            <button
              onClick={() => { onClose(); onSelectRole('customer'); }}
              style={{
                background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                color: '#fff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              🛒 Shop Direct Produce
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortalSelection({ onSelectRole, onOpenMobileApp }) {
  const { language, setLanguage, languages, t } = useLanguage();
  const [hoveredRole, setHoveredRole] = useState(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const videoRef = useRef(null);

  const mandiRates = [
    { crop: 'Desi Wheat (Sharbati)', mandi: 'Karnal APMC', price: '₹2,680 / qtl', change: '+3.8%', trend: 'up' },
    { crop: 'Hybrid Red Tomato', mandi: 'Nashik APMC', price: '₹1,950 / qtl', change: '+5.4%', trend: 'up' },
    { crop: 'Basmati Rice (1121)', mandi: 'Amritsar APMC', price: '₹4,320 / qtl', change: '-1.2%', trend: 'down' },
    { crop: 'Nashik Red Onion', mandi: 'Lasalgaon APMC', price: '₹1,820 / qtl', change: '+2.1%', trend: 'up' },
    { crop: 'Bt Cotton Long Staple', mandi: 'Rajkot APMC', price: '₹7,150 / qtl', change: '+0.8%', trend: 'up' }
  ];

  const farmStories = [
    { id: 1, farmer: 'Suresh Kumar', farm: 'Green Valley Organic', crop: 'Tomatoes', avatar: '👨‍🌾' },
    { id: 2, farmer: 'Maya Patel', farm: 'Sahyadri Honeycomb', crop: 'Wild Honey', avatar: '👩‍🌾' },
    { id: 3, farmer: 'Rameshwar', farm: 'Punjab Golden Fields', crop: 'Wheat Grains', avatar: '🚜' },
    { id: 4, farmer: 'Ananya Roy', farm: 'Darjeeling Berries', crop: 'Hydroponic', avatar: '🌿' }
  ];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (isPlayingVideo) {
      videoRef.current.pause();
      setIsPlayingVideo(false);
    } else {
      videoRef.current.play();
      setIsPlayingVideo(true);
    }
  };

  const portals = [
    {
      role: 'farmer',
      title: t('farmer_hub_title', 'Farmer AI Studio'),
      badge: '🧠 Neural Agronomy & Yield AI',
      icon: <Sprout size={34} color="#10b981" />,
      tagline: t('farmer_tagline', 'Autonomous Sowing & Direct Harvest'),
      description: t('farmer_desc', 'Manage harvest inventory, set your own fair prices without middleman cuts, inspect crop health with 3D scans, and receive direct customer orders.'),
      highlights: [
        'Direct price setting with zero broker fees',
        '3D Crop disease scanner & medicine prescription hub',
        'Instant notifications on new customer orders'
      ],
      cardBg: 'linear-gradient(145deg, rgba(16, 185, 129, 0.22) 0%, rgba(6, 182, 212, 0.14) 45%, rgba(4, 28, 22, 0.85) 100%)',
      borderGlow: '#10b981',
      btnBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      btnBgHover: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
    },
    {
      role: 'customer',
      title: t('portal_customer', 'Direct Farm Marketplace'),
      badge: '✨ 3D Vision & Purity Engine',
      icon: <ShoppingBag size={34} color="#c084fc" />,
      tagline: t('customer_tagline', 'Organic Produce & 3D AR Inspection'),
      description: t('customer_desc', 'Browse fresh organic produce with 3D quality inspection holograms, negotiate bulk prices directly with farmers, and track doorstep deliveries live.'),
      highlights: [
        '3D Bio-Purity & Freshness scan on every harvest',
        'Direct bulk price negotiation / bargaining engine',
        'Live turn-by-turn order tracking until delivery'
      ],
      cardBg: 'linear-gradient(145deg, rgba(139, 92, 246, 0.22) 0%, rgba(236, 72, 153, 0.14) 45%, rgba(24, 12, 42, 0.85) 100%)',
      borderGlow: '#a855f7',
      btnBg: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
      btnBgHover: 'linear-gradient(135deg, #a78bfa 0%, #c026d3 100%)'
    },
    {
      role: 'delivery',
      title: t('delivery_fleet_title', 'Autonomous Fleet Logistics'),
      badge: '🛰️ Quantum GPS Route Dispatch',
      icon: <Truck size={34} color="#fbbf24" />,
      tagline: t('delivery_tagline', 'Cold-Chain Logistics & Live Radar'),
      description: t('delivery_desc', 'Accept delivery assignments, monitor 3D fleet HUD telemetry, simulate live turn-by-turn GPS, and claim instant shift payouts.'),
      highlights: [
        'Real-time order dispatch radar & GPS telemetry HUD',
        'Live GPS route triangulation on interactive map',
        'Instant shift earnings tally & roadside SOS beacon'
      ],
      cardBg: 'linear-gradient(145deg, rgba(245, 158, 11, 0.22) 0%, rgba(239, 68, 68, 0.14) 45%, rgba(38, 18, 5, 0.85) 100%)',
      borderGlow: '#f59e0b',
      btnBg: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
      btnBgHover: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)'
    }
  ];

  return (
    <div
      style={{
        position: 'relative',
        minHeight: 'calc(100vh - 76px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(24px, 4vw, 40px) clamp(12px, 3vw, 20px)',
        backgroundColor: 'transparent',
        isolation: 'isolate'
      }}
    >
      {/* ─── FIXED FULL-SCREEN BACKGROUND VIDEO CONTAINER ─── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          <source src="/Screen Recording 2026-09-25 224918.mp4" type="video/mp4" />
          <source src="/Screen%20Recording%202026-09-25%20224918.mp4" type="video/mp4" />
          <source src="/screen-recording.mp4" type="video/mp4" />
        </video>

        {/* Semi-transparent dark overlay to keep glassmorphism portal cards and text clearly readable */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(3, 14, 12, 0.72) 0%, rgba(2, 10, 9, 0.58) 45%, rgba(1, 8, 7, 0.82) 100%)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* ─── NEXT-GEN COLORFUL AI AURORA MESH BACKGROUND ─── */}
      <div className="ai-aurora-mesh">
        <div className="ai-aurora-orb ai-aurora-orb-1" />
        <div className="ai-aurora-orb ai-aurora-orb-2" />
        <div className="ai-aurora-orb ai-aurora-orb-3" />
        <div className="ai-aurora-orb ai-aurora-orb-4" />
        <div className="ai-aurora-orb ai-aurora-orb-5" />
      </div>

      {/* ─── 3D GOLDEN RICE SEED & SPORE PARTICLE CANVAS ─── */}
      <NatureSeed3DCanvas />

      {/* ─── VIDEO CONTROLLER & STATUS BADGE ─── */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '24px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <button
          onClick={toggleVideo}
          title={isPlayingVideo ? 'Pause nature footage' : 'Play nature footage'}
          style={{
            background: 'rgba(5, 20, 18, 0.75)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            borderRadius: '20px',
            padding: '8px 14px',
            color: '#effbe7',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
            transition: 'all 0.2s ease'
          }}
        >
          {isPlayingVideo ? <Pause size={13} color="#4ade80" /> : <Play size={13} color="#fbbf24" />}
          <span>{isPlayingVideo ? 'Live Farm Cinematics' : 'Cinematics Paused'}</span>
        </button>
      </div>

      {/* ─── MAIN PORTAL CONTENT ─── */}
      <div
        style={{
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 3
        }}
      >
        {/* Proprietary 3D AgriLink Brand Logo */}
        <div style={{ marginBottom: '20px' }}>
          <AgriLinkLogo size="xl" showText={true} showBadge={true} interactive={true} />
        </div>

        {/* Header Badge & Watch Farmer Video Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%)',
              backdropFilter: 'blur(16px)',
              border: '1.2px solid rgba(52, 211, 153, 0.65)',
              borderRadius: '30px',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: '800',
              color: '#6ee7b7',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.35)'
            }}
          >
            <Sparkles size={16} color="#fbbf24" />
            <span>Unified 3D Agricultural AI Ecosystem & Real-Time Logistics</span>
          </div>

          <button
            type="button"
            onClick={() => setShowVideoModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(22, 101, 52, 0.5))',
              backdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(251, 191, 36, 0.65)',
              borderRadius: '30px',
              padding: '8px 22px',
              fontSize: '13px',
              fontWeight: '800',
              color: '#fef08a',
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(245, 158, 11, 0.35)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Film size={16} color="#fbbf24" />
            <span>🎬 Watch Farmer Video & Story</span>
          </button>

        </div>

        {/* 3D Cinematic Farmer Video Theater Modal */}
        <FarmerVideoTheaterModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          onSelectRole={onSelectRole}
        />

        {/* Interactive Multi-Language Pill Switcher Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '20px',
            maxWidth: '850px',
            width: '100%',
            padding: '4px'
          }}
        >
          {languages.map((lang) => {
            const isActive = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  playHapticTone(600, 'sine', 0.05);
                }}
                className={`lang-pill-btn ${isActive ? 'active' : ''}`}
                title={`Switch language to ${lang.name} (${lang.nativeName})`}
              >
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
                {isActive && <Sparkles size={12} color="#34d399" />}
              </button>
            );
          })}
          <div style={{ marginLeft: '4px' }}>
            <LanguageSelector compact={true} variant="pill" />
          </div>
        </div>

        {/* Vibrant Rainbow Hero Badge */}
        <div
          className="ai-rainbow-card"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(6, 32, 26, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            padding: '8px 22px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: '800',
            color: '#6ee7b7',
            marginBottom: '16px',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.25)'
          }}
        >
          <Sparkles size={16} color="#fbbf24" />
          <span>{t('hero_badge', '✨ 100% Direct Farm-to-Table Ecosystem • 0% Broker Fee')}</span>
        </div>

        {/* Grand Colorful Dynamic Heading - NO "Select Your Interactive Portal" */}
        <h1
          className="ai-gradient-text"
          style={{
            fontSize: 'clamp(30px, 5.6vw, 58px)',
            fontWeight: '900',
            letterSpacing: '-1.5px',
            textAlign: 'center',
            margin: '0 0 14px 0',
            background: 'linear-gradient(135deg, #34d399 0%, #38bdf8 30%, #ec4899 65%, #facc15 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 25px rgba(52, 211, 153, 0.35))',
            lineHeight: 1.15
          }}
        >
          {t('hero_title', '🌱 Farm Fresh Produce & Smart Agriculture Hub')}
        </h1>

        <p
          style={{
            fontSize: 'clamp(14.5px, 2.4vw, 17.5px)',
            color: '#ecfdf5',
            maxWidth: '780px',
            textAlign: 'center',
            margin: '0 auto 26px auto',
            lineHeight: '1.7',
            fontWeight: '500',
            textShadow: '0 2px 14px rgba(0,0,0,0.7)'
          }}
        >
          {t('hero_subtitle', 'Direct farm-to-table platform with 3D crop inspection, autonomous GPS delivery dispatch, and pure organic marketplace trading.')}
        </p>

        {/* Vibrant 1-Click Launchpad Row (Colorful, Attractive & Direct) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px',
            maxWidth: '960px',
            width: '100%'
          }}
        >
          <button
            type="button"
            onClick={() => {
              playHapticTone(700, 'sine', 0.08);
              onSelectRole('customer');
            }}
            className="quick-launch-btn quick-launch-shop"
          >
            <ShoppingBag size={18} />
            <span>{t('quick_shop_now', '🛒 Shop Fresh Produce')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playHapticTone(650, 'sine', 0.08);
              onSelectRole('farmer');
            }}
            className="quick-launch-btn quick-launch-farmer"
          >
            <Sprout size={18} />
            <span>{t('farmer_hub_title', '🌾 Farmer Studio & Yield AI')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playHapticTone(600, 'sine', 0.08);
              onSelectRole('delivery');
            }}
            className="quick-launch-btn quick-launch-delivery"
          >
            <Truck size={18} />
            <span>{t('delivery_fleet_title', '🚚 Express Delivery Fleet')}</span>
          </button>

        </div>

        {/* ─── LIVE APMC MANDI TICKER PILL ─── */}
        <div
          style={{
            maxWidth: '960px',
            width: '100%',
            marginBottom: '24px',
            background: 'rgba(6, 28, 22, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(52, 211, 153, 0.35)',
            borderRadius: '18px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="#34d399" />
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.4px' }}>
              {t('mandi_rates_title', 'LIVE APMC MANDI BENCHMARK')}:
            </span>
          </div>

          <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', padding: '2px 0', scrollbarWidth: 'none' }}>
            {mandiRates.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
                <span style={{ color: '#d1fae5', fontWeight: '600' }}>{item.crop}:</span>
                <span style={{ color: '#34d399', fontWeight: '800' }}>{item.price}</span>
                <span style={{ color: item.trend === 'up' ? '#4ade80' : '#f87171', fontSize: '10.5px', fontWeight: '800' }}>
                  ({item.change})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── DAILY HARVEST REELS CAROUSEL ─── */}
        <div style={{ maxWidth: '960px', width: '100%', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff' }}>{t('daily_reels_title', '🌾 Live Daily Harvest Reels & Stories')}</span>
            <span style={{ fontSize: '11px', color: '#34d399', fontWeight: '700' }}>{t('daily_reels_sub', 'Updated 30 mins ago')}</span>
          </div>

          <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'none' }}>
            {farmStories.map((story) => (
              <div
                key={story.id}
                onClick={() => {
                  playHapticTone(650, 'sine', 0.06);
                  alert(`🌾 Live Farm Reel: ${story.farmer} (${story.farm}) harvested prime ${story.crop} at sunrise today!`);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(6, 26, 21, 0.75)',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  borderRadius: '16px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(45deg, #10b981, #f59e0b)', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#06261f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    {story.avatar}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff' }}>{story.farmer}</div>
                  <div style={{ fontSize: '10px', color: '#34d399' }}>{story.crop} • {story.farm}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3D Tilt Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 310px), 1fr))',
            gap: 'clamp(18px, 3vw, 30px)',
            width: '100%',
            marginBottom: '36px'
          }}
        >
          {portals.map((portal) => (
            <Portal3DCard
              key={portal.role}
              portal={portal}
              isHovered={hoveredRole === portal.role}
              onHover={setHoveredRole}
              onSelect={(role) => {
                if (role === 'mobile') {
                  if (onOpenMobileApp) onOpenMobileApp();
                } else {
                  onSelectRole(role);
                }
              }}
            />
          ))}
        </div>

        {/* Bottom Platform Status Indicators */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '20px',
            marginTop: '10px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(5, 20, 18, 0.65)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '7px 16px',
              fontSize: '12.5px',
              color: '#c0d9cb'
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
            <span>{t('tag_gps', '3D Interactive Sowing Physics Active')}</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(5, 20, 18, 0.65)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '7px 16px',
              fontSize: '12.5px',
              color: '#c0d9cb'
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 8px #fbbf24' }} />
            <span>{t('tag_zero_broker', 'Zero Middleman Broker Guarantee')}</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(5, 20, 18, 0.65)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '7px 16px',
              fontSize: '12.5px',
              color: '#c0d9cb'
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2dd4bf', boxShadow: '0 0 8px #2dd4bf' }} />
            <span>{t('tag_organic', '100% Direct Certified Farm Produce')}</span>
          </div>
        </div>

        {/* Mobile-Only Sticky Floating Quick Action Bar */}
        <div
          className="portal-mobile-dock"
          style={{
            position: 'fixed',
            bottom: '12px',
            left: '12px',
            right: '12px',
            zIndex: 100,
            background: 'rgba(3, 18, 14, 0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1.2px solid rgba(52, 211, 153, 0.4)',
            borderRadius: '24px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.75), 0 0 20px rgba(52, 211, 153, 0.2)'
          }}
        >
          <button
            onClick={() => onSelectRole('farmer')}
            style={{ background: 'transparent', border: 'none', color: '#4ade80', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}
          >
            <Sprout size={18} />
            <span style={{ fontSize: '10px', fontWeight: '800' }}>{t('farmer_label', 'Farmer')}</span>
          </button>

          <button
            onClick={() => onSelectRole('customer')}
            style={{ background: 'transparent', border: 'none', color: '#2dd4bf', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}
          >
            <ShoppingBag size={18} />
            <span style={{ fontSize: '10px', fontWeight: '800' }}>{t('cat_all', 'Shop Produce')}</span>
          </button>

          <button
            onClick={() => onSelectRole('delivery')}
            style={{ background: 'transparent', border: 'none', color: '#fbbf24', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}
          >
            <Truck size={18} />
            <span style={{ fontSize: '10px', fontWeight: '800' }}>{t('delivery_fleet_title', 'Delivery')}</span>
          </button>

        </div>
      </div>
    </div>
  );
}
