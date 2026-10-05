import React, { useState, useEffect, useRef } from 'react';

// Subtle Web Audio Haptic & Chime Synthesizer
export const playHapticTone = (freq = 440, type = 'sine', duration = 0.08) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignore audio restriction on initial click
  }
};

/**
 * 3D Crop Doctor & Leaf Diagnostic Canvas Engine
 */
export function CropDoctor3DCanvas({ disease, isSpraying, viewMode }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ rotX: 18, rotY: 25, zoom: 1.0, isDragging: false });
  const dragRef = useRef({ lastX: 0, lastY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;
    let frame = 0;
    const sprayParticles = [];

    const render = () => {
      frame++;
      const w = (canvas.width = canvas.parentElement?.clientWidth || 360);
      const h = (canvas.height = canvas.parentElement?.clientHeight || 260);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const radX = (stateRef.current.rotX * Math.PI) / 180;
      const radY = ((stateRef.current.rotY + (stateRef.current.isDragging ? 0 : frame * 0.4)) * Math.PI) / 180;
      const zScale = stateRef.current.zoom;

      const project = (x, y, z) => {
        const x1 = x * Math.cos(radY) + z * Math.sin(radY);
        const z1 = -x * Math.sin(radY) + z * Math.cos(radY);
        const y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
        const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);
        const fov = 350 / (350 + z2);
        return { px: cx + x1 * fov * zScale, py: cy + y2 * fov * zScale, pz: z2, fov };
      };

      // Draw 3D Leaf Body (Parametric Organic Mesh)
      const segments = 16;
      const leafLength = 120;
      const leafWidth = 55;

      for (let i = 0; i < segments; i++) {
        const t1 = i / segments;
        const t2 = (i + 1) / segments;
        const y1 = (t1 - 0.5) * leafLength;
        const y2 = (t2 - 0.5) * leafLength;
        const w1 = Math.sin(t1 * Math.PI) * leafWidth;
        const w2 = Math.sin(t2 * Math.PI) * leafWidth;
        const curl1 = Math.sin(t1 * Math.PI * 1.5) * 14;
        const curl2 = Math.sin(t2 * Math.PI * 1.5) * 14;

        const pLeft1 = project(-w1, y1, curl1);
        const pRight1 = project(w1, y1, curl1);
        const pLeft2 = project(-w2, y2, curl2);
        const pRight2 = project(w2, y2, curl2);
        const pCenter1 = project(0, y1, curl1 * 0.4);
        const pCenter2 = project(0, y2, curl2 * 0.4);

        if (viewMode === 'wireframe') {
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pLeft1.px, pLeft1.py);
          ctx.lineTo(pRight1.px, pRight1.py);
          ctx.lineTo(pRight2.px, pRight2.py);
          ctx.lineTo(pLeft2.px, pLeft2.py);
          ctx.closePath();
          ctx.stroke();
        } else if (viewMode === 'heatmap') {
          const heatFactor = Math.sin(t1 * Math.PI * 2 + frame * 0.05) * 0.5 + 0.5;
          ctx.fillStyle = heatFactor > 0.65 ? 'rgba(239, 68, 68, 0.75)' : heatFactor > 0.4 ? 'rgba(245, 158, 11, 0.65)' : 'rgba(16, 185, 129, 0.65)';
          ctx.beginPath();
          ctx.moveTo(pLeft1.px, pLeft1.py);
          ctx.lineTo(pRight1.px, pRight1.py);
          ctx.lineTo(pRight2.px, pRight2.py);
          ctx.lineTo(pLeft2.px, pLeft2.py);
          ctx.fill();
        } else {
          const grad = ctx.createLinearGradient(pLeft1.px, pLeft1.py, pRight1.px, pRight1.py);
          grad.addColorStop(0, '#15803d');
          grad.addColorStop(0.5, '#22c55e');
          grad.addColorStop(1, '#166534');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(pLeft1.px, pLeft1.py);
          ctx.lineTo(pCenter1.px, pCenter1.py);
          ctx.lineTo(pCenter2.px, pCenter2.py);
          ctx.lineTo(pLeft2.px, pLeft2.py);
          ctx.fill();

          ctx.fillStyle = '#1e7b39';
          ctx.beginPath();
          ctx.moveTo(pCenter1.px, pCenter1.py);
          ctx.lineTo(pRight1.px, pRight1.py);
          ctx.lineTo(pRight2.px, pRight2.py);
          ctx.lineTo(pCenter2.px, pCenter2.py);
          ctx.fill();
        }

        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 2 * pCenter1.fov;
        ctx.beginPath();
        ctx.moveTo(pCenter1.px, pCenter1.py);
        ctx.lineTo(pCenter2.px, pCenter2.py);
        ctx.stroke();
      }

      const lesions = [
        { x: -18, y: -20, z: 8, r: 12, name: 'Blight Spot A' },
        { x: 14, y: 15, z: 5, r: 9, name: 'Spore Lesion B' },
        { x: -8, y: 35, z: 2, r: 7, name: 'Early Necrosis' }
      ];

      lesions.forEach((lesion, idx) => {
        const pos = project(lesion.x, lesion.y, lesion.z);
        const radius = lesion.r * pos.fov * zScale;
        const pulse = Math.sin(frame * 0.08 + idx) * 3;

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(pos.px, pos.py, radius + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(220, 38, 38, 0.6)';
        ctx.beginPath();
        ctx.arc(pos.px, pos.py, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(`! ${lesion.name}`, pos.px + radius + 4, pos.py + 3);
      });

      if (isSpraying) {
        for (let k = 0; k < 6; k++) {
          sprayParticles.push({
            x: cx + (Math.random() - 0.5) * 80,
            y: cy - 90,
            vx: (Math.random() - 0.5) * 2.2,
            vy: Math.random() * 3.5 + 2,
            life: 1.0,
            color: Math.random() > 0.5 ? '#38bdf8' : '#34d399'
          });
        }
      }

      for (let i = sprayParticles.length - 1; i >= 0; i--) {
        const p = sprayParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.035;
        if (p.life <= 0) {
          sprayParticles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5 * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      if (document.visibilityState === 'visible') {
        frameId = requestAnimationFrame(render);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(frameId);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    render();

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [disease, isSpraying, viewMode]);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      stateRef.current.isDragging = true;
      dragRef.current = { lastX: e.touches[0].clientX, lastY: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e) => {
    if (!stateRef.current.isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragRef.current.lastX;
    const dy = e.touches[0].clientY - dragRef.current.lastY;
    stateRef.current.rotY = (stateRef.current.rotY + dx * 0.8) % 360;
    stateRef.current.rotX = Math.max(-60, Math.min(60, stateRef.current.rotX - dy * 0.8));
    dragRef.current = { lastX: e.touches[0].clientX, lastY: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    stateRef.current.isDragging = false;
  };

  return (
    <div
      style={{
        width: '100%',
        height: '240px',
        borderRadius: '18px',
        background: 'radial-gradient(circle at 50% 50%, rgba(6, 78, 59, 0.4), #031410)',
        border: '1px solid rgba(52, 211, 153, 0.3)',
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '10px',
          fontSize: '10px',
          color: '#6ee7b7',
          background: 'rgba(0,0,0,0.5)',
          padding: '2px 8px',
          borderRadius: '8px',
          pointerEvents: 'none'
        }}
      >
        👆 Touch & Drag to Orbit 360°
      </div>
    </div>
  );
}

/**
 * 3D Holographic Weather Sphere & Micro-Climate Canvas Engine
 */
export function WeatherSphere3DCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;
    let angle = 0;

    const render = () => {
      angle += 0.012;
      const w = (canvas.width = canvas.parentElement?.clientWidth || 360);
      const h = (canvas.height = canvas.parentElement?.clientHeight || 200);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const radius = 65;

      const sphereGrad = ctx.createRadialGradient(cx - 20, cy - 20, 10, cx, cy, radius);
      sphereGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
      sphereGrad.addColorStop(0.6, 'rgba(14, 165, 233, 0.55)');
      sphereGrad.addColorStop(1, 'rgba(3, 105, 161, 0.15)');

      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric Isobar Rings
      const rings = 5;
      for (let r = 0; r < rings; r++) {
        const ringAngle = angle + (r * Math.PI) / rings;
        const rx = radius;
        const ry = Math.cos(ringAngle) * radius;

        ctx.strokeStyle = `rgba(186, 230, 253, ${0.15 + Math.abs(Math.sin(ringAngle)) * 0.45})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, Math.max(1, Math.abs(ry)), ringAngle * 0.2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Orbital Satellites
      for (let s = 0; s < 3; s++) {
        const satAngle = angle * (1.5 + s * 0.4) + (s * (Math.PI * 2)) / 3;
        const sx = cx + Math.cos(satAngle) * (radius + 24);
        const sy = cy + Math.sin(satAngle) * (radius * 0.4 + 10);
        ctx.fillStyle = s === 0 ? '#34d399' : s === 1 ? '#38bdf8' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      if (document.visibilityState === 'visible') {
        frameId = requestAnimationFrame(render);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(frameId);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    render();
    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '200px',
        borderRadius: '18px',
        background: 'radial-gradient(circle at 50% 50%, rgba(15, 32, 39, 0.85), #071318)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '12px',
          fontSize: '11px',
          fontWeight: '700',
          color: '#38bdf8',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} />
        3D Doppler Weather Radar Sphere
      </div>
    </div>
  );
}

/**
 * 3D Cold-Chain Logistics Reefer Van Engine
 */
export function ColdChainVan3DCanvas({ internalTemp = '-4.2°C', doorOpen = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;
    let frame = 0;

    const render = () => {
      frame++;
      const w = (canvas.width = canvas.parentElement?.clientWidth || 360);
      const h = (canvas.height = canvas.parentElement?.clientHeight || 200);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2 + 10;
      const rotY = (frame * 0.5 * Math.PI) / 180;
      const rotX = (15 * Math.PI) / 180;

      const project = (x, y, z) => {
        const x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
        const z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);
        const y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
        const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
        const fov = 300 / (300 + z2);
        return { px: cx + x1 * fov, py: cy + y2 * fov, pz: z2 };
      };

      const p1 = project(-60, -30, -35);
      const p2 = project(60, -30, -35);
      const p3 = project(60, 25, -35);
      const p4 = project(-60, 25, -35);
      const p5 = project(-60, -30, 35);
      const p6 = project(60, -30, 35);
      const p7 = project(60, 25, 35);
      const p8 = project(-60, 25, 35);

      ctx.fillStyle = 'rgba(6, 78, 59, 0.65)';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.8;

      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.lineTo(p6.px, p6.py);
      ctx.lineTo(p5.px, p5.py);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(p5.px, p5.py);
      ctx.lineTo(p6.px, p6.py);
      ctx.lineTo(p7.px, p7.py);
      ctx.lineTo(p8.px, p8.py);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      for (let k = 0; k < 4; k++) {
        const tOffset = (frame * 0.05 + k) % 1;
        const mistY = p5.py + tOffset * 25;
        const mistX = p5.px - 15 - tOffset * 15;
        ctx.fillStyle = `rgba(56, 189, 248, ${0.4 * (1 - tOffset)})`;
        ctx.beginPath();
        ctx.arc(mistX, mistY, 4 + tOffset * 6, 0, Math.PI * 2);
        ctx.fill();
      }

      if (document.visibilityState === 'visible') {
        frameId = requestAnimationFrame(render);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(frameId);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    render();
    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [internalTemp, doorOpen]);

  return (
    <div
      style={{
        width: '100%',
        height: '200px',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.35), rgba(4, 30, 24, 0.95))',
        border: '1px solid rgba(52, 211, 153, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(7, 26, 22, 0.9)',
          border: '1px solid #38bdf8',
          borderRadius: '10px',
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <span style={{ fontSize: '12px' }}>❄️</span>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8' }}>{internalTemp}</span>
      </div>
    </div>
  );
}

/**
 * 3D Holographic Crop / Produce Inspection Canvas
 */
export function Produce3DCanvas({ itemType = 'tomato' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;
    let angle = 0;

    const render = () => {
      angle += 0.02;
      const w = (canvas.width = canvas.parentElement?.clientWidth || 240);
      const h = (canvas.height = canvas.parentElement?.clientHeight || 170);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const radius = 38;
      const bobbing = Math.sin(angle * 2) * 5;

      const bodyGrad = ctx.createRadialGradient(cx - 10, cy - 10 + bobbing, 5, cx, cy + bobbing, radius);
      if (itemType === 'tomato') {
        bodyGrad.addColorStop(0, '#ef4444');
        bodyGrad.addColorStop(0.7, '#dc2626');
        bodyGrad.addColorStop(1, '#991b1b');
      } else if (itemType === 'spinach') {
        bodyGrad.addColorStop(0, '#4ade80');
        bodyGrad.addColorStop(0.7, '#16a34a');
        bodyGrad.addColorStop(1, '#14532d');
      } else {
        bodyGrad.addColorStop(0, '#facc15');
        bodyGrad.addColorStop(0.85, '#ca8a04');
        bodyGrad.addColorStop(1, '#854d0e');
      }

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(cx, cy + bobbing, radius, 0, Math.PI * 2);
      ctx.fill();

      // Specular High Shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx - 12, cy - 14 + bobbing, 10, 6, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Stem and Calyx leaves on top
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(cx, cy - radius + 2 + bobbing, 6, 12, angle, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#15803d';
      ctx.fillRect(cx - 2, cy - radius - 8 + bobbing, 4, 10);

      if (document.visibilityState === 'visible') {
        frameId = requestAnimationFrame(render);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(frameId);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    render();
    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [itemType]);

  return (
    <div style={{ width: '100%', height: '170px', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '9.5px',
          color: '#86efac',
          whiteSpace: 'nowrap'
        }}
      >
        ✦ 100% Pesticide-Free Verified
      </div>
    </div>
  );
}
