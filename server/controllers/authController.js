const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const { getMemoryProducts } = require('./productController');
const generateToken = require('../utils/generateToken');
const { isConnected } = require('../config/db');
const sendSms = require('../utils/sendSms');
const sendEmail = require('../utils/sendEmail');
const {
  normalizePhoneNumber,
  maskPhoneNumber,
  requestPhoneOtp,
  verifyPhoneOtp,
  validateVerificationToken
} = require('../services/phoneOtpService');

const memoryUsersFile = path.join(__dirname, '../data/users.json');
const OTP_TTL_MINUTES = Number(process.env.PASSWORD_RESET_OTP_TTL_MINUTES || 10);
const RESEND_COOLDOWN_SECONDS = Number(process.env.PASSWORD_RESET_RESEND_COOLDOWN_SECONDS || 60);
const MAX_OTP_REQUESTS_PER_HOUR = Number(process.env.PASSWORD_RESET_MAX_REQUESTS_PER_HOUR || 5);
const MAX_OTP_VERIFY_ATTEMPTS = Number(process.env.PASSWORD_RESET_MAX_VERIFY_ATTEMPTS || 5);
const memoryUsers = (() => { try { return JSON.parse(fs.readFileSync(memoryUsersFile, 'utf8')); } catch { return []; } })();
const saveMemoryUsers = () => { fs.mkdirSync(path.dirname(memoryUsersFile), { recursive: true }); fs.writeFileSync(memoryUsersFile, JSON.stringify(memoryUsers, null, 2)); };
const findMemoryUser = (identifier) => memoryUsers.find((user) => user.email === identifier || user.phone === identifier);
const findMemoryUserById = (id) => memoryUsers.find((user) => String(user.id) === String(id) || String(user._id) === String(id));
const validPassword = (password) => typeof password === 'string' && password.length >= 8;
const validOtp = (otp) => typeof otp === 'string' && /^\d{6}$/.test(otp);
const normalizePhone = (phone) => {
  if (!phone) return '';
  const cleaned = String(phone).replace(/[\s\-()]/g, '');
  if (/^\+[1-9]\d{7,14}$/.test(cleaned)) return cleaned;
  if (/^\d{10}$/.test(cleaned)) return `+91${cleaned}`;
  if (/^\d{11,15}$/.test(cleaned)) return `+${cleaned}`;
  return cleaned;
};
const validPhone = (phone) => {
  const norm = normalizePhone(phone);
  return /^\+[1-9]\d{7,14}$/.test(norm);
};
const maskPhone = (phone) => {
  const p = String(phone || '');
  return p.length >= 4 ? `******${p.slice(-4)}` : '******';
};
const formatLockDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatUserResponse = (user, token) => {
  const isLocked = Boolean(user.profileModificationLockedUntil && new Date() < new Date(user.profileModificationLockedUntil));
  const remainingDays = isLocked
    ? Math.max(1, Math.ceil((new Date(user.profileModificationLockedUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    _id: user._id || user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
    email: user.email,
    phone: user.phone,
    role: user.role,
    nativePlace: user.nativePlace,
    farmName: user.farmName || '',
    description: user.description || '',
    avatar: user.avatar || '',
    deliveryAddress: user.deliveryAddress || '',
    city: user.city || '',
    state: user.state || '',
    pincode: user.pincode || '',
    vehicleType: user.vehicleType || '',
    vehicleNumber: user.vehicleNumber || '',
    serviceArea: user.serviceArea || '',
    isVerified: Boolean(user.isVerified),
    location: user.location,
    wishlist: user.wishlist || [],
    lastProfileModifiedAt: user.lastProfileModifiedAt || null,
    profileModificationLockedUntil: user.profileModificationLockedUntil || null,
    isProfileLocked: isLocked,
    profileLockRemainingDays: remainingDays,
    token
  };
};

const otpPepper = () => {
  return process.env.RESET_OTP_PEPPER || process.env.JWT_SECRET || 'agrilink_secret_otp_pepper_2026';
};
const hashOtp = (otp) => crypto.createHmac('sha256', otpPepper()).update(otp).digest('hex');
const clearOtp = (user) => {
  user.resetOtpHash = null;
  user.resetOtpExpiresAt = null;
  user.resetOtpAttempts = 0;
};
const persistUser = async (user) => {
  if (isConnected()) {
    try {
      await user.save();
    } catch (saveErr) {
      console.warn('⚠️ user.save() notice, applying direct updateOne:', saveErr.message);
      const updateData = {
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        phone: user.phone,
        email: user.email,
        nativePlace: user.nativePlace,
        farmName: user.farmName,
        description: user.description,
        avatar: user.avatar,
        deliveryAddress: user.deliveryAddress,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        vehicleType: user.vehicleType,
        vehicleNumber: user.vehicleNumber,
        serviceArea: user.serviceArea,
        location: user.location,
        wishlist: user.wishlist,
        lastProfileModifiedAt: user.lastProfileModifiedAt,
        profileModificationLockedUntil: user.profileModificationLockedUntil,
        pendingEmailChange: user.pendingEmailChange,
        pendingEmailOtpHash: user.pendingEmailOtpHash,
        pendingEmailOtpExpiresAt: user.pendingEmailOtpExpiresAt,
        pendingEmailOtpAttempts: user.pendingEmailOtpAttempts,
        pendingEmailOtpLastSentAt: user.pendingEmailOtpLastSentAt,
        resetOtpHash: user.resetOtpHash,
        resetOtpExpiresAt: user.resetOtpExpiresAt,
        resetOtpAttempts: user.resetOtpAttempts,
        resetOtpLastSentAt: user.resetOtpLastSentAt,
        resetOtpRequestWindowStartedAt: user.resetOtpRequestWindowStartedAt,
        resetOtpRequestCount: user.resetOtpRequestCount,
        password: user.password
      };
      await User.updateOne({ _id: user._id }, { $set: updateData });
    }
  } else {
    saveMemoryUsers();
  }
};
const lookupUser = async (identifier) => {
  if (!identifier) return null;
  const clean = String(identifier).trim().toLowerCase();
  const rawDigits = String(identifier).replace(/\D/g, '');
  const cleanPhone = normalizePhone(identifier);
  const raw10 = rawDigits.length >= 10 ? rawDigits.slice(-10) : '';

  const phoneVariants = Array.from(new Set([
    identifier.trim(),
    clean,
    cleanPhone,
    rawDigits,
    raw10,
    raw10 ? `+91${raw10}` : '',
    raw10 ? `0${raw10}` : '',
    raw10 ? `91${raw10}` : ''
  ].filter(Boolean)));

  if (isConnected()) {
    try {
      const dbUser = await User.findOne({
        $or: [
          { email: clean },
          { phone: { $in: phoneVariants } }
        ]
      });
      if (dbUser) return dbUser;
    } catch (dbErr) {
      console.warn('MongoDB lookup notice, checking memory fallback:', dbErr.message);
    }
  }

  return memoryUsers.find((user) => {
    const userEmail = (user.email || '').toLowerCase().trim();
    if (userEmail === clean) return true;
    const userPhone = String(user.phone || '').trim();
    const userPhoneNorm = normalizePhone(userPhone);
    const userRawDigits = userPhone.replace(/\D/g, '');
    const userRaw10 = userRawDigits.length >= 10 ? userRawDigits.slice(-10) : '';

    return phoneVariants.some(v =>
      v === userPhone ||
      v === userPhoneNorm ||
      (raw10 && raw10 === userRaw10)
    );
  });
};


const registrationOtps = new Map();

/**
 * Dedicated Phone OTP Request Endpoint Handler
 * POST /api/auth/phone-otp/request
 */
const requestPhoneOtpHandler = async (req, res) => {
  try {
    const { phone, purpose = 'authentication' } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone number.' });
    }
    const result = await requestPhoneOtp({ phone, purpose });
    return res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error('Phone OTP request handler error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to process phone OTP request' });
  }
};

/**
 * Dedicated Phone OTP Verify Endpoint Handler
 * POST /api/auth/phone-otp/verify
 */
const verifyPhoneOtpHandler = async (req, res) => {
  try {
    const { phone, otp, purpose = 'authentication' } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone number and 6-digit verification code are required.' });
    }
    const result = await verifyPhoneOtp({ phone, otp, purpose });
    return res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error('Phone OTP verify handler error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to verify phone OTP' });
  }
};

