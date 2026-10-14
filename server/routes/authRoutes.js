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
    getProfile,
    updateProfile,
    requestProfileEmailOtp,
    verifyProfileEmailOtp,
    getFarmers,
    uploadFarmerUpiQr,
    removeFarmerUpiQr,
    getFarmerUpiDetails
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

// Farmers Directory & Farmer UPI Endpoints
router.get('/farmers', getFarmers);
router.get('/farmer/:id/upi', getFarmerUpiDetails);
router.post('/farmer/upi-qr', protect, uploadFarmerUpiQr);
router.delete('/farmer/upi-qr', protect, removeFarmerUpiQr);

// Authenticated User Profile Endpoints
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile/request-email-otp', protect, requestProfileEmailOtp);
router.post('/profile/verify-email-otp', protect, verifyProfileEmailOtp);

// Authenticated User Endpoints
router.put('/location', protect, updateLocation);
router.get('/wishlist', protect, getWishlist);
router.put('/wishlist/toggle', protect, toggleWishlist);
router.get('/status', (req, res) => res.json(getDBStatus()));

module.exports = router;