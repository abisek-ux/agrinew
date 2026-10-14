const express = require('express');
const router = express.Router();
const {
  createReview,
  createDeliveryReview,
  getFarmerReviews,
  getDeliveryReviews,
  getProductReviews
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.post('/delivery', protect, createDeliveryReview);
router.get('/farmer', protect, getFarmerReviews);
router.get('/delivery', protect, getDeliveryReviews);
router.get('/product/:productId', getProductReviews);

module.exports = router;

