const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus, updateDeliveryLocation } = require('../controllers/orderController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

router.post('/', optionalProtect, createOrder);
router.get('/', optionalProtect, getOrders);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/location', protect, updateDeliveryLocation);

module.exports = router;