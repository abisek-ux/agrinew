const Order = require('../models/Order');
const Product = require('../models/Product');
const { isConnected } = require('../config/db');
const { getMemoryProducts } = require('./productController');
const phoneOtpService = require('../services/phoneOtpService');
const { pushNotification } = require('./notificationController');

const memoryOrders = [];

// Helper to find product by id across mongo / memory
const findProduct = async (prodId) => {
  if (isConnected()) {
    return await Product.findById(prodId);
  }
  const memoryList = getMemoryProducts();
  return memoryList.find(p => String(p.id || p._id) === String(prodId));
};

// Helper to save product after stock decrement
const saveProductStock = async (productDoc, newStock) => {
  if (isConnected()) {
    productDoc.stock = newStock;
    await productDoc.save();
  } else {
    productDoc.stock = newStock;
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

      resolvedItems.push({
        productDoc: product,
        productId: String(product._id || product.id),
        title: product.title,
        price: Number(product.price),
        quantity: qty,
        unit: product.unit || 'kg',
        image: product.image || item.image || '',
        farmerId: String(product.farmerId || 'farmer_1'),
        farmerName: product.farmerName || 'Farm Origin',
        farmerPhone: product.farmerPhone || '',
        farmerEmail: product.farmerEmail || '',
        farmerLocation: product.location || { lat: 12.5222, lng: 76.9004, address: 'Farm Depot' }
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
      const orderPayload = {
        orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        customerId: currentUserId,
        customerName: currentUserName,
        customerPhone: currentUserPhone,
        customerEmail: currentUserEmail,
        customerLocation: currentUserLocation,
        farmerId: group.farmerId,
        farmerName: group.farmerName,
        farmerPhone: group.farmerPhone,
        farmerEmail: group.farmerEmail,
        farmerLocation: group.farmerLocation,
        deliveryId: null,
        deliveryName: 'Unassigned',
        deliveryPhone: '',
        deliveryEmail: '',
        deliveryLocation: {
          lat: group.farmerLocation?.lat || 12.5222,
          lng: group.farmerLocation?.lng || 76.9004,
          address: 'Farm Packing Depot'
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
        message: `Your farm produce order ${orderPayload.orderId} for ₹${totalAmount} has been placed with ${group.farmerName}.`,
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

    // Support single order backward compatibility and multi-order array response
    if (createdOrders.length === 1) {
      return res.status(201).json(createdOrders[0]);
    } else {
      return res.status(201).json({
        success: true,
        orders: createdOrders,
        message: `Cart checkout split into ${createdOrders.length} separate farm orders.`
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
            },
            { status: { $in: ['assigned', 'picked_up', 'in_transit', 'arrived'] } }
          ]
        };
      } else if (userRole === 'admin') {
        query = {};
      } else {
        return res.status(403).json({ success: false, message: 'Unauthorized role' });
      }

      const orders = await Order.find(query).sort({ createdAt: -1 });
      return res.json(orders);
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
          ((!o.deliveryId || o.deliveryId === 'Unassigned') && ['confirmed', 'accepted', 'packed'].includes(o.status)) ||
          ['assigned', 'picked_up', 'in_transit', 'arrived'].includes(o.status)
        );
      } else if (userRole === 'admin') {
        filtered = [...memoryOrders];
      } else {
        return res.status(403).json({ success: false, message: 'Unauthorized role' });
      }

      return res.json([...filtered].reverse());
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

    const validStatuses = ['pending', 'confirmed', 'accepted', 'packed', 'assigned', 'picked_up', 'in_transit', 'arrived', 'delivered', 'cancelled'];
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
    } else if (userRole === 'delivery') {
      if (order.deliveryId && order.deliveryId !== 'Unassigned' && String(order.deliveryId) !== userId) {
        return res.status(403).json({ success: false, message: 'This order is assigned to another delivery agent' });
      }
      if (!['assigned', 'picked_up', 'in_transit', 'arrived'].includes(status)) {
        return res.status(403).json({
          success: false,
          message: `Delivery drivers can only update delivery transit stages (requested: ${status})`
        });
      }
      order.deliveryId = userId;
      if (deliveryName) order.deliveryName = deliveryName;
      if (deliveryPhone) order.deliveryPhone = deliveryPhone;
      if (deliveryEmail) order.deliveryEmail = deliveryEmail;
    } else if (userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Customers cannot modify order status' });
    }

    order.status = status;
    if (deliveryLocation) {
      order.deliveryLocation = deliveryLocation;
    }

    if (isConnected()) {
      await order.save();
    }

    // Send customer notification on status milestone
    let notifTitle = '';
    let notifMsg = '';
    if (status === 'confirmed' || status === 'accepted') {
      notifTitle = '✅ Farmer Confirmed Order';
      notifMsg = `Farmer ${order.farmerName || 'Origin'} has accepted and confirmed your order ${order.orderId || order._id || order.id}.`;
    } else if (status === 'packed') {
      notifTitle = '📦 Order Packed';
      notifMsg = `Your order ${order.orderId || order._id || order.id} is packed and ready for dispatch at ${order.farmerName}'s farm.`;
    } else if (status === 'in_transit' || status === 'picked_up') {
      notifTitle = '🛵 Out for Delivery';
      notifMsg = `Order ${order.orderId || order._id || order.id} is out for delivery! Driver: ${order.deliveryName || 'Courier'}.`;
    } else if (status === 'arrived') {
      notifTitle = '📍 Delivery Partner Arrived';
      notifMsg = `Driver ${order.deliveryName || 'Courier'} has arrived at your address with order ${order.orderId || order._id || order.id}.`;
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

    return res.json(order);
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

    return res.json({ success: true, message: 'Order successfully assigned to driver', order });
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
 * Driver triggers OTP dispatch to customer at doorstep
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

    const customerPhone = order.customerPhone;
    if (!customerPhone) {
      return res.status(400).json({ success: false, message: 'Order has no customer phone number on record' });
    }

    const otpPurpose = `delivery_${order._id || order.id}`;
    const result = await phoneOtpService.requestOtp({
      phone: customerPhone,
      purpose: otpPurpose
    });

    if (!result.success) {
      return res.status(result.statusCode || 400).json(result);
    }

    return res.json({
      success: true,
      message: 'Delivery handover OTP sent to customer mobile',
      orderId: order._id || order.id,
      cooldownSeconds: result.cooldownSeconds,
      ...(result.demoOtp ? { demoOtp: result.demoOtp } : {})
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

    if (!otp || typeof otp !== 'string') {
      return res.status(400).json({ success: false, message: '6-digit OTP code is required' });
    }

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

    const customerPhone = order.customerPhone;
    const otpPurpose = `delivery_${order._id || order.id}`;

    const verifyResult = await phoneOtpService.verifyOtp({
      phone: customerPhone,
      otp,
      purpose: otpPurpose
    });

    if (!verifyResult.verified) {
      return res.status(400).json({ success: false, message: verifyResult.message || 'Invalid delivery OTP' });
    }

    // Mark as delivered
    order.status = 'delivered';
    order.deliveryOtpVerifiedAt = new Date();

    if (isConnected()) {
      await order.save();
    }

    pushNotification({
      recipientId: order.customerId,
      recipientRole: 'customer',
      orderId: order.orderId || order._id || order.id,
      title: '🎉 Order Delivered Successfully',
      message: `Order ${order.orderId || order._id || order.id} has been delivered and authenticated via OTP. Thank you for buying direct from farmers!`,
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

    return res.json({
      success: true,
      delivered: true,
      message: 'Delivery successfully authenticated and completed!',
      order
    });
  } catch (error) {
    const status = error.statusCode || 400;
    res.status(status).json({ success: false, message: error.message });
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
  seedMemoryOrder,
  getMemoryOrders
};