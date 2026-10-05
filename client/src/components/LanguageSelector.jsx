import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Check, ChevronDown, Sparkles } from 'lucide-react';

export default function LanguageSelector({ compact = false, variant = 'navbar' }) {
  const { language, setLanguage, languages, currentLangMeta } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSelectLanguage = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="language-selector-trigger"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: variant === 'pill'
            ? 'rgba(16, 185, 129, 0.15)'
            : 'linear-gradient(135deg, rgba(6, 78, 59, 0.8), rgba(9, 43, 39, 0.9))',
          color: '#effbe7',
          border: '1px solid rgba(52, 211, 153, 0.4)',
          borderRadius: '24px',
          padding: compact ? '5px 10px' : '7px 14px',
          fontSize: compact ? '11.5px' : '12.5px',
          fontWeight: '700',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          minHeight: '36px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.8)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.4)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        title="Change application language / மொழியை மாற்றவும்"
      >
        <Globe size={15} color="#34d399" />
        <span style={{ fontSize: '14px' }}>{currentLangMeta.flag}</span>
        <span style={{ color: '#d1fae5', letterSpacing: '0.2px' }}>
          {currentLangMeta.nativeName}
        </span>
        <ChevronDown
          size={13}
          color="#9db5aa"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </button>

      {/* Floating Language Dropdown Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 9999,
            minWidth: '240px',
            background: 'rgba(7, 26, 22, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(52, 211, 153, 0.4)',
            borderRadius: '16px',
            padding: '8px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65), 0 0 20px rgba(16, 185, 129, 0.2)',
            animation: 'fadeInSlide 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '8px 10px 10px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🌐 Select Language / மொழி
            </span>
            <Sparkles size={13} color="#f59e0b" />
          </div>

          {/* Languages list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {languages.map((l) => {
              const isSelected = language === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleSelectLanguage(l.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                    border: isSelected ? '1px solid rgba(52, 211, 153, 0.5)' : '1px solid transparent',
                    color: isSelected ? '#34d399' : '#effbe7',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    minHeight: '44px',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{l.flag}</span>
                    <div>
                      <div style={{ fontWeight: isSelected ? '800' : '600', fontSize: '13px' }}>
                        {l.nativeName}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#9db5aa' }}>
                        {l.name} • {l.region}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={14} color="#ffffff" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Notice */}
          <div style={{
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '10px',
            color: '#9db5aa',
            textAlign: 'center'
          }}>
            ⚡ Instant client translation across all portals
          </div>
        </div>
      )}
    </div>
  );
}
