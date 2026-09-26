const Order = require('../models/Order');
const { isConnected } = require('../config/db');

const memoryOrders = [];

const createOrder = async (req, res) => {
  try {
    const {
      customerId, customerName, customerPhone, customerEmail, customerLocation,
      farmerId, farmerName, farmerPhone, farmerEmail, farmerLocation,
      items, totalAmount
    } = req.body;

    if (!Array.isArray(items) || items.length === 0 || !Number.isFinite(Number(totalAmount)) || Number(totalAmount) < 0) {
      return res.status(400).json({ success: false, message: 'Order items and a valid total are required' });
    }

    const currentUserId = String(req.user?.id || req.user?._id || 'cust_' + Date.now());
    const currentUserName = customerName || `${req.user?.firstName || 'Customer'} ${req.user?.lastName || 'Shopper'}`.trim();
    const currentUserPhone = customerPhone || req.user?.phone || '+1 555-019-2834';
    const currentUserEmail = customerEmail || req.user?.email || 'customer@agrilink.io';
    const currentUserLocation = customerLocation || req.user?.location || { lat: 12.9716, lng: 77.5946, address: 'Bengaluru Delivery Address, Karnataka, India' };

    const orderData = {
      orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      customerId: currentUserId,
      customerName: currentUserName,
      customerPhone: currentUserPhone,
      customerEmail: currentUserEmail,
      customerLocation: currentUserLocation,
      farmerId: farmerId || 'farmer_1',
      farmerName: farmerName || 'Greenfield Organic Farms',
      farmerPhone: farmerPhone || '+1 555-019-9988',
      farmerEmail: farmerEmail || 'farmer@nexus.io',
      farmerLocation: farmerLocation || { lat: 12.5222, lng: 76.9004, address: 'Mandya Organic Farm, Karnataka, India' },
      deliveryLocation: { lat: farmerLocation?.lat || 12.5222, lng: farmerLocation?.lng || 76.9004, address: 'Farm Packing Depot, Karnataka, India' },
      items,
      totalAmount: Number(totalAmount),
      status: 'pending'
    };

    if (isConnected()) {
      const order = await Order.create(orderData);
      return res.status(201).json(order);
    } else {
      const order = { id: 'ord_' + Date.now(), ...orderData, createdAt: new Date() };
      memoryOrders.push(order);
      return res.status(201).json(order);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const userId = String(req.user ? (req.user.id || req.user._id) : (req.query?.customerId || ''));
    const userRole = req.user ? req.user.role : (req.query?.role || 'customer');
    const userEmail = req.user ? req.user.email : (req.query?.customerEmail || '');

    if (isConnected()) {
      let query = {};
      if (userRole === 'customer') {
        const conditions = [];
        if (userId) conditions.push({ customerId: userId });
        if (userEmail) conditions.push({ customerEmail: userEmail });
        query = conditions.length > 0 ? { $or: conditions } : {};
      } else if (userRole === 'farmer') {
        query = {
          $or: [
            { farmerId: userId },
            { farmerEmail: userEmail },
            { farmerEmail: 'farmer@nexus.io' },
            { farmerId: 'farmer_1' },
            { farmerId: 'user_farmer' }
          ]
        };
      } else if (userRole === 'delivery') {
        query = {}; // Delivery fleet has visibility over active logistics orders
      }

      const orders = await Order.find(query).sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      let filtered = memoryOrders;
      if (userRole === 'customer') {
        if (userId || userEmail) {
          filtered = memoryOrders.filter(o => (userId && String(o.customerId) === userId) || (userEmail && o.customerEmail === userEmail));
        } else {
          filtered = memoryOrders;
        }
      } else if (userRole === 'farmer') {
        filtered = memoryOrders.filter(o =>
          String(o.farmerId) === userId ||
          o.farmerEmail === userEmail ||
          o.farmerEmail === 'farmer@nexus.io' ||
          !o.farmerId ||
          o.farmerId === 'farmer_1' ||
          o.farmerId === 'user_farmer'
        );
      } else if (userRole === 'delivery') {
        filtered = memoryOrders;
      }

      return res.json([...filtered].reverse());
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deliveryName, deliveryPhone, deliveryEmail, deliveryLocation } = req.body;
    const deliveryId = req.user ? String(req.user.id || req.user._id) : null;
    const validStatuses = ['pending', 'accepted', 'picked_up', 'in_transit', 'delivered'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status transition requested' });
    }

    const applyUpdates = (order) => {
      order.status = status;
      if (req.user?.role === 'delivery' || deliveryName) {
        order.deliveryId = deliveryId;
        if (deliveryName) order.deliveryName = deliveryName;
        if (deliveryPhone) order.deliveryPhone = deliveryPhone;
        if (deliveryEmail) order.deliveryEmail = deliveryEmail;
      }

      if (deliveryLocation) {
        order.deliveryLocation = deliveryLocation;
      }
    };

    if (isConnected()) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      applyUpdates(order);
      await order.save();
      return res.json(order);
    } else {
      const order = memoryOrders.find(o => o.id === id || o._id === id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      applyUpdates(order);
      return res.json(order);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDeliveryLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng, address } = req.body;
    const driverId = String(req.user?.id || req.user?._id || 'driver_1');
    const driverName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || 'Delivery Driver';

    const newLocation = { lat: Number(lat), lng: Number(lng), address: address || 'En Route' };

    if (isConnected()) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      order.deliveryId = driverId;
      order.deliveryName = driverName;
      if (req.user?.phone) order.deliveryPhone = req.user.phone;
      if (req.user?.email) order.deliveryEmail = req.user.email;
      order.deliveryLocation = newLocation;

      await order.save();
      return res.json({ success: true, deliveryLocation: order.deliveryLocation });
    } else {
      const order = memoryOrders.find(o => o.id === id || o._id === id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      order.deliveryId = driverId;
      order.deliveryName = driverName;
      if (req.user?.phone) order.deliveryPhone = req.user.phone;
      if (req.user?.email) order.deliveryEmail = req.user.email;
      order.deliveryLocation = newLocation;

      return res.json({ success: true, deliveryLocation: order.deliveryLocation });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const seedMemoryOrder = (ord) => memoryOrders.push(ord);

module.exports = { createOrder, getOrders, updateOrderStatus, updateDeliveryLocation, seedMemoryOrder };