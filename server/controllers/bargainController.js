const crypto = require('crypto');
const Bargain = require('../models/Bargain');
const Product = require('../models/Product');
const { isConnected } = require('../config/db');
const { getMemoryProducts } = require('./productController');
const { pushNotification } = require('./notificationController');

const memoryBargains = [];

const mongoose = require('mongoose');

/**
 * Helper to resolve product safely without throwing CastError
 */
const findProduct = async (prodId) => {
  if (isConnected()) {
    try {
      if (mongoose.Types.ObjectId.isValid(prodId)) {
        const p = await Product.findById(prodId);
        if (p) return p;
      }
      const p = await Product.findOne({ $or: [{ id: String(prodId) }, { _id: String(prodId) }] });
      if (p) return p;
    } catch (e) {}
  }
  const prods = getMemoryProducts();
  return prods.find(p => String(p._id || p.id) === String(prodId));
};

/**
 * POST /api/bargains
 * Customer proposes bulk bargain to farmer. Initial status is ALWAYS PENDING.
 * Server authoritatively derives farmerId from product record (BUG 6, 7).
 */
const createBargain = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const customerId = String(req.user.id || req.user._id);
    const customerRole = String(req.user.role || '').toLowerCase();
    if (customerRole !== 'customer' && customerRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only customer accounts can submit bargain proposals' });
    }

    const { productId, quantity, proposedPrice, note } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'Product ID is required' });

    const qty = Number(quantity);
    if (!qty || qty <= 0) return res.status(400).json({ success: false, message: 'Valid quantity is required' });

    const propPrice = Number(proposedPrice);
    if (!propPrice || propPrice <= 0) return res.status(400).json({ success: false, message: 'Valid proposed price is required' });

    const product = await findProduct(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found in marketplace' });

    // Server authoritatively derives farmer identity from loaded product
    const farmerId = String(product.farmerId);
    if (customerId === farmerId) {
      return res.status(400).json({ success: false, message: 'You cannot bargain on your own produce' });
    }

    const bargainId = `BARGAIN-${Date.now()}-${crypto.randomInt(100, 999)}`;
    const originalPrice = Number(product.price);

    const initialHistory = [{
      senderRole: 'customer',
      action: 'propose',
      proposedPrice: propPrice,
      note: note || `Customer proposed ₹${propPrice}/${product.unit || 'kg'} for ${qty} ${product.unit || 'kg'}.`,
      timestamp: new Date()
    }];

    const bargainData = {
      bargainId,
      customerId,
      customerName: req.user.name || `${req.user.firstName || 'Customer'} ${req.user.lastName || ''}`.trim(),
      customerEmail: req.user.email || '',
      customerPhone: req.user.phone || '',
      farmerId,
      farmerName: product.farmerName || 'Origin Farm',
      farmerEmail: product.farmerEmail || '',
      farmerPhone: product.farmerPhone || '',
      productId: String(product._id || product.id),
      productTitle: product.title,
      quantity: qty,
      unit: product.unit || 'kg',
      originalPrice,
      proposedPrice: propPrice,
      counterPrice: null,
      status: 'PENDING',
      farmerNote: '',
      responseHistory: initialHistory
    };

    let savedBargain;
    if (isConnected()) {
      savedBargain = await Bargain.create(bargainData);
    } else {
      savedBargain = { ...bargainData, _id: bargainId, id: bargainId, createdAt: new Date(), updatedAt: new Date() };
      memoryBargains.push(savedBargain);
    }

    // Push notification to farmer
    pushNotification({
      recipientId: farmerId,
      recipientRole: 'farmer',
      title: '🌾 New Bulk Bargain Offer Received',
      message: `${bargainData.customerName} submitted a bulk offer of ₹${propPrice}/${bargainData.unit} for ${qty} ${bargainData.unit} of "${product.title}" (Original: ₹${originalPrice}).`,
      category: 'order',
      priority: 'HIGH'
    });

    return res.status(201).json({
      success: true,
      message: 'Bulk bargain offer sent to farmer! Status: PENDING awaiting farmer review.',
      bargain: savedBargain
    });
  } catch (error) {
    console.error('createBargain error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Unable to submit bargain proposal' });
  }
};

/**
 * GET /api/bargains
 * Retrieve bargains for current user (filtered by customerId or farmerId)
 */
