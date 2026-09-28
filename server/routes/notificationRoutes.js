const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.get('/', optionalProtect, notificationController.getNotifications);
router.post('/', notificationController.createNotification);
router.post('/otp/generate', notificationController.generateOtp);
router.post('/otp/verify', notificationController.verifyOtp);

module.exports = router;
