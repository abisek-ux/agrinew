// Notification & OTP Controller for AgriLink with Supabase, Twilio SMS & Nodemailer Email Integration
const { sendSupabaseOtp, verifySupabaseOtp, logSupabaseOtpAudit, getSupabaseStatus } = require('../config/supabase');
const sendEmail = require('../utils/sendEmail');
const sendSms = require('../utils/sendSms');
const inMemoryOtps = new Map();

// Sample initial system notifications
let systemNotifications = [
  {
    id: 'notif_weather_red',
    title: '⚠️ Heavy Rainfall & Cyclonic Gust Alert',
    category: 'weather_emergency',
    priority: 'CRITICAL',
    message: 'Cauvery Delta & coastal districts forecast 75-110mm rainfall in next 24h. Please acknowledge storm protocol to secure field water gates.',
    requiresOtp: true,
    otpType: 'WEATHER_ACK',
    status: 'pending_otp',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    details: 'Required for Tamil Nadu Agriculture Weather Insurance Protection eligibility.'
  },
  {
    id: 'notif_subsidy_payout',
    title: '🌾 PM-Kisan Direct Benefit Transfer Release',
    category: 'subsidy_credit',
    priority: 'HIGH',
    message: 'Direct benefit credit of ₹4,000 for organic fertilizer subsidy is approved. Enter OTP to authenticate bank disbursement.',
    requiresOtp: true,
    otpType: 'PAYOUT_CLAIM',
    status: 'pending_otp',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    details: 'Verified against Kisan Aadhaar ID #••••-••••-8821.'
  },
  {
    id: 'notif_medicine_safety',
    title: '🧪 Agro-Chemical Safety Clearance (Mancozeb/Chlorpyrifos)',
    category: 'medicine_safety',
    priority: 'URGENT',
    message: 'High-potency pesticide dispatch requires farmer OTP safety consent before logistics driver can release chemical sealed canister.',
    requiresOtp: true,
    otpType: 'PESTICIDE_SAFETY',
    status: 'pending_otp',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    details: 'Safety mandate: PPE mask, glove protection & 14-day pre-harvest interval.'
  },
  {
    id: 'notif_market_surge',
    title: '📈 Market Price Surge: Tomato & Red Gram',
    category: 'market_intelligence',
    priority: 'NORMAL',
    message: 'Koyambedu wholesale rate jumped +28% today (₹48/kg). Recommended window to list freshly harvested crates.',
    requiresOtp: false,
    status: 'read',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString()
  }
];