const getBargains = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userId = String(req.user.id || req.user._id);
    const userRole = String(req.user.role || '').toLowerCase();
    const idCandidates = [userId];
    if (req.user._id && String(req.user._id) !== userId) idCandidates.push(String(req.user._id));
    if (req.user.id && String(req.user.id) !== userId) idCandidates.push(String(req.user.id));

    let list = [];
    if (isConnected()) {
      let query = {};
      if (userRole === 'farmer') {
        const orConditions = [{ farmerId: { $in: idCandidates } }];
        if (req.user.email) orConditions.push({ farmerEmail: req.user.email });
        query = { $or: orConditions };
      } else if (userRole === 'customer') {
        const orConditions = [{ customerId: { $in: idCandidates } }];
        if (req.user.email) orConditions.push({ customerEmail: req.user.email });
        query = { $or: orConditions };
      }
      list = await Bargain.find(query).sort({ createdAt: -1 });
    } else {
      if (userRole === 'farmer') {
        list = memoryBargains.filter(b => idCandidates.includes(String(b.farmerId)) || (req.user.email && b.farmerEmail === req.user.email));
      } else if (userRole === 'customer') {
        list = memoryBargains.filter(b => idCandidates.includes(String(b.customerId)) || (req.user.email && b.customerEmail === req.user.email));
      } else {
        list = [...memoryBargains];
      }
      list.reverse();
    }

    const serialized = list.map(b => {
      const obj = typeof b.toObject === 'function' ? b.toObject() : { ...b };
      obj.offeredPrice = obj.proposedPrice;
      return obj;
    });

    return res.json({ success: true, count: serialized.length, bargains: serialized });
  } catch (error) {
    console.error('getBargains error:', error);
    return res.status(500).json({ success: false, message: 'Unable to retrieve bargains' });
  }
};

/**
 * PUT /api/bargains/:id/farmer-respond
 * Farmer accepts, rejects, or counter-offers a pending proposal
 */
