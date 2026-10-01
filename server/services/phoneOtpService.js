const crypto = require('crypto');
const sendSms = require('../utils/sendSms');

// In-memory OTP storage keyed by normalized phone number
// Stored format: { hash, expiresAt, attempts, lastSentAt, windowStartedAt, requestCount, purpose, verified }
const otpStore = new Map();

// Configuration constants
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_REQUESTS_PER_HOUR = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Normalizes Indian and international phone numbers to E.164 standard (+91XXXXXXXXXX)
 * @param {string|number} phone
 * @returns {string|null} Normalized phone number or null if invalid
 */
const normalizePhoneNumber = (phone) => {
  if (!phone) return null;
  const cleaned = String(phone).replace(/[\s\-().]/g, '').trim();

  // 10-digit Indian mobile number (starts with 6, 7, 8, 9)
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  // 11-digit starting with 0
  if (/^0[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned.slice(1)}`;
  }

  // 12-digit starting with 91
  if (/^91[6-9]\d{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  // Already prefixed with +91
  if (/^\+91[6-9]\d{9}$/.test(cleaned)) {
    return cleaned;
  }

  // General valid international E.164 (+ followed by 8 to 15 digits)
  if (/^\+[1-9]\d{7,14}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
};

/**
 * Masks a phone number for secure client-facing display (e.g. +91 ******4567)
 */
const maskPhoneNumber = (phone) => {
  const norm = normalizePhoneNumber(phone);
  if (!norm) return '******';
  const prefix = norm.slice(0, 3); // e.g. +91
  const suffix = norm.slice(-4);
  return `${prefix} ******${suffix}`;
};

/**
 * Securely hashes an OTP using HMAC-SHA256
 */
const getOtpPepper = () => {
  return process.env.RESET_OTP_PEPPER || process.env.JWT_SECRET || 'agrilink_phone_otp_pepper_2026';
};

const hashOtp = (otp) => {
  return crypto.createHmac('sha256', getOtpPepper()).update(String(otp).trim()).digest('hex');
};

/**
 * Generate a cryptographically secure 6-digit numeric OTP code
 */
const generateSecureOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Determine current OTP operation mode
 */
const getOtpMode = () => {
  const envMode = (process.env.PHONE_OTP_MODE || '').toLowerCase();
  if (envMode === 'demo') return 'demo';
  if (envMode === 'production') return 'production';
  return process.env.NODE_ENV === 'production' ? 'production' : 'demo';
};

/**
 * Request / Send a new Phone OTP
 */
const requestPhoneOtp = async ({ phone, purpose = 'authentication' }) => {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) {
    return {
      success: false,
      statusCode: 400,
      message: 'Invalid mobile number. Please provide a valid 10-digit Indian phone number or international number.'
    };
  }

  const now = Date.now();
  const existing = otpStore.get(normalized);

  // 1. Enforce 60s Resend Cooldown
  if (existing?.lastSentAt) {
    const elapsed = now - existing.lastSentAt;
    if (elapsed < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      return {
        success: false,
        statusCode: 429,
        resendAvailableInSeconds: waitSeconds,
        message: `Please wait ${waitSeconds} second(s) before requesting another verification code.`
      };
    }
  }

  // 2. Enforce Hourly Rate Limit
  let windowStartedAt = existing?.windowStartedAt || now;
  let requestCount = existing?.requestCount || 0;
  if (now - windowStartedAt > RATE_LIMIT_WINDOW_MS) {
    windowStartedAt = now;
    requestCount = 0;
  }
  if (requestCount >= MAX_REQUESTS_PER_HOUR) {
    return {
      success: false,
      statusCode: 429,
      message: 'Too many OTP requests for this phone number. Please try again in an hour.'
    };
  }

  // 3. Generate Cryptographically Secure OTP
  const otp = generateSecureOtp();
  const expiresAt = now + OTP_TTL_MS;

  // 4. Update In-Memory Store
  otpStore.set(normalized, {
    hash: hashOtp(otp),
    expiresAt,
    attempts: 0,
    lastSentAt: now,
    windowStartedAt,
    requestCount: requestCount + 1,
    purpose,
    verified: false
  });

  const mode = getOtpMode();

  // 5. Handle Delivery
  if (mode === 'demo') {
    // Demo / Development Mode: Protected console logging
    console.log(`\n======================================================`);
    console.log(`📱 [PHONE OTP DEMO MODE] Dispatched to: ${maskPhoneNumber(normalized)}`);
    console.log(`🔑 Verification Code: [DISPATCHED TO RECIPIENT - HIDDEN FOR SECURITY]`);
    console.log(`⏱️ Valid for 5 minutes (Purpose: ${purpose})`);
    console.log(`======================================================\n`);

    const response = {
      success: true,
      statusCode: 200,
      mode: 'demo',
      phone: maskPhoneNumber(normalized),
      rawPhone: normalized,
      expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
      resendAvailableInSeconds: Math.floor(RESEND_COOLDOWN_MS / 1000),
      message: `[DEMO MODE] Verification code generated for ${maskPhoneNumber(normalized)}.`
    };

    // Attach demoOtp only if explicitly outside production
    if (process.env.NODE_ENV !== 'production') {
      response.demoOtp = otp;
    }

    return response;
  }

  // Production Mode: Dispatch via SMS Provider
  try {
    const smsMessage = `[AgriLink] Your security verification code is ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;
    await sendSms({
      to: normalized,
      body: smsMessage,
      otp,
      purpose
    });

    console.log(`✅ [PHONE OTP DISPATCHED] Real SMS delivered to ${maskPhoneNumber(normalized)}`);

    return {
      success: true,
      statusCode: 200,
      mode: 'production',
      phone: maskPhoneNumber(normalized),
      rawPhone: normalized,
      expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
      resendAvailableInSeconds: Math.floor(RESEND_COOLDOWN_MS / 1000),
      message: `Verification code sent via SMS to ${maskPhoneNumber(normalized)}.`
    };
  } catch (smsError) {
    // If SMS delivery failed, roll back the OTP so the user isn't locked out by cooldown
    otpStore.delete(normalized);
    console.error(`❌ [PHONE OTP DISPATCH ERROR] Failed to send SMS to ${maskPhoneNumber(normalized)}:`, smsError.message);

    return {
      success: false,
      statusCode: 502,
      message: `Failed to deliver SMS verification code: ${smsError.message}`
    };
  }
};