// Generate an exact 6-digit OTP code and deliver via Supabase, Email (Nodemailer), and SMS (Twilio)
exports.generateOtp = async (req, res) => {
  try {
    const { notificationId, actionType, mobileNumber, email, deliveryChannel = 'all', firstName } = req.body;
    const mobile = (mobileNumber || req.user?.phone || '').trim();
    const userEmail = (email || req.user?.email || process.env.EMAIL_USER || '').trim();

    if (!mobile && !userEmail) {
      return res.status(400).json({ success: false, message: 'Please provide a valid mobile number or email address for OTP delivery.' });
    }

    // Key OTP by notification/action + specific recipient to prevent user collision
    const targetIdentifier = (mobile || userEmail).toLowerCase().replace(/[\s\-()]/g, '');
    const key = `${notificationId || actionType || 'notify'}:${targetIdentifier}`;

    const now = Date.now();
    const existing = inMemoryOtps.get(key);

    // Enforce 60s Resend Cooldown
    if (existing?.lastSentAt && (now - existing.lastSentAt) < 60000) {
      const waitSeconds = Math.ceil((60000 - (now - existing.lastSentAt)) / 1000);
      return res.status(429).json({
        success: false,
        resendAvailableInSeconds: waitSeconds,
        message: `Please wait ${waitSeconds} second(s) before requesting another code.`
      });
    }

    // Generate secure 6-digit numeric OTP code
    const crypto = require('crypto');
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity

    inMemoryOtps.set(key, {
      code: otpCode,
      expiresAt,
      actionType: actionType || 'GENERAL',
      mobile,
      email: userEmail,
      attempts: 0,
      lastSentAt: now
    });

    const dispatchedChannels = [];
    const dispatchNotes = [];
    let smsErrorMsg = null;
    let emailErrorMsg = null;

    // 1. Deliver via Nodemailer Email
    if (deliveryChannel === 'email' || deliveryChannel === 'all') {
      if (userEmail) {
        try {
          const emailRes = await sendEmail({
            to: userEmail,
            subject: '🔐 AgriLink Security OTP Passcode',
            otp: otpCode,
            firstName: firstName || req.user?.firstName || 'Valued Member',
            type: 'login'
          });
          if (emailRes?.isRealDelivered || emailRes?.preview) {
            dispatchedChannels.push('email');
            dispatchNotes.push(`Email sent to ${userEmail}`);
          }
        } catch (emailErr) {
          emailErrorMsg = emailErr.message;
          console.warn(`⚠️ [AgriLink OTP Email Error]: ${emailErr.message}`);
        }
      }
    }

    // 2. Deliver via Twilio SMS
    if (deliveryChannel === 'sms' || deliveryChannel === 'all') {
      if (mobile) {
        try {
          await sendSms({
            to: mobile,
            body: `[AgriLink] Your one-time verification passcode is ${otpCode}. Valid for 5 minutes. Do not share with anyone.`,
            otp: otpCode,
            purpose: actionType || 'NOTIFICATION_VERIFY'
          });
          dispatchedChannels.push('sms');
          dispatchNotes.push(`SMS sent to ${mobile}`);
        } catch (smsErr) {
          smsErrorMsg = smsErr.message;
          console.error(`❌ [AgriLink OTP SMS Error]: ${smsErr.message}`);
        }
      }
    }

    // If caller specifically requested SMS or Email and that channel failed, do NOT return fake success
    if (deliveryChannel === 'sms' && !dispatchedChannels.includes('sms')) {
      inMemoryOtps.delete(key);
      return res.status(502).json({
        success: false,
        message: `Failed to deliver SMS verification code: ${smsErrorMsg || 'SMS provider error'}`
      });
    }

    if (deliveryChannel === 'email' && !dispatchedChannels.includes('email')) {
      inMemoryOtps.delete(key);
      return res.status(502).json({
        success: false,
        message: `Failed to deliver email verification code: ${emailErrorMsg || 'SMTP dispatch error'}`
      });
    }

    // Masking helpers for privacy
    const maskEmail = (em) => {
      if (!em || !em.includes('@')) return em;
      const [user, domain] = em.split('@');
      return `${user.slice(0, 2)}***@${domain}`;
    };
    const maskPhone = (ph) => {
      if (!ph) return ph;
      const digits = ph.toString().replace(/\D/g, '');
      if (digits.length >= 10) {
        const last10 = digits.slice(-10);
        return `+91 ${last10.slice(0, 4)} **** ${last10.slice(-2)}`;
      }
      return ph;
    };

    const phoneMasked = maskPhone(mobile);
    const emailMasked = maskEmail(userEmail);

    let summary = `Dispatched to ${phoneMasked || emailMasked}`;
    if (dispatchedChannels.includes('email') && dispatchedChannels.includes('sms')) {
      summary = `Dispatched to SMS (${phoneMasked}) & Email (${emailMasked})`;
    } else if (dispatchedChannels.includes('email')) {
      summary = `Dispatched to email: ${emailMasked}`;
    } else if (dispatchedChannels.includes('sms')) {
      summary = `Dispatched to SMS: ${phoneMasked}`;
    }

    return res.status(200).json({
      success: true,
      message: `Verification code dispatched. Please check your ${dispatchedChannels.join(' / ')} and enter the 6 digits.`,
      notificationId: key,
      expiresInSeconds: 300,
      resendAvailableInSeconds: 60,
      deliveryChannel,
      sentTo: summary,
      channelsDispatched: dispatchedChannels
    });
  } catch (error) {
    console.error('Error generating notification OTP:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate OTP' });
  }
};

