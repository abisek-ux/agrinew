const express = require('express');
const router = express.Router();
const {
    registerUser,
    sendRegisterOtp,
    verifyRegisterOtp,
    loginUser,
    forgotPassword,
    resetPassword,
    updateLocation
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { getDBStatus } = require('../config/db');

// Authentication Endpoints
router.post('/register', registerUser);
router.post('/register/send-otp', sendRegisterOtp);
router.post('/register/verify-otp', verifyRegisterOtp);
router.post('/login', loginUser);

// Password Reset Flow Endpoints
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Authenticated User Endpoints
router.put('/location', protect, updateLocation);
router.get('/status', (req, res) => res.json(getDBStatus()));

module.exports = router;