const sendRegisterOtp = async (req, res) => {
  try {
    const { email, firstName } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Provide a valid email address' });
    }
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await lookupUser(cleanEmail);
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists. Please Sign In.' });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    registrationOtps.set(cleanEmail, {
      hash: hashOtp(otp),
      expiresAt,
      attempts: 0,
      verified: false
    });

    let emailSent = false;
    let emailErrorMsg = null;

    try {
      const emailResult = await sendEmail({
        to: cleanEmail,
        subject: '🔐 AgriLink Account Registration OTP Verification Code',
        otp,
        firstName: firstName || 'Valued Member',
        type: 'login'
      });
      emailSent = Boolean(emailResult?.isRealDelivered);
      if (emailSent) {
        console.log(`✅ [REGISTRATION OTP SENT] Real email dispatched to ${cleanEmail}`);
      } else {
        emailErrorMsg = emailResult?.error || 'Email dispatch failed';
        console.warn(`⚠️ [REGISTRATION OTP EMAIL FAILED]: ${emailErrorMsg}`);
      }
    } catch (err) {
      emailErrorMsg = err.message;
      console.warn(`⚠️ [REGISTRATION OTP EMAIL ERROR]: ${err.message}`);
    }

    if (!emailSent) {
      registrationOtps.delete(cleanEmail);
      return res.status(500).json({
        success: false,
        message: emailErrorMsg
          ? `Could not send verification email: ${emailErrorMsg}`
          : `Could not send verification code to ${cleanEmail}. Please check your email address and try again.`
      });
    }

    console.log(`\n======================================================`);
    console.log(`🔑 [REGISTRATION EMAIL OTP] Verification code dispatched to ${cleanEmail}`);
    console.log(`======================================================\n`);

    return res.json({
      success: true,
      emailSent: true,
      maskedEmail: maskEmail(cleanEmail),
      expiresInSeconds: 600,
      message: `Verification code sent to your email (${cleanEmail}). Please check your inbox.`
    });
  } catch (error) {
    console.error('Send registration OTP error:', error.message);
    return res.status(500).json({ message: 'Unable to send registration OTP' });
  }
};