const farmerRespond = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    const { id } = req.params;
    const { action, counterPrice, note } = req.body;
    const act = String(action || '').trim().toUpperCase();

    if (!['ACCEPT', 'REJECT', 'COUNTER'].includes(act)) {
      return res.status(400).json({ success: false, message: 'Action must be ACCEPT, REJECT, or COUNTER' });
    }

    let bargain;
    if (isConnected()) {
      const orConditions = [{ bargainId: id }];
      if (mongoose.Types.ObjectId.isValid(id)) {
        orConditions.push({ _id: id });
      }
      bargain = await Bargain.findOne({ $or: orConditions });
    } else {
      bargain = memoryBargains.find(b => String(b.bargainId) === id || String(b.id || b._id) === id);
    }

    if (!bargain) return res.status(404).json({ success: false, message: 'Bargain not found' });

    const userIds = [String(req.user.id || ''), String(req.user._id || '')].filter(Boolean);
    const isAuthorizedFarmer = userIds.includes(String(bargain.farmerId)) ||
      (req.user.email && bargain.farmerEmail && req.user.email.toLowerCase() === bargain.farmerEmail.toLowerCase()) ||
      req.user.role === 'admin';

    if (!isAuthorizedFarmer) {
      return res.status(403).json({ success: false, message: 'You are not authorized to respond to another farmer\'s bargain' });
    }

    if (bargain.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Bargain is already resolved (status: ${bargain.status})` });
    }

    let updateQuery = null;

    if (act === 'ACCEPT') {
      const agreedPrice = Number(bargain.proposedPrice);
      if (!agreedPrice || isNaN(agreedPrice) || agreedPrice <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid proposed bargain price cannot be accepted (must be greater than 0)' });
      }

      const product = await findProduct(bargain.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Marketplace product no longer exists' });
      }

      const farmerNote = note || 'Offer accepted by farmer';
      updateQuery = {
        $set: { status: 'ACCEPTED', farmerNote },
        $push: {
          responseHistory: {
            senderRole: 'farmer',
            action: 'accept',
            proposedPrice: bargain.proposedPrice,
            note: farmerNote,
            timestamp: new Date()
          }
        }
      };
    } else if (act === 'REJECT') {
      const farmerNote = note || 'Offer declined due to high harvest/production costs';
      updateQuery = {
        $set: { status: 'REJECTED', farmerNote },
        $push: {
          responseHistory: {
            senderRole: 'farmer',
            action: 'reject',
            note: farmerNote,
            timestamp: new Date()
          }
        }
      };
    } else if (act === 'COUNTER') {
      const cPrice = Number(counterPrice);
      if (!cPrice || cPrice <= 0) {
        return res.status(400).json({ success: false, message: 'Counter price is required' });
      }
      const farmerNote = note || `Farmer offered counter-price of ₹${cPrice}/${bargain.unit}`;
      updateQuery = {
        $set: { status: 'COUNTERED', counterPrice: cPrice, farmerNote },
        $push: {
          responseHistory: {
            senderRole: 'farmer',
            action: 'counter',
            counterPrice: cPrice,
            note: farmerNote,
            timestamp: new Date()
          }
        }
      };
    }

    if (isConnected()) {
      const updated = await Bargain.findOneAndUpdate(
        { _id: bargain._id, status: 'PENDING' },
        updateQuery,
        { new: true }
      );
      if (!updated) {
        return res.status(400).json({ success: false, message: `Bargain is already resolved (status: ${bargain.status})` });
      }
      bargain = updated;
    } else {
      if (bargain.status !== 'PENDING') {
        return res.status(400).json({ success: false, message: `Bargain is already resolved (status: ${bargain.status})` });
      }
      if (act === 'ACCEPT') {
        bargain.status = 'ACCEPTED';
        bargain.farmerNote = note || 'Offer accepted by farmer';
        bargain.responseHistory.push({
          senderRole: 'farmer',
          action: 'accept',
          proposedPrice: bargain.proposedPrice,
          note: bargain.farmerNote,
          timestamp: new Date()
        });
      } else if (act === 'REJECT') {
        bargain.status = 'REJECTED';
        bargain.farmerNote = note || 'Offer declined due to high harvest/production costs';
        bargain.responseHistory.push({
          senderRole: 'farmer',
          action: 'reject',
          note: bargain.farmerNote,
          timestamp: new Date()
        });
      } else if (act === 'COUNTER') {
        const cPrice = Number(counterPrice);
        bargain.status = 'COUNTERED';
        bargain.counterPrice = cPrice;
        bargain.farmerNote = note || `Farmer offered counter-price of ₹${cPrice}/${bargain.unit}`;
        bargain.responseHistory.push({
          senderRole: 'farmer',
          action: 'counter',
          counterPrice: cPrice,
          note: bargain.farmerNote,
          timestamp: new Date()
        });
      }
    }

    // Push notification based on resolved state
    if (bargain.status === 'ACCEPTED') {
      pushNotification({
        recipientId: bargain.customerId,
        recipientRole: 'customer',
        title: '🎉 Farmer Accepted Your Bulk Offer!',
        message: `Farmer ${bargain.farmerName} agreed to your proposed price of ₹${bargain.proposedPrice}/${bargain.unit} for ${bargain.quantity} ${bargain.unit} of "${bargain.productTitle}"! Add to cart to purchase.`,
        category: 'order',
        priority: 'HIGH'
      });
    } else if (bargain.status === 'REJECTED') {
      pushNotification({
        recipientId: bargain.customerId,
        recipientRole: 'customer',
        title: '🌾 Bulk Offer Declined',
        message: `Farmer ${bargain.farmerName} could not accept your bulk price proposal for "${bargain.productTitle}". Reason: ${bargain.farmerNote}`,
        category: 'order',
        priority: 'NORMAL'
      });
    } else if (bargain.status === 'COUNTERED') {
      pushNotification({
        recipientId: bargain.customerId,
        recipientRole: 'customer',
        title: '🌾 Farmer Sent Counter-Offer',
        message: `Farmer ${bargain.farmerName} countered with ₹${bargain.counterPrice}/${bargain.unit} for "${bargain.productTitle}". Review and accept to buy.`,
        category: 'order',
        priority: 'HIGH'
      });
    }

    return res.json({ success: true, message: `Bargain updated to ${bargain.status}`, bargain });
  } catch (error) {
    console.error('farmerRespond error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Unable to update bargain' });
  }
};

/**
 * PUT /api/bargains/:id/customer-respond
 * Customer accepts or declines farmer's counter offer
 */
const customerRespond = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    const customerId = String(req.user.id || req.user._id);
    const { id } = req.params;
    const { action } = req.body;
    const act = String(action || '').trim().toUpperCase();

    if (!['ACCEPT', 'REJECT'].includes(act)) {
      return res.status(400).json({ success: false, message: 'Action must be ACCEPT or REJECT' });
    }

    let bargain;
    if (isConnected()) {
      const orConditions = [{ bargainId: id }];
      if (mongoose.Types.ObjectId.isValid(id)) {
        orConditions.push({ _id: id });
      }
      bargain = await Bargain.findOne({ $or: orConditions });
    } else {
      bargain = memoryBargains.find(b => String(b.bargainId) === id || String(b.id || b._id) === id);
    }

    if (!bargain) return res.status(404).json({ success: false, message: 'Bargain not found' });

    if (String(bargain.customerId) !== customerId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to respond to this bargain' });
    }

    if (bargain.status !== 'COUNTERED') {
      return res.status(400).json({ success: false, message: 'Can only respond to COUNTERED bargains' });
    }

    let updateQuery = null;
    if (act === 'ACCEPT') {
      const agreedCounter = Number(bargain.counterPrice);
      if (!agreedCounter || isNaN(agreedCounter) || agreedCounter <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid counter price cannot be accepted (must be greater than 0)' });
      }

      updateQuery = {
        $set: { status: 'ACCEPTED', proposedPrice: agreedCounter, counterPrice: agreedCounter },
        $push: {
          responseHistory: {
            senderRole: 'customer',
            action: 'accept_counter',
            proposedPrice: agreedCounter,
            counterPrice: agreedCounter,
            timestamp: new Date()
          }
        }
      };
    } else {
      updateQuery = {
        $set: { status: 'REJECTED' },
        $push: {
          responseHistory: {
            senderRole: 'customer',
            action: 'reject_counter',
            timestamp: new Date()
          }
        }
      };
    }

    if (isConnected()) {
      const updated = await Bargain.findOneAndUpdate(
        { _id: bargain._id, status: 'COUNTERED' },
        updateQuery,
        { new: true }
      );
      if (!updated) {
        return res.status(400).json({ success: false, message: 'Can only respond to COUNTERED bargains' });
      }
      bargain = updated;
    } else {
      if (bargain.status !== 'COUNTERED') {
        return res.status(400).json({ success: false, message: 'Can only respond to COUNTERED bargains' });
      }
      if (act === 'ACCEPT') {
        bargain.status = 'ACCEPTED';
        bargain.proposedPrice = bargain.counterPrice;
        bargain.responseHistory.push({
          senderRole: 'customer',
          action: 'accept_counter',
          proposedPrice: bargain.counterPrice,
          timestamp: new Date()
        });
      } else {
        bargain.status = 'REJECTED';
        bargain.responseHistory.push({
          senderRole: 'customer',
          action: 'reject_counter',
          timestamp: new Date()
        });
      }
    }

    if (bargain.status === 'ACCEPTED') {
      pushNotification({
        recipientId: bargain.farmerId,
        recipientRole: 'farmer',
        title: '🎉 Customer Accepted Your Counter-Offer!',
        message: `${bargain.customerName} accepted your counter-offer of ₹${bargain.counterPrice}/${bargain.unit} for "${bargain.productTitle}".`,
        category: 'order',
        priority: 'HIGH'
      });
    }

    return res.json({ success: true, message: `Counter-offer ${bargain.status.toLowerCase()}`, bargain });
  } catch (error) {
    console.error('customerRespond error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Unable to respond to counter-offer' });
  }
};

/**
 * PUT /api/bargains/:id/add-to-cart
 * Marks an ACCEPTED bargain as ADDED_TO_CART after cart insertion succeeds.
 * Moves bargain from active bargains into bargain history and prevents duplicate additions.
 */
const markBargainAddedToCart = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const customerId = String(req.user.id || req.user._id);
    const { id } = req.params;

    let bargain;
    if (isConnected()) {
      const orConditions = [{ bargainId: id }];
      if (mongoose.Types.ObjectId.isValid(id)) {
        orConditions.push({ _id: id });
      }
      bargain = await Bargain.findOne({ $or: orConditions });
    } else {
      bargain = memoryBargains.find(b => String(b.bargainId) === id || String(b.id || b._id) === id);
    }

    if (!bargain) {
      return res.status(404).json({ success: false, message: 'Bargain not found' });
    }

    if (String(bargain.customerId) !== customerId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this bargain' });
    }

    if (bargain.status === 'ADDED_TO_CART') {
      return res.status(400).json({
        success: false,
        message: 'This bargain produce has already been added to your cart',
        alreadyConsumed: true,
        bargain
      });
    }

    if (bargain.status !== 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: `Only accepted bargains can be added to cart (current status: ${bargain.status})`
      });
    }

    const updateQuery = {
      $set: { status: 'ADDED_TO_CART' },
      $push: {
        responseHistory: {
          senderRole: 'customer',
          action: 'added_to_cart',
          timestamp: new Date()
        }
      }
    };

    if (isConnected()) {
      const updated = await Bargain.findOneAndUpdate(
        { _id: bargain._id, status: 'ACCEPTED' },
        updateQuery,
        { new: true }
      );
      if (!updated) {
        return res.status(400).json({
          success: false,
          message: 'Bargain was already transitioned or is no longer accepted'
        });
      }
      bargain = updated;
    } else {
      bargain.status = 'ADDED_TO_CART';
      bargain.responseHistory.push({
        senderRole: 'customer',
        action: 'added_to_cart',
        timestamp: new Date()
      });
    }

    return res.json({
      success: true,
      message: 'Negotiated produce successfully added to cart and moved to history',
      bargain
    });
  } catch (error) {
    console.error('markBargainAddedToCart error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Unable to update bargain status' });
  }
};

const getMemoryBargains = () => memoryBargains;

module.exports = {
  createBargain,
  getBargains,
  farmerRespond,
  customerRespond,
  markBargainAddedToCart,
  getMemoryBargains
};
