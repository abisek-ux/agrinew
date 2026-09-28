import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { productAPI, orderAPI, reviewAPI } from '../services/api';
import LiveTrackingMap from './LiveTrackingMap';
import {
  ShoppingCart,
  Sprout,
  Apple,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle,
  Package,
  RotateCw,
  Search,
  SlidersHorizontal,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  Truck,
  Sparkles,
  Zap,
  ArrowRight,
  Eye,
  ShieldCheck,
  Heart,
  ChefHat,
  Leaf,
  Activity,
  Award,
  RefreshCw,
  Clock,
  Compass,
  Home,
  DollarSign,
  Send,
  Radio,
  BarChart3,
  Layers,
  ChevronRight,
  ShieldAlert,
  Video,
  Camera,
  Snowflake,
  Star,
  X
} from 'lucide-react';
import AgriLinkLogo from './AgriLinkLogo';

const getProductId = (p) => {
  if (!p) return '';
  if (typeof p === 'string') return p;
  return String(p._id || p.id || '');
};

const isSameProduct = (a, b) => {
  const idA = getProductId(a);
  const idB = getProductId(b);
  return Boolean(idA && idB && idA === idB);
};

/* ─────────────────────────────────────────────────────────────
   3D Produce Quality & Hologram Inspector Component
───────────────────────────────────────────────────────────── */
function Produce3DInspector({ product, onClose, onAddToCart }) {
  const canvasRef = useRef(null);
  const [rotX, setRotX] = useState(15);
  const [rotY, setRotY] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState('organic'); // 'organic' | 'hologram' | 'thermal' | 'soil_mesh'
  const [activeAnalysis, setActiveAnalysis] = useState('nutrients');
  const animFrame = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let angle = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Glow backdrop
      const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 170);
      if (viewMode === 'hologram') {
        bgGrad.addColorStop(0, 'rgba(0, 242, 254, 0.22)');
        bgGrad.addColorStop(1, 'rgba(4, 9, 20, 0)');
      } else if (viewMode === 'thermal') {
        bgGrad.addColorStop(0, 'rgba(255, 75, 43, 0.25)');
        bgGrad.addColorStop(1, 'rgba(10, 4, 15, 0)');
      } else {
        bgGrad.addColorStop(0, 'rgba(46, 125, 50, 0.25)');
        bgGrad.addColorStop(1, 'rgba(5, 20, 10, 0)');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Rotating 3D Organic Sphere / Produce Geometry
      const currentRotY = (rotY + (isDragging ? 0 : angle * 0.4)) * (Math.PI / 180);
      const currentRotX = rotX * (Math.PI / 180);

      const radius = 95;
      const latLines = 14;
      const lonLines = 20;

      ctx.save();
      ctx.translate(cx, cy);

      // Draw Orbit Rings
      ctx.strokeStyle = viewMode === 'hologram' ? 'rgba(0, 242, 254, 0.35)' : 'rgba(76, 175, 80, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.ellipse(0, 0, 140, 50, currentRotY, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Wireframe / 3D Organic Surface
      for (let lat = 0; lat <= latLines; lat++) {
        const theta = (lat * Math.PI) / latLines;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        ctx.beginPath();
        for (let lon = 0; lon <= lonLines; lon++) {
          const phi = (lon * 2 * Math.PI) / lonLines;
          const sinPhi = Math.sin(phi + currentRotY);
          const cosPhi = Math.cos(phi + currentRotY);

          // 3D coordinates
          let x = radius * sinTheta * cosPhi;
          let y = radius * cosTheta;
          let z = radius * sinTheta * sinPhi;

          // Rotation around X axis
          const y2 = y * Math.cos(currentRotX) - z * Math.sin(currentRotX);
          const z2 = y * Math.sin(currentRotX) + z * Math.cos(currentRotX);

          // Depth projection
          const fov = 350;
          const scale = fov / (fov + z2);
          const px = x * scale;
          const py = y2 * scale;

          if (lon === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        if (viewMode === 'hologram') {
          ctx.strokeStyle = `rgba(0, 242, 254, ${0.25 + (lat / latLines) * 0.4})`;
          ctx.lineWidth = 1.2;
        } else if (viewMode === 'thermal') {
          ctx.strokeStyle = lat % 2 === 0 ? 'rgba(255, 87, 34, 0.6)' : 'rgba(255, 193, 7, 0.5)';
          ctx.lineWidth = 1.5;
        } else {
          ctx.strokeStyle = lat % 2 === 0 ? 'rgba(76, 175, 80, 0.6)' : 'rgba(139, 195, 74, 0.4)';
          ctx.lineWidth = 1.2;
        }
        ctx.stroke();
      }

      // Draw 3D Hotspot Nodes (Brix Sugar, Chlorophyll, Soil Purity)
      const hotspots = [
        { label: 'Brix 14.2°', sub: 'Natural Sweetness', x: -50, y: -40, z: 20, color: '#FBC02D' },
        { label: 'Zero Pesticide', sub: 'Mass-Spec Verified', x: 55, y: -20, z: -10, color: '#00E676' },
        { label: 'Soil Mineral 98%', sub: 'Rich Bio-Compost', x: 10, y: 55, z: 30, color: '#29B6F6' }
      ];

      hotspots.forEach((spot) => {
        const cosPhi = Math.cos(currentRotY);
        const sinPhi = Math.sin(currentRotY);
        const rotX_ = spot.x * cosPhi - spot.z * sinPhi;
        const rotZ_ = spot.x * sinPhi + spot.z * cosPhi;
        const rotY_ = spot.y * Math.cos(currentRotX) - rotZ_ * Math.sin(currentRotX);

        const fov = 350;
        const scale = fov / (fov + rotZ_);
        const px = rotX_ * scale;
        const py = rotY_ * scale;

        if (rotZ_ > -50) {
          // Hotspot marker
          ctx.fillStyle = spot.color;
          ctx.beginPath();
          ctx.arc(px, py, 5 * scale, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Connective line to tag
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + 24, py - 18);
          ctx.lineTo(px + 90, py - 18);
          ctx.stroke();

          // Tag background
          ctx.fillStyle = 'rgba(10, 25, 20, 0.85)';
          ctx.fillRect(px + 24, py - 32, 95, 26);
          ctx.strokeStyle = spot.color;
          ctx.strokeRect(px + 24, py - 32, 95, 26);

          ctx.fillStyle = '#effbe7';
          ctx.font = 'bold 9.5px sans-serif';
          ctx.fillText(spot.label, px + 28, py - 20);
          ctx.fillStyle = '#8be28b';
          ctx.font = '7.5px sans-serif';
          ctx.fillText(spot.sub, px + 28, py - 10);
        }
      });

      ctx.restore();

      angle += 1;
      animFrame.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame.current);
  }, [rotX, rotY, isDragging, viewMode]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(2, 10, 8, 0.85)',
      backdropFilter: 'blur(16px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div
        className="responsive-modal-card"
        style={{
          background: 'linear-gradient(145deg, rgba(13, 38, 30, 0.95), rgba(7, 21, 17, 0.98))',
          border: '1.5px solid rgba(76, 175, 80, 0.4)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '880px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(76, 175, 80, 0.25)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2e7d32, #1b5e20)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(76, 175, 80, 0.5)'
            }}>
              <Sparkles size={22} color="#effbe7" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, color: '#effbe7', fontSize: '20px', fontWeight: '800' }}>
                  {product.title} • 3D Bio-Purity Scan
                </h3>
                <span style={{
                  background: 'rgba(76, 175, 80, 0.25)',
                  border: '1px solid rgba(76, 175, 80, 0.5)',
                  color: '#8be28b',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '20px'
                }}>
                  Grade A+ Organic
                </span>
              </div>
              <p style={{ margin: '2px 0 0', color: '#a3c2b0', fontSize: '12px' }}>
                Harvested by {product.farmerName || 'Regional Partner Farmer'} • Real-Time Spectrometry Telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#effbe7',
              borderRadius: '12px',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: '700'
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', padding: 'clamp(14px, 3vw, 24px)' }}>
          {/* Left: 3D Interactive Canvas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                position: 'relative',
                background: 'rgba(4, 15, 12, 0.8)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                borderRadius: '18px',
                overflow: 'hidden',
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onMouseDown={(e) => {
                setIsDragging(true);
                setLastPos({ x: e.clientX, y: e.clientY });
              }}
              onMouseMove={(e) => {
                if (!isDragging) return;
                const dx = e.clientX - lastPos.x;
                const dy = e.clientY - lastPos.y;
                setRotY(r => (r + dx * 0.7) % 360);
                setRotX(r => Math.max(-60, Math.min(60, r - dy * 0.7)));
                setLastPos({ x: e.clientX, y: e.clientY });
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              <canvas ref={canvasRef} width={420} height={320} style={{ width: '100%', height: '320px', display: 'block' }} />

              {/* Holographic Controls overlay */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                display: 'flex',
                gap: '6px'
              }}>
                {['organic', 'hologram', 'thermal'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{
                      background: viewMode === mode ? 'rgba(76, 175, 80, 0.85)' : 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(0, 0, 0, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '4px 10px',
                color: '#8be28b',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <RotateCw size={12} />
                <span>Drag to Orbit 360°</span>
              </div>
            </div>

            {/* Farm Origin Coordinates */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#effbe7', fontSize: '13px' }}>
                <MapPin size={16} color="#37bd78" />
                <span>{product.location?.address || 'Mandya Organic Farm, Karnataka'}</span>
              </div>
              <span style={{ fontSize: '11px', color: '#f4c95d', fontWeight: '700' }}>
                GPS: {product.location?.lat?.toFixed(3) || '12.522'}, {product.location?.lng?.toFixed(3) || '76.900'}
              </span>
            </div>
          </div>

          {/* Right: Nutritional & Bio Data */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px'
            }}>
              <div style={{
                background: 'rgba(46, 125, 50, 0.15)',
                border: '1px solid rgba(46, 125, 50, 0.35)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#8be28b', fontSize: '11px', fontWeight: '700' }}>FRESHNESS SCORE</div>
                <div style={{ color: '#effbe7', fontSize: '24px', fontWeight: '900', marginTop: '2px' }}>99.4%</div>
                <div style={{ color: '#a3c2b0', fontSize: '10px' }}>Picked within 24h</div>
              </div>

              <div style={{
                background: 'rgba(244, 201, 93, 0.12)',
                border: '1px solid rgba(244, 201, 93, 0.35)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#f4c95d', fontSize: '11px', fontWeight: '700' }}>CARBON SAVINGS</div>
                <div style={{ color: '#effbe7', fontSize: '24px', fontWeight: '900', marginTop: '2px' }}>-1.8 kg</div>
                <div style={{ color: '#a3c2b0', fontSize: '10px' }}>Direct Farm Dispatch</div>
              </div>
            </div>

            {/* Health & Nutrient Highlights */}
            <div style={{
              background: 'rgba(9, 43, 39, 0.5)',
              border: '1px solid rgba(110, 219, 208, 0.2)',
              borderRadius: '14px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#6edbd0', fontWeight: '700', fontSize: '13px' }}>
                <Activity size={16} />
                <span>Nutrient & Vitamin Profile</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#effbe7', marginBottom: '3px' }}>
                    <span>Vitamin C & Bio-Antioxidants</span>
                    <span style={{ color: '#37bd78', fontWeight: '700' }}>94% RDA</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: '94%', height: '100%', background: 'linear-gradient(90deg, #37bd78, #8be28b)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#effbe7', marginBottom: '3px' }}>
                    <span>Dietary Fiber & Enzymes</span>
                    <span style={{ color: '#f4c95d', fontWeight: '700' }}>88% RDA</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: '88%', height: '100%', background: 'linear-gradient(90deg, #f4c95d, #ffa726)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#effbe7', marginBottom: '3px' }}>
                    <span>Potassium & Hydration Index</span>
                    <span style={{ color: '#29B6F6', fontWeight: '700' }}>96% RDA</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: '96%', height: '100%', background: 'linear-gradient(90deg, #29B6F6, #00E5FF)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Price and Add Action */}
            <div style={{
              marginTop: 'auto',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase' }}>Direct Farm Price</div>
                <div style={{ color: '#37bd78', fontSize: '26px', fontWeight: '900' }}>
                  ₹{product.price}
                  <span style={{ fontSize: '13px', color: '#effbe7', fontWeight: '600' }}>/{product.unit || 'kg'}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                style={{
                  background: 'linear-gradient(135deg, #00897b, #004d40)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#ffffff',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(0, 137, 123, 0.4)'
                }}
              >
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Direct Farmer Price Negotiation / Bargain Modal
───────────────────────────────────────────────────────────── */
function BargainOfferModal({ product, onClose, onOfferAccepted }) {
  const [proposedPrice, setProposedPrice] = useState(Math.max(1, Math.round(Number(product.price) * 0.9)));
  const [quantity, setQuantity] = useState(5);
  const [status, setStatus] = useState('idle'); // 'idle' | 'negotiating' | 'accepted' | 'counter'
  const [counterPrice, setCounterPrice] = useState(null);

  const handlePropose = () => {
    setStatus('negotiating');
    setTimeout(() => {
      const minAcceptable = Number(product.price) * 0.85;
      if (proposedPrice >= minAcceptable && quantity >= 3) {
        setStatus('accepted');
      } else {
        const fairCounter = Math.round(Number(product.price) * 0.88);
        setCounterPrice(fairCounter);
        setStatus('counter');
      }
    }, 1400);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(2, 10, 8, 0.85)',
      backdropFilter: 'blur(16px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div
        className="responsive-modal-card"
        style={{
          background: 'linear-gradient(145deg, #092b27, #061917)',
          border: '1.5px solid rgba(244, 201, 93, 0.4)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '520px',
          padding: 'clamp(16px, 4vw, 28px)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(244, 201, 93, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f4c95d, #ffa726)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={22} color="#092b27" />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#effbe7', fontSize: '18px', fontWeight: '800' }}>
                Farmer Direct Bulk Bargain
              </h3>
              <p style={{ margin: 0, color: '#a3c2b0', fontSize: '12px' }}>
                Offer custom price for bulk harvest orders
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#effbe7', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#a3c2b0', fontSize: '13px' }}>Item:</span>
            <span style={{ color: '#effbe7', fontWeight: '700', fontSize: '13px' }}>{product.title}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#a3c2b0', fontSize: '13px' }}>Original Unit Price:</span>
            <span style={{ color: '#f4c95d', fontWeight: '800', fontSize: '14px' }}>₹{product.price} / {product.unit || 'kg'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#a3c2b0', fontSize: '13px' }}>Farmer Partner:</span>
            <span style={{ color: '#37bd78', fontWeight: '700', fontSize: '13px' }}>{product.farmerName || 'Verified Producer'}</span>
          </div>
        </div>

        {status === 'idle' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', color: '#effbe7', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  Target Bulk Quantity ({product.unit || 'kg'}):
                </label>
                <input
                  type="number"
                  min="2"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(2, parseInt(e.target.value) || 2))}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: '700',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#effbe7', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  Your Proposed Price Per Unit (₹):
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="range"
                    min={Math.round(Number(product.price) * 0.6)}
                    max={Number(product.price)}
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ color: '#37bd78', fontSize: '18px', fontWeight: '900', minWidth: '60px', textAlign: 'right' }}>
                    ₹{proposedPrice}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#a3c2b0', marginTop: '4px' }}>
                  <span>Total Proposed: ₹{proposedPrice * quantity}</span>
                  <span style={{ color: '#f4c95d' }}>Saving: ₹{(Number(product.price) - proposedPrice) * quantity}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePropose}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f4c95d, #ffa726)',
                border: 'none',
                color: '#092b27',
                fontSize: '15px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Send size={18} />
              <span>Transmit Bulk Offer to Farmer</span>
            </button>
          </div>
        )}

        {status === 'negotiating' && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <RotateCw size={36} color="#f4c95d" style={{ animation: 'spin 1s linear infinite' }} />
            <h4 style={{ color: '#effbe7', margin: '16px 0 6px' }}>Transmitting Offer to Farmer Radar...</h4>
            <p style={{ color: '#a3c2b0', fontSize: '13px', margin: 0 }}>Evaluating harvest costs & regional farm supply balance</p>
          </div>
        )}

        {status === 'accepted' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={48} color="#37bd78" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ color: '#effbe7', fontSize: '18px', margin: '0 0 6px' }}>🎉 Offer Accepted by Farmer!</h4>
            <p style={{ color: '#8be28b', fontSize: '13px', margin: '0 0 20px' }}>
              Farmer agreed to ₹{proposedPrice}/{product.unit || 'kg'} for {quantity} {product.unit || 'kg'}.
            </p>
            <button
              onClick={() => {
                onOfferAccepted({
                  ...product,
                  price: proposedPrice,
                  quantity
                });
                onClose();
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2e7d32, #1b5e20)',
                border: 'none',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Add Negotiated Bulk Batch to Cart
            </button>
          </div>
        )}

        {status === 'counter' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <h4 style={{ color: '#f4c95d', fontSize: '18px', margin: '0 0 8px' }}>🌾 Farmer Counter-Offer: ₹{counterPrice}</h4>
            <p style={{ color: '#effbe7', fontSize: '13px', margin: '0 0 20px' }}>
              The farmer cannot go as low as ₹{proposedPrice}, but has offered a special batch discount of <strong>₹{counterPrice}/{product.unit || 'kg'}</strong>.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#effbe7',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Decline
              </button>
              <button
                onClick={() => {
                  onOfferAccepted({
                    ...product,
                    price: counterPrice,
                    quantity
                  });
                  onClose();
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f4c95d, #ffa726)',
                  border: 'none',
                  color: '#092b27',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Accept ₹{counterPrice}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Real-Time 3D Live Farm-Cam & Greenhouse Sensor Stream
───────────────────────────────────────────────────────────── */
function LiveFarmCamModal({ isOpen, onClose }) {
  const [activeCam, setActiveCam] = useState(0);
  const [streamTime, setStreamTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setStreamTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const cams = [
    {
      name: 'Polyhouse Alpha: Organic Strawberries & Herbs',
      farmer: 'Farmer Ramesh Patel • Mandya Organic Valley',
      temp: '23.8°C',
      humidity: '64%',
      lux: '46,500 Lux',
      src: '/videos/cam-polyhouse.mp4',
      status: 'Irrigation Drip Active • Certified Pure'
    },
    {
      name: 'Greenhouse Beta: Vine Cherry Tomatoes',
      farmer: 'Maria Fernandes • Southern Hydroponic Cluster',
      temp: '25.1°C',
      humidity: '58%',
      lux: '52,000 Lux',
      src: '/videos/cam-greenhouse.mp4',
      status: 'Harvesting Batch #12 for Customer Dispatch'
    },
    {
      name: 'Orchard Gamma: Honeycrisp Apple Trees',
      farmer: 'Gurdeep Singh • Himachal Cooperative',
      temp: '18.4°C',
      humidity: '72%',
      lux: '38,000 Lux',
      src: '/videos/cam-orchard.mp4',
      status: 'Natural Sunlight Maturation'
    }
  ];

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(2, 10, 8, 0.88)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }} onClick={onClose}>
      <div
        className="responsive-modal-card"
        style={{
          maxWidth: '920px',
          width: '100%',
          background: 'linear-gradient(145deg, rgba(8, 28, 22, 0.98), rgba(4, 16, 13, 0.99))',
          border: '1.5px solid rgba(74, 222, 128, 0.45)',
          borderRadius: '26px',
          overflow: 'hidden',
          boxShadow: '0 25px 70px rgba(0,0,0,0.8), 0 0 35px rgba(74,222,128,0.25)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(5, 20, 16, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#ef4444',
              boxShadow: '0 0 12px #ef4444'
            }} />
            <div>
              <h3 style={{ margin: 0, color: '#effbe7', fontSize: '16.5px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>LIVE 24/7 Farm-Cam Telemetry Stream</span>
                <span style={{ fontSize: '10.5px', background: 'rgba(239, 68, 68, 0.25)', border: '1px solid #ef4444', color: '#fca5a5', padding: '2px 7px', borderRadius: '6px' }}>
                  REC • {streamTime}
                </span>
              </h3>
              <p style={{ margin: '2px 0 0 0', color: '#86efac', fontSize: '11.5px', fontWeight: '600' }}>
                {cams[activeCam].name} • {cams[activeCam].farmer}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Video Screen */}
        <div style={{ position: 'relative', width: '100%', height: '380px', backgroundColor: '#000' }}>
          <video
            key={cams[activeCam].src}
            src={cams[activeCam].src}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Telemetry HUD Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            background: 'rgba(4, 16, 13, 0.82)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(74, 222, 128, 0.35)',
            borderRadius: '16px',
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ color: '#9db5aa', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Microclimate Temp</div>
              <div style={{ color: '#86efac', fontSize: '16px', fontWeight: '800' }}>{cams[activeCam].temp}</div>
            </div>
            <div>
              <div style={{ color: '#9db5aa', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Greenhouse Humidity</div>
              <div style={{ color: '#38bdf8', fontSize: '16px', fontWeight: '800' }}>{cams[activeCam].humidity}</div>
            </div>
            <div>
              <div style={{ color: '#9db5aa', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Solar Luminance</div>
              <div style={{ color: '#fbbf24', fontSize: '16px', fontWeight: '800' }}>{cams[activeCam].lux}</div>
            </div>
            <div>
              <div style={{ color: '#9db5aa', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Harvest Stage</div>
              <div style={{ color: '#34d399', fontSize: '13px', fontWeight: '800' }}>{cams[activeCam].status}</div>
            </div>
          </div>
        </div>

        {/* Cam Switcher */}
        <div style={{ display: 'flex', gap: '10px', padding: '14px 24px', background: 'rgba(4, 16, 13, 0.9)' }}>
          {cams.map((c, i) => (
            <button
              key={i}
              onClick={() => setActiveCam(i)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '10px',
                border: activeCam === i ? '1.5px solid #4ade80' : '1px solid rgba(255,255,255,0.1)',
                background: activeCam === i ? 'rgba(22, 101, 52, 0.45)' : 'rgba(255,255,255,0.03)',
                color: activeCam === i ? '#effbe7' : '#9ca3af',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              Cam #{i + 1}: {c.name.split(':')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Customer Portal Component
───────────────────────────────────────────────────────────── */
export default function CustomerPortal() {
  const { user, showToast } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace' | 'orders' | 'recipes' | 'favorites'
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);
  const [refreshingOrders, setRefreshingOrders] = useState(false);
  const [expressDelivery, setExpressDelivery] = useState(false);

  // Modals
  const [inspectProduct, setInspectProduct] = useState(null);
  const [bargainProduct, setBargainProduct] = useState(null);
  const [showLiveCam, setShowLiveCam] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // Reviews State
  const [reviewingItem, setReviewingItem] = useState(null); // { orderId, productId, title, farmerId }
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedKeys, setReviewedKeys] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  useEffect(() => {
    if (activeTab !== 'orders') return;
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getProducts();
      setProducts(res.data);
    } catch (err) {
      showToast('Could not load produce catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const customerId = user?._id || user?.id;
      const customerEmail = user?.email;
      const res = await orderAPI.getOrders({ customerId, customerEmail });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReview = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!reviewingItem) return;
    setSubmittingReview(true);
    try {
      await reviewAPI.createReview({
        orderId: reviewingItem.orderId,
        productId: reviewingItem.productId,
        rating: Number(reviewRating),
        comment: reviewComment
      });
      const key = `${reviewingItem.orderId}_${reviewingItem.productId}`;
      setReviewedKeys(prev => [...prev, key]);
      showToast('⭐ Verified purchase review submitted successfully!', 'success');
      setReviewingItem(null);
      setReviewComment('');
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit review';
      showToast(msg, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
    showToast(favorites.includes(productId) ? 'Removed from favorites' : 'Saved to favorites ❤️', 'info');
  };

  const addToCart = (product, customQty = 1) => {
    const prodId = getProductId(product);
    if (!prodId) {
      showToast('Invalid produce item identifier', 'error');
      return;
    }

    if (Number(product.stock) <= 0) {
      showToast(`${product.title} is currently out of stock.`, 'error');
      return;
    }

    setCart(currentCart => {
      const existing = currentCart.find(item => isSameProduct(item, prodId));
      if (existing) {
        if (existing.quantity + customQty > Number(product.stock)) {
          showToast(`Maximum available stock (${product.stock}) reached for ${product.title}.`, 'error');
          return currentCart;
        }
        return currentCart.map(item =>
          isSameProduct(item, prodId)
            ? { ...item, quantity: item.quantity + customQty, price: product.price || item.price }
            : item
        );
      }
      return [...currentCart, { ...product, quantity: customQty }];
    });
    showToast(`Added ${customQty}x ${product.title} to cart!`, 'success');
  };

  const updateQuantity = (productId, delta) => {
    const targetId = getProductId(productId);
    setCart(currentCart => {
      return currentCart.map(item => {
        if (isSameProduct(item, targetId)) {
          const newQty = item.quantity + delta;
          if (newQty > Number(item.stock)) {
            showToast(`Cannot exceed available stock of ${item.stock}`, 'error');
            return item;
          }
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    const targetId = getProductId(productId);
    setCart(currentCart => currentCart.filter(item => !isSameProduct(item, targetId)));
    showToast('Item removed from cart', 'info');
  };

  const checkoutCart = async () => {
    if (cart.length === 0) return;
    const baseTotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const totalAmount = expressDelivery ? baseTotal + 49 : baseTotal;
    const firstItem = cart[0];

    const orderPayload = {
      customerId: user?._id || user?.id,
      customerName: `${user?.firstName || 'Customer'} ${user?.lastName || 'Shopper'}`.trim(),
      customerPhone: user?.phone || '+91 98400 12345',
      customerEmail: user?.email || 'customer@agrilink.io',
      customerLocation: user?.location || { lat: 12.9716, lng: 77.5946, address: 'Bengaluru Delivery Address, Karnataka, India' },
      farmerId: firstItem.farmerId || 'farmer_1',
      farmerName: firstItem.farmerName || 'Greenfield Farms',
      farmerPhone: firstItem.farmerPhone || '+1 555-019-9988',
      farmerEmail: firstItem.farmerEmail || 'farmer@nexus.io',
      farmerLocation: firstItem.location || { lat: 12.5222, lng: 76.9004, address: 'Mandya Organic Farm, Karnataka, India' },
      items: cart.map(i => ({
        productId: getProductId(i),
        title: i.title,
        price: Number(i.price),
        quantity: i.quantity,
        unit: i.unit || 'kg',
        image: i.image,
        farmerId: i.farmerId
      })),
      totalAmount,
      expressDelivery
    };

    try {
      const res = await orderAPI.createOrder(orderPayload);
      const newOrders = Array.isArray(res.data)
        ? res.data
        : (res.data?.orders || [res.data]);
      setOrders(currentOrders => [...newOrders, ...currentOrders]);
      setCart([]);
      setActiveTab('orders');
      if (newOrders.length > 1) {
        showToast(`🎉 Order placed! Multi-farm cart was split into ${newOrders.length} direct-farm dispatches.`, 'success');
      } else {
        showToast('🎉 Order placed successfully! Direct farm dispatch & GPS tracking activated.', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Checkout failed. Please try again.';
      showToast(msg, 'error');
    }
  };

  // Filter and Sort Logic
  const filteredProducts = products.filter(p => {
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    const matchesSearch = !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.farmerName && p.farmerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.location?.address && p.location.address.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFavorites = activeTab === 'favorites' ? favorites.includes(getProductId(p)) : true;
    return matchesCategory && matchesSearch && matchesFavorites;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
    if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  return (
    <div className="portal-layout" style={{ minHeight: 'calc(100vh - 70px)' }}>
      {/* 3D Inspector Modal */}
      {inspectProduct && (
        <Produce3DInspector
          product={inspectProduct}
          onClose={() => setInspectProduct(null)}
          onAddToCart={(p) => addToCart(p, 1)}
        />
      )}

      {/* Bargain Offer Modal */}
      {bargainProduct && (
        <BargainOfferModal
          product={bargainProduct}
          onClose={() => setBargainProduct(null)}
          onOfferAccepted={(negotiatedItem) => addToCart(negotiatedItem, negotiatedItem.quantity)}
        />
      )}

      {/* Real-Time Live Farm-Cam & Greenhouse Sensor Modal */}
      <LiveFarmCamModal
        isOpen={showLiveCam}
        onClose={() => setShowLiveCam(false)}
      />

      {/* Left Menu Bar (Desktop Sidebar) */}
      <aside
        className="portal-desktop-sidebar"
        style={{
          width: '250px',
          minWidth: '250px',
          background: 'rgba(7, 24, 20, 0.95)',
          borderRight: '1px solid rgba(110, 219, 208, 0.18)',
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
          {/* Logo & Section title */}
          <div style={{ padding: '0 8px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <AgriLinkLogo size="sm" showText={true} showBadge={false} interactive={false} />
            </div>
            <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#6edbd0' }}>
              CUSTOMER 3D HUB
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => setActiveTab('marketplace')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'marketplace' ? 'linear-gradient(135deg, #00897b, #004d40)' : 'transparent',
                color: activeTab === 'marketplace' ? '#ffffff' : '#9db5aa',
                fontWeight: activeTab === 'marketplace' ? '700' : '600',
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease'
              }}
            >
              <Package size={18} />
              <span>Fresh Marketplace</span>
            </button>

            <button
              onClick={() => setShowLiveCam(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Video size={17} color="#ef4444" />
                <span>Live Farm-Cam 24/7</span>
              </div>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 8px #ef4444'
              }} />
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'orders' ? 'linear-gradient(135deg, #00897b, #004d40)' : 'transparent',
                color: activeTab === 'orders' ? '#ffffff' : '#9db5aa',
                fontWeight: activeTab === 'orders' ? '700' : '600',
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
                <span>Track Orders</span>
              </div>
              {orders.length > 0 && (
                <span style={{
                  background: '#37bd78',
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
              onClick={() => setActiveTab('favorites')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'favorites' ? 'linear-gradient(135deg, #00897b, #004d40)' : 'transparent',
                color: activeTab === 'favorites' ? '#ffffff' : '#9db5aa',
                fontWeight: activeTab === 'favorites' ? '700' : '600',
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease'
              }}
            >
              <Heart size={18} />
              <span>Saved Farm Produce</span>
            </button>

            <button
              onClick={() => setActiveTab('recipes')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'recipes' ? 'linear-gradient(135deg, #00897b, #004d40)' : 'transparent',
                color: activeTab === 'recipes' ? '#ffffff' : '#9db5aa',
                fontWeight: activeTab === 'recipes' ? '700' : '600',
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease'
              }}
            >
              <ChefHat size={18} />
              <span>AI Recipe Studio</span>
            </button>
          </div>

          {/* Eco-Impact Badge */}
          <div style={{
            marginTop: '24px',
            background: 'rgba(55, 189, 120, 0.1)',
            border: '1px solid rgba(55, 189, 120, 0.3)',
            borderRadius: '14px',
            padding: '14px',
            color: '#effbe7'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', color: '#37bd78', textTransform: 'uppercase', marginBottom: '6px' }}>
              <Leaf size={14} />
              <span>Eco-Impact Counter</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#8be28b' }}>
              {(orders.length * 2.4).toFixed(1)} kg CO₂
            </div>
            <div style={{ fontSize: '11px', color: '#a3c2b0', marginTop: '2px' }}>
              Saved by buying direct from farmers
            </div>
          </div>
        </div>

        {/* User Card */}
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
            background: 'linear-gradient(135deg, #00897b, #004d40)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#effbe7',
            fontWeight: '800',
            fontSize: '14px'
          }}>
            {user?.firstName?.[0]?.toUpperCase() || 'C'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#effbe7', fontSize: '13px', fontWeight: '700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ color: '#6edbd0', fontSize: '11px', fontWeight: '600' }}>
              Verified Buyer
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="portal-main-content" style={{ flex: 1, padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Marketplace View */}
        {(activeTab === 'marketplace' || activeTab === 'favorites') && (
          <div>
            {/* Top Filter and Search Bar */}
            <div style={{
              background: 'rgba(9, 43, 39, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(110, 219, 208, 0.25)',
              borderRadius: '20px',
              padding: 'clamp(14px, 3vw, 24px)',
              marginBottom: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
            }}>
              {/* Search input */}
              <div style={{ position: 'relative', flex: '1 1 260px' }}>
                <Search size={18} color="#6edbd0" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="customer-search-input"
                  type="text"
                  placeholder="Search organic crops, fruits, vegetables, seeds, or farmer location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '12px',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(110, 219, 208, 0.3)',
                    color: '#effbe7',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Category Pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', 'vegetable', 'fruit', 'grain', 'seed'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: filterCategory === cat ? '#37bd78' : 'rgba(255,255,255,0.15)',
                      background: filterCategory === cat ? 'rgba(55, 189, 120, 0.25)' : 'rgba(0,0,0,0.25)',
                      color: filterCategory === cat ? '#8be28b' : '#a3c2b0',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={16} color="#6edbd0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(110, 219, 208, 0.3)',
                    color: '#effbe7',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="default" style={{ background: '#092b27' }}>Sort: Default</option>
                  <option value="price-low" style={{ background: '#092b27' }}>Price: Low to High</option>
                  <option value="price-high" style={{ background: '#092b27' }}>Price: High to Low</option>
                  <option value="title" style={{ background: '#092b27' }}>Name: A-Z</option>
                </select>
              </div>
            </div>

            {/* Produce Grid & Cart Split */}
            <div className={`customer-produce-grid-wrapper ${cart.length > 0 ? 'has-cart' : ''}`} style={{ gap: '24px' }}>
              {/* Produce Cards Grid */}
              <div>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: '#8be28b' }}>
                    <RotateCw size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                    <div>Loading fresh farm catalog...</div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div style={{
                    background: 'rgba(9, 43, 39, 0.4)',
                    border: '1px dashed rgba(110, 219, 208, 0.3)',
                    borderRadius: '20px',
                    padding: '60px 20px',
                    textAlign: 'center',
                    color: '#a3c2b0'
                  }}>
                    <Sprout size={48} color="#37bd78" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ color: '#effbe7', margin: '0 0 8px' }}>No Farm Produce Found</h3>
                    <p style={{ margin: 0, fontSize: '13.5px' }}>Try adjusting your search query or category filters.</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
                    gap: '20px'
                  }}>
                    {filteredProducts.map(product => {
                      const prodId = getProductId(product);
                      const isFav = favorites.includes(prodId);

                      return (
                        <div
                          key={prodId}
                          style={{
                            background: 'rgba(9, 43, 39, 0.75)',
                            backdropFilter: 'blur(16px)',
                            border: '1.5px solid rgba(110, 219, 208, 0.22)',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 10px 28px rgba(0,0,0,0.3)',
                            transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
                            e.currentTarget.style.boxShadow = '0 18px 40px rgba(0,0,0,0.5), 0 0 25px rgba(55, 189, 120, 0.25)';
                            e.currentTarget.style.borderColor = 'rgba(55, 189, 120, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.3)';
                            e.currentTarget.style.borderColor = 'rgba(110, 219, 208, 0.22)';
                          }}
                        >
                          {/* Image Container with 3D button overlay */}
                          <div style={{ position: 'relative', height: '170px', background: 'rgba(0,0,0,0.4)', overflow: 'hidden' }}>
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Sprout size={48} color="#37bd78" />
                              </div>
                            )}

                            {/* Favorite Button */}
                            <button
                              onClick={() => toggleFavorite(prodId)}
                              style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'rgba(0, 0, 0, 0.55)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '50%',
                                width: '34px',
                                height: '34px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <Heart size={16} color={isFav ? '#ff4081' : '#effbe7'} fill={isFav ? '#ff4081' : 'none'} />
                            </button>

                            {/* 3D Inspect Hologram Button */}
                            <button
                              onClick={() => setInspectProduct(product)}
                              style={{
                                position: 'absolute',
                                bottom: '10px',
                                left: '10px',
                                background: 'rgba(0, 30, 25, 0.85)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(55, 189, 120, 0.5)',
                                borderRadius: '20px',
                                padding: '4px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                color: '#8be28b',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={12} />
                              <span>3D Quality Scan</span>
                            </button>
                          </div>

                          {/* Card Content */}
                          <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#effbe7' }}>
                                {product.title}
                              </h3>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {product.rating > 0 ? (
                                  <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    color: '#facc15',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    background: 'rgba(250, 204, 21, 0.15)',
                                    border: '1px solid rgba(250, 204, 21, 0.3)',
                                    padding: '2px 6px',
                                    borderRadius: '10px'
                                  }}>
                                    ★ {product.rating} <span style={{ opacity: 0.8, fontSize: '10px' }}>({product.numReviews || 1})</span>
                                  </span>
                                ) : null}
                                <span style={{
                                  background: 'rgba(55, 189, 120, 0.15)',
                                  border: '1px solid rgba(55, 189, 120, 0.35)',
                                  color: '#8be28b',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  textTransform: 'capitalize'
                                }}>
                                  {product.category || 'Organic'}
                                </span>
                              </div>
                            </div>

                            <p style={{
                              margin: '0 0 14px',
                              fontSize: '12.5px',
                              color: '#a3c2b0',
                              lineHeight: '1.45',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {product.description || 'Naturally harvested organic farm fresh produce.'}
                            </p>

                            {/* Farmer Location */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#d9c7a0', marginBottom: '14px' }}>
                              <MapPin size={14} color="#37bd78" style={{ flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {product.farmerName || 'Mandya Organic Farm'} • {product.location?.address?.split(',')[0] || 'Karnataka'}
                              </span>
                            </div>

                            {/* Price & Action Buttons */}
                            <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                                <div>
                                  <span style={{ color: '#37bd78', fontSize: '22px', fontWeight: '900' }}>₹{product.price}</span>
                                  <span style={{ color: '#a3c2b0', fontSize: '12px', fontWeight: '600' }}> / {product.unit || 'kg'}</span>
                                </div>
                                <span style={{ fontSize: '11.5px', color: Number(product.stock) > 5 ? '#8be28b' : '#f4c95d', fontWeight: '700' }}>
                                  {product.stock} {product.unit || 'kg'} left
                                </span>
                              </div>

                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => setBargainProduct(product)}
                                  title="Offer custom bulk price directly to farmer"
                                  style={{
                                    padding: '10px',
                                    borderRadius: '10px',
                                    background: 'rgba(244, 201, 93, 0.15)',
                                    border: '1px solid rgba(244, 201, 93, 0.4)',
                                    color: '#f4c95d',
                                    fontWeight: '700',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <DollarSign size={14} />
                                  <span>Bargain</span>
                                </button>

                                <button
                                  onClick={() => addToCart(product, 1)}
                                  style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #00897b, #004d40)',
                                    border: 'none',
                                    color: '#ffffff',
                                    fontWeight: '800',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    boxShadow: '0 4px 14px rgba(0, 137, 123, 0.3)'
                                  }}
                                >
                                  <ShoppingCart size={15} />
                                  <span>Add to Cart</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Floating Slide-in Cart Sidebar (Desktop) */}
              {cart.length > 0 && (
                <div
                  className="desktop-only-cart-pane"
                  style={{
                    background: 'rgba(7, 26, 22, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1.5px solid rgba(110, 219, 208, 0.3)',
                    borderRadius: '20px',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 'calc(100vh - 140px)',
                    position: 'sticky',
                    top: '90px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShoppingCart size={20} color="#6edbd0" />
                      <h3 style={{ margin: 0, color: '#effbe7', fontSize: '18px', fontWeight: '800' }}>Your Farm Cart</h3>
                    </div>
                    <span style={{
                      background: 'rgba(55, 189, 120, 0.2)',
                      color: '#8be28b',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      padding: '3px 8px',
                      borderRadius: '12px'
                    }}>
                      {cartItemCount} items
                    </span>
                  </div>

                  {/* Cart Items List */}
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px', marginBottom: '18px' }}>
                    {cart.map(item => {
                      const id = getProductId(item);
                      return (
                        <div
                          key={id}
                          style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ color: '#effbe7', fontSize: '13.5px', fontWeight: '700' }}>{item.title}</div>
                            <div style={{ color: '#37bd78', fontSize: '12px', fontWeight: '700' }}>
                              ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => updateQuantity(id, -1)}
                              style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: '#effbe7',
                                width: '26px',
                                height: '26px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '700'
                              }}
                            >
                              -
                            </button>
                            <span style={{ color: '#effbe7', fontWeight: '700', minWidth: '18px', textAlign: 'center' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(id, 1)}
                              style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: '#effbe7',
                                width: '26px',
                                height: '26px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '700'
                              }}
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ff5252',
                                cursor: 'pointer',
                                marginLeft: '4px'
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Express Delivery Option */}
                  <div
                    onClick={() => setExpressDelivery(!expressDelivery)}
                    style={{
                      background: expressDelivery ? 'rgba(55, 189, 120, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${expressDelivery ? 'rgba(55, 189, 120, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '12px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      marginBottom: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Zap size={16} color={expressDelivery ? '#37bd78' : '#a3c2b0'} />
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#effbe7' }}>
                        Green Express Courier (2-Hour Dispatch)
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#f4c95d' }}>+₹49</span>
                  </div>

                  {/* Total & Checkout */}
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <span style={{ color: '#a3c2b0', fontSize: '14px' }}>Total Amount:</span>
                      <span style={{ color: '#37bd78', fontSize: '22px', fontWeight: '900' }}>
                        ₹{expressDelivery ? cartTotalPrice + 49 : cartTotalPrice}
                      </span>
                    </div>

                    <button
                      onClick={checkoutCart}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #2e7d32, #1b5e20)',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '15px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 6px 20px rgba(46, 125, 50, 0.4)'
                      }}
                    >
                      <span>Checkout & Direct Dispatch</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Orders & GPS Radar View */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ color: '#effbe7', fontSize: '24px', fontWeight: '800', margin: '0 0 4px' }}>
                  Live Orders & GPS Dispatch Radar
                </h2>
                <p style={{ color: '#a3c2b0', fontSize: '13.5px', margin: 0 }}>
                  Real-time triangulation connecting Mandya farm producers, delivery couriers, and your doorstep.
                </p>
              </div>

              <button
                onClick={async () => {
                  setRefreshingOrders(true);
                  await fetchOrders();
                  setRefreshingOrders(false);
                  showToast('Live tracking radar updated', 'info');
                }}
                style={{
                  background: 'rgba(55, 189, 120, 0.15)',
                  border: '1px solid rgba(55, 189, 120, 0.4)',
                  color: '#8be28b',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} style={{ animation: refreshingOrders ? 'spin 1s linear infinite' : 'none' }} />
                <span>Refresh Radar</span>
              </button>
            </div>

            {orders.length === 0 ? (
              <div style={{
                background: 'rgba(9, 43, 39, 0.5)',
                border: '1px dashed rgba(110, 219, 208, 0.3)',
                borderRadius: '20px',
                padding: '60px 20px',
                textAlign: 'center',
                color: '#a3c2b0'
              }}>
                <Package size={48} color="#6edbd0" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ color: '#effbe7', margin: '0 0 8px' }}>No Active Orders</h3>
                <p style={{ margin: '0 0 20px', fontSize: '13.5px' }}>Explore the marketplace and place your first organic farm order!</p>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  style={{
                    background: 'linear-gradient(135deg, #00897b, #004d40)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Browse Marketplace
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {orders.map(order => (
                  <div
                    key={String(order._id || order.id)}
                    style={{
                      background: 'rgba(9, 43, 39, 0.75)',
                      backdropFilter: 'blur(16px)',
                      border: '1.5px solid rgba(110, 219, 208, 0.25)',
                      borderRadius: '20px',
                      padding: '24px',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.35)'
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                      <div>
                        <span style={{ color: '#6edbd0', fontSize: '12px', fontWeight: '800' }}>
                          ORDER #{String(order._id || order.id).slice(-8).toUpperCase()}
                        </span>
                        <div style={{ color: '#effbe7', fontSize: '18px', fontWeight: '800', marginTop: '2px' }}>
                          Total: ₹{order.totalAmount} • {order.items?.length || 1} Item(s)
                        </div>
                      </div>

                      <span style={{
                        background: order.status === 'delivered' ? 'rgba(55, 189, 120, 0.25)' : 'rgba(244, 201, 93, 0.25)',
                        border: `1px solid ${order.status === 'delivered' ? '#37bd78' : '#f4c95d'}`,
                        color: order.status === 'delivered' ? '#8be28b' : '#f4c95d',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontWeight: '800',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {order.status || 'Pending Dispatch'}
                      </span>
                    </div>

                    {/* Live Tracking Map Component */}
                    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>
                      <LiveTrackingMap order={order} />
                    </div>

                    {/* Status Pipeline Tracker */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {[
                        { key: 'pending', label: '1. Placed' },
                        { key: 'confirmed', label: '2. Confirmed' },
                        { key: 'packed', label: '3. Packed' },
                        { key: 'in_transit', label: '4. Out for Delivery' },
                        { key: 'delivered', label: '5. Delivered' }
                      ].map((step, idx) => {
                        const rankMap = {
                          pending: 1,
                          confirmed: 2,
                          accepted: 2,
                          packed: 3,
                          assigned: 4,
                          picked_up: 4,
                          in_transit: 4,
                          arrived: 4,
                          delivered: 5
                        };
                        const currentRank = rankMap[order.status] || 1;
                        const isDone = currentRank >= (idx + 1);
                        const isCurrent = currentRank === (idx + 1);
                        return (
                          <div key={step.key} style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background: isCurrent ? 'rgba(244, 201, 93, 0.25)' : isDone ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.04)',
                            color: isCurrent ? '#f4c95d' : isDone ? '#34d399' : '#6b7280',
                            border: `1px solid ${isCurrent ? '#f4c95d' : isDone ? '#34d399' : 'rgba(255,255,255,0.08)'}`
                          }}>
                            {isDone && !isCurrent ? '✓ ' : ''}{step.label}
                          </div>
                        );
                      })}
                    </div>

                    {/* Ordered Items & Reviews */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {(order.items || []).map((item, idx) => {
                        const itemKey = `${order._id || order.id}_${item.productId}`;
                        const isReviewed = reviewedKeys.includes(itemKey);
                        return (
                          <div key={idx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.03)',
                            padding: '8px 12px',
                            borderRadius: '10px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {item.image && <img src={item.image} alt={item.title} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />}
                              <div>
                                <div style={{ color: '#effbe7', fontSize: '13px', fontWeight: '700' }}>{item.title}</div>
                                <div style={{ color: '#a3c2b0', fontSize: '11.5px' }}>₹{item.price} × {item.quantity} {item.unit || 'kg'}</div>
                              </div>
                            </div>
                            {order.status === 'delivered' && (
                              <button
                                onClick={() => setReviewingItem({
                                  orderId: order._id || order.id,
                                  productId: item.productId,
                                  title: item.title,
                                  farmerId: order.farmerId
                                })}
                                disabled={isReviewed}
                                style={{
                                  background: isReviewed ? 'rgba(52, 211, 153, 0.2)' : 'rgba(244, 201, 93, 0.2)',
                                  border: `1px solid ${isReviewed ? '#34d399' : '#f4c95d'}`,
                                  color: isReviewed ? '#34d399' : '#f4c95d',
                                  padding: '5px 12px',
                                  borderRadius: '8px',
                                  fontSize: '11.5px',
                                  fontWeight: '700',
                                  cursor: isReviewed ? 'default' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Star size={13} fill={isReviewed ? '#34d399' : '#f4c95d'} />
                                <span>{isReviewed ? '✓ Reviewed' : 'Review Produce'}</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Contact details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '12.5px', color: '#a3c2b0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sprout size={14} color="#37bd78" />
                        <span>Farmer: <strong>{order.farmerName || 'Greenfield Farms'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Truck size={14} color="#f4c95d" />
                        <span>Courier: <strong>{order.deliveryName || 'David Swift'}</strong> ({order.deliveryPhone || '+1 555-019-7766'})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color="#6edbd0" />
                        <span>Destination: <strong>{order.customerLocation?.address?.split(',')[0] || 'Doorstep'}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Recipe Studio View */}
        {activeTab === 'recipes' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ color: '#effbe7', fontSize: '24px', fontWeight: '800', margin: '0 0 6px' }}>
                AI Culinary & Farm-Fresh Recipe Studio
              </h2>
              <p style={{ color: '#a3c2b0', fontSize: '13.5px', margin: 0 }}>
                Instant nutritional pairings, healthy organic recipes, and preservation guides generated for your fresh produce.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
              <div style={{
                background: 'rgba(9, 43, 39, 0.75)',
                border: '1.5px solid rgba(55, 189, 120, 0.3)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#37bd78', fontWeight: '800', fontSize: '14px', marginBottom: '10px' }}>
                  <ChefHat size={18} />
                  <span>Farm-to-Table Organic Salad Bowl</span>
                </div>
                <h4 style={{ color: '#effbe7', fontSize: '17px', margin: '0 0 10px' }}>Roasted Heritage Tomato & Cucumber Medley</h4>
                <p style={{ color: '#a3c2b0', fontSize: '13px', lineHeight: '1.5', margin: '0 0 16px' }}>
                  A high-antioxidant lunch rich in Vitamin C and Lycopene. Tossed with cold-pressed olive oil, crushed basil, and pink rock salt.
                </p>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#effbe7' }}>
                  ⏱️ Prep Time: 10 mins • 🔥 180 kcal • 🌿 100% Vegan
                </div>
              </div>

              <div style={{
                background: 'rgba(9, 43, 39, 0.75)',
                border: '1.5px solid rgba(244, 201, 93, 0.3)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f4c95d', fontWeight: '800', fontSize: '14px', marginBottom: '10px' }}>
                  <Activity size={18} />
                  <span>Detox & Immunity Booster Smoothie</span>
                </div>
                <h4 style={{ color: '#effbe7', fontSize: '17px', margin: '0 0 10px' }}>Cold-Pressed Green Apple & Spinach Elixir</h4>
                <p style={{ color: '#a3c2b0', fontSize: '13px', lineHeight: '1.5', margin: '0 0 16px' }}>
                  Stimulates natural liver detoxification and accelerates cellular hydration. Blended with fresh tender mint leaves and organic lemon zest.
                </p>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#effbe7' }}>
                  ⏱️ Prep Time: 5 mins • 🔥 120 kcal • 🛡️ Immunity +45%
                </div>
              </div>
            </div>
          </div>
        )}
      {/* Verified Purchase Review Modal */}
      {reviewingItem && (
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
        }} onClick={() => setReviewingItem(null)}>
          <div style={{
            maxWidth: '440px',
            width: '100%',
            background: 'linear-gradient(145deg, rgba(9, 43, 39, 0.98), rgba(6, 28, 26, 0.99))',
            border: '1.5px solid rgba(55, 189, 120, 0.45)',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#effbe7', fontSize: '18px', fontWeight: '800' }}>
                Rate & Review {reviewingItem.title}
              </h3>
              <button onClick={() => setReviewingItem(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ color: '#a3c2b0', fontSize: '13px', margin: '0 0 16px' }}>
              Verified Purchase Review for Order #{String(reviewingItem.orderId).slice(-8).toUpperCase()}
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <Star
                    size={28}
                    color={star <= reviewRating ? '#facc15' : '#4b5563'}
                    fill={star <= reviewRating ? '#facc15' : 'none'}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Share your experience regarding freshness, taste, and packaging quality..."
              rows={4}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px',
                padding: '12px',
                color: '#effbe7',
                fontSize: '13.5px',
                boxSizing: 'border-box',
                marginBottom: '18px',
                resize: 'vertical'
              }}
            />

            <button
              onClick={handleSubmitReview}
              disabled={submittingReview}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: '1px solid #34d399',
                color: '#ffffff',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              {submittingReview ? 'Publishing Review...' : 'Publish Verified Review'}
            </button>
          </div>
        </div>
      )}

      {/* Dedicated Cart Tab View (Ideal for Mobile / Standalone View) */}
      {activeTab === 'cart' && (
        <div style={{ padding: '4px 0 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ color: '#effbe7', fontSize: '22px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingCart size={22} color="#6edbd0" />
              <span>Your Farm Cart ({cartItemCount})</span>
            </h2>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                style={{ background: 'none', border: 'none', color: '#ff6b6b', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Clear All
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div style={{
              background: 'rgba(9, 43, 39, 0.5)',
              border: '1px dashed rgba(110, 219, 208, 0.3)',
              borderRadius: '20px',
              padding: '60px 20px',
              textAlign: 'center',
              color: '#a3c2b0'
            }}>
              <ShoppingCart size={48} color="#6edbd0" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: '#effbe7', margin: '0 0 8px' }}>Your Cart is Empty</h3>
              <p style={{ margin: '0 0 20px', fontSize: '13.5px' }}>Explore fresh direct-from-farm organic harvest.</p>
              <button
                onClick={() => setActiveTab('marketplace')}
                style={{
                  background: 'linear-gradient(135deg, #00897b, #004d40)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Browse Fresh Harvest
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: 'rgba(7, 26, 22, 0.95)',
                border: '1px solid rgba(110, 219, 208, 0.25)',
                borderRadius: '18px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {cart.map(item => {
                  const id = getProductId(item);
                  return (
                    <div
                      key={id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#effbe7', fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </div>
                        <div style={{ color: '#37bd78', fontSize: '12.5px', fontWeight: '700', marginTop: '2px' }}>
                          ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => updateQuantity(id, -1)}
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: '#effbe7',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '16px'
                          }}
                        >
                          -
                        </button>
                        <span style={{ color: '#effbe7', fontWeight: '800', minWidth: '20px', textAlign: 'center', fontSize: '14px' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(id, 1)}
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: '#effbe7',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '16px'
                          }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ff6b6b',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: '4px'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Express Courier Option */}
              <div
                onClick={() => setExpressDelivery(!expressDelivery)}
                style={{
                  background: expressDelivery ? 'rgba(55, 189, 120, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${expressDelivery ? 'rgba(55, 189, 120, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '14px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Zap size={18} color={expressDelivery ? '#37bd78' : '#a3c2b0'} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#effbe7' }}>
                      Green Express Courier (2-Hour Dispatch)
                    </div>
                    <div style={{ fontSize: '11px', color: '#a3c2b0' }}>Temperature-monitored refrigerated EV fleet</div>
                  </div>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#f4c95d' }}>+₹49</span>
              </div>

              {/* Delivery Address Details */}
              <div style={{
                background: 'rgba(7, 26, 22, 0.95)',
                border: '1px solid rgba(110, 219, 208, 0.25)',
                borderRadius: '16px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#6edbd0', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} />
                  <span>Deliver To</span>
                </div>
                <div style={{ color: '#effbe7', fontSize: '13.5px', fontWeight: '600' }}>
                  {user?.address || user?.location?.address || 'Mandya Hub, Karnataka • Verified Residence'}
                </div>
              </div>

              {/* Checkout Card */}
              <div style={{
                background: 'rgba(7, 26, 22, 0.95)',
                border: '1.5px solid rgba(55, 189, 120, 0.4)',
                borderRadius: '18px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ color: '#a3c2b0', fontSize: '15px', fontWeight: '600' }}>Total Amount:</span>
                  <span style={{ color: '#37bd78', fontSize: '26px', fontWeight: '900' }}>
                    ₹{expressDelivery ? cartTotalPrice + 49 : cartTotalPrice}
                  </span>
                </div>

                <button
                  onClick={checkoutCart}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #2e7d32, #1b5e20)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 6px 22px rgba(46, 125, 50, 0.5)'
                  }}
                >
                  <span>Place Multi-Farm Order</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dedicated Profile Tab View (Mobile Friendly) */}
      {activeTab === 'profile' && (
        <div style={{ padding: '4px 0 30px' }}>
          <h2 style={{ color: '#effbe7', fontSize: '22px', fontWeight: '800', margin: '0 0 20px 0' }}>
            Customer Profile & Hub
          </h2>

          <div style={{
            background: 'rgba(7, 26, 22, 0.95)',
            border: '1.5px solid rgba(110, 219, 208, 0.25)',
            borderRadius: '20px',
            padding: '22px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #00897b, #004d40)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#effbe7',
                fontWeight: '900',
                fontSize: '22px',
                boxShadow: '0 0 20px rgba(0, 137, 123, 0.4)'
              }}>
                {user?.firstName?.[0]?.toUpperCase() || 'C'}
              </div>
              <div>
                <div style={{ color: '#effbe7', fontSize: '18px', fontWeight: '800' }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ color: '#6edbd0', fontSize: '12px', fontWeight: '700', marginTop: '2px' }}>
                  ✓ Verified Farm Customer
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '12px' }}>
                <div style={{ color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Email</div>
                <div style={{ color: '#effbe7', fontSize: '13px', fontWeight: '600', marginTop: '3px' }}>{user?.email || 'customer@agrilink.in'}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '12px' }}>
                <div style={{ color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Phone</div>
                <div style={{ color: '#effbe7', fontSize: '13px', fontWeight: '600', marginTop: '3px' }}>{user?.phone || '+91 98400 12345'}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '12px' }}>
                <div style={{ color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Orders Placed</div>
                <div style={{ color: '#37bd78', fontSize: '14px', fontWeight: '800', marginTop: '3px' }}>{orders.length} Dispatches</div>
              </div>
            </div>
          </div>

          {/* Eco-Impact Card */}
          <div style={{
            background: 'rgba(55, 189, 120, 0.1)',
            border: '1px solid rgba(55, 189, 120, 0.35)',
            borderRadius: '18px',
            padding: '18px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#37bd78', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>
              <Leaf size={16} />
              <span>Your Green Eco-Impact</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#8be28b' }}>
              {(orders.length * 2.4).toFixed(1)} kg CO₂ Saved
            </div>
            <p style={{ color: '#a3c2b0', fontSize: '12px', margin: '4px 0 0 0' }}>
              Eliminating intermediaries reduces transportation logistics emission by 42%.
            </p>
          </div>

          {/* Quick Menu Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('favorites')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#effbe7',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Heart size={18} color="#ec4899" />
                <span>Saved Farm Produce</span>
              </div>
              <ChevronRight size={18} color="#9db5aa" />
            </button>

            <button
              onClick={() => setActiveTab('recipes')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#effbe7',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ChefHat size={18} color="#f4c95d" />
                <span>AI Recipe Studio</span>
              </div>
              <ChevronRight size={18} color="#9db5aa" />
            </button>

            <button
              onClick={() => setShowLiveCam(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '14px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Video size={18} color="#ef4444" />
                <span>Live 24/7 Farm-Cam Telemetry</span>
              </div>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
            </button>
          </div>
        </div>
      )}
      </main>

      {/* Mobile Bottom Navigation Bar (Home | Search | Cart | Orders | Profile) */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-btn ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('marketplace');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Home size={20} />
          <span>Home</span>
        </button>

        <button
          className="mobile-nav-btn"
          onClick={() => {
            setActiveTab('marketplace');
            setTimeout(() => {
              const el = document.getElementById('customer-search-input');
              if (el) {
                el.focus();
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 100);
          }}
        >
          <Search size={20} />
          <span>Search</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeTab === 'cart' ? 'active' : ''}`}
          onClick={() => setActiveTab('cart')}
        >
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <ShoppingCart size={20} />
            {cartItemCount > 0 && <span className="mobile-nav-badge">{cartItemCount}</span>}
          </div>
          <span>Cart</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Truck size={20} />
            {orders.length > 0 && <span className="mobile-nav-badge">{orders.length}</span>}
          </div>
          <span>Orders</span>
        </button>

        <button
          className={`mobile-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}
