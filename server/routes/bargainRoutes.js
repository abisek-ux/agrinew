const express = require('express');
const router = express.Router();
const {
  createBargain,
  getBargains,
  farmerRespond,
  customerRespond,
  markBargainAddedToCart
} = require('../controllers/bargainController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBargain);
router.get('/', protect, getBargains);
router.put('/:id/farmer-respond', protect, farmerRespond);
router.put('/:id/customer-respond', protect, customerRespond);
router.put('/:id/add-to-cart', protect, markBargainAddedToCart);

module.exports = router;
