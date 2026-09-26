const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/', notificationController.getNotifications);
router.post('/', notificationController.createNotification);
router.post('/otp/generate', notificationController.generateOtp);
router.post('/otp/verify', notificationController.verifyOtp);

module.exports = router;