const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and 6-digit OTP code are required' });
    }
    const cleanEmail = email.toLowerCase().trim();
    const record = registrationOtps.get(cleanEmail);

    if (!record) {
      return res.status(400).json({ message: 'No OTP requested for this email. Please request a new verification code.' });
    }

    if (Date.now() > record.expiresAt) {
      registrationOtps.delete(cleanEmail);
      return res.status(400).json({ message: 'OTP has expired. Please request a new code.' });
    }

    if (record.attempts >= 5) {
      registrationOtps.delete(cleanEmail);
      return res.status(429).json({ message: 'Too many incorrect attempts. Please request a new code.' });
    }

    const submittedHash = hashOtp(String(otp).trim());
    const subBuf = Buffer.from(submittedHash);
    const storedBuf = Buffer.from(record.hash);

    const isMatch = subBuf.length === storedBuf.length && crypto.timingSafeEqual(subBuf, storedBuf);

    if (!isMatch) {
      record.attempts += 1;
      return res.status(400).json({ message: 'Incorrect OTP verification code. Please check your email.' });
    }

    record.verified = true;
    return res.json({
      success: true,
      verified: true,
      message: 'Email successfully verified!'
    });
  } catch (error) {
    console.error('Verify registration OTP error:', error.message);
    return res.status(500).json({ message: 'Unable to verify registration OTP' });
  }
};

const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      nativePlace,
      location,
      emailOtp,
      phoneVerificationToken,
      farmName,
      vehicleType,
      vehicleNumber,
      serviceArea,
      deliveryAddress,
      city,
      state,
      pincode
    } = req.body;
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();
    const normalizedPhone = normalizePhoneNumber(cleanPhone) || cleanPhone;

    // Verify OTP via Phone Verification Token OR Email OTP
    let isVerified = false;
    if (phoneVerificationToken) {
      const tokenPhone = validateVerificationToken(phoneVerificationToken);
      if (tokenPhone && (tokenPhone === cleanPhone || tokenPhone === normalizedPhone)) {
        isVerified = true;
      } else {
        return res.status(400).json({ message: 'Invalid or expired phone verification token. Please verify your phone number.' });
      }
    } else if (emailOtp) {
      const otpRecord = registrationOtps.get(cleanEmail);
      const submittedHash = hashOtp(String(emailOtp).trim());
      const subBuf = Buffer.from(submittedHash);
      const storedBuf = otpRecord ? Buffer.from(otpRecord.hash) : null;
      const isMatch = storedBuf && subBuf.length === storedBuf.length && crypto.timingSafeEqual(subBuf, storedBuf);
      if (isMatch || otpRecord?.verified) {
        isVerified = true;
      } else {
        return res.status(400).json({ message: 'Invalid or unverified Email OTP. Please check your code.' });
      }
    } else {
      const otpRecord = registrationOtps.get(cleanEmail);
      if (otpRecord?.verified) {
        isVerified = true;
      }
    }

    const ALLOWED_REGISTER_ROLES = ['customer', 'farmer', 'delivery'];
    let userRole = typeof role === 'string' ? role.trim().toLowerCase() : 'customer';
    if (!ALLOWED_REGISTER_ROLES.includes(userRole)) {
      userRole = 'customer';
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userLocation = location || { lat: 12.9716, lng: 77.5946, address: deliveryAddress || 'Bengaluru, Karnataka, India', placeName: city || nativePlace || 'Bengaluru, Karnataka' };

    if (isConnected()) {
      if (await User.findOne({ $or: [{ email: cleanEmail }, { phone: cleanPhone }] })) {
        return res.status(400).json({ message: 'User with this email or phone already exists' });
      }
      const user = await User.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName} ${lastName}`.trim(),
        email: cleanEmail,
        phone: normalizedPhone || cleanPhone,
        password: hashedPassword,
        role: userRole,
        nativePlace: nativePlace || city || 'Bengaluru, Karnataka',
        farmName: farmName || '',
        vehicleType: vehicleType || '',
        vehicleNumber: vehicleNumber || '',
        serviceArea: serviceArea || '',
        deliveryAddress: deliveryAddress || '',
        city: city || '',
        state: state || '',
        pincode: pincode || '',
        location: userLocation
      });
      seedMemoryUser({
        ...(user.toObject ? user.toObject() : user),
        id: String(user._id || user.id),
        _id: String(user._id || user.id)
      });
      saveMemoryUsers();
      registrationOtps.delete(cleanEmail);
      return res.status(201).json(formatUserResponse(user, generateToken(user._id, user.role)));
    }

    if (findMemoryUser(cleanEmail) || findMemoryUser(cleanPhone)) {
      return res.status(400).json({ message: 'User with this email or phone already exists' });
    }
    const user = {
      id: `user_${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: `${firstName} ${lastName}`.trim(),
      email: cleanEmail,
      phone: normalizedPhone || cleanPhone,
      password: hashedPassword,
      role: userRole,
      nativePlace: nativePlace || city || 'Bengaluru, Karnataka',
      farmName: farmName || '',
      vehicleType: vehicleType || '',
      vehicleNumber: vehicleNumber || '',
      serviceArea: serviceArea || '',
      deliveryAddress: deliveryAddress || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      location: userLocation
    };
    memoryUsers.push(user);
    saveMemoryUsers();
    registrationOtps.delete(cleanEmail);
    return res.status(201).json(formatUserResponse(user, generateToken(user.id, user.role)));
  } catch (error) {
    console.error('Registration failed:', error.message);
    return res.status(500).json({ message: error.message || 'Unable to create account' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { identifier, password, requiredRole } = req.body;
    if (!identifier || typeof identifier !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Provide Email/Phone and Password' });
    }
    const user = await lookupUser(identifier.trim().toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid Email/Phone or Password' });

    // Strict portal-role isolation: prevent logging into other portals with wrong role
    if (requiredRole && user.role && user.role.toLowerCase() !== requiredRole.toLowerCase()) {
      if (req.body.allowRoleSwitch) {
        return res.json({
          ...formatUserResponse(user, generateToken(user._id || user.id, user.role)),
          switchedRole: true,
          originalRequestedRole: requiredRole
        });
      }
      const userRoleName = user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();
      const reqRoleName = requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1).toLowerCase();
      return res.status(403).json({
        message: `Access Restricted: This account is registered as a ${userRoleName}. You cannot sign in through the ${reqRoleName} Portal. Please switch to the ${userRoleName} Portal.`,
        registeredRole: user.role
      });
    }


    return res.json(formatUserResponse(user, generateToken(user._id || user.id, user.role)));
  } catch (error) {
    console.error('Login failed full error:', error);
    return res.status(500).json({ message: error.message || 'Unable to sign in' });
  }
};

const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email || '';
  const [name, domain] = email.split('@');
  if (name.length <= 2) {
    return `${name[0]}*@${domain}`;
  }
  return `${name.slice(0, 2)}****@${domain}`;
};

const forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return res.status(400).json({ message: 'Enter your registered email address or phone number' });
    }
    const cleanId = identifier.trim().toLowerCase();
    const user = await lookupUser(cleanId);
    if (!user || (!user.email && !user.phone)) {
      return res.status(400).json({ message: 'Unable to find an account with this email or phone number' });
    }
    const now = new Date();

    // Check if identifier is a mobile phone number
    const isPhoneIdentifier = !cleanId.includes('@') && (Boolean(normalizePhoneNumber(cleanId)) || Boolean(user.phone));

    if (isPhoneIdentifier) {
      const targetPhone = user.phone || cleanId;
      const phoneRes = await requestPhoneOtp({ phone: targetPhone, purpose: 'password_reset' });

      if (!phoneRes.success) {
        return res.status(phoneRes.statusCode || 400).json(phoneRes);
      }

      user.resetOtpLastSentAt = now;
      await persistUser(user);

      return res.json({
        success: true,
        deliveryChannel: 'sms',
        maskedPhone: phoneRes.phone,
        targetDestination: phoneRes.phone,
        expiresInSeconds: phoneRes.expiresInSeconds,
        resendAvailableInSeconds: phoneRes.resendAvailableInSeconds,
        smsSent: true,
        mode: phoneRes.mode,
        ...(phoneRes.demoOtp ? { demoOtp: phoneRes.demoOtp } : {}),
        message: phoneRes.message
      });
    }

    // Otherwise deliver via Email
    const lastSent = user.resetOtpLastSentAt && new Date(user.resetOtpLastSentAt);
    const cooldownRemaining = lastSent && RESEND_COOLDOWN_SECONDS - Math.ceil((now - lastSent) / 1000);
    if (cooldownRemaining > 0) return res.status(429).json({ message: `Please wait ${cooldownRemaining} seconds before requesting another code`, resendAvailableInSeconds: cooldownRemaining });
    const windowStartedAt = user.resetOtpRequestWindowStartedAt && new Date(user.resetOtpRequestWindowStartedAt);
    const windowExpired = !windowStartedAt || now - windowStartedAt >= 3600000;
    const requestCount = windowExpired ? 0 : (user.resetOtpRequestCount || 0);
    if (requestCount >= MAX_OTP_REQUESTS_PER_HOUR) return res.status(429).json({ message: 'Too many reset code requests. Please try again later.' });

    const otp = crypto.randomInt(100000, 1000000).toString();
    let emailSent = false;
    let emailErrorMsg = null;
    const targetEmail = user.email || (cleanId.includes('@') ? cleanId : null);
    if (!targetEmail) {
      return res.status(400).json({ message: 'No registered email found for this account. Please provide your registered mobile number or email address.' });
    }

    try {
      const emailResult = await sendEmail({
        to: targetEmail,
        subject: '🔐 AgriLink Password Reset Verification Code',
        otp,
        firstName: user.firstName,
        type: 'reset'
      });
      emailSent = Boolean(emailResult?.isRealDelivered);
      if (emailSent) {
        console.log(`✅ [EMAIL SENT] Password reset OTP delivered to ${targetEmail}`);
      } else {
        emailErrorMsg = emailResult?.error || 'Email dispatch failed';
        console.warn(`⚠️ [EMAIL DISPATCH FAILED]: ${emailErrorMsg}`);
      }
    } catch (emailErr) {
      emailErrorMsg = emailErr.message;
      console.warn(`⚠️ [EMAIL DISPATCH NOTE] ${emailErr.message}`);
    }

    const maskedMail = maskEmail(targetEmail);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: emailErrorMsg
          ? `Could not send password reset email: ${emailErrorMsg}`
          : `Could not send verification code to your registered email (${maskedMail}). Please check your connection and try again.`
      });
    }

    user.resetOtpHash = hashOtp(otp);
    user.resetOtpExpiresAt = new Date(now.getTime() + OTP_TTL_MINUTES * 60000);
    user.resetOtpAttempts = 0;
    user.resetOtpLastSentAt = now;
    user.resetOtpRequestWindowStartedAt = windowExpired ? now : windowStartedAt;
    user.resetOtpRequestCount = requestCount + 1;
    await persistUser(user);

    return res.json({
      success: true,
      deliveryChannel: 'email',
      maskedEmail: maskedMail,
      targetDestination: maskedMail,
      expiresInSeconds: OTP_TTL_MINUTES * 60,
      resendAvailableInSeconds: RESEND_COOLDOWN_SECONDS,
      emailSent: true,
      message: `Verification code sent to your email (${maskedMail}). Please check your inbox.`
    });
  } catch (error) {
    console.error('Password-reset request failed:', error);
    return res.status(500).json({
      message: error.message || 'Unable to process reset request. Please try again later.'
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { identifier, resetToken, newPassword } = req.body;
    if (!identifier || !resetToken || !newPassword) return res.status(400).json({ message: 'Enter your identifier, OTP, and new password' });
    if (!validOtp(resetToken)) return res.status(400).json({ message: 'Enter a valid 6-digit OTP' });
    if (!validPassword(newPassword)) return res.status(400).json({ message: 'New password must be at least 8 characters' });
    const user = await lookupUser(identifier.trim().toLowerCase());
    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP. Request a new code.' });

    let verified = false;

    // Check Phone OTP verification first if identifier or user has phone
    if (!identifier.includes('@') || user.phone) {
      const phoneVerify = await verifyPhoneOtp({
        phone: user.phone || identifier,
        otp: resetToken,
        purpose: 'password_reset'
      });
      if (phoneVerify.verified) {
        verified = true;
      }
    }

    // Check Email OTP verification if not verified via phone
    if (!verified && user.resetOtpHash && user.resetOtpExpiresAt) {
      if (new Date() > new Date(user.resetOtpExpiresAt)) {
        clearOtp(user); await persistUser(user);
        return res.status(400).json({ message: 'OTP has expired. Request a new code.' });
      }
      if ((user.resetOtpAttempts || 0) >= MAX_OTP_VERIFY_ATTEMPTS) {
        clearOtp(user); await persistUser(user);
        return res.status(429).json({ message: 'Too many incorrect OTP attempts. Request a new code.' });
      }
      const submittedHash = hashOtp(resetToken);
      const subBuf = Buffer.from(submittedHash);
      const storedBuf = Buffer.from(user.resetOtpHash);
      const correctOtp = subBuf.length === storedBuf.length && crypto.timingSafeEqual(subBuf, storedBuf);
      if (correctOtp) {
        verified = true;
      } else {
        user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
        const exhausted = user.resetOtpAttempts >= MAX_OTP_VERIFY_ATTEMPTS;
        if (exhausted) clearOtp(user);
        await persistUser(user);
        return res.status(exhausted ? 429 : 400).json({ message: exhausted ? 'Too many incorrect OTP attempts. Request a new code.' : 'Incorrect OTP' });
      }
    }

    if (!verified) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Request a new code.' });
    }

    // Always securely hash password with bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    clearOtp(user);
    await persistUser(user);
    return res.json({ success: true, message: 'Password changed successfully. Please log in with your new password.' });
  } catch (error) {
    console.error('Password reset failed:', error.message);
    return res.status(500).json({ message: 'Unable to reset password' });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { lat, lng, address } = req.body;
    const user = isConnected() ? await User.findById(req.user.id || req.user._id) : memoryUsers.find((item) => item.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.location = { lat, lng, address: address || user.location.address };
    await persistUser(user);
    return res.json({ success: true, location: user.location });
  } catch (error) { console.error('Location update failed:', error.message); return res.status(500).json({ message: 'Unable to update location' }); }
};

const getWishlist = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = isConnected()
      ? await User.findById(userId)
      : findMemoryUserById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, wishlist: user.wishlist || [] });
  } catch (error) {
    console.error('getWishlist error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to retrieve wishlist' });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    const userId = req.user?.id || req.user?._id;
    const user = isConnected()
      ? await User.findById(userId)
      : findMemoryUserById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.wishlist = user.wishlist || [];
    const pIdStr = String(productId);
    const existingIndex = user.wishlist.findIndex(id => String(id) === pIdStr);
    let isSaved = false;

    if (existingIndex >= 0) {
      user.wishlist.splice(existingIndex, 1);
      isSaved = false;
    } else {
      user.wishlist.push(pIdStr);
      isSaved = true;
    }

    await persistUser(user);
    return res.json({
      success: true,
      isSaved,
      wishlist: user.wishlist,
      message: isSaved ? 'Product added to wishlist' : 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('toggleWishlist error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to update wishlist' });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = isConnected()
      ? await User.findById(userId)
      : findMemoryUserById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user: formatUserResponse(user) });
  } catch (error) {
    console.error('getProfile error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to retrieve profile' });
  }
};

