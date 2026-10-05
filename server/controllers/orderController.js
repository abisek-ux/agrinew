const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Bargain = require('../models/Bargain');
const { isConnected } = require('../config/db');
const { getMemoryProducts } = require('./productController');
const phoneOtpService = require('../services/phoneOtpService');
const { pushNotification } = require('./notificationController');
const sendEmail = require('../utils/sendEmail');
const { resolveFarmerLocation, sanitizeOrderFarmerDetails } = require('../utils/farmerLocationHelper');

const otpPepper = () => process.env.RESET_OTP_PEPPER || 'agrilink_secret_otp_pepper_2026';
const hashOtp = (otp) => crypto.createHmac('sha256', otpPepper()).update(String(otp).trim()).digest('hex');

const memoryOrders = [];

// Helper to find product by id across mongo / memory
const findProduct = async (prodId) => {
  if (isConnected()) {
    try {
      const p = await Product.findById(prodId);
      if (p) return p;
    } catch (e) {
      // not a valid ObjectId or not found by findById
    }
    try {
      const p = await Product.findOne({ $or: [{ id: String(prodId) }, { _id: String(prodId) }] });
      if (p) return p;
    } catch (e) {}
  }
  const memoryList = getMemoryProducts();
  return memoryList.find(p => String(p.id || p._id) === String(prodId));
};

// Helper to save product after stock decrement
const saveProductStock = async (productDoc, newStock) => {
  const stockVal = Math.max(0, Number(newStock));
  productDoc.stock = stockVal;
  if (isConnected() && typeof productDoc.save === 'function') {
    await productDoc.save();
  }
};

/**
 * POST /api/orders
 * Supports multi-farmer cart splitting and backend stock management
 */
