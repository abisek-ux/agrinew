const express = require('express');
const router = express.Router();
const {
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
    updateProfile,
    getFarmers
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { getDBStatus } = require('../config/db');

// Authentication Endpoints
router.post('/register', registerUser);
router.post('/register/send-otp', sendRegisterOtp);
router.post('/register/verify-otp', verifyRegisterOtp);
router.post('/login', loginUser);

// Dedicated Phone OTP Service Endpoints
router.post('/phone-otp/request', requestPhoneOtpHandler);
router.post('/phone-otp/verify', verifyPhoneOtpHandler);

// Password Reset Flow Endpoints
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Farmers Directory Endpoint
router.get('/farmers', getFarmers);

// Authenticated User Endpoints
router.put('/location', protect, updateLocation);
router.put('/profile', protect, updateProfile);
router.get('/wishlist', protect, getWishlist);
router.put('/wishlist/toggle', protect, toggleWishlist);
router.get('/status', (req, res) => res.json(getDBStatus()));

module.exports = router;