const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  assignDeliveryDriver,
  updateDeliveryLocation,
  generateDeliveryOtp,
  verifyDeliveryOtp
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/assign', protect, assignDeliveryDriver);
router.put('/:id/location', protect, updateDeliveryLocation);
router.post('/:id/delivery-otp/generate', protect, generateDeliveryOtp);
router.post('/:id/delivery-otp/verify', protect, verifyDeliveryOtp);

module.exports = router;