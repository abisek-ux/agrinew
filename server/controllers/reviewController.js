const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { isConnected } = require('../config/db');
const { getMemoryOrders } = require('./orderController');
const { getMemoryProducts } = require('./productController');

const memoryReviews = [];

const createReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required to post a review' });
    }

    const { orderId, productId, rating, comment } = req.body;
    const customerId = String(req.user.id || req.user._id);
    const customerName = `${req.user.firstName || 'Customer'} ${req.user.lastName || ''}`.trim();

    if (!orderId || !productId) {
      return res.status(400).json({ success: false, message: 'Order ID and Product ID are required' });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
    }

    // 1. Look up Order and verify eligibility
    let order;
    if (isConnected()) {
      order = await Order.findById(orderId);
      if (!order) {
        order = await Order.findOne({ orderId });
      }
    } else {
      order = getMemoryOrders().find(o => String(o.id || o._id) === String(orderId) || o.orderId === orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found' });
    }

    // Authorization: Only the purchasing customer can review
    if (String(order.customerId) !== customerId && order.customerEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'You can only review products from your own purchases' });
    }

    // Status: Order must be delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: `Reviews are only allowed after delivery is completed. Current order status: "${order.status}"`
      });
    }

    // Verification: Product must be in order.items
    const hasItem = Array.isArray(order.items) && order.items.some(i => String(i.productId) === String(productId));
    if (!hasItem) {
      return res.status(400).json({ success: false, message: 'This product was not purchased in the specified order' });
    }

    // 2. Prevent duplicate reviews
    if (isConnected()) {
      const existing = await Review.findOne({
        orderId: String(order._id || order.id),
        productId: String(productId),
        customerId
      });
      if (existing) {
        return res.status(409).json({ success: false, message: 'You have already reviewed this product for this order' });
      }
    } else {
      const existing = memoryReviews.find(r =>
        String(r.orderId) === String(order._id || order.id) &&
        String(r.productId) === String(productId) &&
        String(r.customerId) === customerId
      );
      if (existing) {
        return res.status(409).json({ success: false, message: 'You have already reviewed this product for this order' });
      }
    }

    // 3. Save Review
    const matchedItem = Array.isArray(order.items) && order.items.find(i => String(i.productId) === String(productId));
    const reviewData = {
      reviewType: 'product',
      orderId: String(order._id || order.id),
      productId: String(productId),
      productTitle: matchedItem?.title || 'Farm Produce',
      farmerId: String(order.farmerId),
      customerId,
      customerName,
      rating: numRating,
      comment: (comment || '').trim()
    };

    let newReview;
    if (isConnected()) {
      newReview = await Review.create(reviewData);

      // Recalculate average rating on Product
      const productReviews = await Review.find({ productId: String(productId), reviewType: 'product' });
      const totalScore = productReviews.reduce((sum, r) => sum + r.rating, 0);
      const avg = Number((totalScore / productReviews.length).toFixed(1));

      await Product.findByIdAndUpdate(productId, {
        rating: avg,
        numReviews: productReviews.length
      });
    } else {
      newReview = { id: 'rev_' + Date.now(), ...reviewData, createdAt: new Date() };
      memoryReviews.push(newReview);

      const productReviews = memoryReviews.filter(r => String(r.productId) === String(productId) && r.reviewType === 'product');
      const totalScore = productReviews.reduce((sum, r) => sum + r.rating, 0);
      const avg = Number((totalScore / productReviews.length).toFixed(1));

      const prod = getMemoryProducts().find(p => String(p.id || p._id) === String(productId));
      if (prod) {
        prod.rating = avg;
        prod.numReviews = productReviews.length;
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your verified purchase review has been published.',
      review: newReview
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/reviews/delivery
 * Customer rates delivery partner for a delivered order
 */
const createDeliveryReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required to post a review' });
    }

    const { orderId, rating, comment } = req.body;
    const customerId = String(req.user.id || req.user._id);
    const customerName = `${req.user.firstName || 'Customer'} ${req.user.lastName || ''}`.trim();

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
    }

    let order;
    if (isConnected()) {
      order = await Order.findById(orderId);
      if (!order) {
        order = await Order.findOne({ orderId });
      }
    } else {
      order = getMemoryOrders().find(o => String(o.id || o._id) === String(orderId) || o.orderId === orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found' });
    }

    // Authorization: Only the purchasing customer can review
    if (String(order.customerId) !== customerId && order.customerEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'You can only review deliveries for your own orders' });
    }

    // Status: Order must be delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: `Delivery reviews are only allowed after delivery is completed. Current order status: "${order.status}"`
      });
    }

    // Delivery partner assignment verification
    if (!order.deliveryId || order.deliveryId === 'Unassigned') {
      return res.status(400).json({
        success: false,
        message: 'No delivery partner was assigned to this order to review'
      });
    }

    const deliveryId = String(order.deliveryId);
    const deliveryName = order.deliveryName || 'Delivery Partner';

    // Prevent duplicate delivery review for this order
    if (isConnected()) {
      const existing = await Review.findOne({
        orderId: String(order._id || order.id),
        deliveryId,
        customerId,
        reviewType: 'delivery'
      });
      if (existing) {
        return res.status(409).json({ success: false, message: 'You have already reviewed the delivery partner for this order' });
      }
    } else {
      const existing = memoryReviews.find(r =>
        String(r.orderId) === String(order._id || order.id) &&
        String(r.deliveryId) === deliveryId &&
        String(r.customerId) === customerId &&
        r.reviewType === 'delivery'
      );
      if (existing) {
        return res.status(409).json({ success: false, message: 'You have already reviewed the delivery partner for this order' });
      }
    }

    const reviewData = {
      reviewType: 'delivery',
      orderId: String(order._id || order.id),
      deliveryId,
      deliveryName,
      customerId,
      customerName,
      rating: numRating,
      comment: (comment || '').trim()
    };

    let newReview;
    if (isConnected()) {
      newReview = await Review.create(reviewData);
    } else {
      newReview = { id: 'drev_' + Date.now(), ...reviewData, createdAt: new Date() };
      memoryReviews.push(newReview);
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your delivery courier review has been published.',
      review: newReview
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/reviews/farmer
 * Returns verified product reviews for the authenticated farmer's products only
 */
const getFarmerReviews = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'farmer' && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Access denied: Farmer portal only' });
    }

    const farmerId = String(req.user.id || req.user._id);

    if (isConnected()) {
      const reviews = await Review.find({
        farmerId,
        reviewType: 'product'
      }).sort({ createdAt: -1 });

      const avg = reviews.length > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : 0;

      return res.json({
        success: true,
        reviews,
        averageRating: avg,
        totalReviews: reviews.length
      });
    } else {
      const reviews = memoryReviews.filter(r =>
        String(r.farmerId) === farmerId &&
        r.reviewType === 'product'
      ).reverse();

      const avg = reviews.length > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : 0;

      return res.json({
        success: true,
        reviews,
        averageRating: avg,
        totalReviews: reviews.length
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/reviews/delivery
 * Returns delivery reviews for the authenticated delivery partner only
 */
const getDeliveryReviews = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'delivery' && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Access denied: Delivery portal only' });
    }

    const driverId = String(req.user.id || req.user._id);

    if (isConnected()) {
      const reviews = await Review.find({
        deliveryId: driverId,
        reviewType: 'delivery'
      }).sort({ createdAt: -1 });

      const avg = reviews.length > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : 0;

      return res.json({
        success: true,
        reviews,
        averageRating: avg,
        totalReviews: reviews.length
      });
    } else {
      const reviews = memoryReviews.filter(r =>
        String(r.deliveryId) === driverId &&
        r.reviewType === 'delivery'
      ).reverse();

      const avg = reviews.length > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : 0;

      return res.json({
        success: true,
        reviews,
        averageRating: avg,
        totalReviews: reviews.length
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (isConnected()) {
      const reviews = await Review.find({ productId: String(productId), reviewType: 'product' }).sort({ createdAt: -1 });
      const avg = reviews.length > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : 0;
      return res.json({ success: true, reviews, averageRating: avg, totalReviews: reviews.length });
    } else {
      const reviews = memoryReviews.filter(r => String(r.productId) === String(productId) && r.reviewType === 'product').reverse();
      const avg = reviews.length > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : 0;
      return res.json({ success: true, reviews, averageRating: avg, totalReviews: reviews.length });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReview,
  createDeliveryReview,
  getFarmerReviews,
  getDeliveryReviews,
  getProductReviews
};
