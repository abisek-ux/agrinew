const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
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
const formatUserResponse = (user, token) => ({ _id: user._id || user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, role: user.role, nativePlace: user.nativePlace, location: user.location, token });

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
  const clean = identifier.trim().toLowerCase();
  const cleanPhone = normalizePhone(identifier);
  return isConnected()
    ? User.findOne({ $or: [{ email: clean }, { phone: clean }, { phone: cleanPhone }] })
    : memoryUsers.find((user) => user.email === clean || user.phone === clean || user.phone === cleanPhone);
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
    const { firstName, lastName, email, phone, password, role, nativePlace, location, emailOtp, phoneVerificationToken } = req.body;
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

    const userRole = (role || 'customer').toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);
    const userLocation = location || { lat: 12.9716, lng: 77.5946, address: 'Bengaluru, Karnataka, India', placeName: nativePlace || 'Bengaluru, Karnataka' };

    if (isConnected()) {
      if (await User.findOne({ $or: [{ email: cleanEmail }, { phone: cleanPhone }] })) {
        return res.status(400).json({ message: 'User with this email or phone already exists' });
      }
      const user = await User.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName} ${lastName}`.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        password: hashedPassword,
        role: userRole,
        nativePlace: nativePlace || 'Bengaluru, Karnataka',
        location: userLocation
      });
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
      phone: cleanPhone,
      password: hashedPassword,
      role: userRole,
      nativePlace: nativePlace || 'Bengaluru, Karnataka',
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
    if (!identifier || !password) return res.status(400).json({ message: 'Provide Email/Phone and Password' });
    const user = await lookupUser(identifier.trim().toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid Email/Phone or Password' });

    // Strict portal-role isolation: prevent logging into other portals with wrong role
    if (requiredRole && user.role && user.role.toLowerCase() !== requiredRole.toLowerCase()) {
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
    if (!identifier) return res.status(400).json({ message: 'Enter your registered email address or phone number' });
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

    user.password = isConnected() ? newPassword : await bcrypt.hash(newPassword, 10);
    clearOtp(user);
    await persistUser(user);
    return res.json({ success: true, message: 'Password updated successfully. Please sign in.' });
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

const migrateMemoryPasswords = async () => {
  let changed = false;
  for (const user of memoryUsers) {
    if (user.password && !user.password.startsWith('$2')) { user.password = await bcrypt.hash(user.password, 10); changed = true; }
    if ('resetToken' in user || 'resetTokenExpire' in user) { delete user.resetToken; delete user.resetTokenExpire; changed = true; }
  }
  if (changed) saveMemoryUsers();
};
const seedMemoryUser = (userObj) => {
  if (!memoryUsers.some((user) => user.email === userObj.email || user.phone === userObj.phone)) memoryUsers.push(userObj);
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
  seedMemoryUser,
  migrateMemoryPasswords,
  findMemoryUserById
};