const createOrder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required to place an order' });
    }

    const {
      customerName,
      customerPhone,
      customerEmail,
      customerLocation,
      items,
      expressDelivery
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }

    const currentUserId = String(req.user.id || req.user._id);
    const currentUserName = customerName || `${req.user.firstName || 'Customer'} ${req.user.lastName || 'Shopper'}`.trim();
    const currentUserPhone = customerPhone || req.user.phone || '+919840012345';
    const currentUserEmail = customerEmail || req.user.email || '';
    const currentUserLocation = customerLocation || req.user.location || { lat: 12.9716, lng: 77.5946, address: 'Customer Address, Bengaluru' };

    // 1. Stock validation & Product resolution
    const resolvedItems = [];
    for (const item of items) {
      const prodId = item.productId || item.id || item._id;
      if (!prodId) {
        return res.status(400).json({ success: false, message: 'Each item must have a valid productId' });
      }

      const qty = Number(item.quantity) || 1;
      if (qty <= 0) {
        return res.status(400).json({ success: false, message: 'Item quantity must be greater than zero' });
      }

      const product = await findProduct(prodId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product "${item.title || prodId}" not found in catalog` });
      }

      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.title}". Requested: ${qty}, Available: ${product.stock}`
        });
      }

      let effectivePrice = Number(product.price);
      if (item.price && Number(item.price) < effectivePrice) {
        let acceptedBargain = null;
        if (isConnected()) {
          acceptedBargain = await Bargain.findOne({
            customerId: currentUserId,
            productId: String(product._id || product.id),
            status: 'ACCEPTED'
          }).sort({ updatedAt: -1 });
        } else {
          try {
            const { getMemoryBargains } = require('./bargainController');
            const mBargains = getMemoryBargains();
            acceptedBargain = mBargains.find(b =>
              String(b.customerId) === currentUserId &&
              String(b.productId) === String(product._id || product.id) &&
              b.status === 'ACCEPTED'
            );
          } catch {}
        }

        if (acceptedBargain) {
          const negotiatedRate = Number(acceptedBargain.counterPrice || acceptedBargain.proposedPrice);
          if (negotiatedRate > 0 && Math.abs(Number(item.price) - negotiatedRate) < 0.5) {
            effectivePrice = negotiatedRate;
          }
        }
      }

      resolvedItems.push({
        productDoc: product,
        productId: String(product._id || product.id),
        title: product.title,
        price: effectivePrice,
        quantity: qty,
        unit: product.unit || 'kg',
        image: product.image || item.image || '',
        farmerId: String(product.farmerId || 'farmer_1'),
        farmerName: product.farmerName || 'Farm Origin',
        farmerPhone: product.farmerPhone || '',
        farmerEmail: product.farmerEmail || '',
        farmerLocation: resolveFarmerLocation(product.location, product.farmerId, req.user)
      });
    }

    // 2. Group items by farmerId (Solves the Multi-Farmer Cart Problem)
    const farmerGroups = {};
    for (const item of resolvedItems) {
      const fId = item.farmerId;
      if (!farmerGroups[fId]) {
        farmerGroups[fId] = {
          farmerId: fId,
          farmerName: item.farmerName,
          farmerPhone: item.farmerPhone,
          farmerEmail: item.farmerEmail,
          farmerLocation: item.farmerLocation,
          items: []
        };
      }
      farmerGroups[fId].items.push(item);
    }

    // 3. Atomically decrement stock and create an order per farmer
    const createdOrders = [];
    const deliveryFeePerOrder = expressDelivery ? 49 : 0;

    for (const fId of Object.keys(farmerGroups)) {
      const group = farmerGroups[fId];
      let subtotal = 0;

      const orderItems = [];
      for (const item of group.items) {
        subtotal += item.price * item.quantity;
        // Decrement stock safely
        await saveProductStock(item.productDoc, item.productDoc.stock - item.quantity);

        orderItems.push({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
          image: item.image
        });
      }

      const totalAmount = subtotal + deliveryFeePerOrder;
      const groupLocation = resolveFarmerLocation(group.farmerLocation, group.farmerId, req.user);
      const isRobert = !group.farmerName || String(group.farmerName).toLowerCase().includes('robert') || String(group.farmerName).toLowerCase().includes('murugan') || group.farmerName === 'Farm Origin';
      const effectiveFarmerName = (req.user && req.user.role === 'farmer')
        ? `${req.user.firstName || 'gowres'} ${req.user.lastName || ''}`.trim() || 'gowres'
        : (isRobert ? (groupLocation.defaultFarmerName || 'gowres (Namakkal Farmer)') : group.farmerName);

      const fLat = groupLocation.lat;
      const fLng = groupLocation.lng;
      const cLat = currentUserLocation?.lat || 12.9716;
      const cLng = currentUserLocation?.lng || 77.5946;

      const orderPayload = {
        orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        customerId: currentUserId,
        customerName: currentUserName,
        customerPhone: currentUserPhone,
        customerEmail: currentUserEmail,
        customerLocation: currentUserLocation,
        farmerId: group.farmerId,
        farmerName: effectiveFarmerName,
        farmerPhone: group.farmerPhone || (req.user?.role === 'farmer' ? req.user.phone : '+919842100111'),
        farmerEmail: group.farmerEmail || (req.user?.role === 'farmer' ? req.user.email : 'farmer@agrilink.in'),
        farmerLocation: groupLocation,
        farmerGpsLink: `https://www.google.com/maps?q=${fLat},${fLng}`,
        gpsTrackingLink: `https://www.google.com/maps/dir/?api=1&origin=${fLat},${fLng}&destination=${cLat},${cLng}`,
        deliveryId: null,
        deliveryName: 'Unassigned',
        deliveryPhone: '',
        deliveryEmail: '',
        deliveryLocation: {
          lat: groupLocation.lat,
          lng: groupLocation.lng,
          address: `${groupLocation.placeName || 'Farm Gate Depot'}`
        },
        items: orderItems,
        totalAmount,
        status: 'pending'
      };

      if (isConnected()) {
        const order = await Order.create(orderPayload);
        createdOrders.push(order);
      } else {
        const order = { id: 'ord_' + Date.now() + '_' + Math.floor(Math.random() * 1000), ...orderPayload, createdAt: new Date() };
        memoryOrders.push(order);
        createdOrders.push(order);
      }

      pushNotification({
        recipientId: currentUserId,
        recipientRole: 'customer',
        orderId: orderPayload.orderId,
        title: '📦 Order Placed Successfully',
        message: `Your farm produce order ${orderPayload.orderId} for ₹${totalAmount} has been placed with ${effectiveFarmerName}.`,
        category: 'order',
        priority: 'NORMAL'
      });

      pushNotification({
        recipientId: group.farmerId,
        recipientRole: 'farmer',
        orderId: orderPayload.orderId,
        title: '🌾 New Customer Order Received',
        message: `New order ${orderPayload.orderId} placed by ${customerName} for ${orderItems.map(i => `${i.title} (${i.quantity} ${i.unit || 'kg'})`).join(', ')}. Total: ₹${totalAmount}.`,
        category: 'order',
        priority: 'HIGH'
      });
    }

    const sanitizedOrders = createdOrders.map(o => sanitizeOrderFarmerDetails(o, req.user));

    // Support single order backward compatibility and multi-order array response
    if (sanitizedOrders.length === 1) {
      return res.status(201).json(sanitizedOrders[0]);
    } else {
      return res.status(201).json({
        success: true,
        orders: sanitizedOrders,
        message: `Cart checkout split into ${sanitizedOrders.length} separate farm orders.`
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/orders
 * Strict role-based isolation:
 * - Customer: sees only their orders
 * - Farmer: sees only orders with their products
 * - Delivery: sees assigned orders + unassigned ready orders
 */
const getOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required to view orders' });
    }

    const userId = String(req.user.id || req.user._id);
    const userRole = String(req.user.role || 'customer').toLowerCase();
    const userEmail = (req.user.email || '').toLowerCase().trim();

    if (isConnected()) {
      let query = {};
      if (userRole === 'customer') {
        query = {
          $or: [
            { customerId: userId },
            ...(userEmail ? [{ customerEmail: userEmail }] : [])
          ]
        };
      } else if (userRole === 'farmer') {
        query = {
          $or: [
            { farmerId: userId },
            ...(userEmail ? [{ farmerEmail: userEmail }] : [])
          ]
        };
      } else if (userRole === 'delivery') {
        query = {
          $or: [
            { deliveryId: userId },
            {
              $and: [
                { deliveryId: { $in: [null, 'Unassigned', ''] } },
                { status: { $in: ['confirmed', 'accepted', 'packed'] } }
              ]
            }
          ]
        };
      } else if (userRole === 'admin') {
        query = {};
      } else {
        return res.status(403).json({ success: false, message: 'Unauthorized role' });
      }

      const orders = await Order.find(query).sort({ createdAt: -1 });
      return res.json(orders.map(o => sanitizeOrderFarmerDetails(o, req.user)));
    } else {
      let filtered = [];
      if (userRole === 'customer') {
        filtered = memoryOrders.filter(o =>
          String(o.customerId) === userId ||
          (userEmail && o.customerEmail && o.customerEmail.toLowerCase() === userEmail)
        );
      } else if (userRole === 'farmer') {
        filtered = memoryOrders.filter(o =>
          String(o.farmerId) === userId ||
          (userEmail && o.farmerEmail && o.farmerEmail.toLowerCase() === userEmail)
        );
      } else if (userRole === 'delivery') {
        filtered = memoryOrders.filter(o =>
          String(o.deliveryId) === userId ||
          ((!o.deliveryId || o.deliveryId === 'Unassigned') && ['confirmed', 'accepted', 'packed'].includes(o.status))
        );
      } else if (userRole === 'admin') {
        filtered = [...memoryOrders];
      } else {
        return res.status(403).json({ success: false, message: 'Unauthorized role' });
      }

      return res.json([...filtered].reverse().map(o => sanitizeOrderFarmerDetails(o, req.user)));
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/orders/:id/status
 * Authorized order status transitions:
 * - Farmer: can mark 'confirmed'/'accepted' or 'packed' on their own orders.
 * - Delivery: can mark 'assigned', 'picked_up', 'in_transit', 'arrived' on their assigned orders.
 * - Marking 'delivered' requires OTP verification via POST /api/orders/:id/delivery-otp/verify.
 */
const updateOrderStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { id } = req.params;
    const { status, deliveryName, deliveryPhone, deliveryEmail, deliveryLocation } = req.body;
    const userId = String(req.user.id || req.user._id);
    const userRole = String(req.user.role || '').toLowerCase();

    const validStatuses = ['pending', 'confirmed', 'accepted', 'packed', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'arrived', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    if (status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Delivery completion requires customer OTP verification via POST /api/orders/:id/delivery-otp/verify'
      });
    }

    let order;
    if (isConnected()) {
      order = await Order.findById(id);
    } else {
      order = memoryOrders.find(o => String(o.id || o._id) === String(id));
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ success: false, message: 'Order is already marked as delivered' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Order has already been cancelled' });
    }

    // Role-based authorization
    if (userRole === 'farmer') {
      if (String(order.farmerId) !== userId) {
        return res.status(403).json({ success: false, message: 'You are not authorized to update another farmer\'s order' });
      }
      if (!['confirmed', 'accepted', 'packed', 'cancelled'].includes(status)) {
        return res.status(403).json({
          success: false,
          message: `Farmers can only transition orders to confirmed, packed, or cancelled (requested: ${status})`
        });
      }
      if (status === 'cancelled') {
        if (!['pending', 'confirmed', 'accepted'].includes(order.status)) {
          return res.status(400).json({
            success: false,
            message: `Cannot cancel order at stage "${order.status}". Only pending or confirmed orders can be cancelled.`
          });
        }
        // Replenish stock for all items
        for (const item of order.items || []) {
          const prodId = item.productId || item.product;
          if (prodId) {
            const pDoc = await findProduct(prodId);
            if (pDoc) {
              await saveProductStock(pDoc, (Number(pDoc.stock) || 0) + Number(item.quantity));
            }
          }
        }
      }
    } else if (userRole === 'customer') {
      // Customer cancellation support
      if (String(order.customerId) !== userId && (!req.user.email || order.customerEmail?.toLowerCase() !== req.user.email.toLowerCase())) {
        return res.status(403).json({ success: false, message: 'You are not authorized to cancel this order' });
      }
      if (status !== 'cancelled') {
        return res.status(403).json({ success: false, message: 'Customers can only cancel cancellable orders' });
      }
      if (!['pending', 'confirmed', 'accepted'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel order at stage "${order.status}". Only orders that have not yet been packed or dispatched can be cancelled.`
        });
      }

      // Replenish product stock on inventory
      for (const item of order.items || []) {
        const prodId = item.productId || item.product;
        if (prodId) {
          const pDoc = await findProduct(prodId);
          if (pDoc) {
            await saveProductStock(pDoc, (Number(pDoc.stock) || 0) + Number(item.quantity));
          }
        }
      }

      // Unassign delivery if it was assigned
      order.deliveryId = null;
      order.deliveryName = 'Unassigned';
    } else if (userRole === 'delivery') {
      if (order.deliveryId && order.deliveryId !== 'Unassigned' && String(order.deliveryId) !== userId) {
        return res.status(403).json({ success: false, message: 'This order is assigned to another delivery agent' });
      }
      if (!['assigned', 'picked_up', 'in_transit', 'arrived', 'out_for_delivery'].includes(status)) {
        return res.status(403).json({
          success: false,
          message: `Delivery drivers can only update delivery transit stages (requested: ${status})`
        });
      }

      // Validate sequential status progression for delivery drivers
      const currentStatus = order.status;
      const allowedNext = {
        pending: ['assigned'],
        confirmed: ['assigned'],
        accepted: ['assigned'],
        packed: ['assigned', 'picked_up'],
        assigned: ['picked_up', 'in_transit'],
        picked_up: ['in_transit', 'out_for_delivery'],
        in_transit: ['arrived', 'out_for_delivery'],
        out_for_delivery: ['arrived'],
        arrived: []
      };

      if (!allowedNext[currentStatus] || !allowedNext[currentStatus].includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from "${currentStatus}" to "${status}". Must follow delivery logistics stages: packed -> assigned -> picked_up -> in_transit -> arrived/out_for_delivery -> delivered (via OTP).`
        });
      }

      order.deliveryId = userId;
      if (deliveryName) order.deliveryName = deliveryName;
      if (deliveryPhone) order.deliveryPhone = deliveryPhone;
      if (deliveryEmail) order.deliveryEmail = deliveryEmail;
    } else if (userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized role to modify order status' });
    }

    order.status = status;
    if (status === 'cancelled') {
      order.cancellationReason = req.body.cancellationReason || 'Order cancelled by user';
    }
    if (deliveryLocation) {
      order.deliveryLocation = deliveryLocation;
    }

    if (isConnected()) {
      await order.save();
    }

    // Send notifications on status milestones
    let notifTitle = '';
    let notifMsg = '';
    if (status === 'confirmed' || status === 'accepted') {
      notifTitle = '✅ Farmer Confirmed Order';
      notifMsg = `Farmer ${order.farmerName || 'Origin'} has accepted and confirmed your order ${order.orderId || order._id || order.id}.`;
    } else if (status === 'packed') {
      notifTitle = '📦 Order Packed';
      notifMsg = `Your order ${order.orderId || order._id || order.id} is packed and ready for dispatch at ${order.farmerName}'s farm.`;
    } else if (status === 'picked_up') {
      notifTitle = '📦 Cargo Picked Up from Farm';
      notifMsg = `Courier ${order.deliveryName || 'Partner'} has collected order ${order.orderId || order._id || order.id} from ${order.farmerName}'s farm and is preparing for transit.`;
      // Also notify farmer that courier picked up
      pushNotification({
        recipientId: order.farmerId,
        recipientRole: 'farmer',
        orderId: order.orderId || order._id || order.id,
        title: '📦 Cargo Dispatched with Courier',
        message: `Courier ${order.deliveryName || 'Partner'} has picked up order ${order.orderId || order._id || order.id} from your farm depot.`,
        category: 'delivery',
        priority: 'NORMAL'
      });
    } else if (status === 'in_transit') {
      notifTitle = '🛵 Out for Delivery';
      notifMsg = `Order ${order.orderId || order._id || order.id} is out for delivery! Driver: ${order.deliveryName || 'Courier'}.`;
    } else if (status === 'arrived') {
      notifTitle = '📍 Delivery Partner Arrived';
      notifMsg = `Driver ${order.deliveryName || 'Courier'} has arrived at your address with order ${order.orderId || order._id || order.id}. Please provide your handover PIN upon inspection.`;
      // Notify farmer
      pushNotification({
        recipientId: order.farmerId,
        recipientRole: 'farmer',
        orderId: order.orderId || order._id || order.id,
        title: '📍 Courier Arrived at Customer Doorstep',
        message: `Courier ${order.deliveryName || 'Partner'} has arrived at customer ${order.customerName}'s destination for order ${order.orderId || order._id || order.id}.`,
        category: 'delivery',
        priority: 'NORMAL'
      });
    } else if (status === 'cancelled') {
      notifTitle = '⚠️ Order Cancelled by Farmer';
      notifMsg = `Your order ${order.orderId || order._id || order.id} has been cancelled by ${order.farmerName}. Reserved produce has been returned to inventory.`;
    }

    if (notifTitle) {
      pushNotification({
        recipientId: order.customerId,
        recipientRole: 'customer',
        orderId: order.orderId || order._id || order.id,
        title: notifTitle,
        message: notifMsg,
        category: 'order',
        priority: status === 'cancelled' || status === 'arrived' ? 'HIGH' : 'NORMAL'
      });
    }

    return res.json(sanitizeOrderFarmerDetails(order, req.user));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/orders/:id/assign
 * Delivery agent claims / assigns an order to themselves
 */
const assignDeliveryDriver = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'delivery') {
      return res.status(403).json({ success: false, message: 'Only delivery drivers can assign orders' });
    }

    const { id } = req.params;
    const driverId = String(req.user.id || req.user._id);
    const driverName = `${req.user.firstName || 'David'} ${req.user.lastName || 'Swift'}`.trim();
    const driverPhone = req.user.phone || '+919842155678';
    const driverEmail = req.user.email || 'driver@nexus.io';

    let order;
    if (isConnected()) {
      order = await Order.findById(id);
    } else {
      order = memoryOrders.find(o => String(o.id || o._id) === String(id));
    }

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.deliveryId && order.deliveryId !== 'Unassigned' && String(order.deliveryId) !== driverId) {
      return res.status(409).json({ success: false, message: 'Order has already been assigned to another courier' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ success: false, message: 'Order is already delivered' });
    }

    order.deliveryId = driverId;
    order.deliveryName = driverName;
    order.deliveryPhone = driverPhone;
    order.deliveryEmail = driverEmail;
    order.status = 'assigned';

    if (isConnected()) {
      await order.save();
    }

    pushNotification({
      recipientId: order.customerId,
      recipientRole: 'customer',
      orderId: order.orderId || order._id || order.id,
      title: '🚚 Delivery Courier Assigned',
      message: `Courier ${driverName} has been assigned to deliver order ${order.orderId || order._id || order.id}.`,
      category: 'delivery',
      priority: 'NORMAL'
    });

    pushNotification({
      recipientId: order.farmerId,
      recipientRole: 'farmer',
      orderId: order.orderId || order._id || order.id,
      title: '🚚 Courier Assigned for Pickup',
      message: `Courier ${driverName} has been assigned to pick up order ${order.orderId || order._id || order.id} from your farm depot.`,
      category: 'delivery',
      priority: 'NORMAL'
    });

    pushNotification({
      recipientId: driverId,
      recipientRole: 'delivery',
      orderId: order.orderId || order._id || order.id,
      title: '🚚 Order Claimed Successfully',
      message: `You have claimed order ${order.orderId || order._id || order.id}. Ready for pickup at ${order.farmerName}'s farm.`,
      category: 'delivery',
      priority: 'NORMAL'
    });

    return res.json({ success: true, message: 'Order successfully assigned to driver', order: sanitizeOrderFarmerDetails(order, req.user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/orders/:id/location
 * Driver updates GPS location of delivery
 */
const updateDeliveryLocation = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'delivery') {
      return res.status(403).json({ success: false, message: 'Only delivery drivers can update GPS location' });
    }

    const { id } = req.params;
    const { lat, lng, address } = req.body;
    const driverId = String(req.user.id || req.user._id);

    let order;
    if (isConnected()) {
      order = await Order.findById(id);
    } else {
      order = memoryOrders.find(o => String(o.id || o._id) === String(id));
    }

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.deliveryId && order.deliveryId !== 'Unassigned' && String(order.deliveryId) !== driverId) {
      return res.status(403).json({ success: false, message: 'Unauthorized driver' });
    }

    const newLocation = { lat: Number(lat), lng: Number(lng), address: address || 'En Route' };
    order.deliveryLocation = newLocation;

    if (isConnected()) {
      await order.save();
    }
    return res.json({ success: true, deliveryLocation: order.deliveryLocation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/orders/:id/delivery-otp/generate
 * Driver triggers OTP dispatch to customer's verified email at doorstep
 */
const generateDeliveryOtp = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'delivery') {
      return res.status(403).json({ success: false, message: 'Only authorized delivery drivers can generate handover OTP' });
    }

    const { id } = req.params;
    const driverId = String(req.user.id || req.user._id);

    let order;
    if (isConnected()) {
      order = await Order.findById(id);
    } else {
      order = memoryOrders.find(o => String(o.id || o._id) === String(id));
    }

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.deliveryId && order.deliveryId !== 'Unassigned' && String(order.deliveryId) !== driverId) {
      return res.status(403).json({ success: false, message: 'You are not the assigned delivery agent for this order' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ success: false, message: 'Order is already marked as delivered' });
    }

    // Resolve customer's verified email address
    let customerEmail = (order.customerEmail || '').trim();
    if (!customerEmail && order.customerId) {
      const custUser = isConnected()
        ? await User.findById(order.customerId)
        : null;
      if (custUser && custUser.email) {
        customerEmail = custUser.email;
        order.customerEmail = customerEmail;
      }
    }

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Order has no customer email address on record for delivery handover.'
      });
    }

    // Rate-limiting: 60 seconds cooldown between OTP generation requests
    const now = Date.now();
    if (order.deliveryOtpLastSentAt) {
      const elapsed = Math.floor((now - new Date(order.deliveryOtpLastSentAt).getTime()) / 1000);
      const cooldownRemaining = 60 - elapsed;
      if (cooldownRemaining > 0) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${cooldownRemaining}s before requesting a new handover code.`,
          cooldownSeconds: cooldownRemaining
        });
      }
    }

    // Generate secure cryptographically random 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(rawOtp);

    order.deliveryOtpHash = otpHash;
    order.deliveryOtpExpiresAt = new Date(now + 10 * 60 * 1000); // 10 minutes expiry
    order.deliveryOtpAttempts = 0;
    order.deliveryOtpLastSentAt = new Date(now);

    if (isConnected()) {
      await order.save();
    }

    // Dispatch OTP to customer's verified email via Google Apps Script Webhook / Nodemailer SMTP
    const emailResult = await sendEmail({
      to: customerEmail,
      subject: `📦 [Handover Code] Order ${order.orderId || order._id || order.id} Has Arrived`,
      otp: rawOtp,
      firstName: order.customerName,
      type: 'delivery'
    });

    // Also support SMS as secondary fallback if phone exists
    if (order.customerPhone) {
      try {
        const otpPurpose = `delivery_${order._id || order.id}`;
        await phoneOtpService.requestOtp({ phone: order.customerPhone, purpose: otpPurpose });
      } catch (smsErr) {
        console.warn('SMS handover backup notice:', smsErr.message);
      }
    }

    console.log(`\n======================================================`);
    console.log(`🔑 [DELIVERY EMAIL OTP] Handover code dispatched to ${customerEmail}`);
    console.log(`======================================================\n`);

    const maskedMail = customerEmail.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 5)) + c);

    return res.json({
      success: true,
      message: `Delivery handover OTP dispatched to customer's verified email (${maskedMail})`,
      orderId: order._id || order.id,
      customerEmail: maskedMail,
      cooldownSeconds: 60,
      expiresInMinutes: 10
    });
  } catch (error) {
    const status = error.statusCode || (error.message?.includes('cooldown') ? 429 : 500);
    res.status(status).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/orders/:id/delivery-otp/verify
 * Driver inputs customer OTP to complete delivery handover
 */
const verifyDeliveryOtp = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'delivery') {
      return res.status(403).json({ success: false, message: 'Only delivery drivers can verify handover OTP' });
    }

    const { id } = req.params;
    const { otp } = req.body;
    const driverId = String(req.user.id || req.user._id);

    if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp.trim())) {
      return res.status(400).json({ success: false, message: 'Valid 6-digit OTP code is required' });
    }

    const cleanOtp = otp.trim();

    let order;
    if (isConnected()) {
      order = await Order.findById(id);
    } else {
      order = memoryOrders.find(o => String(o.id || o._id) === String(id));
    }

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.deliveryId && order.deliveryId !== 'Unassigned' && String(order.deliveryId) !== driverId) {
      return res.status(403).json({ success: false, message: 'You are not the assigned delivery agent for this order' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ success: false, message: 'This order has already been authenticated and delivered' });
    }

    let verified = false;

    // 1. Verify primary Email OTP hash
    if (order.deliveryOtpHash && order.deliveryOtpExpiresAt) {
      if (new Date() > new Date(order.deliveryOtpExpiresAt)) {
        order.deliveryOtpHash = null;
        if (isConnected()) await order.save();
        return res.status(400).json({ success: false, message: 'Handover OTP has expired. Please request a new code.' });
      }

      if ((order.deliveryOtpAttempts || 0) >= 5) {
        order.deliveryOtpHash = null;
        if (isConnected()) await order.save();
        return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please request a new code.' });
      }

      const submittedHash = hashOtp(cleanOtp);
      const subBuf = Buffer.from(submittedHash);
      const storedBuf = Buffer.from(order.deliveryOtpHash);

      if (subBuf.length === storedBuf.length && crypto.timingSafeEqual(subBuf, storedBuf)) {
        verified = true;
      } else {
        order.deliveryOtpAttempts = (order.deliveryOtpAttempts || 0) + 1;
        if (isConnected()) await order.save();
      }
    }

    // 2. Secondary fallback via phone OTP service if configured
    if (!verified && order.customerPhone) {
      const otpPurpose = `delivery_${order._id || order.id}`;
      const verifyResult = await phoneOtpService.verifyOtp({
        phone: order.customerPhone,
        otp: cleanOtp,
        purpose: otpPurpose
      });
      if (verifyResult.verified) {
        verified = true;
      }
    }

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid delivery handover OTP code' });
    }

    // Mark as delivered
    order.status = 'delivered';
    order.deliveryOtpVerifiedAt = new Date();
    order.deliveryOtpHash = null;

    if (isConnected()) {
      await order.save();
    }

    pushNotification({
      recipientId: order.customerId,
      recipientRole: 'customer',
      orderId: order.orderId || order._id || order.id,
      title: '🎉 Order Delivered Successfully',
      message: `Order ${order.orderId || order._id || order.id} has been delivered and authenticated via Email OTP. Thank you for buying direct from farmers!`,
      category: 'order',
      priority: 'HIGH'
    });

    pushNotification({
      recipientId: order.farmerId,
      recipientRole: 'farmer',
      orderId: order.orderId || order._id || order.id,
      title: '🎉 Produce Delivered & Settlement Logged',
      message: `Order ${order.orderId || order._id || order.id} has been authenticated with delivery OTP and delivered to ${order.customerName}. Total: ₹${order.totalAmount}.`,
      category: 'order',
      priority: 'HIGH'
    });

    pushNotification({
      recipientId: driverId,
      recipientRole: 'delivery',
      orderId: order.orderId || order._id || order.id,
      title: '🎉 Delivery Completed & Authenticated',
      message: `Order ${order.orderId || order._id || order.id} successfully authenticated with customer handover OTP and delivered!`,
      category: 'delivery',
      priority: 'HIGH'
    });

    return res.json({
      success: true,
      delivered: true,
      message: 'Delivery successfully authenticated and completed!',
      order: sanitizeOrderFarmerDetails(order, req.user)
    });
  } catch (error) {
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/orders/:id/dispatch-signal
 * POST /api/orders/dispatch-signal
 * Farmer signals dispatch for packed orders to summon regional courier fleet
 */
const confirmDispatchSignal = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'farmer') {
      return res.status(403).json({ success: false, message: 'Only registered farmers can signal produce dispatch' });
    }

    const farmerId = String(req.user.id || req.user._id);
    const { id } = req.params;
    const { orderIds } = req.body;

    let targetOrders = [];
    if (id && id !== 'batch') {
      let order = isConnected() ? await Order.findById(id) : memoryOrders.find(o => String(o.id || o._id) === String(id));
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      if (String(order.farmerId) !== farmerId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'You are not authorized to dispatch another farmer\'s order' });
      }
      targetOrders = [order];
    } else if (Array.isArray(orderIds) && orderIds.length > 0) {
      if (isConnected()) {
        targetOrders = await Order.find({ _id: { $in: orderIds }, farmerId });
      } else {
        targetOrders = memoryOrders.filter(o => orderIds.includes(String(o.id || o._id)) && String(o.farmerId) === farmerId);
      }
    } else {
      // Dispatch all packed/confirmed orders for this farmer
      if (isConnected()) {
        targetOrders = await Order.find({ farmerId, status: { $in: ['confirmed', 'accepted', 'packed'] } });
      } else {
        targetOrders = memoryOrders.filter(o => String(o.farmerId) === farmerId && ['confirmed', 'accepted', 'packed'].includes(o.status));
      }
    }

    if (targetOrders.length === 0) {
      return res.status(400).json({ success: false, message: 'No confirmed or packed orders available to dispatch' });
    }

    const now = new Date();
    for (const order of targetOrders) {
      order.status = 'packed';
      order.dispatchSignaledAt = now;
      if (isConnected()) {
        await order.save();
      }

      // Notify customer
      pushNotification({
        recipientId: order.customerId,
        recipientRole: 'customer',
        orderId: order.orderId || order._id || order.id,
        title: '📦 Farm Produce Packed & Dispatch Signaled',
        message: `Farmer ${order.farmerName} has packed order ${order.orderId || order._id || order.id} and signaled the regional courier fleet for farm gate pickup!`,
        category: 'order',
        priority: 'HIGH'
      });

      // Notify farmer
      pushNotification({
        recipientId: order.farmerId,
        recipientRole: 'farmer',
        orderId: order.orderId || order._id || order.id,
        title: '🛰️ Dispatch Signal Transmitted',
        message: `Dispatch beacon confirmed for Order ${order.orderId || order._id || order.id}. Logistics couriers alerted for farm gate collection.`,
        category: 'delivery',
        priority: 'NORMAL'
      });
    }

    return res.json({
      success: true,
      message: `Dispatch signal successfully confirmed for ${targetOrders.length} order(s)!`,
      dispatchedCount: targetOrders.length,
      orders: targetOrders
    });
  } catch (error) {
    console.error('confirmDispatchSignal error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Unable to confirm dispatch signal' });
  }
};