/**
 * Verify a submitted Phone OTP
 */
const verifyPhoneOtp = async ({ phone, otp, purpose }) => {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) {
    return {
      verified: false,
      statusCode: 400,
      message: 'Invalid mobile number format.'
    };
  }

  const record = otpStore.get(normalized);
  if (!record) {
    return {
      verified: false,
      statusCode: 400,
      message: 'No active OTP found for this phone number. Please request a new verification code.'
    };
  }

  const now = Date.now();

  // 1. Expiry Check
  if (now > record.expiresAt) {
    otpStore.delete(normalized);
    return {
      verified: false,
      statusCode: 400,
      message: 'The verification code has expired. Please request a new code.'
    };
  }

  // 2. Max Attempts Check
  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    otpStore.delete(normalized);
    return {
      verified: false,
      statusCode: 429,
      message: 'Too many incorrect attempts. This OTP has been invalidated. Please request a new code.'
    };
  }

  // 3. Timing-Safe Hash Comparison
  const submittedHash = hashOtp(String(otp).trim());
  const subBuf = Buffer.from(submittedHash);
  const storedBuf = Buffer.from(record.hash);

  const isMatch = subBuf.length === storedBuf.length && crypto.timingSafeEqual(subBuf, storedBuf);

  if (!isMatch) {
    record.attempts += 1;
    const remaining = MAX_VERIFY_ATTEMPTS - record.attempts;

    if (remaining <= 0) {
      otpStore.delete(normalized);
      return {
        verified: false,
        statusCode: 429,
        message: 'Too many incorrect attempts. This OTP has been invalidated. Please request a new code.'
      };
    }

    return {
      verified: false,
      statusCode: 400,
      remainingAttempts: remaining,
      message: `Incorrect verification code. ${remaining} attempt(s) remaining.`
    };
  }

  // 4. Success: Invalidate OTP so it cannot be reused
  otpStore.delete(normalized);

  // Generate a signed verification token (valid for 15 minutes) to prove phone ownership in downstream flows
  const verificationProof = crypto.createHmac('sha256', getOtpPepper())
    .update(`${normalized}_${now}`)
    .digest('hex');

  return {
    verified: true,
    statusCode: 200,
    phone: normalized,
    verificationToken: `${normalized}:${now}:${verificationProof}`,
    message: 'Mobile number verified successfully!'
  };
};

/**
 * Validate a verification token issued upon successful OTP verification
 */
const validateVerificationToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split(':');
  if (parts.length !== 3) return null;

  const [phone, timestampStr, proof] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return null;

  // Max 15 minutes validity
  if (Date.now() - timestamp > 15 * 60 * 1000) return null;

  const expectedProof = crypto.createHmac('sha256', getOtpPepper())
    .update(`${phone}_${timestamp}`)
    .digest('hex');

  const pBuf = Buffer.from(proof);
  const eBuf = Buffer.from(expectedProof);
  if (pBuf.length !== eBuf.length || !crypto.timingSafeEqual(pBuf, eBuf)) return null;

  return phone;
};

// Helper for testing: clear store
const _clearOtpStoreForTests = () => {
  otpStore.clear();
};

module.exports = {
  normalizePhoneNumber,
  maskPhoneNumber,
  requestPhoneOtp,
  verifyPhoneOtp,
  requestOtp: requestPhoneOtp,
  verifyOtp: verifyPhoneOtp,
  validateVerificationToken,
  _clearOtpStoreForTests
};