const requestProfileEmailOtp = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = isConnected()
      ? await User.findById(userId)
      : findMemoryUserById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Strict 7-day modification lock check
    if (user.profileModificationLockedUntil && new Date() < new Date(user.profileModificationLockedUntil)) {
      const remainingDays = Math.max(1, Math.ceil((new Date(user.profileModificationLockedUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      const dateStr = formatLockDate(user.profileModificationLockedUntil);
      return res.status(403).json({
        success: false,
        locked: true,
        remainingDays,
        lockedUntil: user.profileModificationLockedUntil,
        message: `Profile changes locked. You can edit your profile again in ${remainingDays} days. (Available on: ${dateStr})`
      });
    }

    const { newEmail } = req.body;
    if (!newEmail || typeof newEmail !== 'string' || !newEmail.includes('@') || !newEmail.includes('.')) {
      return res.status(400).json({ success: false, message: 'Provide a valid email address' });
    }

    const cleanNewEmail = newEmail.toLowerCase().trim();
    if (cleanNewEmail === (user.email || '').toLowerCase().trim()) {
      return res.status(400).json({ success: false, message: 'New email must be different from current email address' });
    }

    // Check if new email is already claimed
    const existing = await lookupUser(cleanNewEmail);
    if (existing && String(existing._id || existing.id) !== String(userId)) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists' });
    }

    // 60-second resend cooldown
    if (user.pendingEmailOtpLastSentAt) {
      const elapsedMs = Date.now() - new Date(user.pendingEmailOtpLastSentAt).getTime();
      if (elapsedMs < 60 * 1000) {
        const waitSec = Math.ceil((60 * 1000 - elapsedMs) / 1000);
        return res.status(429).json({
          success: false,
          cooldownRemainingSeconds: waitSec,
          message: `Please wait ${waitSec} seconds before requesting a new verification code`
        });
      }
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.pendingEmailChange = cleanNewEmail;
    user.pendingEmailOtpHash = hashOtp(otp);
    user.pendingEmailOtpExpiresAt = expiresAt;
    user.pendingEmailOtpAttempts = 0;
    user.pendingEmailOtpLastSentAt = new Date();

    let emailSent = false;
    let emailErrorMsg = null;
    try {
      const emailResult = await sendEmail({
        to: cleanNewEmail,
        subject: '🔐 AgriLink Profile Email Verification Code',
        otp,
        firstName: user.firstName || 'Valued Member',
        type: 'login'
      });
      emailSent = Boolean(emailResult?.isRealDelivered);
    } catch (err) {
      emailErrorMsg = err.message;
    }

    await persistUser(user);

    return res.json({
      success: true,
      message: `Verification code sent to your new email (${cleanNewEmail}). Please check your inbox.`,
      maskedEmail: maskEmail(cleanNewEmail),
      expiresInSeconds: 600
    });
  } catch (error) {
    console.error('requestProfileEmailOtp error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to request email verification code' });
  }
};

const verifyProfileEmailOtp = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = isConnected()
      ? await User.findById(userId)
      : findMemoryUserById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Strict 7-day modification lock check
    if (user.profileModificationLockedUntil && new Date() < new Date(user.profileModificationLockedUntil)) {
      const remainingDays = Math.max(1, Math.ceil((new Date(user.profileModificationLockedUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      const dateStr = formatLockDate(user.profileModificationLockedUntil);
      return res.status(403).json({
        success: false,
        locked: true,
        remainingDays,
        lockedUntil: user.profileModificationLockedUntil,
        message: `Profile changes locked. You can edit your profile again in ${remainingDays} days. (Available on: ${dateStr})`
      });
    }

    const { otp } = req.body;
    if (!otp || !validOtp(String(otp).trim())) {
      return res.status(400).json({ success: false, message: 'Enter a valid 6-digit OTP code' });
    }

    if (!user.pendingEmailChange || !user.pendingEmailOtpHash || !user.pendingEmailOtpExpiresAt) {
      return res.status(400).json({ success: false, message: 'No pending email change request found. Please request a new verification code.' });
    }

    if (new Date() > new Date(user.pendingEmailOtpExpiresAt)) {
      user.pendingEmailChange = null;
      user.pendingEmailOtpHash = null;
      user.pendingEmailOtpExpiresAt = null;
      user.pendingEmailOtpAttempts = 0;
      await persistUser(user);
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    if ((user.pendingEmailOtpAttempts || 0) >= 5) {
      user.pendingEmailChange = null;
      user.pendingEmailOtpHash = null;
      user.pendingEmailOtpExpiresAt = null;
      user.pendingEmailOtpAttempts = 0;
      await persistUser(user);
      return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please request a new verification code.' });
    }

    const submittedHash = hashOtp(String(otp).trim());
    const subBuf = Buffer.from(submittedHash);
    const storedBuf = Buffer.from(user.pendingEmailOtpHash);
    const isMatch = subBuf.length === storedBuf.length && crypto.timingSafeEqual(subBuf, storedBuf);

    if (!isMatch) {
      user.pendingEmailOtpAttempts = (user.pendingEmailOtpAttempts || 0) + 1;
      const exhausted = user.pendingEmailOtpAttempts >= 5;
      if (exhausted) {
        user.pendingEmailChange = null;
        user.pendingEmailOtpHash = null;
        user.pendingEmailOtpExpiresAt = null;
        user.pendingEmailOtpAttempts = 0;
      }
      await persistUser(user);
      return res.status(exhausted ? 429 : 400).json({
        success: false,
        message: exhausted ? 'Too many incorrect attempts. Please request a new verification code.' : 'Incorrect verification code. Please try again.'
      });
    }

    // Double check email hasn't been claimed by someone else in the meantime
    const targetEmail = user.pendingEmailChange;
    const existing = await lookupUser(targetEmail);
    if (existing && String(existing._id || existing.id) !== String(userId)) {
      user.pendingEmailChange = null;
      user.pendingEmailOtpHash = null;
      await persistUser(user);
      return res.status(400).json({ success: false, message: 'This email address is already claimed by another account.' });
    }

    // Apply email change
    user.email = targetEmail;
    user.pendingEmailChange = null;
    user.pendingEmailOtpHash = null;
    user.pendingEmailOtpExpiresAt = null;
    user.pendingEmailOtpAttempts = 0;

    // Apply 7-day modification lock!
    const lockDurationMs = 7 * 24 * 60 * 60 * 1000;
    const now = new Date();
    user.lastProfileModifiedAt = now;
    user.profileModificationLockedUntil = new Date(now.getTime() + lockDurationMs);

    await persistUser(user);

    const unlockDateStr = formatLockDate(user.profileModificationLockedUntil);
    return res.json({
      success: true,
      message: `Profile email updated successfully. Your profile details cannot be modified again until ${unlockDateStr}.`,
      lockedUntil: user.profileModificationLockedUntil,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('verifyProfileEmailOtp error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to verify email verification code' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = isConnected()
      ? await User.findById(userId)
      : findMemoryUserById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // 1. Strict 7-Day Modification Lock Check
    if (user.profileModificationLockedUntil && new Date() < new Date(user.profileModificationLockedUntil)) {
      const remainingDays = Math.max(1, Math.ceil((new Date(user.profileModificationLockedUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      const dateStr = formatLockDate(user.profileModificationLockedUntil);
      return res.status(403).json({
        success: false,
        locked: true,
        remainingDays,
        lockedUntil: user.profileModificationLockedUntil,
        message: `Profile changes locked. You can edit your profile again in ${remainingDays} days. (Available on: ${dateStr})`
      });
    }

    const {
      firstName,
      lastName,
      phone,
      email,
      role,
      isVerified,
      nativePlace,
      farmName,
      description,
      avatar,
      deliveryAddress,
      city,
      state,
      pincode,
      vehicleType,
      vehicleNumber,
      serviceArea,
      location
    } = req.body;

    // Strict Security Rule: Email changes must go through the dedicated OTP flow
    if (email && email.toLowerCase().trim() !== (user.email || '').toLowerCase().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address changes require OTP verification. Please use the Verify Email flow.'
      });
    }

    // Strict Security Rule: Role and verification badges are strictly immutable
    // Any attempted tampering or privilege escalation (e.g. role: 'admin', isVerified: true) is strictly ignored
    // and cannot alter the authenticated user's established permissions.

    // Editable profile fields: name, farm name, native place, description, address, vehicle, etc.
    if (firstName !== undefined && typeof firstName === 'string') user.firstName = firstName.trim();
    if (lastName !== undefined && typeof lastName === 'string') user.lastName = lastName.trim();
    user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

    if (phone !== undefined && typeof phone === 'string' && phone.trim()) {
      const cleanPhone = phone.trim();
      const normPhone = normalizePhone(cleanPhone) || cleanPhone;
      const existing = isConnected()
        ? await User.findOne({
            $or: [{ phone: cleanPhone }, { phone: normPhone }],
            _id: { $ne: user._id }
          })
        : memoryUsers.find(u => (u.phone === cleanPhone || u.phone === normPhone) && String(u.id || u._id) !== String(userId));

      if (existing) {
        return res.status(400).json({ success: false, message: 'This phone number is already registered to another account' });
      }
      user.phone = cleanPhone;
    }

    if (nativePlace !== undefined && typeof nativePlace === 'string') user.nativePlace = nativePlace.trim();
    if (farmName !== undefined && typeof farmName === 'string') user.farmName = farmName.trim();
    if (description !== undefined && typeof description === 'string') user.description = description.trim();
    if (avatar !== undefined && typeof avatar === 'string') user.avatar = avatar.trim();
    if (deliveryAddress !== undefined && typeof deliveryAddress === 'string') user.deliveryAddress = deliveryAddress.trim();
    if (city !== undefined && typeof city === 'string') user.city = city.trim();
    if (state !== undefined && typeof state === 'string') user.state = state.trim();
    if (pincode !== undefined && typeof pincode === 'string') user.pincode = pincode.trim();
    if (vehicleType !== undefined && typeof vehicleType === 'string') user.vehicleType = vehicleType.trim();
    if (vehicleNumber !== undefined && typeof vehicleNumber === 'string') user.vehicleNumber = vehicleNumber.trim();
    if (serviceArea !== undefined && typeof serviceArea === 'string') user.serviceArea = serviceArea.trim();

    if (location && typeof location === 'object') {
      user.location = {
        lat: Number(location.lat) || user.location?.lat || 12.9716,
        lng: Number(location.lng) || user.location?.lng || 77.5946,
        address: location.address || user.location?.address || 'Bengaluru, Karnataka',
        placeName: location.placeName || user.location?.placeName || user.nativePlace || 'Bengaluru'
      };
    }

    // Apply 7-day modification lock!
    const lockDurationMs = 7 * 24 * 60 * 60 * 1000;
    const now = new Date();
    user.lastProfileModifiedAt = now;
    user.profileModificationLockedUntil = new Date(now.getTime() + lockDurationMs);

    await persistUser(user);
    const unlockDateStr = formatLockDate(user.profileModificationLockedUntil);
    return res.json({
      success: true,
      message: `Profile updated successfully. Your profile details cannot be modified again until ${unlockDateStr}.`,
      lockedUntil: user.profileModificationLockedUntil,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('updateProfile error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to update profile' });
  }
};

/**
 * GET /api/auth/farmers
 * Dynamic directory of all registered farmers from MongoDB / memory
 * Clearly reflects registered farmers vs farmers with published products
 */
const getFarmers = async (req, res) => {
  try {
    let farmersList = [];
    if (isConnected()) {
      const farmers = await User.find({ role: 'farmer' }).select('-password -resetOtpHash');
      const products = await Product.find({});
      farmersList = farmers.map(f => {
        const farmerProds = products.filter(p => String(p.farmerId) === String(f._id || f.id));
        const crops = Array.from(new Set(farmerProds.map(p => p.category || p.title).filter(Boolean)));
        return {
          id: String(f._id || f.id),
          _id: String(f._id || f.id),
          name: f.name || `${f.firstName || ''} ${f.lastName || ''}`.trim() || 'Farmer',
          farmName: f.farmName || `${f.firstName || f.name || 'Organic'}'s Farm`,
          location: f.location || { address: f.nativePlace || 'Rural Cluster, India' },
          nativePlace: f.nativePlace || 'Rural Cluster',
          description: f.description || '',
          isVerified: Boolean(f.isVerified),
          crops,
          publishedProductsCount: farmerProds.length,
          publishedProducts: farmerProds.map(p => ({
            id: String(p._id || p.id),
            _id: String(p._id || p.id),
            title: p.title,
            price: p.price,
            stock: p.stock,
            image: p.image,
            category: p.category,
            unit: p.unit || 'kg'
          }))
        };
      });
    } else {
      const memoryProds = typeof getMemoryProducts === 'function' ? getMemoryProducts() : [];
      farmersList = memoryUsers.filter(u => u.role === 'farmer').map(f => {
        const farmerProds = memoryProds.filter(p => String(p.farmerId) === String(f.id || f._id));
        const crops = Array.from(new Set(farmerProds.map(p => p.category || p.title).filter(Boolean)));
        return {
          id: String(f.id || f._id),
          _id: String(f.id || f._id),
          name: f.name || `${f.firstName || ''} ${f.lastName || ''}`.trim() || 'Farmer',
          farmName: f.farmName || `${f.firstName || f.name || 'Organic'}'s Farm`,
          location: f.location || { address: f.nativePlace || 'Rural Cluster, India' },
          nativePlace: f.nativePlace || 'Rural Cluster',
          description: f.description || '',
          isVerified: Boolean(f.isVerified),
          crops,
          publishedProductsCount: farmerProds.length,
          publishedProducts: farmerProds.map(p => ({
            id: String(p._id || p.id),
            _id: String(p._id || p.id),
            title: p.title,
            price: p.price,
            stock: p.stock,
            image: p.image,
            category: p.category,
            unit: p.unit || 'kg'
          }))
        };
      });
    }

    return res.json({ success: true, count: farmersList.length, farmers: farmersList });
  } catch (error) {
    console.error('getFarmers error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to retrieve farmers directory' });
  }
};

const migrateMemoryPasswords = async () => {
  let changed = false;
  for (const user of memoryUsers) {
    if (user.password && !user.password.startsWith('$2')) { user.password = await bcrypt.hash(user.password, 10); changed = true; }
    if ('resetToken' in user || 'resetTokenExpire' in user) { delete user.resetToken; delete user.resetTokenExpire; changed = true; }
  }
  if (changed) saveMemoryUsers();
};
const seedMemoryUser = (userObj) => {
  const idx = memoryUsers.findIndex((user) => user.email === userObj.email || user.phone === userObj.phone || String(user.id || user._id) === String(userObj.id || userObj._id));
  const initializedUser = {
    profileModificationLockedUntil: null,
    lastProfileModifiedAt: null,
    ...userObj
  };
  if (idx !== -1) {
    memoryUsers[idx] = { ...memoryUsers[idx], ...initializedUser };
  } else {
    memoryUsers.push(initializedUser);
  }
};

module.exports = {
  registerUser,
  sendRegisterOtp,
  verifyRegisterOtp,
  requestPhoneOtpHandler,
  verifyPhoneOtpHandler,
  loginUser,
  forgotPassword,
  resetPassword,
  updateLocation,
  getWishlist,
  toggleWishlist,
  getProfile,
  updateProfile,
  requestProfileEmailOtp,
  verifyProfileEmailOtp,
  getFarmers,
  seedMemoryUser,
  migrateMemoryPasswords,
  findMemoryUserById,
  lookupUser
};