/**
 * POST /api/orders/pay
 * or POST /api/orders/:id/pay
 * Records payment method, transactionId, payment status ('paid'), and updates order status.
 */
const processOrderPayment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const { orderId, orderIds, paymentMethod, transactionId, amountPaid } = req.body;
    const targetId = req.params.id || orderId;
    let ids = orderIds || (targetId ? [targetId] : []);
    if (!Array.isArray(ids)) ids = [ids];

    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Order ID is required to process payment' });
    }

    const txnId = transactionId || `TXN-AGRI-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const method = paymentMethod || 'UPI';
    const updatedOrders = [];

    for (const id of ids) {
      if (isConnected()) {
        const order = await Order.findOne({
          $or: [{ _id: id }, { id: id }, { orderId: id }]
        });
        if (order) {
          order.paymentStatus = 'paid';
          order.paymentMethod = method;
          order.transactionId = txnId;
          order.paidAt = new Date();
          if (order.status === 'pending') {
            order.status = 'confirmed';
          }
          await order.save();
          updatedOrders.push(order);

          // Push payment notification to customer
          pushNotification({
            recipientId: order.customerId,
            recipientRole: 'customer',
            orderId: order.orderId || order._id || order.id,
            title: '💳 Payment Confirmed & Verified',
            message: `Payment of ₹${order.totalAmount} via ${method} confirmed for Order ${order.orderId || order._id || order.id}. Txn Ref: ${txnId}`,
            category: 'order',
            priority: 'HIGH'
          });
        }
      } else {
        const order = memoryOrders.find(o => String(o._id || o.id || o.orderId) === String(id));
        if (order) {
          order.paymentStatus = 'paid';
          order.paymentMethod = method;
          order.transactionId = txnId;
          order.paidAt = new Date();
          if (order.status === 'pending') {
            order.status = 'confirmed';
          }
          updatedOrders.push(order);
        }
      }
    }

    return res.json({
      success: true,
      message: 'Payment received and verified successfully!',
      transactionId: txnId,
      paymentMethod: method,
      orders: updatedOrders.map(o => sanitizeOrderFarmerDetails(o, req.user))
    });
  } catch (error) {
    console.error('processOrderPayment error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Payment processing failed' });
  }
};

const seedMemoryOrder = (ord) => memoryOrders.push(ord);
const getMemoryOrders = () => memoryOrders;

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  assignDeliveryDriver,
  updateDeliveryLocation,
  generateDeliveryOtp,
  verifyDeliveryOtp,
  confirmDispatchSignal,
  processOrderPayment,
  seedMemoryOrder,
  getMemoryOrders
};