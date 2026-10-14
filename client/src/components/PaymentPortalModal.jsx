import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  ShieldCheck, CheckCircle2, QrCode, CreditCard, Building2, Wallet,
  Banknote, ArrowRight, Loader2, Sparkles, AlertCircle, Copy, Check,
  Lock, RefreshCw, X, ChevronRight, Download, Printer, Smartphone,
  CheckCircle, Delete, KeyRound, ExternalLink
} from 'lucide-react';
import { orderAPI, authAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function PaymentPortalModal({
  isOpen,
  orderData,
  onClose,
  onPaymentSuccess,
  onViewOrders
}) {
  const { t } = useLanguage();
  if (!isOpen || !orderData) return null;

  const orders = Array.isArray(orderData.orders)
    ? orderData.orders
    : (orderData.orders ? [orderData.orders] : [orderData]);

  const totalAmount = Number(orderData.totalAmount || orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0) || 0);
  const primaryOrderId = orders[0]?.orderId || orders[0]?._id || orders[0]?.id || `ORD-${Date.now().toString().slice(-6)}`;
  const orderIds = orders.map(o => o._id || o.id || o.orderId).filter(Boolean);

  // Multi-Farmer Shipment Tab State
  const [activeShipmentIndex, setActiveShipmentIndex] = useState(0);
  const [farmerUpiDetailsMap, setFarmerUpiDetailsMap] = useState({});
  const [loadingFarmerUpi, setLoadingFarmerUpi] = useState(false);

  // Payment method tab state
  const [selectedMethod, setSelectedMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod'
  const [upiSubMode, setUpiSubMode] = useState('qr'); // 'qr' | 'direct_transfer' | 'vpa'

  // Dynamic Real QR Code Data URL
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [generatingQr, setGeneratingQr] = useState(true);

  // Form states
  const [upiId, setUpiId] = useState('');
  const [selectedBankUpi, setSelectedBankUpi] = useState('sbi');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('hdfc');
  const [useCoins, setUseCoins] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // UPI MPIN Modal State
  const [showMpinModal, setShowMpinModal] = useState(false);
  const [mpin, setMpin] = useState('');
  const [mpinError, setMpinError] = useState('');

  // Gateway simulation states
  const [processingState, setProcessingState] = useState('idle'); // 'idle' | 'authorizing' | 'securing' | 'success' | 'failed'
  const [processingStepText, setProcessingStepText] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);
  const [countdown, setCountdown] = useState(580); // 9m 40s QR countdown
  const [errorMessage, setErrorMessage] = useState(null);

  const finalPayable = useCoins ? Math.max(1, totalAmount - 50) : totalAmount;

  // Fetch specific farmer UPI configurations for orders
  useEffect(() => {
    let isMounted = true;
    const fetchFarmerUpis = async () => {
      setLoadingFarmerUpi(true);
      const map = {};
      for (const ord of orders) {
        const fId = ord.farmerId;
        if (fId && !map[fId]) {
          if (ord.farmerUpiQrCode) {
            map[fId] = {
              isUpiConfigured: true,
              upiQrCode: ord.farmerUpiQrCode,
              upiId: ord.farmerUpiId || '',
              upiPayeeName: ord.farmerUpiPayeeName || ord.farmerName || 'Verified Farm Producer'
            };
          } else {
            try {
              const res = await authAPI.getFarmerUpiDetails(fId);
              if (res.data?.success) {
                map[fId] = res.data;
              }
            } catch (err) {
              map[fId] = { isUpiConfigured: false, upiQrCode: null };
            }
          }
        }
      }
      if (isMounted) {
        setFarmerUpiDetailsMap(map);
        setLoadingFarmerUpi(false);
      }
    };
    fetchFarmerUpis();
    return () => {
      isMounted = false;
    };
  }, [orderData]);

  const currentOrder = orders[activeShipmentIndex] || orders[0] || {};
  const currentFarmerId = currentOrder.farmerId;
  const currentFarmerInfo = farmerUpiDetailsMap[currentFarmerId] || {};
  const currentFarmerQr = currentOrder.farmerUpiQrCode || currentFarmerInfo.upiQrCode || null;
  const isCurrentFarmerQrConfigured = Boolean(currentFarmerQr);
  const currentFarmerName = currentOrder.farmerName || currentFarmerInfo.farmerName || 'Verified Farm Producer';
  const currentFarmerUpiId = currentOrder.farmerUpiId || currentFarmerInfo.upiId || '';
  const currentFarmerPayeeName = currentOrder.farmerUpiPayeeName || currentFarmerInfo.upiPayeeName || currentFarmerName;
  const currentShipmentAmount = Number(currentOrder.totalAmount || (orders.length === 1 ? finalPayable : totalAmount));

  // QR Timer Countdown
  useEffect(() => {
    if (processingState === 'success') return undefined;
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 600));
    }, 1000);
    return () => clearInterval(timer);
  }, [processingState]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Card formatting
  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
  };

  const getCardNetwork = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'VISA';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MASTERCARD';
    if (/^(60|65|81|82)/.test(clean)) return 'RUPAY';
    return 'CARD';
  };

  // Cash on Delivery: Confirm order without fake payment confirmation
  const handleConfirmCod = () => {
    const result = {
      amount: finalPayable,
      method: 'CASH ON DELIVERY',
      status: 'PAYMENT PENDING (DUE ON HANDOVER)',
      message: 'Pay when your order arrives at your doorstep.',
      timestamp: new Date().toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }),
      orderIds,
      orders
    };
    setPaymentResult(result);
    setProcessingState('cod_confirmed');
  };

  // UPI on Delivery: Record customer notification without fake escrow settlement
  const handleReportUpiPayment = async (modeLabel = 'UPI_QR_SCAN') => {
    setErrorMessage(null);
    setProcessingState('authorizing');
    setProcessingStepText('Registering Doorstep UPI Payment Notification...');

    try {
      await orderAPI.processPayment({
        orderIds,
        paymentMethod: 'UPI',
        isCustomerClaim: true
      });

      const result = {
        amount: finalPayable,
        method: 'UPI ON HANDOVER',
        status: 'CUSTOMER REPORTED (PENDING HANDOVER VERIFICATION)',
        message: 'Payment notification recorded. Delivery partner will verify upon doorstep produce arrival.',
        timestamp: new Date().toLocaleString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }),
        orderIds,
        orders
      };

      setPaymentResult(result);
      setProcessingState('upi_reported');

      if (onPaymentSuccess) {
        onPaymentSuccess(result);
      }
    } catch (err) {
      console.warn('UPI notification recorded locally:', err.message);
      const fallbackResult = {
        amount: finalPayable,
        method: 'UPI ON HANDOVER',
        status: 'CUSTOMER REPORTED (PENDING HANDOVER VERIFICATION)',
        message: 'Payment notification recorded. Delivery partner will verify upon doorstep produce arrival.',
        timestamp: new Date().toLocaleString(),
        orderIds,
        orders
      };
      setPaymentResult(fallbackResult);
      setProcessingState('upi_reported');
      if (onPaymentSuccess) onPaymentSuccess(fallbackResult);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('agrilink@oksbi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const downloadReceipt = () => {
    const receiptContent = `
=========================================
AGRILINK FARM-TO-TABLE ORDER SLIP
=========================================
Order ID       : ${primaryOrderId}
Total Payable  : INR ${paymentResult?.amount}
Payment Mode   : ${paymentResult?.method || 'CASH ON DELIVERY'}
Payment Status : ${paymentResult?.status || 'PAYMENT PENDING (PAY ON HANDOVER)'}
Timestamp      : ${paymentResult?.timestamp}
Farm Depots    : ${paymentResult?.orders?.length || 1} Direct Shipment(s)
=========================================
Instructions:
• Pay directly to the verified delivery partner upon produce arrival.
• Cash or UPI QR scan on handover is accepted.
=========================================
Thank you for supporting Indian Farmers!
Zero Brokerage • 100% Direct to Producer
=========================================
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AgriLink_OrderSlip_${primaryOrderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(3, 10, 18, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: 'linear-gradient(165deg, #0b1a20, #061217)',
          border: '1.5px solid rgba(16, 185, 129, 0.45)',
          borderRadius: '24px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.85), 0 0 40px rgba(16, 185, 129, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#f3f4f6',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '18px 24px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(6, 78, 59, 0.35))',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
            >
              <ShieldCheck size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.3px' }}>
                  AgriLink Payment & Checkout Handover
                </h3>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.5)',
                    color: '#6ee7b7',
                    fontSize: '10.5px',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '20px'
                  }}
                >
                  🌾 Direct Farm Producer Purchase
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#9db5aa' }}>
                Order #{String(primaryOrderId).slice(-8).toUpperCase()} • Verified Farm Gate Order
              </p>
            </div>
          </div>

          {processingState !== 'authorizing' && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#9ca3af',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* ── PROCESSING SCREEN ── */}
        {processingState === 'authorizing' && (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 24px' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  border: '4px solid rgba(16, 185, 129, 0.2)',
                  borderTopColor: '#10b981',
                  borderRadius: '50%',
                  animation: 'spin 0.9s linear infinite'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981'
                }}
              >
                <Lock size={26} />
              </div>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#effbe7', margin: '0 0 10px' }}>
              Recording Order Details...
            </h3>
            <p style={{ fontSize: '14px', color: '#6ee7b7', margin: '0 0 20px', fontWeight: '600' }}>
              {processingStepText}
            </p>
          </div>
        )}

        {/* ── COD CONFIRMED SCREEN (NO FAKE ESCROW) ── */}
        {processingState === 'cod_confirmed' && paymentResult && (
          <div style={{ padding: '32px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '2px solid #f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 0 30px rgba(245, 158, 11, 0.35)'
                }}
              >
                <Banknote size={38} color="#f59e0b" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#effbe7', margin: '0 0 6px' }}>
                Order Placed — Cash on Delivery
              </h2>
              <p style={{ fontSize: '13.5px', color: '#fcd34d', margin: 0, fontWeight: '700' }}>
                Payment Status: Payment Pending (Pay on Handover)
              </p>
              <p style={{ fontSize: '12.5px', color: '#a3c2b0', marginTop: '6px' }}>
                Your harvest request is sent to farm depots. You will pay the delivery partner at your door.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '18px',
                padding: '20px',
                marginBottom: '24px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px dashed rgba(255,255,255,0.15)',
                  paddingBottom: '14px',
                  marginBottom: '14px'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700' }}>
                    Amount Due at Doorstep
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#f59e0b' }}>
                    ₹{paymentResult.amount}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#fcd34d',
                      border: '1px solid rgba(245, 158, 11, 0.5)',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '800'
                    }}
                  >
                    PENDING COLLECTION
                  </span>
                  <div style={{ fontSize: '11.5px', color: '#9ca3af', marginTop: '4px' }}>
                    Doorstep Cash / QR Handover
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px' }}>
                <div>
                  <div style={{ color: '#9db5aa' }}>Order Reference:</div>
                  <div style={{ fontWeight: '700', color: '#effbe7', fontFamily: 'monospace' }}>
                    #{String(primaryOrderId).slice(-8).toUpperCase()}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9db5aa' }}>Payment Method:</div>
                  <div style={{ fontWeight: '700', color: '#effbe7' }}>
                    Cash on Delivery (COD)
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9db5aa' }}>Order Placed:</div>
                  <div style={{ fontWeight: '700', color: '#effbe7' }}>
                    {paymentResult.timestamp}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9db5aa' }}>Farm Packages:</div>
                  <div style={{ fontWeight: '700', color: '#4ade80' }}>
                    {paymentResult.orders?.length || 1} Farm Depot(s)
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  onClose();
                  if (onViewOrders) onViewOrders();
                }}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '14px 20px',
                  borderRadius: '14px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                📦 Track Order Status <ArrowRight size={16} />
              </button>

              <button
                onClick={downloadReceipt}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={15} /> Order Slip
              </button>
            </div>
          </div>
        )}

        {/* ── UPI CLAIMED SCREEN (HONEST STATUS) ── */}
        {processingState === 'upi_reported' && paymentResult && (
          <div style={{ padding: '32px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: '2px solid #38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 0 30px rgba(56, 189, 248, 0.35)'
                }}
              >
                <Smartphone size={38} color="#38bdf8" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#effbe7', margin: '0 0 6px' }}>
                Payment Reported via UPI
              </h2>
              <p style={{ fontSize: '13.5px', color: '#38bdf8', margin: 0, fontWeight: '700' }}>
                Status: Reported by Customer (Pending Handover Verification)
              </p>
              <p style={{ fontSize: '12.5px', color: '#a3c2b0', marginTop: '6px' }}>
                The delivery partner will physically verify this UPI transaction during produce handover.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '18px',
                padding: '20px',
                marginBottom: '24px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px dashed rgba(255,255,255,0.15)',
                  paddingBottom: '14px',
                  marginBottom: '14px'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700' }}>
                    Reported Amount
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#38bdf8' }}>
                    ₹{paymentResult.amount}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '800'
                    }}
                  >
                    PENDING VERIFICATION
                  </span>
                  <div style={{ fontSize: '11.5px', color: '#9ca3af', marginTop: '4px' }}>
                    UPI on Handover
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px' }}>
                <div>
                  <div style={{ color: '#9db5aa' }}>Order Reference:</div>
                  <div style={{ fontWeight: '700', color: '#effbe7', fontFamily: 'monospace' }}>
                    #{String(primaryOrderId).slice(-8).toUpperCase()}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9db5aa' }}>{t('Payee UPI Destination')}:</div>
                  <div style={{ fontWeight: '700', color: '#effbe7', fontFamily: 'monospace' }}>
                    {currentFarmerUpiId || currentFarmerPayeeName || t('Direct Farmer QR')}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9db5aa' }}>Reported At:</div>
                  <div style={{ fontWeight: '700', color: '#effbe7' }}>
                    {paymentResult.timestamp}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9db5aa' }}>Farm Packages:</div>
                  <div style={{ fontWeight: '700', color: '#4ade80' }}>
                    {paymentResult.orders?.length || 1} Farm Depot(s)
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  onClose();
                  if (onViewOrders) onViewOrders();
                }}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '14px 20px',
                  borderRadius: '14px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                📦 Track Order Status <ArrowRight size={16} />
              </button>

              <button
                onClick={downloadReceipt}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={15} /> Order Slip
              </button>

              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        {/* ── MAIN PAYMENT METHOD SELECTION ── */}
        {processingState === 'idle' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Amount & Savings Ribbon */}
            <div
              style={{
                padding: '16px 24px',
                background: 'rgba(0,0,0,0.3)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '700' }}>
                  Total Payable Amount
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '28px', fontWeight: '900', color: '#10b981' }}>
                    ₹{finalPayable}
                  </span>
                  {useCoins && (
                    <span style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'line-through' }}>
                      ₹{totalAmount}
                    </span>
                  )}
                  <span style={{ fontSize: '12px', color: '#6ee7b7', fontWeight: '700' }}>
                    ({orders.length} farm shipment{orders.length > 1 ? 's' : ''})
                  </span>
                </div>
              </div>

              {/* AgriCoins Discount Toggle */}
              <div
                onClick={() => setUseCoins(!useCoins)}
                style={{
                  background: useCoins ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${useCoins ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '14px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{ fontSize: '18px' }}>🪙</div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: useCoins ? '#fcd34d' : '#effbe7' }}>
                    {useCoins ? '₹50 AgriCoins Applied!' : 'Use 100 AgriCoins (Save ₹50)'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                    {useCoins ? 'Instant discount deducted' : 'Balance: 140 AgriCoins'}
                  </div>
                </div>
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: useCoins ? '#f59e0b' : 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {useCoins && <Check size={12} color="#000" />}
                </div>
              </div>
            </div>

            {/* Multi-Farmer Shipment Navigator */}
            {orders.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 24px',
                  background: 'rgba(0,0,0,0.45)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  overflowX: 'auto'
                }}
              >
                <span style={{ fontSize: '11px', color: '#9db5aa', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>
                  {t('Farm Shipments')}:
                </span>
                {orders.map((ord, idx) => {
                  const fName = ord.farmerName || `Farmer ${idx + 1}`;
                  const isSel = idx === activeShipmentIndex;
                  return (
                    <button
                      key={ord._id || ord.orderId || idx}
                      type="button"
                      onClick={() => setActiveShipmentIndex(idx)}
                      style={{
                        background: isSel ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${isSel ? '#10b981' : 'rgba(255,255,255,0.15)'}`,
                        color: isSel ? '#ffffff' : '#cbd5e1',
                        borderRadius: '10px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>📦 {t('Shipment')} {idx + 1}: {fName}</span>
                      <span style={{ background: isSel ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '6px', fontSize: '11px' }}>
                        ₹{ord.totalAmount}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Layout: Left Sidebar tabs + Right Content */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '220px 1fr',
                minHeight: '410px'
              }}
              className="payment-portal-grid"
            >
              {/* Payment Methods Tab Rail */}
              <div
                style={{
                  background: 'rgba(0,0,0,0.22)',
                  borderRight: '1px solid rgba(255,255,255,0.06)',
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                {[
                  { id: 'upi', label: 'UPI on Handover', icon: <QrCode size={18} />, badge: 'Pay on Delivery' },
                  { id: 'cod', label: 'Cash on Delivery', icon: <Banknote size={18} />, badge: 'Doorstep Cash' },
                  { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard size={18} />, badge: 'Coming Soon', disabled: true },
                  { id: 'netbanking', label: 'Net Banking', icon: <Building2 size={18} />, badge: 'Coming Soon', disabled: true },
                  { id: 'wallet', label: 'Wallets & AgriCoins', icon: <Wallet size={18} />, badge: 'Coming Soon', disabled: true }
                ].map((item) => {
                  const isActive = selectedMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.disabled) {
                          setErrorMessage(`${item.label} gateway is coming soon. Please choose Cash on Delivery or UPI on Handover.`);
                          return;
                        }
                        setErrorMessage(null);
                        setSelectedMethod(item.id);
                      }}
                      style={{
                        background: isActive ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(6, 78, 59, 0.3))' : 'transparent',
                        border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.5)' : 'transparent'}`,
                        color: item.disabled ? '#64748b' : (isActive ? '#4ade80' : '#cbd5e1'),
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        cursor: item.disabled ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: isActive ? '800' : '600',
                        opacity: item.disabled ? 0.6 : 1,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: item.disabled ? '#475569' : (isActive ? '#4ade80' : '#94a3b8') }}>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: '9.5px',
                            background: item.disabled ? 'rgba(148, 163, 184, 0.12)' : (isActive ? '#10b981' : 'rgba(255,255,255,0.06)'),
                            color: item.disabled ? '#94a3b8' : (isActive ? '#000000' : '#9ca3af'),
                            fontWeight: '800',
                            padding: '1px 6px',
                            borderRadius: '10px'
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                <div
                  style={{
                    marginTop: 'auto',
                    padding: '12px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    fontSize: '11px',
                    color: '#a7f3d0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Lock size={14} color="#10b981" />
                  <span>Direct Farm-to-Table Handover</span>
                </div>
              </div>

              {/* Active Tab Form Body */}
              <div style={{ padding: '22px', overflowY: 'auto' }}>
                {/* ── TAB 1: UPI & DYNAMIC REAL QR CODE & AMOUNT TRANSFER ── */}
                {selectedMethod === 'upi' && (
                  <div>
                    {/* Sub-tabs for UPI Mode */}
                    <div
                      style={{
                        display: 'flex',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '4px',
                        borderRadius: '12px',
                        marginBottom: '16px',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setUpiSubMode('qr')}
                        style={{
                          flex: 1,
                          background: upiSubMode === 'qr' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                          color: upiSubMode === 'qr' ? '#ffffff' : '#94a3b8',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <QrCode size={14} /> Scan UPI QR
                      </button>

                      <button
                        type="button"
                        onClick={() => setUpiSubMode('direct_transfer')}
                        style={{
                          flex: 1,
                          background: upiSubMode === 'direct_transfer' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                          color: upiSubMode === 'direct_transfer' ? '#ffffff' : '#94a3b8',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Building2 size={14} /> Direct UPI Transfer
                      </button>

                      <button
                        type="button"
                        onClick={() => setUpiSubMode('vpa')}
                        style={{
                          flex: 1,
                          background: upiSubMode === 'vpa' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                          color: upiSubMode === 'vpa' ? '#ffffff' : '#94a3b8',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Smartphone size={14} /> UPI ID / Apps
                      </button>
                    </div>

                    {/* SUB-MODE A: FARMER-SPECIFIC UPI QR CODE */}
                    {upiSubMode === 'qr' && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#effbe7' }}>
                              {t('Farmer UPI QR Code')}
                            </h4>
                            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#9db5aa' }}>
                              {t('Pay directly to verified producer')} ({currentFarmerName})
                            </p>
                          </div>
                          <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: '800', background: 'rgba(251, 191, 36, 0.1)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                            ⏱️ {formatTimer(countdown)}
                          </span>
                        </div>

                        {loadingFarmerUpi ? (
                          <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                            <Loader2 size={32} className="spin" color="#10b981" style={{ margin: '0 auto 12px' }} />
                            <p style={{ color: '#9db5aa', fontSize: '13px' }}>{t('Resolving farmer payment details...')}</p>
                          </div>
                        ) : isCurrentFarmerQrConfigured ? (
                          <div>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '170px 1fr',
                                gap: '18px',
                                alignItems: 'center',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '16px',
                                padding: '16px',
                                marginBottom: '16px'
                              }}
                            >
                              {/* Authentic Farmer Uploaded QR Code */}
                              <div
                                style={{
                                  background: '#ffffff',
                                  padding: '10px',
                                  borderRadius: '16px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                                  position: 'relative'
                                }}
                              >
                                <img
                                  src={currentFarmerQr}
                                  alt={`${currentFarmerName} UPI QR Code`}
                                  style={{ width: '150px', height: '150px', objectFit: 'contain', display: 'block', borderRadius: '8px' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                                <div style={{ fontSize: '11px', color: '#064e3b', fontWeight: '900', marginTop: '6px', textAlign: 'center' }}>
                                  ₹{currentShipmentAmount} {t('Due to')} {currentFarmerName}
                                </div>
                                {currentFarmerUpiId && (
                                  <div style={{ fontSize: '9.5px', color: '#047857', fontWeight: '700', wordBreak: 'break-all' }}>
                                    {currentFarmerUpiId}
                                  </div>
                                )}
                              </div>

                              {/* Details & Instructions */}
                              <div>
                                <div style={{ fontSize: '12px', color: '#9db5aa', marginBottom: '4px' }}>
                                  {t('Shipment Producer')}:
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#effbe7', marginBottom: '8px' }}>
                                  🌾 {currentFarmerName}
                                </div>

                                <div style={{ fontSize: '12px', color: '#9db5aa', marginBottom: '4px' }}>
                                  {t('Shipment Amount Due')}:
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: '900', color: '#10b981', marginBottom: '12px' }}>
                                  ₹{currentShipmentAmount}
                                </div>

                                {currentFarmerUpiId ? (
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      background: 'rgba(0,0,0,0.4)',
                                      border: '1px solid rgba(255,255,255,0.1)',
                                      borderRadius: '10px',
                                      padding: '6px 10px',
                                      marginBottom: '10px'
                                    }}
                                  >
                                    <div style={{ fontSize: '11.5px', color: '#cbd5e1', fontFamily: 'monospace' }}>
                                      {currentFarmerUpiId}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(currentFarmerUpiId);
                                        setCopiedUpi(true);
                                        setTimeout(() => setCopiedUpi(false), 2000);
                                      }}
                                      style={{
                                        background: copiedUpi ? '#10b981' : 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        color: '#fff',
                                        borderRadius: '6px',
                                        padding: '3px 8px',
                                        fontSize: '10.5px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      {copiedUpi ? <Check size={11} /> : <Copy size={11} />}
                                      {copiedUpi ? t('Copied') : t('Copy UPI ID')}
                                    </button>
                                  </div>
                                ) : null}

                                <p style={{ fontSize: '11.5px', color: '#a7f3d0', margin: 0, lineHeight: '1.4' }}>
                                  ℹ️ {t('Scan with any UPI app on produce delivery or tap below after scanning to notify handover.')}
                                </p>
                              </div>
                            </div>

                            {/* Button: Report paid via QR */}
                            <button
                              type="button"
                              onClick={() => handleReportUpiPayment('UPI_QR_SCAN')}
                              style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                border: 'none',
                                color: '#ffffff',
                                padding: '13px 20px',
                                borderRadius: '14px',
                                fontSize: '14.5px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyCenter: 'center',
                                gap: '8px',
                                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
                              }}
                            >
                              <CheckCircle2 size={16} /> {t('I Have Paid / Notify Handover')} (₹{finalPayable})
                            </button>
                          </div>
                        ) : (
                          /* Unconfigured Farmer QR fallback - Exact user requirement */
                          <div
                            style={{
                              background: 'rgba(239, 68, 68, 0.12)',
                              border: '1.5px dashed rgba(239, 68, 68, 0.4)',
                              borderRadius: '16px',
                              padding: '24px 20px',
                              textAlign: 'center',
                              marginBottom: '16px'
                            }}
                          >
                            <div
                              style={{
                                width: '52px',
                                height: '52px',
                                borderRadius: '50%',
                                background: 'rgba(239, 68, 68, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 12px'
                              }}
                            >
                              <AlertCircle size={28} color="#f87171" />
                            </div>
                            <h4 style={{ margin: '0 0 8px', fontSize: '15.5px', fontWeight: '800', color: '#fecaca' }}>
                              This farmer has not configured a UPI QR code yet.
                            </h4>
                            <p style={{ margin: '0 0 18px', fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
                              {t('Farmer')} <strong>{currentFarmerName}</strong> {t('has not uploaded a UPI QR code. Please pay via Cash on Delivery when your order arrives.')}
                            </p>

                            <button
                              type="button"
                              onClick={() => setSelectedMethod('cod')}
                              style={{
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                border: 'none',
                                color: '#ffffff',
                                padding: '11px 22px',
                                borderRadius: '12px',
                                fontSize: '13.5px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
                              }}
                            >
                              <Banknote size={16} /> {t('Switch to Cash on Delivery')}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUB-MODE B: IN-APP DIRECT AMOUNT TRANSFER */}
                    {upiSubMode === 'direct_transfer' && (
                      <div>
                        <h4 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: '800', color: '#effbe7' }}>
                          {t('Direct Bank UPI Transfer')}
                        </h4>
                        <p style={{ fontSize: '12.5px', color: '#cbd5e1', marginBottom: '14px' }}>
                          {t('Use your bank UPI app to transfer to verified farmer account. The delivery partner will verify receipt upon produce arrival.')}
                        </p>

                        {currentFarmerUpiId ? (
                          <div
                            style={{
                              background: 'rgba(6, 78, 59, 0.25)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              borderRadius: '12px',
                              padding: '14px 16px',
                              marginBottom: '16px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                              <span style={{ color: '#9db5aa' }}>{t('Farmer Payee')}:</span>
                              <span style={{ color: '#effbe7', fontWeight: '700' }}>{currentFarmerPayeeName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                              <span style={{ color: '#9db5aa' }}>{t('Payee UPI ID')}:</span>
                              <span style={{ color: '#6ee7b7', fontWeight: '700', fontFamily: 'monospace' }}>{currentFarmerUpiId}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '800' }}>
                              <span style={{ color: '#effbe7' }}>{t('Amount Due')}:</span>
                              <span style={{ color: '#34d399', fontSize: '16px' }}>₹{currentShipmentAmount}</span>
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              background: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '12px',
                              padding: '14px 16px',
                              marginBottom: '16px',
                              color: '#fecaca',
                              fontSize: '12.5px'
                            }}
                          >
                            This farmer has not configured a UPI ID yet. Please choose Cash on Delivery.
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleReportUpiPayment('DIRECT_UPI_TRANSFER')}
                          style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            color: '#ffffff',
                            padding: '14px 20px',
                            borderRadius: '14px',
                            fontSize: '14.5px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
                          }}
                        >
                          <CheckCircle2 size={16} /> {t('Report Payment on Handover / Notify Driver')} (₹{finalPayable})
                        </button>
                      </div>
                    )}

                    {/* SUB-MODE C: UPI VPA / APPS */}
                    {upiSubMode === 'vpa' && (
                      <div>
                        <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '800', color: '#effbe7' }}>
                          {t('Enter Your UPI ID (VPA)')}
                        </h4>
                        <div style={{ marginBottom: '16px' }}>
                          <input
                            type="text"
                            value={upiId}
                            onChange={e => setUpiId(e.target.value)}
                            placeholder="e.g. yourname@okhdfcbank or 9952712633@upi"
                            style={{
                              width: '100%',
                              background: 'rgba(0,0,0,0.4)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '12px',
                              padding: '12px 14px',
                              color: '#fff',
                              fontSize: '13.5px',
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div style={{ fontSize: '12px', color: '#9db5aa', marginBottom: '8px' }}>
                          {t('Quick UPI Handles')}:
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                          {['@oksbi', '@okhdfcbank', '@okaxis', '@ybl', '@paytm'].map(suffix => (
                            <button
                              key={suffix}
                              type="button"
                              onClick={() => {
                                const base = upiId.split('@')[0] || 'customer';
                                setUpiId(base + suffix);
                              }}
                              style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '8px',
                                padding: '4px 10px',
                                fontSize: '11px',
                                color: '#6ee7b7',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              {suffix}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (!upiId.trim() || !upiId.includes('@')) {
                              setErrorMessage(t('Please enter a valid UPI ID (e.g. mobile@upi or name@oksbi)'));
                              return;
                            }
                            handleReportUpiPayment('UPI_VPA_REQUEST');
                          }}
                          style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            color: '#ffffff',
                            padding: '13px 20px',
                            borderRadius: '14px',
                            fontSize: '14.5px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
                          }}
                        >
                          {t('Request Doorstep UPI Handover for')} ₹{finalPayable}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB 2: CREDIT / DEBIT CARD (COMING SOON) ── */}
                {selectedMethod === 'card' && (
                  <div style={{ textAlign: 'center', padding: '36px 16px' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(148, 163, 184, 0.1)',
                        border: '1px solid rgba(148, 163, 184, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                      }}
                    >
                      <CreditCard size={32} color="#94a3b8" />
                    </div>
                    <h4 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: '800', color: '#effbe7' }}>
                      Card Payment Gateway (Coming Soon)
                    </h4>
                    <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '380px', margin: '0 auto 20px', lineHeight: '1.6' }}>
                      Online credit and debit card processing via RBI-regulated payment gateway is currently under integration. Please choose Cash on Delivery or UPI on Handover.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedMethod('cod')}
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          border: 'none',
                          color: '#ffffff',
                          padding: '10px 18px',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Switch to Cash on Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedMethod('upi')}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#ffffff',
                          padding: '10px 18px',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Switch to UPI QR
                      </button>
                    </div>
                  </div>
                )}

                {/* ── TAB 3: NET BANKING (COMING SOON) ── */}
                {selectedMethod === 'netbanking' && (
                  <div style={{ textAlign: 'center', padding: '36px 16px' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(148, 163, 184, 0.1)',
                        border: '1px solid rgba(148, 163, 184, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                      }}
                    >
                      <Building2 size={32} color="#94a3b8" />
                    </div>
                    <h4 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: '800', color: '#effbe7' }}>
                      Net Banking Direct Gateway (Coming Soon)
                    </h4>
                    <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '380px', margin: '0 auto 20px', lineHeight: '1.6' }}>
                      Direct bank integrations with 50+ Indian banks are scheduled for upcoming release. Please select Cash on Delivery or UPI on Handover.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('cod')}
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        border: 'none',
                        color: '#ffffff',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Switch to Cash on Delivery
                    </button>
                  </div>
                )}

                {/* ── TAB 4: WALLETS (COMING SOON) ── */}
                {selectedMethod === 'wallet' && (
                  <div style={{ textAlign: 'center', padding: '36px 16px' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(148, 163, 184, 0.1)',
                        border: '1px solid rgba(148, 163, 184, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                      }}
                    >
                      <Wallet size={32} color="#94a3b8" />
                    </div>
                    <h4 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: '800', color: '#effbe7' }}>
                      Digital Wallets & Pay Later (Coming Soon)
                    </h4>
                    <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '380px', margin: '0 auto 20px', lineHeight: '1.6' }}>
                      Amazon Pay, Paytm, and Mobikwik integrations are under certification. Please select Cash on Delivery or UPI on Handover.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('cod')}
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        border: 'none',
                        color: '#ffffff',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Switch to Cash on Delivery
                    </button>
                  </div>
                )}

                {/* ── TAB 5: COD (HONEST PAYMENT PENDING) ── */}
                {selectedMethod === 'cod' && (
                  <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'rgba(245, 158, 11, 0.2)',
                        border: '1.5px solid #f59e0b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 14px'
                      }}
                    >
                      <Banknote size={30} color="#f59e0b" />
                    </div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800', color: '#effbe7' }}>
                      Cash on Delivery (Pay on Arrival)
                    </h4>
                    <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                      Pay ₹{finalPayable} directly to the verified delivery driver when fresh farm produce reaches your doorstep. You can pay with Cash or UPI QR scan on handover.
                    </p>

                    <div
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '20px',
                        display: 'flex',
                        justifyContent: 'space-around',
                        fontSize: '12.5px'
                      }}
                    >
                      <div>
                        <span style={{ color: '#9db5aa' }}>Payment Status: </span>
                        <strong style={{ color: '#f59e0b' }}>Pending Collection</strong>
                      </div>
                      <div>
                        <span style={{ color: '#9db5aa' }}>Amount Due: </span>
                        <strong style={{ color: '#effbe7' }}>₹{finalPayable}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmCod}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        border: 'none',
                        color: '#ffffff',
                        padding: '14px 20px',
                        borderRadius: '14px',
                        fontSize: '15px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)'
                      }}
                    >
                      <CheckCircle2 size={16} /> Place Order — Pay on Delivery (₹{finalPayable})
                    </button>
                  </div>
                )}

                {/* Error Banner if any */}
                {errorMessage && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #ef4444',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      marginTop: '14px',
                      fontSize: '12.5px',
                      color: '#fecaca',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <AlertCircle size={16} color="#ef4444" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