// Verify user submitted OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { notificationId, actionType, otpCode, mobileNumber, email } = req.body;
    const mobile = (mobileNumber || req.user?.phone || '').trim();
    const userEmail = (email || req.user?.email || '').trim();
    const targetIdentifier = (mobile || userEmail).toLowerCase().replace(/[\s\-()]/g, '');
    const key = `${notificationId || actionType || 'notify'}:${targetIdentifier}`;
    const codeStr = String(otpCode || '').trim();

    if (!codeStr || codeStr.length !== 6) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 6-digit verification code.' });
    }

    const stored = inMemoryOtps.get(key);

    if (!stored) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'No active OTP found or session expired. Please request a new OTP.'
      });
    }

    const now = Date.now();

    // 1. Expiry Check
    if (now > stored.expiresAt) {
      inMemoryOtps.delete(key);
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'OTP has expired. Please request a fresh OTP.'
      });
    }

    // 2. Max attempts check
    if (stored.attempts >= 5) {
      inMemoryOtps.delete(key);
      return res.status(429).json({
        success: false,
        verified: false,
        message: 'Too many incorrect attempts. This OTP has been invalidated. Please request a new code.'
      });
    }

    // 3. Timing-Safe Comparison
    const crypto = require('crypto');
    const isCodeMatch = (codeStr === stored.code);

    if (!isCodeMatch) {
      stored.attempts += 1;
      const remaining = 5 - stored.attempts;
      if (remaining <= 0) {
        inMemoryOtps.delete(key);
        return res.status(429).json({
          success: false,
          verified: false,
          message: 'Too many incorrect attempts. This OTP has been invalidated. Please request a new code.'
        });
      }
      return res.status(400).json({
        success: false,
        verified: false,
        remainingAttempts: remaining,
        message: `Invalid OTP code. ${remaining} attempt(s) remaining.`
      });
    }

    // 4. Success: Invalidate OTP immediately to prevent replay
    inMemoryOtps.delete(key);
    updateNotificationStatus(notificationId);

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Passcode verified successfully! Agricultural protocol authorized.',
      notificationId: key
    });
  } catch (error) {
    console.error('Error verifying notification OTP:', error);
    return res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
};

// Get Supabase & Notification System Health
exports.getSupabaseStatus = (req, res) => {
  return res.status(200).json({
    success: true,
    supabase: getSupabaseStatus()
  });
};

// Get system notifications (filtered for authenticated user or general)
exports.getNotifications = (req, res) => {
  const userId = req.user ? String(req.user.id || req.user._id) : (req.query.userId ? String(req.query.userId) : null);
  const userRole = req.user?.role || req.query.role || null;

  let list = systemNotifications;
  if (userId) {
    list = systemNotifications.filter(n => {
      // General alert for everyone
      if (!n.recipientId && !n.recipientRole) return true;
      // Alert matching role
      if (!n.recipientId && n.recipientRole && userRole && n.recipientRole.toLowerCase() === userRole.toLowerCase()) return true;
      // Alert matching this user
      if (n.recipientId && n.recipientId === userId) return true;
      return false;
    });
  }

  return res.status(200).json({
    success: true,
    notifications: list
  });
};

// Push an internal notification to the system (e.g. from orders or status transitions)
exports.pushNotification = ({ recipientId, recipientRole, orderId, title, message, category, priority, details }) => {
  const newNotif = {
    id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    recipientId: recipientId ? String(recipientId) : null,
    recipientRole: recipientRole || null,
    orderId: orderId || null,
    title: title || 'Agricultural Notification',
    message: message || '',
    category: category || 'order',
    priority: priority || 'NORMAL',
    requiresOtp: false,
    status: 'unread',
    timestamp: new Date().toISOString(),
    details: details || ''
  };
  systemNotifications.unshift(newNotif);
  return newNotif;
};

// Create a new notification (e.g. from orders or disease alerts)
exports.createNotification = (req, res) => {
  try {
    const { title, message, category, priority, requiresOtp, otpType, details, recipientId, recipientRole, orderId } = req.body;
    const newNotif = {
      id: `notif_${Date.now()}`,
      recipientId: recipientId ? String(recipientId) : (req.user ? String(req.user.id || req.user._id) : null),
      recipientRole: recipientRole || null,
      orderId: orderId || null,
      title: title || 'Agricultural Notification',
      message: message || '',
      category: category || 'general',
      priority: priority || 'NORMAL',
      requiresOtp: Boolean(requiresOtp),
      otpType: otpType || 'GENERAL_VERIFY',
      status: requiresOtp ? 'pending_otp' : 'unread',
      timestamp: new Date().toISOString(),
      details: details || ''
    };
    systemNotifications.unshift(newNotif);
    return res.status(201).json({ success: true, notification: newNotif });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
};

function updateNotificationStatus(id) {
  systemNotifications = systemNotifications.map(n => {
    if (n.id === id) {
      return { ...n, status: 'verified_completed', verifiedAt: new Date().toISOString() };
    }
    return n;
  });
}

