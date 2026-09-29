import React, { useEffect, useRef, useState } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Sparkles, Layers, Eye, Droplets, Sun, Wind, CheckCircle2, ShieldAlert, Zap, HelpCircle, X, Info } from 'lucide-react';

export default function ThreeDPortViewer({
  mode = 'leaf_inspector', // 'leaf_inspector' | 'medicine_dispenser' | 'farm_terrain'
  diseaseName = 'Tomato Early Blight',
  severity = '65%',
  medicineData = null,
  onHotspotClick = null
}) {
  const canvasRef = useRef(null);
  const [rotationX, setRotationX] = useState(15);
  const [rotationY, setRotationY] = useState(35);
  const [zoom, setZoom] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewStyle, setViewStyle] = useState('realistic'); // 'realistic' | 'wireframe' | 'heatmap' | 'hologram'
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [sprayActive, setSprayActive] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('day'); // 'day' | 'golden' | 'night'
  const [showInfoModal, setShowInfoModal] = useState(false);
  const animationFrameRef = useRef(null);
  const stateRef = useRef({ rotX: 15, rotY: 35, zoom: 1.0, isDragging: false });

  // Keep stateRef synced for animation loops
  useEffect(() => {
    stateRef.current = { rotX: rotationX, rotY: rotationY, zoom, isDragging };
  }, [rotationX, rotationY, zoom, isDragging]);

  // Handle Mouse / Touch Dragging for 360° 3D Orbit
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setRotationY((prev) => (prev + deltaX * 0.6) % 360);
    setRotationX((prev) => Math.max(-75, Math.min(75, prev - deltaY * 0.6)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch support for mobile devices
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStart.x;
    const deltaY = e.touches[0].clientY - dragStart.y;
    setRotationY((prev) => (prev + deltaX * 0.8) % 360);
    setRotationX((prev) => Math.max(-75, Math.min(75, prev - deltaY * 0.8)));
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  // Canvas 3D Rendering Engine (Procedural 3D WebGL / High-Performance 2.5D Orthographic & Perspective Engine)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameCount = 0;

    const render = () => {
      frameCount++;
      const width = (canvas.width = canvas.parentElement?.clientWidth || 450);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 340);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radX = (stateRef.current.rotX * Math.PI) / 180;
      const radY = ((stateRef.current.rotY + (stateRef.current.isDragging ? 0 : frameCount * 0.3)) * Math.PI) / 180;
      const zScale = stateRef.current.zoom;

      // 3D Projection Helpers
      const project = (x, y, z) => {
        // Rotate around Y
        const x1 = x * Math.cos(radY) + z * Math.sin(radY);
        const z1 = -x * Math.sin(radY) + z * Math.cos(radY);
        // Rotate around X
        const y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
        const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);
        // Perspective divide
        const distance = 400;
        const fov = distance / (distance + z2);
        return {
          px: cx + x1 * fov * zScale,
          py: cy + y2 * fov * zScale,
          pz: z2,
          fov
        };
      };

      // =========================================================================
      // MODE 1: 3D PLANT LEAF & DISEASE INSPECTOR
      // =========================================================================
      if (mode === 'leaf_inspector') {
        // Background Grid / Bio-Aura
        draw3DGrid(ctx, project, 160, viewStyle);

        // Draw Stem
        ctx.beginPath();
        const stemBase = project(0, 110, 0);
        const stemTip = project(0, -90, 0);
        ctx.strokeStyle = viewStyle === 'hologram' ? '#38bdf8' : '#2d6a4f';
        ctx.lineWidth = 6 * stemBase.fov * zScale;
        ctx.lineCap = 'round';
        ctx.moveTo(stemBase.px, stemBase.py);
        ctx.lineTo(stemTip.px, stemTip.py);
        ctx.stroke();

        // Draw 3D Leaf Mesh (Parametric curved leaf vertices)
        const leafSegments = 16;
        for (let i = 0; i < leafSegments; i++) {
          const t1 = i / leafSegments;
          const t2 = (i + 1) / leafSegments;
          const y1 = 90 - t1 * 180;
          const y2 = 90 - t2 * 180;
          const w1 = Math.sin(t1 * Math.PI) * 75;
          const w2 = Math.sin(t2 * Math.PI) * 75;
          const curl1 = Math.sin(t1 * Math.PI) * 22;
          const curl2 = Math.sin(t2 * Math.PI) * 22;

          // Quad points (Left & Right halves)
          const pLeft1 = project(-w1, y1, curl1);
          const pLeft2 = project(-w2, y2, curl2);
          const pMid1 = project(0, y1, curl1 * 0.4);
          const pMid2 = project(0, y2, curl2 * 0.4);
          const pRight1 = project(w1, y1, curl1);
          const pRight2 = project(w2, y2, curl2);

          // Render Left Half
          ctx.beginPath();
          ctx.moveTo(pMid1.px, pMid1.py);
          ctx.lineTo(pLeft1.px, pLeft1.py);
          ctx.lineTo(pLeft2.px, pLeft2.py);
          ctx.lineTo(pMid2.px, pMid2.py);
          ctx.closePath();

          if (viewStyle === 'wireframe') {
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 1;
            ctx.stroke();
          } else if (viewStyle === 'heatmap') {
            // Heatmap color based on severity & vertical position
            const heat = Math.sin(t1 * Math.PI * 1.5 + frameCount * 0.05);
            ctx.fillStyle = heat > 0.3 ? 'rgba(239, 68, 68, 0.75)' : 'rgba(245, 158, 11, 0.65)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.stroke();
          } else if (viewStyle === 'hologram') {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
            ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.2;
            ctx.stroke();
          } else {
            // Realistic Leaf Green Gradient with subtle disease necrotic spots
            const isDiseasedZone = t1 > 0.35 && t1 < 0.75;
            const grad = ctx.createLinearGradient(pMid1.px, pMid1.py, pLeft1.px, pLeft1.py);
            if (isDiseasedZone) {
              grad.addColorStop(0, '#52796f');
              grad.addColorStop(0.5, '#784d28');
              grad.addColorStop(1, '#a73e21');
            } else {
              grad.addColorStop(0, '#2d6a4f');
              grad.addColorStop(0.7, '#40916c');
              grad.addColorStop(1, '#52b788');
            }
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.stroke();
          }

          // Render Right Half
          ctx.beginPath();
          ctx.moveTo(pMid1.px, pMid1.py);
          ctx.lineTo(pRight1.px, pRight1.py);
          ctx.lineTo(pRight2.px, pRight2.py);
          ctx.lineTo(pMid2.px, pMid2.py);
          ctx.closePath();

          if (viewStyle === 'wireframe') {
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 1;
            ctx.stroke();
          } else if (viewStyle === 'heatmap') {
            ctx.fillStyle = t1 > 0.4 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(16, 185, 129, 0.6)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.stroke();
          } else if (viewStyle === 'hologram') {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
            ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.2;
            ctx.stroke();
          } else {
            const gradR = ctx.createLinearGradient(pMid1.px, pMid1.py, pRight1.px, pRight1.py);
            const isDiseasedR = t1 > 0.4 && t1 < 0.8;
            if (isDiseasedR) {
              gradR.addColorStop(0, '#52796f');
              gradR.addColorStop(0.6, '#8b5a2b');
              gradR.addColorStop(1, '#c0392b');
            } else {
              gradR.addColorStop(0, '#2d6a4f');
              gradR.addColorStop(0.7, '#52b788');
              gradR.addColorStop(1, '#74c69d');
            }
            ctx.fillStyle = gradR;
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.stroke();
          }
        }

        // Draw Interactive 3D Disease Hotspots
        const hotspots = [
          { id: 'spot1', label: 'Necrotic Ring Lesion', x: -28, y: -10, z: 16, severity: 'High', color: '#ef4444' },
          { id: 'spot2', label: 'Chlorosis Margin', x: 35, y: 15, z: 12, severity: 'Moderate', color: '#f59e0b' },
          { id: 'spot3', label: 'Fungal Spore Cluster', x: -12, y: -45, z: 8, severity: 'Critical', color: '#dc2626' }
        ];

        hotspots.forEach((spot) => {
          const pt = project(spot.x, spot.y, spot.z);
          const pulse = Math.sin(frameCount * 0.1 + spot.x) * 4;
          const radius = Math.max(5, (9 + pulse) * pt.fov * zScale);

          // Glowing radar ring
          ctx.beginPath();
          ctx.arc(pt.px, pt.py, radius * 1.6, 0, Math.PI * 2);
          ctx.strokeStyle = spot.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Center solid dot
          ctx.beginPath();
          ctx.arc(pt.px, pt.py, radius * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = spot.color;
          ctx.fill();

          // Floating 3D Text Label
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`🔍 ${spot.label}`, pt.px + radius + 4, pt.py + 3);
        });
      }

      // =========================================================================
      // MODE 2: 3D AGRO-MEDICINE & FERTILIZER DISPENSER PORT
      // =========================================================================
      else if (mode === 'medicine_dispenser') {
        draw3DGrid(ctx, project, 140, 'hologram');

        // Draw 3D Fertilizer Sack / Medicine Cylinder
        const segments = 24;
        const bodyHeight = 130;
        const radius = 55;
        const topCapY = -80;
        const bottomY = 70;

        // Draw Cylinder Body Ribs
        for (let i = 0; i < segments; i++) {
          const angle1 = (i / segments) * Math.PI * 2;
          const angle2 = ((i + 1) / segments) * Math.PI * 2;
          const x1 = Math.cos(angle1) * radius;
          const z1 = Math.sin(angle1) * radius;
          const x2 = Math.cos(angle2) * radius;
          const z2 = Math.sin(angle2) * radius;

          const pTop1 = project(x1, topCapY, z1);
          const pTop2 = project(x2, topCapY, z2);
          const pBot1 = project(x1, bottomY, z1);
          const pBot2 = project(x2, bottomY, z2);

          // Fill face
          ctx.beginPath();
          ctx.moveTo(pTop1.px, pTop1.py);
          ctx.lineTo(pTop2.px, pTop2.py);
          ctx.lineTo(pBot2.px, pBot2.py);
          ctx.lineTo(pBot1.px, pBot1.py);
          ctx.closePath();

          const isFront = z1 + z2 > 0;
          const isBio = medicineData?.type === 'organic';
          const baseColor = isBio ? (isFront ? '#10b981' : '#047857') : isFront ? '#0ea5e9' : '#0369a1';

          ctx.fillStyle = baseColor;
          ctx.globalAlpha = isFront ? 0.9 : 0.45;
          ctx.fill();
          ctx.globalAlpha = 1.0;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.stroke();
        }

        // Draw Cap & Spray Nozzle
        const capP = project(0, topCapY - 20, 0);
        ctx.beginPath();
        ctx.arc(capP.px, capP.py, 16 * capP.fov * zScale, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // 3D Spray Particle Emission Animation
        if (sprayActive || frameCount % 60 < 45) {
          for (let p = 0; p < 18; p++) {
            const spread = (p - 9) * 4;
            const sprayY = topCapY - 20 - (p * 5 + (frameCount * 3) % 40);
            const partPt = project(spread + Math.sin(frameCount * 0.2 + p) * 10, sprayY, Math.cos(frameCount * 0.2 + p) * 10);
            ctx.beginPath();
            ctx.arc(partPt.px, partPt.py, 2.5 * partPt.fov * zScale, 0, Math.PI * 2);
            ctx.fillStyle = medicineData?.type === 'organic' ? 'rgba(52, 211, 153, 0.7)' : 'rgba(56, 189, 248, 0.8)';
            ctx.fill();
          }
        }

        // 3D Product Label Overlay
        const labelP = project(0, 0, radius + 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(medicineData?.name || 'AgriShield 3D', labelP.px, labelP.py);
        ctx.fillStyle = '#fef08a';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(medicineData?.type === 'organic' ? '🌿 100% Bio-Active' : '🧪 Synthetic Agrochemical', labelP.px, labelP.py + 14);
      }

      // =========================================================================
      // MODE 3: 3D SMART FARM TERRAIN & ELEVATION PORT
      // =========================================================================
      else if (mode === 'farm_terrain') {
        const gridSize = 7;
        const spacing = 35;
        const startX = -((gridSize - 1) * spacing) / 2;
        const startZ = -((gridSize - 1) * spacing) / 2;

        // Draw Isometric Elevation Surface
        for (let gx = 0; gx < gridSize - 1; gx++) {
          for (let gz = 0; gz < gridSize - 1; gz++) {
            const x0 = startX + gx * spacing;
            const z0 = startZ + gz * spacing;
            const x1 = x0 + spacing;
            const z1 = z0 + spacing;

            // Height function (simulates furrow channels and ridges)
            const y00 = Math.sin(gx * 0.8) * 15 + Math.cos(gz * 0.8) * 12;
            const y10 = Math.sin((gx + 1) * 0.8) * 15 + Math.cos(gz * 0.8) * 12;
            const y11 = Math.sin((gx + 1) * 0.8) * 15 + Math.cos((gz + 1) * 0.8) * 12;
            const y01 = Math.sin(gx * 0.8) * 15 + Math.cos((gz + 1) * 0.8) * 12;

            const p00 = project(x0, y00 + 40, z0);
            const p10 = project(x1, y10 + 40, z0);
            const p11 = project(x1, y11 + 40, z1);
            const p01 = project(x0, y01 + 40, z1);

            ctx.beginPath();
            ctx.moveTo(p00.px, p00.py);
            ctx.lineTo(p10.px, p10.py);
            ctx.lineTo(p11.px, p11.py);
            ctx.lineTo(p01.px, p01.py);
            ctx.closePath();

            // Color terrain by moisture and elevation
            const isIrrigationChannel = gz === 3;
            if (isIrrigationChannel) {
              ctx.fillStyle = 'rgba(14, 165, 233, 0.75)'; // Water channel
            } else {
              const moistureColor = gx % 2 === 0 ? '#1b4332' : '#2d6a4f';
              ctx.fillStyle = moistureColor;
            }
            ctx.fill();
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw miniature 3D crop sprout on each cell
            if (!isIrrigationChannel && (gx + gz) % 2 === 0) {
              const plantP = project(x0 + spacing / 2, y00 + 30, z0 + spacing / 2);
              ctx.beginPath();
              ctx.arc(plantP.px, plantP.py - 6, 4 * plantP.fov * zScale, 0, Math.PI * 2);
              ctx.fillStyle = '#4ade80';
              ctx.fill();
            }
          }
        }

        // 3D Soil Sensor Node Marker
        const sensorPt = project(20, 20, 20);
        ctx.beginPath();
        ctx.arc(sensorPt.px, sensorPt.py, 8 * sensorPt.fov * zScale, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillText('📡 IoT Soil Moisture: 74%', sensorPt.px + 12, sensorPt.py);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [mode, viewStyle, diseaseName, severity, medicineData, sprayActive, timeOfDay]);

  function draw3DGrid(ctx, project, size, style) {
    const lines = 6;
    const step = (size * 2) / lines;
    ctx.strokeStyle = style === 'hologram' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(52, 211, 153, 0.12)';
    ctx.lineWidth = 1;

    for (let i = -lines / 2; i <= lines / 2; i++) {
      const p1 = project(-size, 100, i * step);
      const p2 = project(size, 100, i * step);
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();

      const p3 = project(i * step, 100, -size);
      const p4 = project(i * step, 100, size);
      ctx.beginPath();
      ctx.moveTo(p3.px, p3.py);
      ctx.lineTo(p4.px, p4.py);
      ctx.stroke();
    }
  }

  const resetCamera = () => {
    setRotationX(15);
    setRotationY(35);
    setZoom(1.0);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '340px',
      height: '100%',
      background: 'radial-gradient(circle at 50% 40%, #0d2822 0%, #041310 100%)',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1.5px solid rgba(55, 189, 120, 0.35)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
      userSelect: 'none',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 3D Viewport Controls Top Bar */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        {/* Title Badge */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'auto'
        }}>
          <Sparkles size={14} color="#34d399" />
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {mode === 'leaf_inspector' ? '3D Leaf Tissue Diagnostic Port' : mode === 'medicine_dispenser' ? '3D Medicine & Fertilizer Port' : '3D Smart Farm Elevation Port'}
          </span>
          <span style={{
            fontSize: '10px',
            background: 'rgba(52, 211, 153, 0.2)',
            color: '#34d399',
            padding: '2px 6px',
            borderRadius: '6px',
            fontWeight: '700'
          }}>
            3D Simulation Mesh
          </span>
        </div>

        {/* View Shader Toggle Pills & Info Button */}
        <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto', alignItems: 'center' }}>
          {['realistic', 'wireframe', 'heatmap', 'hologram'].map((style) => (
            <button
              key={style}
              onClick={() => setViewStyle(style)}
              style={{
                background: viewStyle === style ? '#10b981' : 'rgba(0, 0, 0, 0.65)',
                color: viewStyle === style ? '#ffffff' : '#94a3b8',
                border: viewStyle === style ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.15)',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '10px',
                fontWeight: '700',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease'
              }}
            >
              {style}
            </button>
          ))}

          <button
            onClick={() => setShowInfoModal(true)}
            title="What is this 3D feature?"
            style={{
              background: 'rgba(56, 189, 248, 0.2)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '10.5px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            <HelpCircle size={12} />
            <span>What is this?</span>
          </button>
        </div>
      </div>

      {/* "What is this?" Explanatory Modal (Problem 5) */}
      {showInfoModal && (
        <div
          onClick={() => setShowInfoModal(false)}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 100,
            background: 'rgba(2, 10, 8, 0.88)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg, #09261c, #051a13)',
              border: '1.5px solid rgba(52, 211, 153, 0.4)',
              borderRadius: '16px',
              padding: '20px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              color: '#effbe7',
              fontSize: '12.5px',
              lineHeight: '1.5'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={18} color="#34d399" />
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#effbe7' }}>
                  {mode === 'leaf_inspector'
                    ? '3D Leaf Tissue Diagnostic Port'
                    : mode === 'medicine_dispenser'
                    ? '3D Medicine & Fertilizer Port'
                    : '3D Farm Digital Twin'}
                </h4>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <strong style={{ color: '#86efac' }}>🎯 Purpose:</strong>{' '}
                {mode === 'leaf_inspector'
                  ? 'Visualizes crop leaf structure in 360° to highlight pathogen infection zones (lesions, fungal spores, necrosis).'
                  : mode === 'medicine_dispenser'
                  ? 'Visualizes precise spray droplet dispersion, leaf coverage, and absorption physics for biological & chemical remedies.'
                  : 'Provides a topographical 3D model of farm plots, soil hydration tiers, and crop canopy coverage.'}
              </div>

              <div>
                <strong style={{ color: '#86efac' }}>👆 How to Use:</strong>
                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  <li>Click & drag (or swipe on touchscreens) to rotate 360°.</li>
                  <li>Use the Zoom controls (+ / -) to inspect leaf tissue up close.</li>
                  <li>Switch shader pills: <em>Realistic</em>, <em>Wireframe</em>, <em>Heatmap</em>, or <em>Hologram</em>.</li>
                </ul>
              </div>

              <div>
                <strong style={{ color: '#86efac' }}>👁️ What You Are Seeing:</strong>{' '}
                {mode === 'leaf_inspector'
                  ? `Curved 3D leaf blade with procedural vein mesh and disease symptom clusters for ${diseaseName}.`
                  : mode === 'medicine_dispenser'
                  ? 'Simulated spray nozzle atomization showing droplet adhesion on leaf cuticle.'
                  : '3D plot terrain grid with elevation contours and moisture saturation shading.'}
              </div>

              <div>
                <strong style={{ color: '#86efac' }}>🌾 Farmer Benefit:</strong>{' '}
                Helps understand disease progression beneath leaf cuticles and ensures spraying reaches both upper and underside surfaces where fungi thrive.
              </div>

              <div style={{ background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', color: '#fef08a' }}>
                <strong>📡 Data Source:</strong> Simulated 3D Educational Visualization. (Computer-generated procedural geometry for agronomy education — not direct hardware telemetry).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive 3D Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        style={{
          width: '100%',
          flex: 1,
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'block'
        }}
      />

      {/* Bottom Floating Toolbar */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        right: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        {/* Helper Hint */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(6px)',
          borderRadius: '8px',
          padding: '4px 10px',
          fontSize: '11px',
          color: '#cbd5e1',
          pointerEvents: 'auto'
        }}>
          🖐️ Drag to Rotate 360° • Zoom: {(zoom * 100).toFixed(0)}%
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto' }}>
          <button
            onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
            title="Zoom In"
            style={{
              background: 'rgba(0, 0, 0, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            title="Zoom Out"
            style={{
              background: 'rgba(0, 0, 0, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={resetCamera}
            title="Reset View"
            style={{
              background: 'rgba(0, 0, 0, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#34d399',
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: '700'
            }}
          >
            <RotateCw size={13} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
