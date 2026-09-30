import React from 'react';
import {
  X,
  Edit2,
  Trash2,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Droplets,
  Package,
  CheckCircle2,
  Lock,
  IndianRupee,
  ShieldCheck,
  Tag
} from 'lucide-react';

export default function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) {
  if (!isOpen || !product) return null;

  const prodId = product._id || product.id;
  const isOutOfStock = Number(product.stock) <= 0;
  const isLowStock = Number(product.stock) < 20 && Number(product.stock) > 0;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99990,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }} onClick={onClose}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        background: 'linear-gradient(145deg, #09231c, #051814)',
        border: '1.5px solid rgba(74, 222, 128, 0.4)',
        borderRadius: '24px',
        color: '#effbe7',
        boxShadow: '0 24px 60px rgba(0,0,0,0.85)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.6)',
            border: 'none',
            color: '#effbe7',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>

        {/* Hero Image */}
        <div style={{ height: '220px', width: '100%', position: 'relative', overflow: 'hidden', borderTopLeftRadius: '22px', borderTopRightRadius: '22px' }}>
          <img
            src={product.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b'}
            alt={product.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(5, 24, 20, 0.95) 0%, transparent 70%)'
          }} />

          {/* Badges on Hero */}
          <div style={{ position: 'absolute', bottom: '16px', left: '18px', right: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <span style={{
                background: product.category === 'seed' ? '#10b981' : product.category === 'fruit' ? '#f59e0b' : '#0284c7',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase'
              }}>
                {product.category === 'seed' ? '🌾 SEED' : product.category === 'fruit' ? '🥭 FRUIT' : '🥬 VEGETABLE'}
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#effbe7', margin: '8px 0 0 0', textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
                {product.title}
              </h2>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#4ade80' }}>
                ₹{Number(product.price).toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: '#a3c2b0' }}>
                per {product.unit || 'kg'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 22px' }}>
          
          {/* Stock & Bargain Status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '18px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '10px 14px'
            }}>
              <span style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700' }}>Available Stock</span>
              <div style={{ fontSize: '15px', fontWeight: '800', color: isOutOfStock ? '#ef4444' : isLowStock ? '#fbbf24' : '#34d399', marginTop: '2px' }}>
                {isOutOfStock ? '0 (Out of stock)' : `${product.stock} ${product.unit || 'kg'}`}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '10px 14px'
            }}>
              <span style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700' }}>Minimum Order</span>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#effbe7', marginTop: '2px' }}>
                {product.minOrderQty || 1} {product.unit || 'kg'}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '10px 14px'
            }}>
              <span style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700' }}>Bargain Policy</span>
              <div style={{ fontSize: '14px', fontWeight: '800', color: product.allowBargain !== false ? '#34d399' : '#9ca3af', marginTop: '2px' }}>
                {product.allowBargain !== false ? '🤝 Enabled' : '🔒 Fixed Price'}
              </div>
            </div>
          </div>

          {/* Complete Agricultural Attributes Grid */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '18px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '800', color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              🌾 Complete Agricultural Information
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px' }}>
              <div>
                <span style={{ color: '#9db5aa', display: 'block', fontSize: '11px' }}>Variety / Strain</span>
                <span style={{ fontWeight: '700', color: '#effbe7' }}>{product.variety || 'Standard Farm Grade'}</span>
              </div>

              <div>
                <span style={{ color: '#9db5aa', display: 'block', fontSize: '11px' }}>Quality Grade</span>
                <span style={{ fontWeight: '700', color: '#fcd34d' }}>{product.qualityGrade || 'Grade A Premium'}</span>
              </div>

              <div>
                <span style={{ color: '#9db5aa', display: 'block', fontSize: '11px' }}>Cultivation Method</span>
                <span style={{ fontWeight: '700', color: '#7dd3fc' }}>{product.cultivationType || 'Certified Organic / Natural'}</span>
              </div>

              <div>
                <span style={{ color: '#9db5aa', display: 'block', fontSize: '11px' }}>Irrigation Technique</span>
                <span style={{ fontWeight: '700', color: '#a7f3d0' }}>{product.irrigationMethod || 'Micro-Drip Irrigation'}</span>
              </div>

              <div>
                <span style={{ color: '#9db5aa', display: 'block', fontSize: '11px' }}>Harvest Date</span>
                <span style={{ fontWeight: '700', color: '#effbe7' }}>
                  {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Farm Fresh (Today)'}
                </span>
              </div>

              <div>
                <span style={{ color: '#9db5aa', display: 'block', fontSize: '11px' }}>Farm Location</span>
                <span style={{ fontWeight: '700', color: '#effbe7' }}>
                  {product.location?.address || product.farmerNative || 'Mandya Cluster, Karnataka'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '22px' }}>
            <span style={{ fontSize: '12px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
              Produce Description & Harvest Notes
            </span>
            <p style={{
              margin: 0,
              fontSize: '13px',
              lineHeight: '1.6',
              color: '#d1fae5',
              background: 'rgba(255,255,255,0.03)',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              {product.description || 'Certified direct farm-harvested produce. Grown without harmful synthetic chemicals, ensuring superior sweetness, aroma, and nutrient density.'}
            </p>
          </div>

          {/* Action Buttons: Edit & Delete */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              style={{
                flex: 1,
                minHeight: '48px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '12px',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Edit2 size={16} />
              <span>Edit Listing</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onDelete(prodId, product.title);
              }}
              style={{
                flex: 1,
                minHeight: '48px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1.5px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '12px',
                color: '#f87171',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Trash2 size={16} />
              <span>Delete Produce</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
