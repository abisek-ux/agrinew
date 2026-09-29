import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { productAPI, orderAPI, reviewAPI, authAPI, notificationAPI, bargainAPI, aiAPI } from '../services/api';
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
  X,
  Bell,
  Edit2,
  Check,
  Filter,
  Users,
  Handshake,
  IndianRupee,
  Tag,
  CreditCard,
  ArrowLeft,
  CheckCircle2
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

const getHarvestFreshness = (harvestDate) => {
  if (!harvestDate) {
    return {
      label: 'Harvest date not provided by farmer',
      shortLabel: 'Harvest date not provided',
      hasDate: false,
      hoursAgo: null,
      daysAgo: null,
      formattedDate: 'Not provided by farmer'
    };
  }

  const dateObj = new Date(harvestDate);
  if (isNaN(dateObj.getTime())) {
    return {
      label: 'Harvest date not provided by farmer',
      shortLabel: 'Harvest date not provided',
      hasDate: false,
      hoursAgo: null,
      daysAgo: null,
      formattedDate: 'Not provided by farmer'
    };
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  let label = '';
  if (diffHours >= 0 && diffHours < 24) {
    label = 'Harvested today';
  } else if (diffDays === 1) {
    label = 'Harvested 1 day ago';
  } else if (diffDays > 1) {
    label = `Harvested ${diffDays} days ago`;
  } else {
    label = 'Freshly harvested';
  }

  const formattedDate = dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return {
    label,
    shortLabel: label,
    hasDate: true,
    hoursAgo: Math.max(0, diffHours),
    daysAgo: Math.max(0, diffDays),
    formattedDate
  };
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
function BargainOfferModal({ product, onClose, onBargainSubmitted }) {
  const minQty = Math.max(1, Number(product.minOrderQty) || 1);
  const maxStock = Math.max(minQty, Number(product.stock) || 500);
  const [proposedPrice, setProposedPrice] = useState(Math.max(1, Math.round(Number(product.price) * 0.9)));
  const [quantity, setQuantity] = useState(Math.max(minQty, 2));
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedBargain, setSubmittedBargain] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePropose = async () => {
    if (quantity < minQty) {
      setErrorMsg(`Minimum order quantity for bulk bargain is ${minQty} ${product.unit || 'kg'}`);
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        productId: getProductId(product),
        quantity,
        proposedPrice,
        note: note.trim()
      };
      const res = await bargainAPI.createBargain(payload);
      setSubmittedBargain(res.data.bargain);
      if (onBargainSubmitted) onBargainSubmitted(res.data.bargain);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit bulk bargain offer. Please verify connectivity.');
    } finally {
      setSubmitting(false);
    }
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
              justifyContent: 'center',
              fontSize: '18px'
            }}>
              🤝
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#effbe7', fontSize: '18px', fontWeight: '800' }}>
                Request a Bulk Bargain
              </h3>
              <p style={{ margin: 0, color: '#a3c2b0', fontSize: '12px' }}>
                You can submit a price offer for bulk purchases.
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
            <span style={{ color: '#a3c2b0', fontSize: '13px' }}>Original Price:</span>
            <span style={{ color: '#f4c95d', fontWeight: '800', fontSize: '14px' }}>₹{product.price} / {product.unit || 'kg'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#a3c2b0', fontSize: '13px' }}>Farmer:</span>
            <span style={{ color: '#37bd78', fontWeight: '700', fontSize: '13px' }}>{product.farmerName || 'Verified Producer'}</span>
          </div>
        </div>

        {!submittedBargain ? (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ color: '#effbe7', fontSize: '13px', fontWeight: '700' }}>
                    Target Bulk Quantity ({product.unit || 'kg'}):
                  </label>
                  <span style={{ fontSize: '11px', color: '#9db5aa' }}>
                    Min order: {minQty} {product.unit || 'kg'}
                  </span>
                </div>
                <input
                  type="number"
                  min={minQty}
                  max={maxStock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(minQty, parseInt(e.target.value) || minQty))}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: '700',
                    boxSizing: 'border-box',
                    minHeight: '48px'
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
                    min={Math.max(1, Math.round(Number(product.price) * 0.5))}
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
                  <span style={{ color: '#f4c95d' }}>Saving: ₹{Math.max(0, (Number(product.price) - proposedPrice) * quantity)}</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#effbe7', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  Note to Farmer (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Regular monthly wholesale purchase for family"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#effbe7',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#fca5a5',
                fontSize: '12px',
                marginBottom: '14px'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              onClick={handlePropose}
              disabled={submitting}
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
              <span>{submitting ? 'Transmitting Offer...' : 'Transmit Bulk Offer to Farmer'}</span>
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '2px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto'
            }}>
              <Clock size={32} color="#fbbf24" />
            </div>

            <div style={{
              display: 'inline-block',
              background: 'rgba(245, 158, 11, 0.25)',
              border: '1px solid #f59e0b',
              color: '#fbbf24',
              padding: '3px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '800',
              marginBottom: '10px'
            }}>
              STATUS: PENDING
            </div>

            <h4 style={{ color: '#effbe7', fontSize: '18px', margin: '0 0 8px' }}>
              Bulk Bargain Proposal Dispatched!
            </h4>
            <p style={{ color: '#a3c2b0', fontSize: '13px', lineHeight: '1.5', margin: '0 0 20px' }}>
              Your wholesale offer of <strong>₹{proposedPrice}/{product.unit || 'kg'}</strong> for <strong>{quantity} {product.unit || 'kg'}</strong> (Total: ₹{proposedPrice * quantity}) has been delivered to <strong>{product.farmerName || 'the producer'}</strong>.
              <br /><br />
              The farmer partner will review your proposal and choose to <strong>Accept</strong>, <strong>Counter</strong>, or <strong>Reject</strong>. You can monitor and respond to negotiations anytime in your Bargains dashboard.
            </p>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                color: '#ffffff',
                fontSize: '14.5px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Done
            </button>
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
/* ─────────────────────────────────────────────────────────────
   Product Details & Farmer Information Modal
───────────────────────────────────────────────────────────── */
function ProductDetailsModal({
  product,
  allProducts,
  onClose,
  onAddToCart,
  onOpen3DScan,
  onOpenBargain,
  isFavorite,
  onToggleFavorite,
  onViewFarmer
}) {
  const minQty = Math.max(1, Number(product?.minOrderQty) || 1);
  const maxStock = Math.max(0, Number(product?.stock) || 0);
  const [selectedQty, setSelectedQty] = useState(minQty);

  if (!product) return null;

  const otherFarmerProducts = (allProducts || []).filter(
    p => String(p.farmerId) === String(product.farmerId) && getProductId(p) !== getProductId(product)
  );

  const freshness = getHarvestFreshness(product.harvestDate);
  const allowBargain = product.allowBargain !== false;

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
      padding: 'clamp(10px, 3vw, 20px)'
    }}>
      <div
        className="responsive-modal-card"
        style={{
          background: 'linear-gradient(145deg, rgba(13, 38, 30, 0.98), rgba(7, 21, 17, 0.98))',
          border: '1.5px solid rgba(110, 219, 208, 0.35)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(55, 189, 120, 0.2)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 22px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(55, 189, 120, 0.15)',
              border: '1px solid rgba(55, 189, 120, 0.35)',
              color: '#8be28b',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase'
            }}>
              {product.category || 'Produce'}
            </span>
            {allowBargain ? (
              <span style={{
                background: 'rgba(244, 201, 93, 0.15)',
                border: '1px solid rgba(244, 201, 93, 0.35)',
                color: '#f4c95d',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700'
              }}>
                🤝 Bulk Bargaining: Available
              </span>
            ) : (
              <span style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#a3c2b0',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                Fixed Price Only
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onToggleFavorite && (
              <button
                onClick={onToggleFavorite}
                title={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: isFavorite ? '#ff4081' : '#effbe7',
                  borderRadius: '10px',
                  width: '38px',
                  height: '38px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Heart size={18} fill={isFavorite ? '#ff4081' : 'none'} color={isFavorite ? '#ff4081' : '#effbe7'} />
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#effbe7',
                borderRadius: '10px',
                width: '38px',
                height: '38px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

          {/* =========================================================================
              SECTION 1 — PRODUCT OVERVIEW
              ========================================================================= */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Image Container with 3D scan overlay */}
            <div>
              <div style={{
                position: 'relative',
                borderRadius: '18px',
                overflow: 'hidden',
                height: '260px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b'}
                  alt={product.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {freshness.hasDate && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(9, 38, 28, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(74, 222, 128, 0.4)',
                    color: '#86efac',
                    padding: '4px 10px',
                    borderRadius: '14px',
                    fontSize: '11px',
                    fontWeight: '800'
                  }}>
                    🌱 {freshness.label}
                  </div>
                )}
                {onOpen3DScan && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpen3DScan(product);
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      background: 'rgba(0, 30, 25, 0.9)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(55, 189, 120, 0.5)',
                      borderRadius: '20px',
                      padding: '6px 14px',
                      color: '#8be28b',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Eye size={14} />
                    <span>3D Bio-Purity Scan</span>
                  </button>
                )}
              </div>
            </div>

            {/* Overview Details & Price & Cart Action */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{ color: '#effbe7', fontSize: '24px', fontWeight: '900', margin: '0 0 8px 0', lineHeight: '1.2' }}>
                  {product.title}
                </h1>

                {/* Price Display */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '14px' }}>
                  <span style={{ color: '#37bd78', fontSize: '28px', fontWeight: '900' }}>₹{product.price}</span>
                  <span style={{ color: '#a3c2b0', fontSize: '14px', fontWeight: '600' }}>/ {product.unit || 'kg'}</span>
                </div>

                {/* Stock & Minimum Order Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '12px' }}>
                    <div style={{ color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Available Stock</div>
                    <div style={{ color: maxStock > 0 ? '#8be28b' : '#fca5a5', fontSize: '15px', fontWeight: '800', marginTop: '2px' }}>
                      {maxStock > 0 ? `${maxStock} ${product.unit || 'kg'} available` : 'Out of stock'}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '12px' }}>
                    <div style={{ color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Minimum Order</div>
                    <div style={{ color: '#effbe7', fontSize: '15px', fontWeight: '800', marginTop: '2px' }}>
                      {minQty} {product.unit || 'kg'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Box: Quantity Selector & Add to Cart */}
              <div style={{
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(110, 219, 208, 0.25)',
                borderRadius: '16px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <span style={{ color: '#a3c2b0', fontSize: '12px', display: 'block' }}>Order Quantity</span>
                    <span style={{ color: '#effbe7', fontSize: '11px' }}>Min: {minQty} {product.unit || 'kg'}</span>
                  </div>

                  {/* Quantity selector with strict minOrderQty enforcement */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px 8px' }}>
                    <button
                      type="button"
                      disabled={selectedQty <= minQty}
                      onClick={() => setSelectedQty(q => Math.max(minQty, q - 1))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: selectedQty <= minQty ? '#6b7280' : '#effbe7',
                        cursor: selectedQty <= minQty ? 'not-allowed' : 'pointer',
                        padding: '6px',
                        minWidth: '32px',
                        minHeight: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Minus size={15} />
                    </button>
                    <input
                      type="number"
                      min={minQty}
                      max={maxStock}
                      value={selectedQty}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || minQty;
                        setSelectedQty(Math.max(minQty, Math.min(maxStock, val)));
                      }}
                      style={{
                        width: '45px',
                        background: 'transparent',
                        border: 'none',
                        color: '#effbe7',
                        fontWeight: '800',
                        fontSize: '15px',
                        textAlign: 'center',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      disabled={selectedQty >= maxStock}
                      onClick={() => setSelectedQty(q => Math.min(maxStock, q + 1))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: selectedQty >= maxStock ? '#6b7280' : '#effbe7',
                        cursor: selectedQty >= maxStock ? 'not-allowed' : 'pointer',
                        padding: '6px',
                        minWidth: '32px',
                        minHeight: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    disabled={maxStock <= 0}
                    onClick={() => {
                      onAddToCart(product, selectedQty);
                      onClose();
                    }}
                    style={{
                      flex: 1,
                      minHeight: '48px',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      background: maxStock > 0 ? 'linear-gradient(135deg, #00897b, #004d40)' : 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '14px',
                      cursor: maxStock > 0 ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: maxStock > 0 ? '0 4px 14px rgba(0, 137, 123, 0.4)' : 'none'
                    }}
                  >
                    <ShoppingCart size={17} />
                    <span>{maxStock > 0 ? `Add ${selectedQty} to Cart • ₹${product.price * selectedQty}` : 'Out of Stock'}</span>
                  </button>

                  {allowBargain && onOpenBargain && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenBargain(product);
                      }}
                      title="Propose bulk wholesale price directly to farmer"
                      style={{
                        minHeight: '48px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'rgba(244, 201, 93, 0.15)',
                        border: '1.5px solid rgba(244, 201, 93, 0.4)',
                        color: '#f4c95d',
                        fontWeight: '800',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>🤝 Bargain</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 2 — ABOUT THIS PRODUCE
              ========================================================================= */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '18px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#effbe7', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={17} color="#4ade80" />
              <span>About This Produce</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Variety</span>
                <span style={{ fontSize: '14px', color: '#effbe7', fontWeight: '700', marginTop: '2px', display: 'block' }}>
                  {product.variety || 'Not provided by farmer'}
                </span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Quality Grade</span>
                <span style={{ fontSize: '14px', color: '#effbe7', fontWeight: '700', marginTop: '2px', display: 'block' }}>
                  {product.qualityGrade || 'Not provided by farmer'}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Description</span>
              <p style={{ color: '#d1fae5', fontSize: '13.5px', lineHeight: '1.6', margin: 0 }}>
                {product.description || 'Not provided by farmer'}
              </p>
            </div>
          </div>

          {/* =========================================================================
              SECTION 3 — HARVEST & FRESHNESS
              ========================================================================= */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(244, 201, 93, 0.25)',
            borderRadius: '16px',
            padding: '18px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#f4c95d', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={17} color="#f4c95d" />
              <span>Harvest & Freshness</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Harvest Date</span>
                <span style={{ fontSize: '14px', color: '#effbe7', fontWeight: '700', marginTop: '2px', display: 'block' }}>
                  {freshness.formattedDate}
                </span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Relative Freshness</span>
                <span style={{ fontSize: '14px', color: freshness.hasDate ? '#4ade80' : '#a3c2b0', fontWeight: '700', marginTop: '2px', display: 'block' }}>
                  {freshness.hasDate ? freshness.label : 'Harvest date not provided by farmer'}
                </span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 4 — FARM & GROWER
              ========================================================================= */}
          <div style={{
            background: 'rgba(55, 189, 120, 0.08)',
            border: '1px solid rgba(55, 189, 120, 0.25)',
            borderRadius: '16px',
            padding: '18px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#effbe7', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sprout size={18} color="#37bd78" />
              <span>Grown By</span>
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#effbe7', fontWeight: '800', fontSize: '16px' }}>
                    {product.farmerName || 'Local Direct Producer'}
                  </span>
                  <span style={{
                    background: 'rgba(55, 189, 120, 0.2)',
                    border: '1px solid rgba(55, 189, 120, 0.4)',
                    color: '#8be28b',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    ✓ Verified Farmer
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d9c7a0', fontSize: '13px', marginTop: '6px' }}>
                  <MapPin size={14} color="#37bd78" />
                  <span>{product.location?.address || product.farmerNative || 'Location not provided by farmer'}</span>
                </div>
              </div>

              {onViewFarmer && product.farmerId && (
                <button
                  onClick={() => onViewFarmer(product.farmerId)}
                  style={{
                    background: 'rgba(55, 189, 120, 0.2)',
                    border: '1px solid rgba(55, 189, 120, 0.5)',
                    color: '#8be28b',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    minHeight: '44px'
                  }}
                >
                  View Farmer's Produce
                </button>
              )}
            </div>

            {/* Other produce from this farmer */}
            {otherFarmerProducts.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                <div style={{ color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>
                  More Fresh Harvests From This Farmer ({otherFarmerProducts.length})
                </div>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {otherFarmerProducts.map(fp => (
                    <div
                      key={getProductId(fp)}
                      style={{
                        minWidth: '170px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '8px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <img
                        src={fp.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b'}
                        alt={fp.title}
                        style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ color: '#effbe7', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {fp.title}
                        </div>
                        <div style={{ color: '#37bd78', fontSize: '11.5px', fontWeight: '800' }}>
                          ₹{fp.price} / {fp.unit || 'kg'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              SECTION 5 — CULTIVATION
              ========================================================================= */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            borderRadius: '16px',
            padding: '18px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#34d399', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Leaf size={17} color="#34d399" />
              <span>Cultivation & Water Source</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Cultivation Method</span>
                <span style={{ fontSize: '14px', color: '#effbe7', fontWeight: '700', marginTop: '2px', display: 'block' }}>
                  {product.cultivationType === 'Organic'
                    ? 'Organic — Farmer reported'
                    : (product.cultivationType || 'Not provided by farmer')}
                </span>
                {product.cultivationType === 'Organic' && (
                  <span style={{ fontSize: '10.5px', color: '#facc15', marginTop: '3px', display: 'block' }}>
                    ℹ️ Farmer-reported cultivation method
                  </span>
                )}
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Irrigation Method</span>
                <span style={{ fontSize: '14px', color: '#effbe7', fontWeight: '700', marginTop: '2px', display: 'block' }}>
                  {product.irrigationMethod || 'Not provided by farmer'}
                </span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 6 — AVAILABILITY & ORDERING
              ========================================================================= */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(110, 219, 208, 0.25)',
            borderRadius: '16px',
            padding: '18px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#6edbd0', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={17} color="#6edbd0" />
              <span>Availability & Ordering</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: allowBargain ? '14px' : 0 }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Available Stock</span>
                <span style={{ fontSize: '14px', color: '#effbe7', fontWeight: '700', marginTop: '2px', display: 'block' }}>
                  {maxStock} {product.unit || 'kg'}
                </span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Minimum Order</span>
                <span style={{ fontSize: '14px', color: '#effbe7', fontWeight: '700', marginTop: '2px', display: 'block' }}>
                  {minQty} {product.unit || 'kg'}
                </span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Packaging Unit</span>
                <span style={{ fontSize: '14px', color: '#effbe7', fontWeight: '700', marginTop: '2px', display: 'block' }}>
                  {product.unit || 'kg'}
                </span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Bulk Bargaining</span>
                <span style={{ fontSize: '14px', color: allowBargain ? '#f4c95d' : '#9db5aa', fontWeight: '700', marginTop: '2px', display: 'block' }}>
                  {allowBargain ? 'Available' : 'Not available'}
                </span>
              </div>
            </div>

            {allowBargain && onOpenBargain && (
              <div style={{
                background: 'rgba(244, 201, 93, 0.08)',
                border: '1px solid rgba(244, 201, 93, 0.25)',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#f4c95d' }}>
                    Request a Bulk Bargain
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#d9c7a0' }}>
                    You can submit a price offer for bulk purchases.
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenBargain(product);
                  }}
                  style={{
                    background: '#f4c95d',
                    color: '#092b27',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    fontWeight: '800',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    minHeight: '44px'
                  }}
                >
                  Propose Bulk Offer
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Customer Notifications Drawer / Modal
───────────────────────────────────────────────────────────── */
function NotificationDrawer({ isOpen, onClose, notifications, onRefresh }) {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(2, 10, 8, 0.75)',
      backdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div
        className="responsive-modal-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          background: 'rgba(9, 32, 27, 0.98)',
          borderLeft: '1.5px solid rgba(110, 219, 208, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 35px rgba(0,0,0,0.6)'
        }}
      >
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="#6edbd0" />
            <h3 style={{ color: '#effbe7', fontSize: '17px', fontWeight: '800', margin: 0 }}>
              Order & Marketplace Alerts
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onRefresh}
              title="Refresh alerts"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#effbe7',
                borderRadius: '8px',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#effbe7',
                borderRadius: '8px',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#a3c2b0' }}>
              <Bell size={36} color="#6edbd0" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
              <div style={{ color: '#effbe7', fontWeight: '700' }}>All Caught Up</div>
              <div style={{ fontSize: '12.5px', marginTop: '4px' }}>Marketplace and order status updates will appear here in real time.</div>
            </div>
          ) : (
            notifications.map((notif, idx) => (
              <div
                key={notif.id || idx}
                style={{
                  background: notif.category === 'delivery'
                    ? 'rgba(244, 201, 93, 0.08)'
                    : notif.priority === 'HIGH' || notif.priority === 'URGENT'
                      ? 'rgba(55, 189, 120, 0.12)'
                      : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${notif.category === 'delivery' ? 'rgba(244, 201, 93, 0.3)' : 'rgba(110, 219, 208, 0.2)'}`,
                  borderRadius: '14px',
                  padding: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div style={{ color: '#effbe7', fontSize: '13.5px', fontWeight: '800' }}>
                    {notif.title}
                  </div>
                  <span style={{ color: '#a3c2b0', fontSize: '10.5px' }}>
                    {notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <div style={{ color: '#a3c2b0', fontSize: '12px', lineHeight: '1.4' }}>
                  {notif.message}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Phase 4 Skeletons for Loading States
───────────────────────────────────────────────────────────── */
function SkeletonOrderList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            background: 'rgba(9, 43, 39, 0.65)',
            border: '1.5px solid rgba(110, 219, 208, 0.15)',
            borderRadius: '18px',
            padding: '22px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div className="skeleton-box" style={{ width: '160px', height: '22px' }} />
            <div className="skeleton-box" style={{ width: '110px', height: '24px', borderRadius: '12px' }} />
          </div>
          <div className="skeleton-box" style={{ width: '65%', height: '18px', marginBottom: '12px' }} />
          <div className="skeleton-box" style={{ width: '45%', height: '14px', marginBottom: '18px' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="skeleton-box" style={{ width: '130px', height: '40px', borderRadius: '10px' }} />
            <div className="skeleton-box" style={{ width: '130px', height: '40px', borderRadius: '10px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonBargainList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            background: 'rgba(9, 43, 39, 0.65)',
            border: '1.5px solid rgba(110, 219, 208, 0.15)',
            borderRadius: '18px',
            padding: '22px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div className="skeleton-box" style={{ width: '180px', height: '22px' }} />
            <div className="skeleton-box" style={{ width: '90px', height: '24px', borderRadius: '12px' }} />
          </div>
          <div className="skeleton-box" style={{ width: '100%', height: '70px', borderRadius: '10px', marginBottom: '14px' }} />
          <div className="skeleton-box" style={{ width: '150px', height: '38px', borderRadius: '8px' }} />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Phase 4 — Checkout Modal (Multi-Farmer Package Breakdown, Address & Payment)
───────────────────────────────────────────────────────────── */
function CheckoutModal({
  isOpen,
  onClose,
  cart,
  cartGroupedByFarmer,
  expressDelivery,
  setExpressDelivery,
  checkoutAddress,
  setCheckoutAddress,
  isEditingAddress,
  setIsEditingAddress,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  onConfirmCheckout,
  placingOrder,
  checkoutError
}) {
  if (!isOpen) return null;

  const baseTotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const deliveryFee = expressDelivery ? 49 : 0;
  const totalAmount = baseTotal + deliveryFee;

  const totalBargainSavings = cart.reduce((sum, item) => {
    const orig = Number(item.originalPrice);
    const curr = Number(item.price);
    if (orig > curr) {
      return sum + ((orig - curr) * item.quantity);
    }
    return sum;
  }, 0);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 12, 10, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="responsive-modal-card"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          background: 'linear-gradient(155deg, rgba(9, 43, 39, 0.98), rgba(6, 24, 21, 0.99))',
          border: '1.5px solid rgba(55, 189, 120, 0.4)',
          borderRadius: '24px',
          boxShadow: '0 25px 65px rgba(0,0,0,0.85)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart size={22} color="#37bd78" />
            <div>
              <h2 style={{ margin: 0, color: '#effbe7', fontSize: '19px', fontWeight: '800' }}>
                Direct Farm Checkout
              </h2>
              <span style={{ color: '#a3c2b0', fontSize: '12px' }}>
                Review farmer packages & doorstep fulfillment
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9db5aa',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {checkoutError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#fca5a5',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
              <span>{checkoutError}</span>
            </div>
          )}

          {/* 1. FARMER PACKAGE BREAKDOWN */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#6edbd0', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sprout size={16} />
                <span>Farmer Packages ({cartGroupedByFarmer.length})</span>
              </div>
              <span style={{ fontSize: '11.5px', color: '#a3c2b0' }}>
                {cart.length} item{cart.length > 1 ? 's' : ''} in cart
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cartGroupedByFarmer.map((group, gIdx) => (
                <div
                  key={group.farmerId || gIdx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(110, 219, 208, 0.2)',
                    borderRadius: '16px',
                    padding: '16px'
                  }}
                >
                  {/* Farmer Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: 'rgba(55, 189, 120, 0.2)', color: '#8be28b', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>
                        Farmer #{gIdx + 1}
                      </span>
                      <strong style={{ color: '#effbe7', fontSize: '14.5px' }}>{group.farmerName}</strong>
                    </div>
                    {group.farmerLocation && (
                      <span style={{ color: '#a3c2b0', fontSize: '11.5px' }}>
                        📍 {group.farmerLocation}
                      </span>
                    )}
                  </div>

                  {/* Items in this farm package */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {group.items.map((item, idx) => {
                      const hasSavings = Number(item.originalPrice) > Number(item.price);
                      const unitSavings = hasSavings ? Number(item.originalPrice) - Number(item.price) : 0;
                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'rgba(0, 0, 0, 0.25)',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            gap: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.title}
                                style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                              />
                            )}
                            <div>
                              <div style={{ color: '#effbe7', fontSize: '13.5px', fontWeight: '700' }}>
                                {item.title}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                <span style={{ color: '#37bd78', fontSize: '12.5px', fontWeight: '800' }}>
                                  ₹{item.price} / {item.unit || 'kg'}
                                </span>
                                <span style={{ color: '#a3c2b0', fontSize: '12px' }}>
                                  × {item.quantity} {item.unit || 'kg'}
                                </span>
                              </div>
                              {hasSavings && (
                                <div style={{ fontSize: '11px', color: '#f4c95d', fontWeight: '700', marginTop: '2px' }}>
                                  Negotiated Bargain (Saved ₹{unitSavings * item.quantity})
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', minWidth: '70px' }}>
                            <div style={{ color: '#effbe7', fontSize: '14.5px', fontWeight: '900' }}>
                              ₹{Number(item.price) * item.quantity}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Farmer Subtotal */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '12px',
                      paddingTop: '10px',
                      borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
                      fontSize: '13px'
                    }}
                  >
                    <span style={{ color: '#a3c2b0', fontWeight: '600' }}>Farmer Subtotal:</span>
                    <span style={{ color: '#8be28b', fontSize: '15px', fontWeight: '900' }}>
                      ₹{group.subtotal}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Transparent Multi-Farm Fulfillment Notice */}
            {cartGroupedByFarmer.length > 1 && (
              <div
                style={{
                  marginTop: '12px',
                  background: 'rgba(55, 189, 120, 0.1)',
                  border: '1px solid rgba(55, 189, 120, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '12.5px',
                  color: '#effbe7',
                  lineHeight: '1.5'
                }}
              >
                ℹ️ <strong>Multi-Farm Direct Dispatch:</strong> Products from different farms are packed directly at source to guarantee harvest freshness and may arrive in separate dispatches.
              </div>
            )}
          </div>

          {/* 2. DELIVERY ADDRESS */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(110, 219, 208, 0.2)',
              borderRadius: '16px',
              padding: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#6edbd0', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} />
                <span>Delivery Doorstep Address</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingAddress(!isEditingAddress)}
                style={{
                  background: 'rgba(110, 219, 208, 0.15)',
                  border: '1px solid rgba(110, 219, 208, 0.35)',
                  color: '#6edbd0',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  minHeight: '34px'
                }}
              >
                <Edit2 size={13} />
                <span>{isEditingAddress ? 'Done Editing' : 'Edit Address'}</span>
              </button>
            </div>

            {isEditingAddress ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Customer Name</label>
                  <input
                    type="text"
                    value={checkoutAddress.name || ''}
                    onChange={(e) => setCheckoutAddress({ ...checkoutAddress, name: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(110, 219, 208, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      color: '#effbe7',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Phone Number</label>
                  <input
                    type="tel"
                    value={checkoutAddress.phone || ''}
                    onChange={(e) => setCheckoutAddress({ ...checkoutAddress, phone: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(110, 219, 208, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      color: '#effbe7',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Street / Doorstep Address</label>
                  <input
                    type="text"
                    value={checkoutAddress.addressLine || ''}
                    onChange={(e) => setCheckoutAddress({ ...checkoutAddress, addressLine: e.target.value })}
                    placeholder="House/Flat No., Apartment, Street"
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(110, 219, 208, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      color: '#effbe7',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>City</label>
                  <input
                    type="text"
                    value={checkoutAddress.city || ''}
                    onChange={(e) => setCheckoutAddress({ ...checkoutAddress, city: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(110, 219, 208, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      color: '#effbe7',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>State</label>
                  <input
                    type="text"
                    value={checkoutAddress.state || ''}
                    onChange={(e) => setCheckoutAddress({ ...checkoutAddress, state: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(110, 219, 208, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      color: '#effbe7',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Pincode</label>
                  <input
                    type="text"
                    value={checkoutAddress.pincode || ''}
                    onChange={(e) => setCheckoutAddress({ ...checkoutAddress, pincode: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(110, 219, 208, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      color: '#effbe7',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ color: '#effbe7', fontSize: '13.5px', lineHeight: '1.6' }}>
                <div style={{ fontWeight: '800', color: '#37bd78' }}>
                  {checkoutAddress.name || 'Verified Customer'} • {checkoutAddress.phone || '+91 98400 12345'}
                </div>
                <div style={{ color: '#effbe7', marginTop: '2px' }}>
                  {checkoutAddress.addressLine || 'Direct Delivery Address'}
                </div>
                <div style={{ color: '#a3c2b0', fontSize: '12.5px' }}>
                  {checkoutAddress.city || 'Bengaluru'}, {checkoutAddress.state || 'Karnataka'} - {checkoutAddress.pincode || '560001'}
                </div>
              </div>
            )}
          </div>

          {/* 3. PAYMENT METHOD (Truthful UI) */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(110, 219, 208, 0.2)',
              borderRadius: '16px',
              padding: '16px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#6edbd0', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CreditCard size={16} />
              <span>Select Payment Method</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Option 1: Cash on Delivery (Standard Active) */}
              <div
                onClick={() => setSelectedPaymentMethod('cod')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: selectedPaymentMethod === 'cod' ? 'rgba(55, 189, 120, 0.15)' : 'rgba(0,0,0,0.25)',
                  border: `1.5px solid ${selectedPaymentMethod === 'cod' ? '#37bd78' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '12px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  minHeight: '48px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: `2px solid ${selectedPaymentMethod === 'cod' ? '#37bd78' : '#a3c2b0'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {selectedPaymentMethod === 'cod' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#37bd78' }} />}
                  </div>
                  <div>
                    <div style={{ color: '#effbe7', fontSize: '14px', fontWeight: '800' }}>
                      Cash on Delivery (Standard Farm-to-Doorstep)
                    </div>
                    <div style={{ color: '#a3c2b0', fontSize: '12px' }}>
                      Pay with cash upon inspecting harvest quality at handover.
                    </div>
                  </div>
                </div>
                <span style={{ background: 'rgba(55, 189, 120, 0.2)', color: '#8be28b', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                  Active
                </span>
              </div>

              {/* Option 2: UPI on Delivery (Scan Courier QR) */}
              <div
                onClick={() => setSelectedPaymentMethod('upi_delivery')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: selectedPaymentMethod === 'upi_delivery' ? 'rgba(55, 189, 120, 0.15)' : 'rgba(0,0,0,0.25)',
                  border: `1.5px solid ${selectedPaymentMethod === 'upi_delivery' ? '#37bd78' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '12px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  minHeight: '48px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: `2px solid ${selectedPaymentMethod === 'upi_delivery' ? '#37bd78' : '#a3c2b0'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {selectedPaymentMethod === 'upi_delivery' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#37bd78' }} />}
                  </div>
                  <div>
                    <div style={{ color: '#effbe7', fontSize: '14px', fontWeight: '800' }}>
                      UPI on Delivery (GPay / PhonePe / Paytm QR)
                    </div>
                    <div style={{ color: '#a3c2b0', fontSize: '12px' }}>
                      Scan delivery partner's verified UPI QR code at your doorstep.
                    </div>
                  </div>
                </div>
                <span style={{ background: 'rgba(55, 189, 120, 0.2)', color: '#8be28b', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                  Active
                </span>
              </div>

              {/* Option 3: Online Cards / NetBanking (Disabled - Truthful representation) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0,0,0,0.15)',
                  border: '1px dashed rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  opacity: 0.65,
                  cursor: 'not-allowed',
                  minHeight: '48px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />
                  <div>
                    <div style={{ color: '#effbe7', fontSize: '14px', fontWeight: '700' }}>
                      Credit / Debit Card & NetBanking
                    </div>
                    <div style={{ color: '#a3c2b0', fontSize: '11.5px' }}>
                      Online payment gateway integration currently under review.
                    </div>
                  </div>
                </div>
                <span style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#d9c7a0', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>
                  Coming Soon
                </span>
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '11.5px', color: '#a3c2b0' }}>
              🛡️ <strong>Zero Prepayment Risk:</strong> Payment is strictly collected upon inspecting produce freshness and verifying your delivery OTP.
            </div>
          </div>

          {/* Express Delivery Option */}
          <div
            onClick={() => setExpressDelivery(!expressDelivery)}
            style={{
              background: expressDelivery ? 'rgba(55, 189, 120, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: `1.5px solid ${expressDelivery ? '#37bd78' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '14px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              minHeight: '48px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={18} color={expressDelivery ? '#37bd78' : '#a3c2b0'} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#effbe7' }}>
                  Green Express Courier (2-Hour Chilled Dispatch)
                </div>
                <div style={{ fontSize: '11px', color: '#a3c2b0' }}>
                  Temperature-monitored refrigerated EV fleet direct from Mandya
                </div>
              </div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#f4c95d' }}>
              +₹49
            </span>
          </div>

          {/* 4. ORDER COST BREAKDOWN */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(110, 219, 208, 0.2)',
              borderRadius: '16px',
              padding: '16px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#6edbd0', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
              Payment Breakdown
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a3c2b0' }}>
                <span>Produce Items Subtotal:</span>
                <span style={{ color: '#effbe7', fontWeight: '700' }}>₹{baseTotal}</span>
              </div>

              {totalBargainSavings > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#37bd78' }}>
                  <span>Negotiated Bargain Savings:</span>
                  <span style={{ fontWeight: '800' }}>-₹{totalBargainSavings}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a3c2b0' }}>
                <span>Direct Farm Dispatch:</span>
                <span style={{ color: expressDelivery ? '#f4c95d' : '#8be28b', fontWeight: '700' }}>
                  {expressDelivery ? '₹49 (Express Chilled EV)' : 'FREE (Direct from Farm)'}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '8px',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '16px'
                }}
              >
                <span style={{ color: '#effbe7', fontWeight: '800' }}>Final Payable Amount:</span>
                <span style={{ color: '#37bd78', fontSize: '24px', fontWeight: '900' }}>
                  ₹{totalAmount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action (Sticky Mobile Friendly) */}
        <div
          className="checkout-mobile-footer"
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <div style={{ color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>
              Total Payable (INR)
            </div>
            <div style={{ color: '#37bd78', fontSize: '22px', fontWeight: '900' }}>
              ₹{totalAmount}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 18px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#effbe7',
                fontWeight: '700',
                cursor: 'pointer',
                minHeight: '48px'
              }}
            >
              Back to Cart
            </button>
            <button
              type="button"
              onClick={onConfirmCheckout}
              disabled={placingOrder}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2e7d32, #1b5e20)',
                border: 'none',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '800',
                cursor: placingOrder ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minHeight: '48px',
                boxShadow: '0 6px 20px rgba(46, 125, 50, 0.5)'
              }}
            >
              {placingOrder ? (
                <>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Placing Farm Order...</span>
                </>
              ) : (
                <>
                  <span>Place Multi-Farm Order (₹{totalAmount})</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Phase 4 — Order Confirmation Screen / Modal
───────────────────────────────────────────────────────────── */
function OrderConfirmationModal({
  isOpen,
  orderResult,
  onClose,
  onViewOrders,
  onContinueShopping
}) {
  if (!isOpen || !orderResult) return null;

  const orders = Array.isArray(orderResult.orders) ? orderResult.orders : [orderResult.orders];
  const { totalAmount, paymentMethod, address } = orderResult;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 12, 10, 0.88)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="responsive-modal-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          background: 'linear-gradient(155deg, rgba(9, 43, 39, 0.98), rgba(6, 24, 21, 0.99))',
          border: '1.5px solid rgba(55, 189, 120, 0.5)',
          borderRadius: '24px',
          boxShadow: '0 25px 65px rgba(0,0,0,0.85)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '28px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(55, 189, 120, 0.2)',
              border: '2px solid #37bd78',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 0 24px rgba(55, 189, 120, 0.4)'
            }}
          >
            <CheckCircle2 size={36} color="#37bd78" />
          </div>
          <h2 style={{ color: '#effbe7', fontSize: '22px', fontWeight: '900', margin: '0 0 6px' }}>
            ✓ Order Placed Successfully!
          </h2>
          <p style={{ color: '#a3c2b0', fontSize: '13.5px', margin: 0 }}>
            Your direct harvest request has been sent to farm packing depots.
          </p>
        </div>

        {/* Order Details Body */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
          {/* Order IDs & Farmer Packages */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(110, 219, 208, 0.25)',
              borderRadius: '16px',
              padding: '16px'
            }}
          >
            <div style={{ color: '#6edbd0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', marginBottom: '8px' }}>
              Dispatched Farm Packages ({orders.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {orders.map((ord, idx) => (
                <div
                  key={ord._id || ord.id || idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '8px 12px',
                    borderRadius: '10px'
                  }}
                >
                  <div>
                    <div style={{ color: '#effbe7', fontSize: '13px', fontWeight: '700' }}>
                      #{String(ord.orderId || ord._id || ord.id).slice(-8).toUpperCase()}
                    </div>
                    <div style={{ color: '#a3c2b0', fontSize: '11.5px' }}>
                      🧑‍🌾 {ord.farmerName || 'Direct Farm Producer'} • {ord.items?.length || 1} item(s)
                    </div>
                  </div>
                  <span style={{ color: '#8be28b', fontSize: '14px', fontWeight: '800' }}>
                    ₹{ord.totalAmount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Amount Summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px'
            }}
          >
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Total Amount</div>
              <div style={{ color: '#37bd78', fontSize: '18px', fontWeight: '900', marginTop: '2px' }}>₹{totalAmount}</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Payment Mode</div>
              <div style={{ color: '#effbe7', fontSize: '13px', fontWeight: '700', marginTop: '2px' }}>
                {paymentMethod || 'Cash on Delivery'}
              </div>
              <div style={{ color: '#f4c95d', fontSize: '11px', fontWeight: '600' }}>Payable at Handover</div>
            </div>
          </div>

          {/* Delivery Address */}
          {address && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '12px 14px',
                fontSize: '12.5px',
                color: '#effbe7'
              }}
            >
              <div style={{ color: '#6edbd0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px' }}>
                Deliver To
              </div>
              <div style={{ fontWeight: '700' }}>{address.name} • {address.phone}</div>
              <div style={{ color: '#a3c2b0', marginTop: '2px' }}>
                {address.addressLine || address.address}, {address.city}, {address.state} - {address.pincode}
              </div>
            </div>
          )}

          {/* Secure Handover Notice */}
          <div
            style={{
              background: 'rgba(244, 201, 93, 0.1)',
              border: '1px solid rgba(244, 201, 93, 0.3)',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '12px',
              color: '#effbe7',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ShieldCheck size={18} color="#f4c95d" style={{ flexShrink: 0 }} />
            <span>
              <strong>Secure Handover:</strong> Your delivery courier will verify package handover via an SMS/Email OTP upon arrival at your doorstep.
            </span>
          </div>
        </div>

        {/* Action Buttons (48px+ Touch Targets) */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onViewOrders}
            style={{
              flex: '1 1 180px',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00897b, #004d40)',
              border: 'none',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              minHeight: '48px',
              boxShadow: '0 4px 16px rgba(0, 137, 123, 0.4)'
            }}
          >
            <Truck size={17} />
            <span>Track in Live GPS Radar</span>
          </button>

          <button
            type="button"
            onClick={onContinueShopping}
            style={{
              flex: '1 1 140px',
              padding: '14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#effbe7',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '48px'
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Phase 4 — Detailed Order Page / Modal with Vertical Tracking Timeline
───────────────────────────────────────────────────────────── */
function OrderDetailsModal({
  order,
  onClose,
  onCancelOrder,
  onReviewItem
}) {
  if (!order) return null;

  const orderId = String(order.orderId || order._id || order.id || '').toUpperCase();
  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Recent Order';

  const isCancellable = ['pending', 'confirmed', 'accepted'].includes(order.status);
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  // Milestone mapping strictly from backend enum
  const stages = [
    { key: 'placed', label: 'Order Placed', match: ['pending', 'confirmed', 'accepted', 'packed', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'arrived', 'delivered'], time: order.createdAt },
    { key: 'confirmed', label: 'Farmer Confirmed', match: ['confirmed', 'accepted', 'packed', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'arrived', 'delivered'] },
    { key: 'packed', label: 'Produce Packed at Farm', match: ['packed', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'arrived', 'delivered'] },
    { key: 'assigned', label: 'Courier Assigned', match: ['assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'arrived', 'delivered'], note: order.deliveryName && order.deliveryName !== 'Unassigned' ? `Courier: ${order.deliveryName}` : null },
    { key: 'transit', label: 'Dispatched & Out for Delivery', match: ['picked_up', 'in_transit', 'out_for_delivery', 'arrived', 'delivered'], time: order.dispatchSignaledAt },
    { key: 'delivered', label: 'Delivered to Doorstep', match: ['delivered'], time: order.deliveryOtpVerifiedAt }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 12, 10, 0.85)',
        backdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="responsive-modal-card"
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '92vh',
          background: 'linear-gradient(155deg, rgba(9, 43, 39, 0.98), rgba(6, 24, 21, 0.99))',
          border: '1.5px solid rgba(110, 219, 208, 0.35)',
          borderRadius: '24px',
          boxShadow: '0 25px 65px rgba(0,0,0,0.85)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          <div>
            <span style={{ color: '#6edbd0', fontSize: '11.5px', fontWeight: '800' }}>
              ORDER #{orderId.slice(-8)}
            </span>
            <div style={{ color: '#effbe7', fontSize: '17px', fontWeight: '800', marginTop: '2px' }}>
              Total: ₹{order.totalAmount} • {formattedDate}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                background: isDelivered ? 'rgba(55, 189, 120, 0.25)' : isCancelled ? 'rgba(239, 68, 68, 0.25)' : 'rgba(244, 201, 93, 0.25)',
                border: `1px solid ${isDelivered ? '#37bd78' : isCancelled ? '#ef4444' : '#f4c95d'}`,
                color: isDelivered ? '#8be28b' : isCancelled ? '#fca5a5' : '#f4c95d',
                padding: '5px 12px',
                borderRadius: '20px',
                fontWeight: '800',
                fontSize: '11.5px',
                textTransform: 'uppercase'
              }}
            >
              {order.status}
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9db5aa',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Details Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Vertical Tracking Timeline (Prompt Requirement 8) */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(110, 219, 208, 0.2)',
              borderRadius: '16px',
              padding: '18px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#6edbd0', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} />
              <span>Live Order Milestones & Tracking</span>
            </div>

            {isCancelled ? (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#fca5a5'
                }}
              >
                <div style={{ fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={16} color="#ef4444" />
                  <span>Order Cancelled</span>
                </div>
                <div style={{ fontSize: '12.5px', marginTop: '4px', color: '#effbe7' }}>
                  {order.cancellationReason || 'Order cancelled by customer request. Reserved farm stock has been restored to catalog.'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {stages.map((stage, sIdx) => {
                  const isDone = stage.match.includes(order.status);
                  const isCurrent = order.status === stage.key || (stage.key === 'transit' && ['picked_up', 'in_transit', 'out_for_delivery', 'arrived'].includes(order.status));
                  const isLast = sIdx === stages.length - 1;

                  return (
                    <div key={stage.key} style={{ display: 'flex', gap: '14px', position: 'relative' }}>
                      {/* Timeline dot and connecting line */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '24px' }}>
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: isCurrent ? '#f4c95d' : isDone ? '#37bd78' : 'rgba(255, 255, 255, 0.1)',
                            border: `2px solid ${isCurrent ? '#f4c95d' : isDone ? '#37bd78' : 'rgba(255, 255, 255, 0.2)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                            boxShadow: isCurrent ? '0 0 10px rgba(244, 201, 93, 0.6)' : isDone ? '0 0 8px rgba(55, 189, 120, 0.4)' : 'none'
                          }}
                        >
                          {isDone && !isCurrent && <Check size={11} color="#092b27" strokeWidth={3} />}
                        </div>
                        {!isLast && (
                          <div
                            style={{
                              width: '2px',
                              flex: 1,
                              minHeight: '26px',
                              background: isDone ? 'rgba(55, 189, 120, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                              margin: '2px 0'
                            }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ paddingBottom: isLast ? 0 : '14px', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: isCurrent ? '800' : isDone ? '700' : '500', color: isCurrent ? '#f4c95d' : isDone ? '#effbe7' : '#6b7280' }}>
                            {stage.label}
                          </span>
                          {stage.time && (
                            <span style={{ fontSize: '11px', color: '#a3c2b0' }}>
                              {new Date(stage.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        {stage.note && (
                          <div style={{ fontSize: '11.5px', color: '#6edbd0', marginTop: '2px' }}>
                            {stage.note}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Farmer & Courier Information */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px'
            }}
          >
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '14px' }}>
              <div style={{ color: '#37bd78', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sprout size={13} />
                <span>Producer Farm</span>
              </div>
              <div style={{ color: '#effbe7', fontSize: '14px', fontWeight: '700' }}>
                {order.farmerName || 'Mandya Organic Farm Partner'}
              </div>
              <div style={{ color: '#a3c2b0', fontSize: '12px', marginTop: '2px' }}>
                📍 {order.farmerLocation?.address || 'Direct Farm Depot, Karnataka'}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '14px' }}>
              <div style={{ color: '#f4c95d', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Truck size={13} />
                <span>Delivery Partner</span>
              </div>
              <div style={{ color: '#effbe7', fontSize: '14px', fontWeight: '700' }}>
                {order.deliveryName || 'Awaiting Courier Assignment'}
              </div>
              <div style={{ color: '#a3c2b0', fontSize: '12px', marginTop: '2px' }}>
                📞 {order.deliveryPhone || 'Contact will be enabled upon driver claim'}
              </div>
            </div>
          </div>

          {/* Products Ordered */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(110, 219, 208, 0.2)',
              borderRadius: '16px',
              padding: '16px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#6edbd0', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
              Ordered Farm Produce ({order.items?.length || 0})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(order.items || []).map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '10px 12px',
                    borderRadius: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                    )}
                    <div>
                      <div style={{ color: '#effbe7', fontSize: '13px', fontWeight: '700' }}>{item.title}</div>
                      <div style={{ color: '#a3c2b0', fontSize: '12px' }}>
                        ₹{item.price} × {item.quantity} {item.unit || 'kg'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ color: '#effbe7', fontSize: '14px', fontWeight: '800' }}>
                      ₹{Number(item.price) * item.quantity}
                    </div>

                    {isDelivered && onReviewItem && (
                      <button
                        onClick={() => onReviewItem({
                          orderId: order._id || order.id,
                          productId: item.productId,
                          title: item.title,
                          farmerId: order.farmerId
                        })}
                        style={{
                          background: 'rgba(244, 201, 93, 0.2)',
                          border: '1px solid #f4c95d',
                          color: '#f4c95d',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Rate Produce
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
                paddingTop: '10px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '14px'
              }}
            >
              <span style={{ color: '#a3c2b0', fontWeight: '600' }}>Total Order Value:</span>
              <span style={{ color: '#37bd78', fontSize: '18px', fontWeight: '900' }}>
                ₹{order.totalAmount}
              </span>
            </div>
          </div>

          {/* Delivery Address & Payment Status */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px'
            }}
          >
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '14px' }}>
              <div style={{ color: '#6edbd0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px' }}>
                Delivery Address
              </div>
              <div style={{ color: '#effbe7', fontSize: '13px', fontWeight: '700' }}>
                {order.customerName || 'Customer'} • {order.customerPhone || 'Phone verified'}
              </div>
              <div style={{ color: '#a3c2b0', fontSize: '12px', marginTop: '2px' }}>
                {order.customerLocation?.address || 'Doorstep Delivery, Mandya/Bengaluru Cluster'}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '14px' }}>
              <div style={{ color: '#6edbd0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px' }}>
                Payment Status
              </div>
              <div style={{ color: isDelivered ? '#8be28b' : isCancelled ? '#fca5a5' : '#f4c95d', fontSize: '13.5px', fontWeight: '800' }}>
                {isDelivered ? 'Paid on Handover (Verified)' : isCancelled ? 'Cancelled • No Payment Due' : 'Cash on Delivery • Payable at Doorstep'}
              </div>
              <div style={{ color: '#a3c2b0', fontSize: '11.5px', marginTop: '2px' }}>
                {isDelivered ? 'OTP handover confirmed delivery' : 'Pay via cash or UPI scan when courier arrives'}
              </div>
            </div>
          </div>

          {/* OTP Security reminder */}
          {!isDelivered && !isCancelled && (
            <div
              style={{
                background: 'rgba(244, 201, 93, 0.08)',
                border: '1px solid rgba(244, 201, 93, 0.25)',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '12px',
                color: '#effbe7',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShieldCheck size={18} color="#f4c95d" style={{ flexShrink: 0 }} />
              <span>
                <strong>Verification Handover:</strong> Check your registered SMS/Email for your secure OTP when your courier reaches your doorstep.
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          {isCancellable ? (
            <button
              onClick={() => {
                onClose();
                onCancelOrder(order);
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '44px'
              }}
            >
              <Trash2 size={15} />
              <span>Cancel Order</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#effbe7',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              minHeight: '44px'
            }}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Customer Portal Component
───────────────────────────────────────────────────────────── */
export default function CustomerPortal() {
  const { user, showToast, updateUserProfile } = useAuth();
  const [products, setProducts] = useState([]);

  // Cart persisted per customer account in localStorage (Protected against race-condition overwrite)
  const cartStorageKey = `agrilink_cart_${user?._id || user?.id || 'customer'}`;
  const [cart, setCart] = useState([]);
  const [cartHydrated, setCartHydrated] = useState(false);

  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace' | 'orders' | 'recipes' | 'favorites' | 'profile' | 'cart' | 'bargains' | 'farmers'

  // Registered Farmers from Database (Problem 9)
  const [registeredFarmers, setRegisteredFarmers] = useState([]);

  // Customer Bulk Bargains (Problem 9)
  const [customerBargains, setCustomerBargains] = useState([]);
  const [loadingBargains, setLoadingBargains] = useState(false);

  // Order Cancellation State (Problem 9)
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingOrder, setCancellingOrder] = useState(false);

  // AI Recipe Studio Interactive Assistant (Problem 10)
  const [recipeMessages, setRecipeMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your AgriLink Farm-to-Table Culinary Assistant. You can ask me what to cook with the fresh produce in your cart, request step-by-step preparation, ask for high-protein or no-onion variations, or cooking times. What fresh dish would you like to prepare today?'
    }
  ]);
  const [recipeInput, setRecipeInput] = useState('');
  const [recipeLoading, setRecipeLoading] = useState(false);

  // Advanced Filters (Phase 3 Enriched)
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterFarmerId, setFilterFarmerId] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filterBargainOnly, setFilterBargainOnly] = useState(false);
  const [filterFreshness, setFilterFreshness] = useState('all'); // 'all' | 'today' | '24h' | '48h' | 'older' | 'unspecified'
  const [filterCultivation, setFilterCultivation] = useState('all'); // 'all' | 'natural' | 'organic' | 'conventional' | 'hydroponic'
  const [filterQualityGrade, setFilterQualityGrade] = useState('all'); // 'all' | 'premium' | 'grade_a' | 'standard'
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const [loading, setLoading] = useState(true);
  const [productError, setProductError] = useState(null);
  const [refreshingOrders, setRefreshingOrders] = useState(false);
  const [expressDelivery, setExpressDelivery] = useState(false);

  // Modals & Drawers
  const [inspectProduct, setInspectProduct] = useState(null);
  const [detailsProduct, setDetailsProduct] = useState(null);
  const [bargainProduct, setBargainProduct] = useState(null);
  const [showLiveCam, setShowLiveCam] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFirstName, setProfileFirstName] = useState(user?.firstName || '');
  const [profileLastName, setProfileLastName] = useState(user?.lastName || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAddress, setProfileAddress] = useState(user?.location?.address || '');
  const [profileNative, setProfileNative] = useState(user?.nativePlace || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Reviews State
  const [reviewingItem, setReviewingItem] = useState(null); // { orderId, productId, title, farmerId }
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedKeys, setReviewedKeys] = useState([]);

  // Phase 4 — Checkout, Orders & Payment State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod'); // 'cod' | 'upi_delivery'
  const [checkoutAddress, setCheckoutAddress] = useState({
    name: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [confirmedOrderResult, setConfirmedOrderResult] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState('');
  const [expandedRadarOrderId, setExpandedRadarOrderId] = useState(null);

  // Sync checkout address with authenticated user
  useEffect(() => {
    if (user) {
      setCheckoutAddress({
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Verified Customer',
        phone: user.phone || '+91 98400 12345',
        addressLine: user.location?.address || user.address || 'Mandya Agricultural Belt, Near APMC Hub',
        city: user.location?.placeName || user.nativePlace || 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      });
    }
  }, [user]);

  // Hydrate cart from localStorage whenever cartStorageKey changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(cartStorageKey);
      if (saved) {
        setCart(JSON.parse(saved));
      } else {
        const legacy = localStorage.getItem('agrilink_cart_customer');
        if (legacy && (user?._id || user?.id)) {
          setCart(JSON.parse(legacy));
        } else {
          setCart([]);
        }
      }
    } catch {
      setCart([]);
    }
    setCartHydrated(true);
  }, [cartStorageKey]);

  // Sync cart to localStorage only AFTER initial hydration
  useEffect(() => {
    if (!cartHydrated) return;
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch {}
  }, [cart, cartStorageKey, cartHydrated]);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchWishlist();
    fetchNotifications();
    fetchRegisteredFarmers();
    fetchCustomerBargains();
  }, [user]);

  // Synchronize cart with latest live database stock & prices
  useEffect(() => {
    if (products.length > 0 && cart.length > 0) {
      setCart(currentCart => currentCart.map(item => {
        const matching = products.find(p => isSameProduct(p, getProductId(item)));
        if (matching) {
          const freshPrice = Number(matching.price);
          const freshStock = Number(matching.stock);
          const freshQty = Math.min(item.quantity, freshStock);
          return {
            ...item,
            price: freshPrice,
            stock: freshStock,
            quantity: freshQty > 0 ? freshQty : 1
          };
        }
        return item;
      }));
    }
  }, [products]);

  // Periodic polling for live order radar updates
  useEffect(() => {
    if (activeTab !== 'orders') return;
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Periodic polling for customer notifications
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    setProductError(null);
    try {
      const res = await productAPI.getProducts();
      setProducts(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to load products. Please check network connection.';
      setProductError(msg);
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

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const res = await authAPI.getWishlist();
      if (res.data?.wishlist) {
        setFavorites(res.data.wishlist);
      }
    } catch (e) {
      if (user?.wishlist) setFavorites(user.wishlist);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getNotifications();
      if (res.data?.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (e) {
      console.warn('Failed to load notifications:', e);
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

  const fetchRegisteredFarmers = async () => {
    try {
      const res = await authAPI.getFarmers();
      if (res.data?.farmers) {
        setRegisteredFarmers(res.data.farmers);
      }
    } catch (e) {
      console.warn('Could not load registered farmers:', e);
    }
  };

  const fetchCustomerBargains = async () => {
    setLoadingBargains(true);
    try {
      const res = await bargainAPI.getBargains();
      if (res.data?.bargains) {
        setCustomerBargains(res.data.bargains);
      }
    } catch (e) {
      console.warn('Could not load bargains:', e);
    } finally {
      setLoadingBargains(false);
    }
  };

  const handleAcceptCounterBargain = async (bargain) => {
    try {
      await bargainAPI.customerRespond(bargain._id, { action: 'accept' });
      showToast('🎉 Counter offer accepted! Produce added to cart at negotiated price.', 'success');
      if (bargain.productId) {
        const prod = {
          ...bargain.productId,
          price: bargain.counterPrice || bargain.offeredPrice,
          originalPrice: bargain.originalPrice || bargain.productId?.price,
          isBargain: true
        };
        addToCart(prod, bargain.quantity || 1);
      }
      fetchCustomerBargains();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to accept counter offer', 'error');
    }
  };

  const handleRejectCounterBargain = async (bargain) => {
    try {
      await bargainAPI.customerRespond(bargain._id, { action: 'reject' });
      showToast('Counter offer declined.', 'info');
      fetchCustomerBargains();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to decline offer', 'error');
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelModalOrder) return;
    setCancellingOrder(true);
    const finalReason = [cancelReasonPreset, cancelReason.trim()].filter(Boolean).join(' - ') || 'Customer requested order cancellation';
    try {
      await orderAPI.updateStatus(cancelModalOrder._id, {
        status: 'cancelled',
        cancellationReason: finalReason
      });
      showToast('Order cancelled and reserved farm stock restored to catalog.', 'success');
      setCancelModalOrder(null);
      setCancelReason('');
      setCancelReasonPreset('');
      if (selectedOrderDetails && (selectedOrderDetails._id === cancelModalOrder._id || selectedOrderDetails.id === cancelModalOrder.id)) {
        setSelectedOrderDetails(prev => ({ ...prev, status: 'cancelled', cancellationReason: finalReason }));
      }
      await fetchOrders();
      await fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    } finally {
      setCancellingOrder(false);
    }
  };

  const handleAskRecipeAssistant = async (e, customPrompt = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const promptToSend = customPrompt || recipeInput.trim();
    if (!promptToSend || recipeLoading) return;

    if (!customPrompt) setRecipeInput('');
    const updatedMessages = [...recipeMessages, { role: 'user', text: promptToSend }];
    setRecipeMessages(updatedMessages);
    setRecipeLoading(true);

    try {
      const cartItemsPayload = cart.map(i => ({ title: i.title, quantity: i.quantity, unit: i.unit || 'kg' }));
      const res = await aiAPI.recipeAssistant({
        message: promptToSend,
        history: updatedMessages.slice(-6),
        cartItems: cartItemsPayload
      });
      if (res.data?.reply) {
        setRecipeMessages(prev => [...prev, {
          role: 'assistant',
          text: res.data.reply,
          missingIngredients: res.data.missingIngredients || []
        }]);
      }
    } catch (err) {
      setRecipeMessages(prev => [...prev, {
        role: 'assistant',
        text: 'I could not connect to the Culinary Assistant at this moment. You can still browse our fresh ingredients and try again in a few moments!'
      }]);
    } finally {
      setRecipeLoading(false);
    }
  };

  const toggleFavorite = async (productId) => {
    const pId = String(productId);
    // Optimistic UI toggle
    setFavorites(prev =>
      prev.includes(pId) ? prev.filter(id => id !== pId) : [...prev, pId]
    );

    try {
      const res = await authAPI.toggleWishlist({ productId: pId });
      if (res.data?.wishlist) {
        setFavorites(res.data.wishlist);
      }
      showToast(res.data?.isSaved ? 'Saved to favorites ❤️' : 'Removed from favorites', 'info');
    } catch (err) {
      fetchWishlist();
      showToast('Could not sync favorites with cloud', 'error');
    }
  };

  const addToCart = (product, customQty = null) => {
    const prodId = getProductId(product);
    if (!prodId) {
      showToast('Invalid produce item identifier', 'error');
      return;
    }

    if (Number(product.stock) <= 0) {
      showToast(`${product.title} is currently out of stock.`, 'error');
      return;
    }

    const minQty = Math.max(1, Number(product.minOrderQty) || 1);
    const qtyToAdd = customQty !== null ? customQty : minQty;
    if (qtyToAdd < minQty) {
      showToast(`Minimum order quantity for ${product.title} is ${minQty} ${product.unit || 'kg'}`, 'error');
      return;
    }

    setCart(currentCart => {
      const existing = currentCart.find(item => isSameProduct(item, prodId));
      if (existing) {
        if (existing.quantity + qtyToAdd > Number(product.stock)) {
          showToast(`Maximum available stock (${product.stock}) reached for ${product.title}.`, 'error');
          return currentCart;
        }
        return currentCart.map(item =>
          isSameProduct(item, prodId)
            ? {
                ...item,
                quantity: item.quantity + qtyToAdd,
                price: product.price || item.price,
                originalPrice: product.originalPrice || item.originalPrice,
                minOrderQty: minQty,
                unit: product.unit || item.unit || 'kg',
                farmerName: product.farmerName || item.farmerName,
                farmerId: product.farmerId || item.farmerId,
                location: product.location || item.location
              }
            : item
        );
      }
      return [
        ...currentCart,
        {
          ...product,
          quantity: qtyToAdd,
          minOrderQty: minQty,
          unit: product.unit || 'kg',
          farmerName: product.farmerName || 'Local Direct Farmer',
          farmerId: product.farmerId,
          originalPrice: product.originalPrice || null
        }
      ];
    });
    showToast(`Added ${qtyToAdd}x ${product.title} to cart!`, 'success');
  };

  const updateQuantity = (productId, delta) => {
    const targetId = getProductId(productId);
    setCart(currentCart => {
      return currentCart.map(item => {
        if (isSameProduct(item, targetId)) {
          const minQty = Math.max(1, Number(item.minOrderQty) || 1);
          if (delta < 0 && item.quantity <= minQty) {
            showToast(`Minimum order for ${item.title} is ${minQty} ${item.unit || 'kg'}. Tap trash to remove.`, 'info');
            return item;
          }
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

  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      showToast('Your cart is empty. Add farm produce first!', 'info');
      return;
    }
    if (!checkoutAddress.name) {
      setCheckoutAddress({
        name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Verified Customer',
        phone: user?.phone || '+91 98400 12345',
        addressLine: user?.location?.address || user?.address || 'Doorstep, Bengaluru Cluster',
        city: user?.location?.placeName || user?.nativePlace || 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      });
    }
    setCheckoutError(null);
    setShowCheckoutModal(true);
  };

  const checkoutCart = handleOpenCheckout;

  const executeCheckout = async () => {
    if (cart.length === 0) return;
    if (!checkoutAddress.name?.trim() || !checkoutAddress.phone?.trim() || !checkoutAddress.addressLine?.trim()) {
      setCheckoutError('Please provide a valid delivery name, phone, and doorstep address.');
      return;
    }

    setPlacingOrder(true);
    setCheckoutError(null);

    const baseTotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const totalAmount = expressDelivery ? baseTotal + 49 : baseTotal;

    const fullDoorstep = `${checkoutAddress.addressLine}, ${checkoutAddress.city || 'Bengaluru'}, ${checkoutAddress.state || 'Karnataka'} - ${checkoutAddress.pincode || '560001'}`;

    const orderPayload = {
      customerId: user?._id || user?.id,
      customerName: checkoutAddress.name.trim(),
      customerPhone: checkoutAddress.phone.trim(),
      customerEmail: user?.email || '',
      customerLocation: {
        lat: user?.location?.lat || 12.9716,
        lng: user?.location?.lng || 77.5946,
        address: fullDoorstep
      },
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
      setShowCheckoutModal(false);
      setConfirmedOrderResult({
        orders: newOrders,
        totalAmount,
        paymentMethod: selectedPaymentMethod === 'upi_delivery' ? 'UPI on Delivery (Scan QR on Handover)' : 'Cash on Delivery (Standard Handover)',
        address: checkoutAddress,
        expressDelivery
      });
      fetchNotifications();
      if (newOrders.length > 1) {
        showToast(`🎉 Order placed! Multi-farm cart was split into ${newOrders.length} direct-farm dispatches.`, 'success');
      } else {
        showToast('🎉 Order placed successfully! Direct farm dispatch & GPS tracking activated.', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Checkout failed. Please try again.';
      setCheckoutError(msg);
      showToast(msg, 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Derive available farmers from products
  const availableFarmers = React.useMemo(() => {
    const map = new Map();
    products.forEach(p => {
      if (p.farmerId && p.farmerName && !map.has(String(p.farmerId))) {
        map.set(String(p.farmerId), { id: String(p.farmerId), name: p.farmerName, location: p.location?.address });
      }
    });
    return Array.from(map.values());
  }, [products]);

  // Group cart items by farmer for transparent multi-farm fulfillment
  const cartGroupedByFarmer = React.useMemo(() => {
    const map = new Map();
    cart.forEach(item => {
      const fKey = String(item.farmerId || item.farmerName || 'local_producer');
      if (!map.has(fKey)) {
        map.set(fKey, {
          farmerId: item.farmerId,
          farmerName: item.farmerName || 'Local Direct Farmer',
          farmerLocation: item.location?.address || item.farmerNative || '',
          items: [],
          subtotal: 0
        });
      }
      const group = map.get(fKey);
      group.items.push(item);
      group.subtotal += Number(item.price) * item.quantity;
    });
    return Array.from(map.values());
  }, [cart]);

  // Filter and Sort Logic with Price, Farmer, Stock, Category, Bargain, Freshness, Cultivation & Quality
  const filteredProducts = products.filter(p => {
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    const matchesFarmer = filterFarmerId === 'all' || String(p.farmerId) === String(filterFarmerId);
    const matchesStock = !inStockOnly || Number(p.stock) > 0;
    const matchesMinPrice = !minPrice || Number(p.price) >= Number(minPrice);
    const matchesMaxPrice = !maxPrice || Number(p.price) <= Number(maxPrice);
    const matchesSearch = !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.variety && p.variety.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.farmerName && p.farmerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.location?.address && p.location.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBargain = !filterBargainOnly || p.allowBargain !== false;
    const matchesCultivation = filterCultivation === 'all' ||
      (p.cultivationType && p.cultivationType.toLowerCase() === filterCultivation.toLowerCase());
    const matchesQualityGrade = filterQualityGrade === 'all' ||
      (p.qualityGrade && p.qualityGrade.toLowerCase().replace(/\s+/g, '_') === filterQualityGrade.toLowerCase());

    let matchesFreshness = true;
    if (filterFreshness !== 'all') {
      const f = getHarvestFreshness(p.harvestDate);
      if (filterFreshness === 'today') {
        matchesFreshness = f.hasDate && f.hoursAgo < 24;
      } else if (filterFreshness === '24h') {
        matchesFreshness = f.hasDate && f.hoursAgo <= 24;
      } else if (filterFreshness === '48h') {
        matchesFreshness = f.hasDate && f.hoursAgo <= 48;
      } else if (filterFreshness === 'older') {
        matchesFreshness = f.hasDate && f.hoursAgo > 48;
      } else if (filterFreshness === 'unspecified') {
        matchesFreshness = !f.hasDate;
      }
    }

    const matchesFavorites = activeTab === 'favorites' ? favorites.includes(getProductId(p)) : true;
    return matchesCategory && matchesFarmer && matchesStock && matchesMinPrice && matchesMaxPrice && matchesSearch && matchesFavorites && matchesBargain && matchesCultivation && matchesQualityGrade && matchesFreshness;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
    if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'rating') return Number(b.rating || 0) - Number(a.rating || 0);
    return 0;
  });

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  const activeFiltersCount = (filterCategory !== 'all' ? 1 : 0) +
    (filterFarmerId !== 'all' ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (filterBargainOnly ? 1 : 0) +
    (filterFreshness !== 'all' ? 1 : 0) +
    (filterCultivation !== 'all' ? 1 : 0) +
    (filterQualityGrade !== 'all' ? 1 : 0);

  const clearAllFilters = () => {
    setFilterCategory('all');
    setFilterFarmerId('all');
    setInStockOnly(false);
    setFilterBargainOnly(false);
    setFilterFreshness('all');
    setFilterCultivation('all');
    setFilterQualityGrade('all');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setSortBy('default');
  };

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

      {/* Product Details & Real Farmer Information Modal */}
      {detailsProduct && (
        <ProductDetailsModal
          product={detailsProduct}
          allProducts={products}
          onClose={() => setDetailsProduct(null)}
          onAddToCart={(p, qty) => addToCart(p, qty)}
          onOpen3DScan={(p) => setInspectProduct(p)}
          onOpenBargain={(p) => setBargainProduct(p)}
          isFavorite={favorites.includes(getProductId(detailsProduct))}
          onToggleFavorite={() => toggleFavorite(getProductId(detailsProduct))}
          onViewFarmer={(farmerId) => {
            setFilterFarmerId(String(farmerId));
            setDetailsProduct(null);
            setActiveTab('marketplace');
          }}
        />
      )}

      {/* Real Customer Notifications Drawer */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onRefresh={fetchNotifications}
      />

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

      {/* Phase 4 — Checkout Review & Multi-Farmer Breakdown Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cart={cart}
        cartGroupedByFarmer={cartGroupedByFarmer}
        expressDelivery={expressDelivery}
        setExpressDelivery={setExpressDelivery}
        checkoutAddress={checkoutAddress}
        setCheckoutAddress={setCheckoutAddress}
        isEditingAddress={isEditingAddress}
        setIsEditingAddress={setIsEditingAddress}
        selectedPaymentMethod={selectedPaymentMethod}
        setSelectedPaymentMethod={setSelectedPaymentMethod}
        onConfirmCheckout={executeCheckout}
        placingOrder={placingOrder}
        checkoutError={checkoutError}
      />

      {/* Phase 4 — Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={!!confirmedOrderResult}
        orderResult={confirmedOrderResult}
        onClose={() => setConfirmedOrderResult(null)}
        onViewOrders={() => {
          setConfirmedOrderResult(null);
          setActiveTab('orders');
        }}
        onContinueShopping={() => {
          setConfirmedOrderResult(null);
          setActiveTab('marketplace');
        }}
      />

      {/* Phase 4 — Order Details & Vertical Milestones Tracking Modal */}
      <OrderDetailsModal
        order={selectedOrderDetails}
        onClose={() => setSelectedOrderDetails(null)}
        onCancelOrder={(ord) => {
          setCancelModalOrder(ord);
          setCancelReason('');
          setCancelReasonPreset('');
        }}
        onReviewItem={(item) => {
          setSelectedOrderDetails(null);
          setReviewingItem(item);
        }}
      />

      {/* Phase 4 — Enhanced Order Cancellation Confirmation Modal */}
      {cancelModalOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #0d2822, #071915)',
            border: '1.5px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fca5a5' }}>
                <AlertCircle size={22} color="#ef4444" />
                <h3 style={{ margin: 0, color: '#effbe7', fontSize: '18px', fontWeight: '800' }}>
                  Cancel Order?
                </h3>
              </div>
              <button
                onClick={() => setCancelModalOrder(null)}
                style={{ background: 'none', border: 'none', color: '#9db5aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Order Information Display */}
            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 14px', marginBottom: '14px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#effbe7', fontWeight: '700' }}>
                <span>Order #{String(cancelModalOrder.orderId || cancelModalOrder._id || cancelModalOrder.id).slice(-8).toUpperCase()}</span>
                <span style={{ color: '#37bd78' }}>₹{cancelModalOrder.totalAmount}</span>
              </div>
              <div style={{ color: '#a3c2b0', marginTop: '4px' }}>
                Farmer: <strong style={{ color: '#effbe7' }}>{cancelModalOrder.farmerName || 'Farm Producer'}</strong> • {cancelModalOrder.items?.length || 1} item(s)
              </div>
              <div style={{ color: '#f4c95d', fontSize: '11.5px', marginTop: '2px' }}>
                Current Status: <strong>{cancelModalOrder.status}</strong>
              </div>
            </div>

            <p style={{ color: '#a3c2b0', fontSize: '12.5px', lineHeight: '1.5', margin: '0 0 14px' }}>
              Are you sure you want to cancel this farm order? Reserved produce stock will be immediately replenished to the live catalog.
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }}>
                Select Cancellation Reason
              </label>
              <select
                value={cancelReasonPreset}
                onChange={(e) => setCancelReasonPreset(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: '#effbe7',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select a reason...</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Delivery address needs modification">Delivery address needs modification</option>
                <option value="Change of cooking plans">Change of cooking plans</option>
                <option value="Delay in produce dispatch">Delay in produce dispatch</option>
                <option value="Found alternate harvest source">Found alternate harvest source</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }}>
                Additional Details (Optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Share any additional context for the farmer..."
                rows={2}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: '#effbe7',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#effbe7',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  minHeight: '44px'
                }}
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancellingOrder}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: cancellingOrder ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  minHeight: '44px'
                }}
              >
                {cancellingOrder ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

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

            <button
              onClick={() => {
                setActiveTab('bargains');
                fetchCustomerBargains();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'bargains' ? 'linear-gradient(135deg, #00897b, #004d40)' : 'transparent',
                color: activeTab === 'bargains' ? '#ffffff' : '#9db5aa',
                fontWeight: activeTab === 'bargains' ? '700' : '600',
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Handshake size={18} />
                <span>My Bargains</span>
              </div>
              {customerBargains.filter(b => b.status === 'PENDING' || b.status === 'COUNTERED').length > 0 && (
                <span style={{
                  background: '#f4c95d',
                  color: '#092b27',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '2px 7px',
                  borderRadius: '10px'
                }}>
                  {customerBargains.filter(b => b.status === 'PENDING' || b.status === 'COUNTERED').length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('farmers');
                fetchRegisteredFarmers();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'farmers' ? 'linear-gradient(135deg, #00897b, #004d40)' : 'transparent',
                color: activeTab === 'farmers' ? '#ffffff' : '#9db5aa',
                fontWeight: activeTab === 'farmers' ? '700' : '600',
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Users size={18} />
                <span>Farmers Directory</span>
              </div>
              {registeredFarmers.length > 0 && (
                <span style={{
                  background: 'rgba(110, 219, 208, 0.2)',
                  color: '#6edbd0',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  border: '1px solid rgba(110, 219, 208, 0.4)'
                }}>
                  {registeredFarmers.length}
                </span>
              )}
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
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
            }}>
              {/* Row 1: Search + Category Pills + Mobile Filter Trigger */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '14px',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                {/* Search input */}
                <div style={{ position: 'relative', flex: '1 1 260px' }}>
                  <Search size={18} color="#6edbd0" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    id="customer-search-input"
                    type="text"
                    placeholder="Search produce, variety, farmer, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 38px 12px 42px',
                      borderRadius: '12px',
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(110, 219, 208, 0.3)',
                      color: '#effbe7',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#a3c2b0',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    background: activeFiltersCount > 0 ? 'rgba(55, 189, 120, 0.25)' : 'rgba(0, 0, 0, 0.35)',
                    border: `1.5px solid ${activeFiltersCount > 0 ? '#37bd78' : 'rgba(110, 219, 208, 0.35)'}`,
                    color: activeFiltersCount > 0 ? '#8be28b' : '#effbe7',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minHeight: '44px'
                  }}
                >
                  <Filter size={16} />
                  <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
                </button>

                {/* Category Pills */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['all', 'vegetable', 'fruit', 'grain', 'seed', 'dairy', 'spices'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        border: '1px solid',
                        borderColor: filterCategory === cat ? '#37bd78' : 'rgba(255,255,255,0.15)',
                        background: filterCategory === cat ? 'rgba(55, 189, 120, 0.25)' : 'rgba(0,0,0,0.25)',
                        color: filterCategory === cat ? '#8be28b' : '#a3c2b0',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        transition: 'all 0.2s ease',
                        minHeight: '38px'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Agricultural Filters (Freshness, Cultivation, Quality Grade, Bargain, In Stock, Price, Sort) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                paddingTop: '12px',
                borderTop: '1px solid rgba(110, 219, 208, 0.15)'
              }}>
                {/* Harvest Freshness Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} color="#6edbd0" />
                  <select
                    value={filterFreshness}
                    onChange={(e) => setFilterFreshness(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(110, 219, 208, 0.3)',
                      color: filterFreshness !== 'all' ? '#8be28b' : '#effbe7',
                      fontSize: '12px',
                      fontWeight: '600',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all" style={{ background: '#092b27' }}>🌱 Freshness: All</option>
                    <option value="today" style={{ background: '#092b27' }}>Harvested Today</option>
                    <option value="24h" style={{ background: '#092b27' }}>Within 24 Hours</option>
                    <option value="48h" style={{ background: '#092b27' }}>Within 48 Hours</option>
                    <option value="older" style={{ background: '#092b27' }}>Older Harvests</option>
                    <option value="unspecified" style={{ background: '#092b27' }}>Date Not Provided</option>
                  </select>
                </div>

                {/* Cultivation Type Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Leaf size={14} color="#37bd78" />
                  <select
                    value={filterCultivation}
                    onChange={(e) => setFilterCultivation(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(110, 219, 208, 0.3)',
                      color: filterCultivation !== 'all' ? '#8be28b' : '#effbe7',
                      fontSize: '12px',
                      fontWeight: '600',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all" style={{ background: '#092b27' }}>🌾 Cultivation: All</option>
                    <option value="organic" style={{ background: '#092b27' }}>Organic (Farmer Reported)</option>
                    <option value="natural" style={{ background: '#092b27' }}>Natural Farming</option>
                    <option value="conventional" style={{ background: '#092b27' }}>Conventional</option>
                    <option value="hydroponic" style={{ background: '#092b27' }}>Hydroponic</option>
                  </select>
                </div>

                {/* Quality Grade Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={14} color="#facc15" />
                  <select
                    value={filterQualityGrade}
                    onChange={(e) => setFilterQualityGrade(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(110, 219, 208, 0.3)',
                      color: filterQualityGrade !== 'all' ? '#facc15' : '#effbe7',
                      fontSize: '12px',
                      fontWeight: '600',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all" style={{ background: '#092b27' }}>⭐ Grade: All</option>
                    <option value="grade_a" style={{ background: '#092b27' }}>Grade A</option>
                    <option value="grade_b" style={{ background: '#092b27' }}>Grade B</option>
                    <option value="grade_c" style={{ background: '#092b27' }}>Grade C</option>
                    <option value="export" style={{ background: '#092b27' }}>Export Quality</option>
                  </select>
                </div>

                {/* Bulk Bargain Only Toggle */}
                <button
                  onClick={() => setFilterBargainOnly(prev => !prev)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: filterBargainOnly ? '#f4c95d' : 'rgba(255,255,255,0.18)',
                    background: filterBargainOnly ? 'rgba(244, 201, 93, 0.25)' : 'rgba(0,0,0,0.35)',
                    color: filterBargainOnly ? '#f4c95d' : '#a3c2b0',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Handshake size={14} color={filterBargainOnly ? '#f4c95d' : '#a3c2b0'} />
                  <span>Bargain Available</span>
                </button>

                {/* In Stock Only Toggle */}
                <button
                  onClick={() => setInStockOnly(prev => !prev)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: inStockOnly ? '#37bd78' : 'rgba(255,255,255,0.18)',
                    background: inStockOnly ? 'rgba(55, 189, 120, 0.25)' : 'rgba(0,0,0,0.35)',
                    color: inStockOnly ? '#8be28b' : '#a3c2b0',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Check size={13} color={inStockOnly ? '#8be28b' : 'transparent'} />
                  <span>In Stock</span>
                </button>

                {/* Farmer Selection Filter */}
                {availableFarmers.length > 0 && (
                  <select
                    value={filterFarmerId}
                    onChange={(e) => setFilterFarmerId(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(110, 219, 208, 0.3)',
                      color: '#effbe7',
                      fontSize: '12px',
                      fontWeight: '600',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all" style={{ background: '#092b27' }}>🧑‍🌾 All Farmers ({availableFarmers.length})</option>
                    {availableFarmers.map(f => (
                      <option key={f.id} value={f.id} style={{ background: '#092b27' }}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Price Range Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: '#a3c2b0', fontSize: '11px', fontWeight: '700' }}>₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    style={{
                      width: '56px',
                      padding: '6px 8px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(110, 219, 208, 0.3)',
                      color: '#effbe7',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                  <span style={{ color: '#a3c2b0', fontSize: '11px' }}>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    style={{
                      width: '56px',
                      padding: '6px 8px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(110, 219, 208, 0.3)',
                      color: '#effbe7',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Sort Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <SlidersHorizontal size={14} color="#6edbd0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(110, 219, 208, 0.3)',
                      color: '#effbe7',
                      fontSize: '12px',
                      fontWeight: '600',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="default" style={{ background: '#092b27' }}>Sort: Default</option>
                    <option value="price-low" style={{ background: '#092b27' }}>Price: Low to High</option>
                    <option value="price-high" style={{ background: '#092b27' }}>Price: High to Low</option>
                    <option value="title" style={{ background: '#092b27' }}>Name: A-Z</option>
                    <option value="rating" style={{ background: '#092b27' }}>Rating: High to Low</option>
                  </select>
                </div>

                {/* Reset Filters button */}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#ff6b6b',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Clear Filters ({activeFiltersCount})
                  </button>
                )}

                {/* Alerts / Notifications Trigger */}
                <button
                  onClick={() => setShowNotifications(true)}
                  title="Customer Notifications & Order Updates"
                  style={{
                    position: 'relative',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(110, 219, 208, 0.3)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    color: '#effbe7',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginLeft: 'auto'
                  }}
                >
                  <Bell size={14} color="#6edbd0" />
                  <span style={{ fontSize: '12px', fontWeight: '700' }}>Alerts</span>
                  {notifications.length > 0 && (
                    <span style={{
                      background: '#37bd78',
                      color: '#071814',
                      fontSize: '10px',
                      fontWeight: '900',
                      borderRadius: '10px',
                      padding: '1px 6px'
                    }}>
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Produce Grid & Cart Split */}
            <div className={`customer-produce-grid-wrapper ${cart.length > 0 ? 'has-cart' : ''}`} style={{ gap: '24px' }}>
              {/* Produce Cards Grid */}
              <div>
                {loading ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                    gap: '20px'
                  }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div
                        key={i}
                        style={{
                          background: 'rgba(9, 43, 39, 0.6)',
                          border: '1.5px solid rgba(110, 219, 208, 0.15)',
                          borderRadius: '20px',
                          overflow: 'hidden',
                          height: '420px',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                        }}
                      >
                        <div style={{ height: '175px', background: 'rgba(255, 255, 255, 0.05)' }} />
                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                          <div style={{ height: '22px', width: '70%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '6px' }} />
                          <div style={{ height: '14px', width: '45%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }} />
                          <div style={{ height: '20px', width: '90%', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '6px' }} />
                          <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                            <div style={{ height: '44px', flex: 1, background: 'rgba(0, 137, 123, 0.25)', borderRadius: '10px' }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : productError ? (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '20px',
                    padding: '50px 20px',
                    textAlign: 'center',
                    color: '#ffcdd2'
                  }}>
                    <AlertCircle size={44} color="#ff6b6b" style={{ margin: '0 auto 12px' }} />
                    <h3 style={{ color: '#effbe7', margin: '0 0 8px', fontSize: '18px', fontWeight: '800' }}>
                      Unable to load products.
                    </h3>
                    <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: '#ffcdd2' }}>
                      There was a problem loading fresh harvest listings from the farm network.
                    </p>
                    <button
                      onClick={() => { setProductError(null); fetchProducts(); }}
                      style={{
                        background: 'linear-gradient(135deg, #00897b, #004d40)',
                        border: 'none',
                        color: '#ffffff',
                        padding: '12px 28px',
                        borderRadius: '12px',
                        fontWeight: '800',
                        fontSize: '14px',
                        cursor: 'pointer',
                        minHeight: '48px'
                      }}
                    >
                      Try Again
                    </button>
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
                    <h3 style={{ color: '#effbe7', margin: '0 0 8px', fontSize: '18px', fontWeight: '800' }}>
                      {activeTab === 'favorites' ? 'No Wishlist Items Yet' : filterFarmerId !== 'all' ? 'This farmer has not published products yet.' : 'No Products Found'}
                    </h3>
                    <p style={{ margin: '0 0 20px', fontSize: '13.5px' }}>
                      {activeTab === 'favorites'
                        ? 'Save produce you want to find quickly later.'
                        : filterFarmerId !== 'all'
                        ? 'This farmer has not published products yet.'
                        : 'Try changing your filters or search terms.'}
                    </p>
                    <button
                      onClick={clearAllFilters}
                      style={{
                        background: 'rgba(55, 189, 120, 0.2)',
                        border: '1px solid rgba(55, 189, 120, 0.5)',
                        color: '#8be28b',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        minHeight: '44px'
                      }}
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                    gap: '20px'
                  }}>
                    {filteredProducts.map(product => {
                      const prodId = getProductId(product);
                      const isFav = favorites.includes(prodId);
                      const freshness = getHarvestFreshness(product.harvestDate);
                      const minOrder = Math.max(1, Number(product.minOrderQty) || 1);
                      const inStock = Number(product.stock) > 0;

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
                          {/* Image Container with Badges */}
                          <div style={{ position: 'relative', height: '175px', background: 'rgba(0,0,0,0.4)', overflow: 'hidden' }}>
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

                            {/* Freshness Badge (Truthful) */}
                            <div style={{
                              position: 'absolute',
                              top: '10px',
                              left: '10px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              maxWidth: '75%'
                            }}>
                              <span style={{
                                background: 'rgba(7, 26, 22, 0.88)',
                                backdropFilter: 'blur(8px)',
                                border: freshness.hasDate ? '1px solid rgba(55, 189, 120, 0.6)' : '1px solid rgba(255, 255, 255, 0.15)',
                                color: freshness.hasDate ? '#8be28b' : '#a3c2b0',
                                fontSize: '11px',
                                fontWeight: '800',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                width: 'fit-content'
                              }}>
                                {freshness.hasDate ? `🌱 ${freshness.label}` : '📅 Harvest date not provided'}
                              </span>

                              {/* Bulk Bargain Badge */}
                              {product.allowBargain !== false && (
                                <span style={{
                                  background: 'rgba(244, 201, 93, 0.22)',
                                  backdropFilter: 'blur(8px)',
                                  border: '1px solid rgba(244, 201, 93, 0.55)',
                                  color: '#f4c95d',
                                  fontSize: '10.5px',
                                  fontWeight: '800',
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  width: 'fit-content'
                                }}>
                                  <Handshake size={11} />
                                  <span>Bargain Available</span>
                                </span>
                              )}
                            </div>

                            {/* Wishlist / Favorite Button (min 44x44 touch target) */}
                            <button
                              onClick={() => toggleFavorite(prodId)}
                              title={isFav ? 'Remove from wishlist' : 'Save to wishlist'}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'rgba(0, 0, 0, 0.65)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.25)',
                                borderRadius: '50%',
                                width: '44px',
                                height: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <Heart size={18} color={isFav ? '#ff4081' : '#effbe7'} fill={isFav ? '#ff4081' : 'none'} />
                            </button>

                            {/* 3D Inspect Button */}
                            <button
                              onClick={() => setInspectProduct(product)}
                              style={{
                                position: 'absolute',
                                bottom: '8px',
                                left: '8px',
                                background: 'rgba(0, 30, 25, 0.88)',
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
                                cursor: 'pointer',
                                minHeight: '30px'
                              }}
                            >
                              <Eye size={12} />
                              <span>3D Quality Scan</span>
                            </button>
                          </div>

                          {/* Card Content */}
                          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            {/* Product Title & Category */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#effbe7', lineHeight: '1.3' }}>
                                {product.title}
                              </h3>
                              <span style={{
                                background: 'rgba(55, 189, 120, 0.15)',
                                border: '1px solid rgba(55, 189, 120, 0.35)',
                                color: '#8be28b',
                                fontSize: '11px',
                                fontWeight: '700',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                textTransform: 'capitalize',
                                whiteSpace: 'nowrap'
                              }}>
                                {product.category || 'Produce'}
                              </span>
                            </div>

                            {/* Agricultural Metadata Chips: Variety, Grade, Cultivation */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                              {product.variety && (
                                <span style={{
                                  background: 'rgba(110, 219, 208, 0.12)',
                                  border: '1px solid rgba(110, 219, 208, 0.3)',
                                  color: '#6edbd0',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  padding: '2px 7px',
                                  borderRadius: '8px'
                                }}>
                                  Var: {product.variety}
                                </span>
                              )}
                              {product.qualityGrade && (
                                <span style={{
                                  background: 'rgba(250, 204, 21, 0.12)',
                                  border: '1px solid rgba(250, 204, 21, 0.3)',
                                  color: '#facc15',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  padding: '2px 7px',
                                  borderRadius: '8px'
                                }}>
                                  {product.qualityGrade}
                                </span>
                              )}
                              {product.cultivationType && (
                                <span style={{
                                  background: 'rgba(55, 189, 120, 0.12)',
                                  border: '1px solid rgba(55, 189, 120, 0.3)',
                                  color: '#8be28b',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  padding: '2px 7px',
                                  borderRadius: '8px'
                                }}>
                                  {product.cultivationType.toLowerCase() === 'organic' ? 'Organic — Farmer reported' : product.cultivationType}
                                </span>
                              )}
                            </div>

                            {/* Farmer & Location Attribution */}
                            <div style={{ marginBottom: '10px', fontSize: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#effbe7', fontWeight: '700' }}>
                                <span>🧑‍🌾 {product.farmerName || 'Local Direct Farmer'}</span>
                                {product.farmerVerified && (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    color: '#6edbd0',
                                    fontSize: '10.5px',
                                    fontWeight: '800',
                                    background: 'rgba(110, 219, 208, 0.15)',
                                    padding: '1px 6px',
                                    borderRadius: '6px'
                                  }}>
                                    ✓ Verified Farmer
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#a3c2b0', marginTop: '2px' }}>
                                <MapPin size={12} color="#37bd78" style={{ flexShrink: 0 }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {product.location?.address?.split(',')[0] || product.farmerLocation || 'Location not provided by farmer'}
                                </span>
                              </div>
                            </div>

                            {/* Stock & Minimum Order Quantity */}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: 'rgba(0, 0, 0, 0.25)',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              marginBottom: '12px',
                              fontSize: '11.5px'
                            }}>
                              <span style={{ color: inStock ? '#8be28b' : '#ff8a80', fontWeight: '700' }}>
                                {inStock ? `${product.stock} ${product.unit || 'kg'} available` : 'Out of stock'}
                              </span>
                              <span style={{ color: '#d9c7a0', fontWeight: '600' }}>
                                Min: {minOrder} {product.unit || 'kg'}
                              </span>
                            </div>

                            {/* Price & Action Buttons */}
                            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                                <div>
                                  <span style={{ color: '#37bd78', fontSize: '22px', fontWeight: '900' }}>₹{product.price}</span>
                                  <span style={{ color: '#a3c2b0', fontSize: '12px', fontWeight: '600' }}> / {product.unit || 'kg'}</span>
                                </div>
                                {product.allowBargain !== false && (
                                  <span style={{ color: '#f4c95d', fontSize: '11.5px', fontWeight: '700' }}>
                                    🤝 Bargain available
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => setDetailsProduct(product)}
                                  title="View full produce details and agricultural profile"
                                  style={{
                                    padding: '12px 14px',
                                    borderRadius: '10px',
                                    background: 'rgba(110, 219, 208, 0.15)',
                                    border: '1px solid rgba(110, 219, 208, 0.4)',
                                    color: '#6edbd0',
                                    fontWeight: '700',
                                    fontSize: '12.5px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '5px',
                                    minHeight: '48px'
                                  }}
                                >
                                  <Eye size={14} />
                                  <span>Details</span>
                                </button>

                                {product.allowBargain !== false && (
                                  <button
                                    onClick={() => setBargainProduct(product)}
                                    title="Request a bulk bargain price directly from farmer"
                                    style={{
                                      padding: '12px 14px',
                                      borderRadius: '10px',
                                      background: 'rgba(244, 201, 93, 0.15)',
                                      border: '1px solid rgba(244, 201, 93, 0.4)',
                                      color: '#f4c95d',
                                      fontWeight: '700',
                                      fontSize: '12.5px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '5px',
                                      minHeight: '48px'
                                    }}
                                  >
                                    <Handshake size={14} />
                                    <span>Bargain</span>
                                  </button>
                                )}

                                <button
                                  disabled={!inStock}
                                  onClick={() => addToCart(product, minOrder)}
                                  style={{
                                    flex: '1 1 120px',
                                    padding: '12px 14px',
                                    borderRadius: '10px',
                                    background: inStock ? 'linear-gradient(135deg, #00897b, #004d40)' : 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    color: '#ffffff',
                                    fontWeight: '800',
                                    fontSize: '13px',
                                    cursor: inStock ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    boxShadow: inStock ? '0 4px 14px rgba(0, 137, 123, 0.3)' : 'none',
                                    minHeight: '48px'
                                  }}
                                >
                                  <ShoppingCart size={16} />
                                  <span>{inStock ? `Add (${minOrder}${product.unit || 'kg'})` : 'Out of Stock'}</span>
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
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                    width: '340px'
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

                  {/* Multi-Farmer Grouped Cart Items List */}
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px', marginBottom: '18px' }}>
                    {cartGroupedByFarmer.map(group => (
                      <div
                        key={group.farmerId || group.farmerName}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(110, 219, 208, 0.2)',
                          borderRadius: '14px',
                          padding: '12px'
                        }}
                      >
                        {/* Farmer Group Header */}
                        <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px', marginBottom: '10px' }}>
                          <div style={{ color: '#8be28b', fontSize: '12.5px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>🧑‍🌾 {group.farmerName}</span>
                          </div>
                          {group.farmerLocation && (
                            <div style={{ color: '#a3c2b0', fontSize: '11px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={11} color="#37bd78" />
                              <span>{group.farmerLocation}</span>
                            </div>
                          )}
                        </div>

                        {/* Items for this farmer */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {group.items.map(item => {
                            const id = getProductId(item);
                            const hasBargainSavings = item.isBargain || (item.originalPrice && Number(item.originalPrice) > Number(item.price));
                            const unitSavings = hasBargainSavings ? Math.max(0, Number(item.originalPrice) - Number(item.price)) : 0;
                            const totalItemSavings = unitSavings * item.quantity;

                            return (
                              <div
                                key={id}
                                style={{
                                  background: 'rgba(0, 0, 0, 0.25)',
                                  borderRadius: '10px',
                                  padding: '10px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{ color: '#effbe7', fontSize: '13px', fontWeight: '700' }}>{item.title}</div>
                                  <button
                                    onClick={() => removeFromCart(id)}
                                    title="Remove item"
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#ff5252',
                                      cursor: 'pointer',
                                      padding: '2px'
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>

                                {/* Price / Savings Breakdown */}
                                {hasBargainSavings ? (
                                  <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                                    <div style={{ color: '#a3c2b0', textDecoration: 'line-through' }}>
                                      Original: ₹{item.originalPrice}/{item.unit || 'kg'}
                                    </div>
                                    <div style={{ color: '#f4c95d', fontWeight: '800' }}>
                                      Negotiated: ₹{item.price}/{item.unit || 'kg'}
                                    </div>
                                    <div style={{ color: '#37bd78', fontWeight: '700' }}>
                                      You save: ₹{unitSavings}/{item.unit || 'kg'} (₹{totalItemSavings})
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ color: '#37bd78', fontSize: '12px', fontWeight: '700' }}>
                                    ₹{item.price} / {item.unit || 'kg'}
                                  </div>
                                )}

                                {/* Qty Controls & Item Subtotal */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <button
                                      onClick={() => updateQuantity(id, -1)}
                                      style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        color: '#effbe7',
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '700'
                                      }}
                                    >
                                      -
                                    </button>
                                    <span style={{ color: '#effbe7', fontWeight: '700', minWidth: '22px', textAlign: 'center', fontSize: '13px' }}>
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(id, 1)}
                                      style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        color: '#effbe7',
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '700'
                                      }}
                                    >
                                      +
                                    </button>
                                  </div>
                                  <div style={{ color: '#effbe7', fontSize: '13px', fontWeight: '800' }}>
                                    ₹{Number(item.price) * item.quantity}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Farmer Subtotal */}
                        <div style={{
                          marginTop: '10px',
                          paddingTop: '8px',
                          borderTop: '1px dashed rgba(255,255,255,0.1)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '12px'
                        }}>
                          <span style={{ color: '#a3c2b0' }}>Farmer subtotal:</span>
                          <span style={{ color: '#8be28b', fontWeight: '800' }}>₹{group.subtotal}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Multi-Farmer Shipping Notice */}
                  {cartGroupedByFarmer.length > 1 && (
                    <div style={{
                      background: 'rgba(55, 189, 120, 0.1)',
                      border: '1px solid rgba(55, 189, 120, 0.25)',
                      borderRadius: '10px',
                      padding: '8px 10px',
                      fontSize: '11.5px',
                      color: '#a3c2b0',
                      marginBottom: '12px',
                      lineHeight: '1.4'
                    }}>
                      📦 <strong style={{ color: '#effbe7' }}>Multi-farmer dispatch:</strong> Items from different farmers are packed fresh at their respective farms and may arrive separately.
                    </div>
                  )}

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
                        boxShadow: '0 6px 20px rgba(46, 125, 50, 0.4)',
                        minHeight: '48px'
                      }}
                    >
                      <span>Checkout & Direct Dispatch</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Filter Bottom Sheet / Modal */}
            {showMobileFilters && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(8px)',
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center'
                }}
                onClick={() => setShowMobileFilters(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: 'linear-gradient(160deg, #092b27, #071a16)',
                    border: '1.5px solid rgba(110, 219, 208, 0.4)',
                    borderBottom: 'none',
                    borderRadius: '24px 24px 0 0',
                    width: '100%',
                    maxWidth: '560px',
                    maxHeight: '85vh',
                    overflowY: 'auto',
                    padding: '24px',
                    boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Filter size={20} color="#6edbd0" />
                      <h3 style={{ margin: 0, color: '#effbe7', fontSize: '18px', fontWeight: '800' }}>
                        Filter Produce
                      </h3>
                      {activeFiltersCount > 0 && (
                        <span style={{
                          background: '#37bd78',
                          color: '#071814',
                          fontWeight: '800',
                          fontSize: '11px',
                          borderRadius: '10px',
                          padding: '2px 8px'
                        }}>
                          {activeFiltersCount} active
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: '#effbe7',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Harvest Freshness */}
                  <div>
                    <label style={{ display: 'block', color: '#6edbd0', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Harvest Freshness
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {[
                        { id: 'all', label: 'All Freshness' },
                        { id: 'today', label: 'Harvested Today' },
                        { id: '24h', label: 'Within 24 Hours' },
                        { id: '48h', label: 'Within 48 Hours' },
                        { id: 'older', label: 'Older Harvests' },
                        { id: 'unspecified', label: 'Date Not Provided' }
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => setFilterFreshness(f.id)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: `1px solid ${filterFreshness === f.id ? '#37bd78' : 'rgba(255,255,255,0.15)'}`,
                            background: filterFreshness === f.id ? 'rgba(55, 189, 120, 0.25)' : 'rgba(0,0,0,0.3)',
                            color: filterFreshness === f.id ? '#8be28b' : '#a3c2b0',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            minHeight: '44px'
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cultivation Method */}
                  <div>
                    <label style={{ display: 'block', color: '#6edbd0', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Cultivation Method
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {[
                        { id: 'all', label: 'All Types' },
                        { id: 'organic', label: 'Organic (Reported)' },
                        { id: 'natural', label: 'Natural Farming' },
                        { id: 'conventional', label: 'Conventional' },
                        { id: 'hydroponic', label: 'Hydroponic' }
                      ].map(c => (
                        <button
                          key={c.id}
                          onClick={() => setFilterCultivation(c.id)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: `1px solid ${filterCultivation === c.id ? '#37bd78' : 'rgba(255,255,255,0.15)'}`,
                            background: filterCultivation === c.id ? 'rgba(55, 189, 120, 0.25)' : 'rgba(0,0,0,0.3)',
                            color: filterCultivation === c.id ? '#8be28b' : '#a3c2b0',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            minHeight: '44px'
                          }}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality Grade */}
                  <div>
                    <label style={{ display: 'block', color: '#6edbd0', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Quality Grade
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {[
                        { id: 'all', label: 'All Grades' },
                        { id: 'grade_a', label: 'Grade A' },
                        { id: 'grade_b', label: 'Grade B' },
                        { id: 'grade_c', label: 'Grade C' },
                        { id: 'export', label: 'Export Quality' }
                      ].map(q => (
                        <button
                          key={q.id}
                          onClick={() => setFilterQualityGrade(q.id)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: `1px solid ${filterQualityGrade === q.id ? '#facc15' : 'rgba(255,255,255,0.15)'}`,
                            background: filterQualityGrade === q.id ? 'rgba(250, 204, 21, 0.2)' : 'rgba(0,0,0,0.3)',
                            color: filterQualityGrade === q.id ? '#facc15' : '#a3c2b0',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            minHeight: '44px'
                          }}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Toggles */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setFilterBargainOnly(p => !p)}
                      style={{
                        flex: '1 1 140px',
                        padding: '12px',
                        borderRadius: '12px',
                        border: `1px solid ${filterBargainOnly ? '#f4c95d' : 'rgba(255,255,255,0.15)'}`,
                        background: filterBargainOnly ? 'rgba(244, 201, 93, 0.2)' : 'rgba(0,0,0,0.3)',
                        color: filterBargainOnly ? '#f4c95d' : '#a3c2b0',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        minHeight: '48px'
                      }}
                    >
                      <Handshake size={16} />
                      <span>Bargain Available</span>
                    </button>

                    <button
                      onClick={() => setInStockOnly(p => !p)}
                      style={{
                        flex: '1 1 140px',
                        padding: '12px',
                        borderRadius: '12px',
                        border: `1px solid ${inStockOnly ? '#37bd78' : 'rgba(255,255,255,0.15)'}`,
                        background: inStockOnly ? 'rgba(55, 189, 120, 0.2)' : 'rgba(0,0,0,0.3)',
                        color: inStockOnly ? '#8be28b' : '#a3c2b0',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        minHeight: '48px'
                      }}
                    >
                      <Check size={16} />
                      <span>In Stock Only</span>
                    </button>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label style={{ display: 'block', color: '#6edbd0', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Price Range (₹)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="number"
                        placeholder="Min ₹"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '10px',
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid rgba(110, 219, 208, 0.3)',
                          color: '#effbe7',
                          fontSize: '14px',
                          outline: 'none',
                          minHeight: '48px'
                        }}
                      />
                      <span style={{ color: '#a3c2b0' }}>to</span>
                      <input
                        type="number"
                        placeholder="Max ₹"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '10px',
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid rgba(110, 219, 208, 0.3)',
                          color: '#effbe7',
                          fontSize: '14px',
                          outline: 'none',
                          minHeight: '48px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Mobile Actions: Reset & Apply */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                      onClick={clearAllFilters}
                      style={{
                        flex: '1 1 120px',
                        padding: '14px',
                        borderRadius: '12px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        color: '#ff6b6b',
                        fontWeight: '800',
                        fontSize: '13px',
                        cursor: 'pointer',
                        minHeight: '48px'
                      }}
                    >
                      Reset All
                    </button>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      style={{
                        flex: '2 1 180px',
                        padding: '14px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #00897b, #004d40)',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: '800',
                        fontSize: '14px',
                        cursor: 'pointer',
                        minHeight: '48px'
                      }}
                    >
                      Show {filteredProducts.length} Results
                    </button>
                  </div>
                </div>
              </div>
            )}
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

            {/* Refresh / Loading Status */}
            {refreshingOrders && orders.length === 0 ? (
              <SkeletonOrderList />
            ) : orders.length === 0 ? (
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
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    minHeight: '48px'
                  }}
                >
                  Browse Marketplace
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {orders.map(order => {
                  const orderKey = String(order._id || order.id);
                  const isRadarExpanded = expandedRadarOrderId === orderKey;
                  const isDelivered = order.status === 'delivered';
                  const isCancelled = order.status === 'cancelled';
                  const isCancellable = ['pending', 'confirmed', 'accepted'].includes(order.status);

                  const statusColorMap = {
                    pending: { bg: 'rgba(244, 201, 93, 0.2)', border: '#f4c95d', color: '#f4c95d' },
                    confirmed: { bg: 'rgba(55, 189, 120, 0.2)', border: '#37bd78', color: '#8be28b' },
                    accepted: { bg: 'rgba(55, 189, 120, 0.2)', border: '#37bd78', color: '#8be28b' },
                    packed: { bg: 'rgba(96, 165, 250, 0.2)', border: '#60a5fa', color: '#93c5fd' },
                    assigned: { bg: 'rgba(168, 85, 247, 0.2)', border: '#a855f7', color: '#c084fc' },
                    picked_up: { bg: 'rgba(244, 201, 93, 0.2)', border: '#f4c95d', color: '#f4c95d' },
                    in_transit: { bg: 'rgba(244, 201, 93, 0.2)', border: '#f4c95d', color: '#f4c95d' },
                    out_for_delivery: { bg: 'rgba(244, 201, 93, 0.25)', border: '#f4c95d', color: '#f4c95d' },
                    arrived: { bg: 'rgba(52, 211, 153, 0.25)', border: '#34d399', color: '#34d399' },
                    delivered: { bg: 'rgba(55, 189, 120, 0.25)', border: '#37bd78', color: '#8be28b' },
                    cancelled: { bg: 'rgba(239, 68, 68, 0.25)', border: '#ef4444', color: '#fca5a5' }
                  };
                  const statusStyle = statusColorMap[order.status] || statusColorMap.pending;

                  const formattedOrderDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Recent Dispatch';

                  return (
                    <div
                      key={orderKey}
                      style={{
                        background: 'rgba(9, 43, 39, 0.75)',
                        backdropFilter: 'blur(16px)',
                        border: '1.5px solid rgba(110, 219, 208, 0.25)',
                        borderRadius: '20px',
                        padding: '22px',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.35)'
                      }}
                    >
                      {/* Order Card Top Bar */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                        <div>
                          <span style={{ color: '#6edbd0', fontSize: '12px', fontWeight: '800' }}>
                            ORDER #{orderKey.slice(-8).toUpperCase()}
                          </span>
                          <div style={{ color: '#effbe7', fontSize: '18px', fontWeight: '800', marginTop: '2px' }}>
                            Total: ₹{order.totalAmount} • {order.items?.length || 1} Item(s)
                          </div>
                          <div style={{ color: '#a3c2b0', fontSize: '12px', marginTop: '2px' }}>
                            📅 {formattedOrderDate}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {/* Payment status badge (Requirement 11) */}
                          <span style={{
                            background: isDelivered ? 'rgba(55, 189, 120, 0.15)' : isCancelled ? 'rgba(255,255,255,0.05)' : 'rgba(244, 201, 93, 0.15)',
                            border: `1px solid ${isDelivered ? 'rgba(55, 189, 120, 0.3)' : isCancelled ? 'rgba(255,255,255,0.1)' : 'rgba(244, 201, 93, 0.3)'}`,
                            color: isDelivered ? '#8be28b' : isCancelled ? '#a3c2b0' : '#f4c95d',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}>
                            {isDelivered ? 'Paid on Handover' : isCancelled ? 'No Payment Due' : 'Cash on Delivery • Due on Arrival'}
                          </span>

                          {/* Order status badge */}
                          <span style={{
                            background: statusStyle.bg,
                            border: `1px solid ${statusStyle.border}`,
                            color: statusStyle.color,
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontWeight: '800',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {order.status || 'pending'}
                          </span>
                        </div>
                      </div>

                      {/* Farmer and Courier Quick Info */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '14px', fontSize: '12.5px', color: '#a3c2b0' }}>
                        <div>🧑‍🌾 <strong>Farmer:</strong> <span style={{ color: '#effbe7' }}>{order.farmerName || 'Partner Farm'}</span></div>
                        <div>🚚 <strong>Courier:</strong> <span style={{ color: '#effbe7' }}>{order.deliveryName || 'Awaiting assignment'}</span></div>
                        <div>📍 <strong>Destination:</strong> <span style={{ color: '#effbe7' }}>{order.customerLocation?.address?.split(',')[0] || 'Doorstep'}</span></div>
                      </div>

                      {/* Handover OTP Security Banner */}
                      {!isDelivered && !isCancelled && (
                        <div style={{
                          background: 'rgba(244, 201, 93, 0.08)',
                          border: '1px solid rgba(244, 201, 93, 0.25)',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          marginBottom: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '12px',
                          color: '#effbe7'
                        }}>
                          <ShieldCheck size={18} color="#f4c95d" style={{ flexShrink: 0 }} />
                          <div>
                            <span style={{ fontWeight: '800', color: '#f4c95d' }}>Handover Authentication: </span>
                            <span>Share the secure code received via SMS/Email with the delivery partner upon produce arrival.</span>
                          </div>
                        </div>
                      )}

                      {/* Items Preview */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        {(order.items || []).map((item, idx) => {
                          const itemKey = `${orderKey}_${item.productId}`;
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
                                {item.image && <img src={item.image} alt={item.title} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />}
                                <div>
                                  <div style={{ color: '#effbe7', fontSize: '13px', fontWeight: '700' }}>{item.title}</div>
                                  <div style={{ color: '#a3c2b0', fontSize: '11.5px' }}>₹{item.price} × {item.quantity} {item.unit || 'kg'}</div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ color: '#effbe7', fontSize: '13.5px', fontWeight: '800' }}>
                                  ₹{Number(item.price) * item.quantity}
                                </div>
                                {isDelivered && (
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
                                      gap: '4px',
                                      minHeight: '34px'
                                    }}
                                  >
                                    <Star size={13} fill={isReviewed ? '#34d399' : '#f4c95d'} />
                                    <span>{isReviewed ? '✓ Reviewed' : 'Review Produce'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Expandable Live Radar Map Component */}
                      {isRadarExpanded && (
                        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>
                          <LiveTrackingMap order={order} />
                        </div>
                      )}

                      {/* Cancellation banner if already cancelled */}
                      {isCancelled && (
                        <div style={{
                          marginBottom: '14px',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#fca5a5',
                          fontSize: '12.5px'
                        }}>
                          <strong>Order Cancelled:</strong> {order.cancellationReason || 'Cancelled upon customer request. Reserved farm inventory has been replenished.'}
                        </div>
                      )}

                      {/* Action Buttons Row (Requirement 12: 48px+ touch targets) */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            style={{
                              background: 'linear-gradient(135deg, #00897b, #004d40)',
                              border: 'none',
                              color: '#ffffff',
                              padding: '10px 18px',
                              borderRadius: '10px',
                              fontSize: '13px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              minHeight: '44px'
                            }}
                          >
                            <Eye size={15} />
                            <span>Order Details & Milestones</span>
                          </button>

                          <button
                            onClick={() => setExpandedRadarOrderId(isRadarExpanded ? null : orderKey)}
                            style={{
                              background: isRadarExpanded ? 'rgba(55, 189, 120, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                              border: `1px solid ${isRadarExpanded ? '#37bd78' : 'rgba(255, 255, 255, 0.15)'}`,
                              color: isRadarExpanded ? '#8be28b' : '#effbe7',
                              padding: '10px 16px',
                              borderRadius: '10px',
                              fontSize: '13px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              minHeight: '44px'
                            }}
                          >
                            <Radio size={15} />
                            <span>{isRadarExpanded ? 'Hide GPS Radar' : 'Live GPS Radar'}</span>
                          </button>
                        </div>

                        {isCancellable && (
                          <button
                            onClick={() => {
                              setCancelModalOrder(order);
                              setCancelReason('');
                              setCancelReasonPreset('');
                            }}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              color: '#fca5a5',
                              padding: '10px 18px',
                              borderRadius: '10px',
                              fontSize: '13px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              minHeight: '44px'
                            }}
                          >
                            <Trash2 size={15} />
                            <span>Cancel Order</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* AI Recipe Studio View */}
        {activeTab === 'recipes' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <ChefHat size={26} color="#6edbd0" />
                <h2 style={{ color: '#effbe7', fontSize: '24px', fontWeight: '800', margin: 0 }}>
                  AI Culinary & Farm-Fresh Recipe Studio
                </h2>
              </div>
              <p style={{ color: '#a3c2b0', fontSize: '13.5px', margin: 0 }}>
                Interactive farm-to-table culinary assistant powered by Gemini. Ask what to cook with produce in your cart, healthy recipes, preservation guides, or ingredient substitutions.
              </p>
            </div>

            {/* Quick Prompt Suggestions */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {[
                { label: `🥦 Cook with my cart items (${cart.length})`, prompt: `What delicious and healthy meal can I cook using the produce currently in my cart? Cart contains: ${cart.map(i => `${i.quantity}x ${i.title}`).join(', ') || 'fresh produce'}.` },
                { label: '⏱️ 15-Minute quick organic dinner', prompt: 'Give me a healthy 15-minute dinner recipe using fresh organic farm vegetables.' },
                { label: '🥗 High-protein farm bowl', prompt: 'Share a high-protein vegetarian farm bowl recipe using whole grains and fresh vegetables.' },
                { label: '🍅 Produce preservation tips', prompt: 'What are the best natural techniques to preserve fresh organic greens and tomatoes for maximum shelf-life?' }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleAskRecipeAssistant(e, chip.prompt)}
                  disabled={recipeLoading}
                  style={{
                    background: 'rgba(55, 189, 120, 0.12)',
                    border: '1px solid rgba(55, 189, 120, 0.3)',
                    color: '#8be28b',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: recipeLoading ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Interactive Chat Box */}
            <div style={{
              background: 'rgba(9, 43, 39, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(110, 219, 208, 0.25)',
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '30px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.35)'
            }}>
              <div style={{
                maxHeight: '420px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                paddingRight: '6px',
                marginBottom: '16px'
              }}>
                {recipeMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      background: msg.role === 'user' ? 'linear-gradient(135deg, #00897b, #004d40)' : 'rgba(255, 255, 255, 0.05)',
                      border: msg.role === 'user' ? '1px solid #34d399' : '1px solid rgba(110, 219, 208, 0.2)',
                      borderRadius: '16px',
                      padding: '14px 18px',
                      color: '#effbe7'
                    }}
                  >
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      color: msg.role === 'user' ? '#8be28b' : '#6edbd0',
                      marginBottom: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {msg.role === 'user' ? <User size={13} /> : <Sparkles size={13} />}
                      <span>{msg.role === 'user' ? 'You' : 'AgriLink Culinary Assistant'}</span>
                    </div>
                    <div style={{ fontSize: '13.5px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                      {msg.text}
                    </div>

                    {msg.missingIngredients && msg.missingIngredients.length > 0 && (
                      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#f4c95d', marginBottom: '6px' }}>
                          ADDITIONAL PRODUCE YOU MAY NEED:
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {msg.missingIngredients.map((item, iIdx) => (
                            <span
                              key={iIdx}
                              style={{
                                background: 'rgba(244, 201, 93, 0.15)',
                                border: '1px solid rgba(244, 201, 93, 0.3)',
                                color: '#f4c95d',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: '700'
                              }}
                            >
                              + {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {recipeLoading && (
                  <div style={{
                    alignSelf: 'flex-start',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(110, 219, 208, 0.2)',
                    borderRadius: '16px',
                    padding: '12px 18px',
                    color: '#6edbd0',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Analyzing fresh ingredients & cooking techniques...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleAskRecipeAssistant} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={recipeInput}
                  onChange={(e) => setRecipeInput(e.target.value)}
                  placeholder="Ask a cooking question (e.g. 'How to make creamy tomato soup with organic garlic?')..."
                  disabled={recipeLoading}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(110, 219, 208, 0.3)',
                    color: '#effbe7',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={recipeLoading || !recipeInput.trim()}
                  style={{
                    background: 'linear-gradient(135deg, #00897b, #004d40)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '13.5px',
                    cursor: recipeLoading || !recipeInput.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: recipeLoading || !recipeInput.trim() ? 0.6 : 1
                  }}
                >
                  <Send size={16} />
                  <span>Ask Chef</span>
                </button>
              </form>
            </div>

            {/* Recommended Signature Recipes */}
            <h3 style={{ color: '#effbe7', fontSize: '18px', fontWeight: '800', margin: '0 0 16px' }}>
              Chef-Curated Farm Highlights
            </h3>
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

        {/* My Bargains View */}
        {activeTab === 'bargains' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ color: '#effbe7', fontSize: '24px', fontWeight: '800', margin: '0 0 4px' }}>
                  My Bulk Bargain Proposals
                </h2>
                <p style={{ color: '#a3c2b0', fontSize: '13.5px', margin: 0 }}>
                  Real-time negotiation records with local farmers. Review status updates, counter-offers, and accepted prices.
                </p>
              </div>

              <button
                onClick={fetchCustomerBargains}
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
                <RefreshCw size={14} style={{ animation: loadingBargains ? 'spin 1s linear infinite' : 'none' }} />
                <span>Refresh Bargains</span>
              </button>
            </div>

            {/* Loading / Empty / Content states */}
            {loadingBargains && customerBargains.length === 0 ? (
              <SkeletonBargainList />
            ) : customerBargains.length === 0 ? (
              <div style={{
                background: 'rgba(9, 43, 39, 0.5)',
                border: '1px dashed rgba(110, 219, 208, 0.3)',
                borderRadius: '20px',
                padding: '60px 20px',
                textAlign: 'center',
                color: '#a3c2b0'
              }}>
                <Handshake size={48} color="#6edbd0" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ color: '#effbe7', margin: '0 0 8px' }}>No Bargain Proposals Yet</h3>
                <p style={{ margin: '0 0 20px', fontSize: '13.5px' }}>
                  Looking for bulk quantities (5kg+)? You can propose custom offers to farmers from the Fresh Marketplace!
                </p>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  style={{
                    background: 'linear-gradient(135deg, #00897b, #004d40)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    minHeight: '48px'
                  }}
                >
                  Browse Marketplace
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {customerBargains.map((bargain) => {
                  const unit = bargain.productId?.unit || 'kg';
                  const origPrice = Number(bargain.originalPrice || bargain.productId?.price || 0);
                  const offeredPrice = Number(bargain.offeredPrice || 0);
                  const counterPrice = bargain.counterPrice ? Number(bargain.counterPrice) : null;
                  const acceptedPrice = counterPrice || offeredPrice;
                  const unitSavings = Math.max(0, origPrice - acceptedPrice);
                  const totalSavings = unitSavings * (bargain.quantity || 1);

                  const statusColors = {
                    PENDING: { bg: 'rgba(244, 201, 93, 0.2)', border: '#f4c95d', color: '#f4c95d' },
                    ACCEPTED: { bg: 'rgba(52, 211, 153, 0.2)', border: '#34d399', color: '#34d399' },
                    COUNTERED: { bg: 'rgba(96, 165, 250, 0.2)', border: '#60a5fa', color: '#93c5fd' },
                    REJECTED: { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', color: '#fca5a5' }
                  };
                  const currentStyle = statusColors[bargain.status] || statusColors.PENDING;

                  return (
                    <div
                      key={bargain._id}
                      style={{
                        background: 'rgba(9, 43, 39, 0.75)',
                        backdropFilter: 'blur(16px)',
                        border: '1.5px solid rgba(110, 219, 208, 0.25)',
                        borderRadius: '20px',
                        padding: '22px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
                      }}
                    >
                      {/* Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {bargain.productId?.image && (
                            <img
                              src={bargain.productId.image}
                              alt={bargain.productId.title}
                              style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }}
                            />
                          )}
                          <div>
                            <div style={{ color: '#effbe7', fontSize: '18px', fontWeight: '800' }}>
                              {bargain.productId?.title || 'Produce Item'}
                            </div>
                            <div style={{ color: '#a3c2b0', fontSize: '12px', marginTop: '2px' }}>
                              🧑‍🌾 Farmer: <strong style={{ color: '#effbe7' }}>{bargain.farmerId?.name || bargain.farmerId?.firstName || 'Direct Grower'}</strong> • {new Date(bargain.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                        </div>

                        <span style={{
                          background: currentStyle.bg,
                          border: `1px solid ${currentStyle.border}`,
                          color: currentStyle.color,
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {bargain.status}
                        </span>
                      </div>

                      {/* Vertical Negotiation Timeline (Requirement 10) */}
                      <div
                        style={{
                          background: 'rgba(0, 0, 0, 0.25)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '16px',
                          padding: '18px',
                          marginBottom: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '14px'
                        }}
                      >
                        {/* Step 1: Your Initial Offer */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'rgba(244, 201, 93, 0.2)',
                            border: '1.5px solid #f4c95d',
                            color: '#f4c95d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: '800',
                            flexShrink: 0
                          }}>
                            1
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: '#a3c2b0', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: '700' }}>
                              Your Offer
                            </div>
                            <div style={{ color: '#f4c95d', fontSize: '16px', fontWeight: '900', marginTop: '2px' }}>
                              ₹{offeredPrice}/{unit} × {bargain.quantity} {unit}
                              <span style={{ color: '#effbe7', fontSize: '13px', fontWeight: '600', marginLeft: '8px' }}>
                                (Total: ₹{offeredPrice * (bargain.quantity || 1)})
                              </span>
                            </div>
                            {origPrice > 0 && (
                              <div style={{ color: '#9db5aa', fontSize: '12px', marginTop: '2px' }}>
                                Original catalog price: ₹{origPrice}/{unit}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Step 2: Farmer Counter Offer (if countered or counterPrice exists) */}
                        {(counterPrice !== null || bargain.status === 'COUNTERED') && (
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderTop: '1px dashed rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: 'rgba(96, 165, 250, 0.2)',
                              border: '1.5px solid #60a5fa',
                              color: '#60a5fa',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: '800',
                              flexShrink: 0
                            }}>
                              2
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ color: '#93c5fd', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: '700' }}>
                                Farmer Counter Offer
                              </div>
                              <div style={{ color: '#60a5fa', fontSize: '16px', fontWeight: '900', marginTop: '2px' }}>
                                ₹{counterPrice}/{unit} × {bargain.quantity} {unit}
                                <span style={{ color: '#effbe7', fontSize: '13px', fontWeight: '600', marginLeft: '8px' }}>
                                  (Total: ₹{counterPrice * (bargain.quantity || 1)})
                                </span>
                              </div>
                              {bargain.farmerNote && (
                                <div style={{ color: '#effbe7', fontSize: '12px', marginTop: '3px', fontStyle: 'italic' }}>
                                  Farmer Note: "{bargain.farmerNote}"
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Step 3: Current Status and Decision */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderTop: '1px dashed rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: currentStyle.bg,
                            border: `1.5px solid ${currentStyle.border}`,
                            color: currentStyle.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: '800',
                            flexShrink: 0
                          }}>
                            3
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: '#a3c2b0', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: '700' }}>
                              Current Status: <span style={{ color: currentStyle.color }}>{bargain.status}</span>
                            </div>

                            {/* Countered Actions */}
                            {bargain.status === 'COUNTERED' && (
                              <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => handleAcceptCounterBargain(bargain)}
                                  style={{
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    border: 'none',
                                    color: '#ffffff',
                                    padding: '10px 18px',
                                    borderRadius: '10px',
                                    fontSize: '13px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    minHeight: '44px'
                                  }}
                                >
                                  <Check size={15} />
                                  <span>Accept ₹{counterPrice}/{unit} & Add to Cart</span>
                                </button>

                                <button
                                  onClick={() => handleRejectCounterBargain(bargain)}
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.35)',
                                    color: '#fca5a5',
                                    padding: '10px 16px',
                                    borderRadius: '10px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    minHeight: '44px'
                                  }}
                                >
                                  Decline
                                </button>
                              </div>
                            )}

                            {/* Accepted Price & Savings Display */}
                            {bargain.status === 'ACCEPTED' && (
                              <div style={{ marginTop: '8px' }}>
                                <div style={{ color: '#8be28b', fontSize: '14px', fontWeight: '800' }}>
                                  Accepted Price: ₹{acceptedPrice}/{unit}
                                </div>
                                {unitSavings > 0 && (
                                  <div style={{ color: '#f4c95d', fontSize: '13px', fontWeight: '700', marginTop: '3px' }}>
                                    🎉 Savings compared with original price: ₹{unitSavings}/{unit} (₹{totalSavings} total savings!)
                                  </div>
                                )}
                                <div style={{ marginTop: '10px' }}>
                                  <button
                                    onClick={() => {
                                      if (bargain.productId) {
                                        addToCart({
                                          ...bargain.productId,
                                          price: acceptedPrice,
                                          originalPrice: origPrice,
                                          isBargain: true
                                        }, bargain.quantity || 1);
                                      }
                                    }}
                                    style={{
                                      background: 'linear-gradient(135deg, #10b981, #059669)',
                                      border: 'none',
                                      color: '#ffffff',
                                      padding: '10px 18px',
                                      borderRadius: '10px',
                                      fontSize: '13px',
                                      fontWeight: '800',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      minHeight: '44px'
                                    }}
                                  >
                                    <ShoppingCart size={15} />
                                    <span>Add to Cart at Negotiated Price</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {bargain.status === 'PENDING' && (
                              <div style={{ color: '#effbe7', fontSize: '12.5px', marginTop: '4px' }}>
                                ⏳ Submitted to farmer depot. You will receive an alert once the farmer reviews, counters, or accepts.
                              </div>
                            )}

                            {bargain.status === 'REJECTED' && (
                              <div style={{ color: '#fca5a5', fontSize: '12.5px', marginTop: '4px' }}>
                                ✕ Bargain declined by farmer. You can place an order at catalog price or submit another reasonable offer.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Farmers Directory View */}
        {activeTab === 'farmers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ color: '#effbe7', fontSize: '24px', fontWeight: '800', margin: '0 0 4px' }}>
                  Registered Farmer Partners
                </h2>
                <p style={{ color: '#a3c2b0', fontSize: '13.5px', margin: 0 }}>
                  Meet the local growers powering your clean food supply directly from Mandya, Ramanagara, and Karnataka agricultural belts.
                </p>
              </div>

              <button
                onClick={fetchRegisteredFarmers}
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
                <RefreshCw size={14} />
                <span>Refresh Directory</span>
              </button>
            </div>

            {registeredFarmers.length === 0 ? (
              <div style={{
                background: 'rgba(9, 43, 39, 0.5)',
                border: '1px dashed rgba(110, 219, 208, 0.3)',
                borderRadius: '20px',
                padding: '60px 20px',
                textAlign: 'center',
                color: '#a3c2b0'
              }}>
                <Users size={48} color="#6edbd0" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ color: '#effbe7', margin: '0 0 8px' }}>No Farmers Listed</h3>
                <p style={{ margin: '0 0 20px', fontSize: '13.5px' }}>Farmer directory data is currently being fetched.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {registeredFarmers.map((farmer) => {
                  const farmerId = String(farmer._id || farmer.id);
                  const farmerProductCount = products.filter(p => String(p.farmerId) === farmerId).length;

                  return (
                    <div
                      key={farmerId}
                      style={{
                        background: 'rgba(9, 43, 39, 0.75)',
                        backdropFilter: 'blur(16px)',
                        border: '1.5px solid rgba(110, 219, 208, 0.25)',
                        borderRadius: '20px',
                        padding: '22px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #00897b, #004d40)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#effbe7',
                            fontWeight: '900',
                            fontSize: '18px',
                            boxShadow: '0 4px 14px rgba(0, 137, 123, 0.3)'
                          }}>
                            {farmer.name?.[0]?.toUpperCase() || farmer.firstName?.[0]?.toUpperCase() || 'F'}
                          </div>
                          <div>
                            <div style={{ color: '#effbe7', fontSize: '16px', fontWeight: '800' }}>
                              {farmer.name || `${farmer.firstName || ''} ${farmer.lastName || ''}`.trim() || 'Organic Farmer Partner'}
                            </div>
                            <div style={{ color: '#37bd78', fontSize: '12px', fontWeight: '700', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle size={13} />
                              <span>Verified Producer • Mandya Cluster</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#a3c2b0', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={14} color="#6edbd0" />
                            <span>{farmer.location?.address || farmer.address || 'Mandya Organic Farmland, Karnataka'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Sprout size={14} color="#37bd78" />
                            <span>Specialty: Heritage Vegetables, Cold-Chain Greens & Grains</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Active Harvest</div>
                          <div style={{ color: '#effbe7', fontSize: '14px', fontWeight: '800' }}>
                            {farmerProductCount > 0 ? `${farmerProductCount} Produce Items` : '0 Listed'}
                          </div>
                        </div>

                        {farmerProductCount > 0 ? (
                          <button
                            onClick={() => {
                              setFilterFarmerId(farmerId);
                              setActiveTab('marketplace');
                            }}
                            style={{
                              background: 'linear-gradient(135deg, #00897b, #004d40)',
                              border: 'none',
                              color: '#ffffff',
                              padding: '8px 14px',
                              borderRadius: '10px',
                              fontSize: '12px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span>Browse Harvest</span>
                            <ArrowRight size={13} />
                          </button>
                        ) : (
                          <span style={{
                            fontSize: '11.5px',
                            color: '#a3c2b0',
                            fontStyle: 'italic',
                            background: 'rgba(255,255,255,0.04)',
                            padding: '4px 10px',
                            borderRadius: '8px'
                          }}>
                            «This farmer has not published products yet.»
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
              {/* Multi-Farmer Grouped Cart List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cartGroupedByFarmer.map(group => (
                  <div
                    key={group.farmerId || group.farmerName}
                    style={{
                      background: 'rgba(7, 26, 22, 0.95)',
                      border: '1.5px solid rgba(110, 219, 208, 0.25)',
                      borderRadius: '18px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    {/* Farmer Group Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingBottom: '10px'
                    }}>
                      <div>
                        <div style={{ color: '#8be28b', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>🧑‍🌾 {group.farmerName}</span>
                        </div>
                        {group.farmerLocation && (
                          <div style={{ color: '#a3c2b0', fontSize: '12px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} color="#37bd78" />
                            <span>{group.farmerLocation}</span>
                          </div>
                        )}
                      </div>
                      <span style={{
                        background: 'rgba(55, 189, 120, 0.15)',
                        color: '#8be28b',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '10px'
                      }}>
                        {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {/* Group Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {group.items.map(item => {
                        const id = getProductId(item);
                        const hasBargainSavings = item.isBargain || (item.originalPrice && Number(item.originalPrice) > Number(item.price));
                        const unitSavings = hasBargainSavings ? Math.max(0, Number(item.originalPrice) - Number(item.price)) : 0;
                        const totalItemSavings = unitSavings * item.quantity;
                        const minQty = Math.max(1, Number(item.minOrderQty) || 1);

                        return (
                          <div
                            key={id}
                            style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '12px',
                              padding: '14px',
                              display: 'flex',
                              flexWrap: 'wrap',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '12px'
                            }}
                          >
                            <div style={{ flex: '1 1 200px' }}>
                              <div style={{ color: '#effbe7', fontSize: '15px', fontWeight: '800' }}>
                                {item.title}
                              </div>

                              {/* Bargain Savings Display */}
                              {hasBargainSavings ? (
                                <div style={{ marginTop: '4px', fontSize: '12px', lineHeight: '1.4' }}>
                                  <div style={{ color: '#a3c2b0', textDecoration: 'line-through' }}>
                                    Original price: ₹{item.originalPrice}/{item.unit || 'kg'}
                                  </div>
                                  <div style={{ color: '#f4c95d', fontWeight: '800' }}>
                                    Negotiated price: ₹{item.price}/{item.unit || 'kg'}
                                  </div>
                                  <div style={{ color: '#37bd78', fontWeight: '700' }}>
                                    You save: ₹{unitSavings}/{item.unit || 'kg'} (₹{totalItemSavings} total savings)
                                  </div>
                                </div>
                              ) : (
                                <div style={{ color: '#37bd78', fontSize: '13px', fontWeight: '700', marginTop: '2px' }}>
                                  ₹{item.price} / {item.unit || 'kg'}
                                </div>
                              )}

                              {minQty > 1 && (
                                <div style={{ color: '#a3c2b0', fontSize: '11px', marginTop: '3px' }}>
                                  Minimum order: {minQty} {item.unit || 'kg'}
                                </div>
                              )}
                            </div>

                            {/* Qty Controls & Item Subtotal */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  onClick={() => updateQuantity(id, -1)}
                                  title="Decrease quantity"
                                  style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    color: '#effbe7',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '800',
                                    fontSize: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  -
                                </button>
                                <span style={{ color: '#effbe7', fontWeight: '800', minWidth: '24px', textAlign: 'center', fontSize: '15px' }}>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(id, 1)}
                                  title="Increase quantity"
                                  style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    color: '#effbe7',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '800',
                                    fontSize: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => removeFromCart(id)}
                                  title="Remove item"
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#ff6b6b',
                                    width: '36px',
                                    height: '36px',
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

                              <div style={{ color: '#effbe7', fontSize: '15px', fontWeight: '900', minWidth: '70px', textAlign: 'right' }}>
                                ₹{Number(item.price) * item.quantity}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Farmer Subtotal */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '6px',
                      paddingTop: '10px',
                      borderTop: '1px dashed rgba(255, 255, 255, 0.1)'
                    }}>
                      <span style={{ color: '#a3c2b0', fontSize: '13px', fontWeight: '600' }}>Farmer subtotal:</span>
                      <span style={{ color: '#8be28b', fontSize: '16px', fontWeight: '900' }}>₹{group.subtotal}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Multi-Farmer Transparent Dispatch Notice */}
              {cartGroupedByFarmer.length > 1 && (
                <div style={{
                  background: 'rgba(55, 189, 120, 0.12)',
                  border: '1.5px solid rgba(55, 189, 120, 0.35)',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  fontSize: '13px',
                  color: '#effbe7',
                  lineHeight: '1.5'
                }}>
                  📦 <strong style={{ color: '#8be28b' }}>Multi-Farm Fulfillment:</strong> Items from different farmers are packed directly at their farms to ensure maximum harvest freshness and may arrive in separate deliveries.
                </div>
              )}

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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

              <button
                onClick={() => {
                  setProfileFirstName(user?.firstName || '');
                  setProfileLastName(user?.lastName || '');
                  setProfilePhone(user?.phone || '');
                  setProfileAddress(user?.location?.address || '');
                  setProfileNative(user?.nativePlace || '');
                  setIsEditingProfile(prev => !prev);
                }}
                style={{
                  background: isEditingProfile ? 'rgba(255, 255, 255, 0.08)' : 'rgba(110, 219, 208, 0.15)',
                  border: '1px solid rgba(110, 219, 208, 0.4)',
                  color: '#6edbd0',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Edit2 size={14} />
                <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setSavingProfile(true);
                await updateUserProfile({
                  firstName: profileFirstName,
                  lastName: profileLastName,
                  phone: user?.phone || profilePhone,
                  nativePlace: profileNative,
                  location: {
                    address: profileAddress,
                    placeName: profileNative || 'Bengaluru'
                  }
                });
                setSavingProfile(false);
                setIsEditingProfile(false);
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>First Name</label>
                    <input
                      type="text"
                      value={profileFirstName}
                      onChange={(e) => setProfileFirstName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(110, 219, 208, 0.3)',
                        color: '#effbe7',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Last Name</label>
                    <input
                      type="text"
                      value={profileLastName}
                      onChange={(e) => setProfileLastName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(110, 219, 208, 0.3)',
                        color: '#effbe7',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>
                      Phone Number (Verified Identity - Locked)
                    </label>
                    <input
                      type="text"
                      value={user?.phone || profilePhone}
                      disabled
                      readOnly
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#9db5aa',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        cursor: 'not-allowed',
                        opacity: 0.7
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Region / Native Place</label>
                    <input
                      type="text"
                      value={profileNative}
                      onChange={(e) => setProfileNative(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(110, 219, 208, 0.3)',
                        color: '#effbe7',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Default Delivery Address</label>
                  <input
                    type="text"
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(110, 219, 208, 0.3)',
                      color: '#effbe7',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#effbe7',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #00897b, #004d40)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: '800',
                      cursor: savingProfile ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Check size={16} />
                    <span>{savingProfile ? 'Saving Changes...' : 'Save Profile'}</span>
                  </button>
                </div>
              </form>
            ) : (
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
                  <div style={{ color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Delivery Address</div>
                  <div style={{ color: '#effbe7', fontSize: '13px', fontWeight: '600', marginTop: '3px' }}>{user?.location?.address || user?.nativePlace || 'Bengaluru, Karnataka'}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '12px' }}>
                  <div style={{ color: '#a3c2b0', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Orders Placed</div>
                  <div style={{ color: '#37bd78', fontSize: '14px', fontWeight: '800', marginTop: '3px' }}>{orders.length} Dispatches</div>
                </div>
              </div>
            )}
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
