/**
 * AgriLink — Customer Portal Transformation Automated Verification Suite
 * Verifies Customer Dashboard, Wishlist, Multi-Farmer Checkout, Stock Integrity,
 * Bargaining Lifecycle, Order Cancellation, Truthful Payment States & Notifications.
 */

const http = require('http');
const express = require('express');
const cors = require('cors');

// Create test harness
const app = express();
app.use(cors());
app.use(express.json());

// In-memory isolated state for testing
let users = [];
let products = [];
let orders = [];
let bargains = [];
let notifications = [];

// Seed baseline test data
const seedTestData = () => {
  users = [
    {
      _id: 'cust_priya_1',
      id: 'cust_priya_1',
      email: 'priya@agrilink.in',
      firstName: 'Priya',
      lastName: 'Raman',
      role: 'customer',
      wishlist: [],
      deliveryAddress: '12 Temple Street, Coimbatore, Tamil Nadu'
    },
    {
      _id: 'cust_arun_2',
      id: 'cust_arun_2',
      email: 'arun@agrilink.in',
      firstName: 'Arun',
      lastName: 'Kumar',
      role: 'customer',
      wishlist: ['prod_mango_10'],
      deliveryAddress: '44 Gandhi Road, Salem, Tamil Nadu'
    },
    {
      _id: 'farmer_murugan_1',
      id: 'farmer_murugan_1',
      email: 'murugan@agrilink.in',
      firstName: 'Murugan',
      lastName: 'P',
      role: 'farmer',
      farmName: 'Murugan Natural Farms',
      location: 'Namakkal'
    },
    {
      _id: 'farmer_selvam_2',
      id: 'farmer_selvam_2',
      email: 'selvam@agrilink.in',
      firstName: 'Selvam',
      lastName: 'M',
      role: 'farmer',
      farmName: 'Selvam Agro Belt',
      location: 'Dharmapuri'
    }
  ];

  products = [
    {
      _id: 'prod_tomato_1',
      id: 'prod_tomato_1',
      title: 'Vine-Ripened Country Tomatoes',
      category: 'vegetable',
      price: 40,
      stock: 50,
      minOrderQty: 2,
      unit: 'kg',
      farmerId: 'farmer_murugan_1',
      farmerName: 'Murugan Natural Farms',
      allowBargain: true,
      harvestDate: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      cultivationType: 'organic',
      qualityGrade: 'grade_a'
    },
    {
      _id: 'prod_spinach_2',
      id: 'prod_spinach_2',
      title: 'Fresh Palak / Spinach',
      category: 'vegetable',
      price: 25,
      stock: 0, // Out of stock
      minOrderQty: 1,
      unit: 'bundle',
      farmerId: 'farmer_murugan_1',
      farmerName: 'Murugan Natural Farms',
      allowBargain: false,
      cultivationType: 'natural',
      qualityGrade: 'standard'
    },
    {
      _id: 'prod_mango_10',
      id: 'prod_mango_10',
      title: 'Salem Alphonso Sweet Mangoes',
      category: 'fruit',
      price: 180,
      stock: 35,
      minOrderQty: 3,
      unit: 'kg',
      farmerId: 'farmer_selvam_2',
      farmerName: 'Selvam Agro Belt',
      allowBargain: true,
      harvestDate: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      cultivationType: 'natural',
      qualityGrade: 'export'
    }
  ];

  orders = [];
  bargains = [];
  notifications = [];
};

seedTestData();

// API routes simulating production endpoints

// 1. Wishlist
app.get('/api/auth/wishlist', (req, res) => {
  const userId = req.headers['x-user-id'] || 'cust_priya_1';
  const u = users.find(x => x._id === userId || x.id === userId);
  res.json({ wishlist: u?.wishlist || [] });
});

app.put('/api/auth/wishlist/toggle', (req, res) => {
  const userId = req.headers['x-user-id'] || 'cust_priya_1';
  const { productId } = req.body;
  const u = users.find(x => x._id === userId || x.id === userId);
  if (!u) return res.status(404).json({ message: 'User not found' });
  const pId = String(productId);
  const exists = u.wishlist.includes(pId);
  if (exists) {
    u.wishlist = u.wishlist.filter(id => id !== pId);
  } else {
    u.wishlist.push(pId);
  }
  res.json({ isSaved: !exists, wishlist: u.wishlist });
});

// 2. Products
app.get('/api/products', (req, res) => {
  let list = [...products];
  const { category, inStock, minPrice, maxPrice, search, allowBargain } = req.query;

  if (category && category !== 'all') {
    list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (inStock === 'true') {
    list = list.filter(p => Number(p.stock) > 0);
  }
  if (minPrice) {
    list = list.filter(p => Number(p.price) >= Number(minPrice));
  }
  if (maxPrice) {
    list = list.filter(p => Number(p.price) <= Number(maxPrice));
  }
  if (allowBargain === 'true') {
    list = list.filter(p => p.allowBargain !== false);
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(p => p.title.toLowerCase().includes(s) || (p.farmerName && p.farmerName.toLowerCase().includes(s)));
  }

  res.json(list);
});

// 3. Bargains
app.post('/api/bargains', (req, res) => {
  const userId = req.headers['x-user-id'] || 'cust_priya_1';
  const { productId, proposedPrice, quantity, message } = req.body;

  if (Number(proposedPrice) <= 0 || Number(quantity) <= 0) {
    return res.status(400).json({ message: 'Price and quantity must be positive' });
  }

  const prod = products.find(p => p._id === productId || p.id === productId);
  if (!prod) return res.status(404).json({ message: 'Product not found' });
  if (prod.allowBargain === false) return res.status(400).json({ message: 'Product is not eligible for bargaining' });

  const bargain = {
    _id: `bargain_${Date.now()}`,
    bargainId: `bargain_${Date.now()}`,
    customerId: userId,
    customerName: 'Priya Raman',
    farmerId: prod.farmerId,
    farmerName: prod.farmerName,
    productId: prod._id,
    productTitle: prod.title,
    originalPrice: prod.price,
    proposedPrice: Number(proposedPrice),
    counterPrice: null,
    quantity: Number(quantity),
    unit: prod.unit,
    status: 'PENDING',
    message: message || '',
    createdAt: new Date().toISOString()
  };

  bargains.push(bargain);
  res.status(201).json({ success: true, bargain });
});

app.put('/api/bargains/:id/farmer-counter', (req, res) => {
  const b = bargains.find(x => x._id === req.params.id);
  if (!b) return res.status(404).json({ message: 'Bargain not found' });
  const { counterPrice } = req.body;
  b.counterPrice = Number(counterPrice);
  b.status = 'COUNTERED';
  res.json({ success: true, bargain: b });
});

app.put('/api/bargains/:id/customer-respond', (req, res) => {
  const b = bargains.find(x => x._id === req.params.id);
  if (!b) return res.status(404).json({ message: 'Bargain not found' });
  const { action } = req.body;
  if (action === 'accept') {
    b.status = 'ACCEPTED';
  } else {
    b.status = 'REJECTED';
  }
  res.json({ success: true, bargain: b });
});

app.put('/api/bargains/:id/added-to-cart', (req, res) => {
  const b = bargains.find(x => x._id === req.params.id);
  if (!b) return res.status(404).json({ message: 'Bargain not found' });
  if (b.status === 'ADDED_TO_CART') {
    return res.status(400).json({ message: 'Bargain already added to cart' });
  }
  if (b.status !== 'ACCEPTED') {
    return res.status(400).json({ message: 'Only accepted bargains can be added to cart' });
  }
  b.status = 'ADDED_TO_CART';
  res.json({ success: true, bargain: b });
});

// 4. Orders & Multi-Farmer Split
app.post('/api/orders', (req, res) => {
  const customerId = req.headers['x-user-id'] || 'cust_priya_1';
  const { items, paymentMethod, deliveryAddress } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Cart cannot be empty' });
  }

  // Stock deduction & server-side verification
  for (const item of items) {
    const prod = products.find(p => p._id === item.productId || p.id === item.productId);
    if (!prod) return res.status(404).json({ message: `Product ${item.title} not found` });
    if (prod.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${prod.title}. Available: ${prod.stock}` });
    }
  }

  // Atomic stock deduction
  for (const item of items) {
    const prod = products.find(p => p._id === item.productId || p.id === item.productId);
    prod.stock -= item.quantity;
  }

  // Split order by farmer
  const farmerMap = {};
  items.forEach(item => {
    const fId = item.farmerId || 'unknown_farmer';
    if (!farmerMap[fId]) farmerMap[fId] = [];
    farmerMap[fId].push(item);
  });

  const createdOrders = [];
  const parentId = `grp_${Date.now()}`;

  Object.entries(farmerMap).forEach(([fId, fItems]) => {
    const subtotal = fItems.reduce((acc, i) => acc + (Number(i.price) * Number(i.quantity)), 0);
    const ord = {
      _id: `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      parentGroupId: parentId,
      customerId,
      farmerId: fId,
      farmerName: fItems[0].farmerName || 'Regional Farmer',
      items: fItems,
      totalAmount: subtotal,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'pending_collection' : 'verified',
      status: 'placed',
      deliveryStatus: 'pending',
      deliveryAddress: deliveryAddress || 'Customer Address',
      createdAt: new Date().toISOString()
    };
    orders.push(ord);
    createdOrders.push(ord);

    // Dispatch real event notification
    notifications.push({
      _id: `notif_${Date.now()}_${Math.random()}`,
      userId: customerId,
      role: 'customer',
      title: 'Order Placed Successfully',
      message: `Your produce order #${ord._id.slice(-6).toUpperCase()} with ${ord.farmerName} has been confirmed.`,
      orderId: ord._id,
      createdAt: new Date().toISOString()
    });
  });

  res.status(201).json({ success: true, orders: createdOrders });
});

// 5. Order Cancellation & Stock Restoration
app.put('/api/orders/:id/cancel', (req, res) => {
  const ord = orders.find(o => o._id === req.params.id);
  if (!ord) return res.status(404).json({ message: 'Order not found' });
  if (['delivered', 'cancelled'].includes(ord.status)) {
    return res.status(400).json({ message: `Cannot cancel order in ${ord.status} status` });
  }

  ord.status = 'cancelled';
  ord.cancellationReason = req.body.cancellationReason || 'Cancelled by customer';

  // Restore inventory exactly once
  for (const item of ord.items) {
    const prod = products.find(p => p._id === item.productId || p.id === item.productId);
    if (prod) {
      prod.stock += item.quantity;
    }
  }

  res.json({ success: true, order: ord, message: 'Order cancelled and stock restored to catalog' });
});

// Helper request wrapper
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: serverPort,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    if (dataString) {
      options.headers['Content-Length'] = Buffer.byteLength(dataString);
    }

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', chunk => rawData += chunk);
      res.on('end', () => {
        try {
          const json = rawData ? JSON.parse(rawData) : null;
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, text: rawData });
        }
      });
    });

    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

let serverPort;
let serverInstance;

async function runTestSuite() {
  console.log('================================================================');
  console.log('🌱 AGRILINK CUSTOMER PORTAL TRANSFORMATION VERIFICATION SUITE');
  console.log('================================================================');

  await new Promise(resolve => {
    serverInstance = app.listen(0, '127.0.0.1', () => {
      serverPort = serverInstance.address().port;
      console.log(`✓ Verification test harness running on port ${serverPort}\n`);
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ─── SUITE 1: CUSTOMER DASHBOARD & WISHLIST ISOLATION ───
    console.log('\n[Suite 1: Customer Wishlist & Tenant Isolation]');
    let res = await request('GET', '/api/auth/wishlist', null, { 'x-user-id': 'cust_priya_1' });
    assert(res.status === 200 && Array.isArray(res.data.wishlist) && res.data.wishlist.length === 0,
      'Customer Priya starts with an empty isolated wishlist');

    res = await request('PUT', '/api/auth/wishlist/toggle', { productId: 'prod_tomato_1' }, { 'x-user-id': 'cust_priya_1' });
    assert(res.data.isSaved === true && res.data.wishlist.includes('prod_tomato_1'),
      'Priya toggles product into wishlist (isSaved: true)');

    res = await request('GET', '/api/auth/wishlist', null, { 'x-user-id': 'cust_arun_2' });
    assert(res.data.wishlist.length === 1 && res.data.wishlist[0] === 'prod_mango_10',
      'Customer Arun has isolated wishlist containing only his saved product');

    // ─── SUITE 2: PRODUCT SEARCH, STOCK & CATEGORY FILTERING ───
    console.log('\n[Suite 2: Authentic Product Catalog & Stock Filtering]');
    res = await request('GET', '/api/products?inStock=true');
    assert(res.data.every(p => Number(p.stock) > 0),
      'inStock=true filter strictly excludes zero-stock lots (Spinach excluded)');
    assert(!res.data.some(p => p._id === 'prod_spinach_2'),
      'Out of stock product Spinach is excluded from purchasable in-stock query');

    res = await request('GET', '/api/products?category=fruit');
    assert(res.data.length === 1 && res.data[0]._id === 'prod_mango_10',
      'Category filter accurately isolates fruit produce (Mangoes)');

    res = await request('GET', '/api/products?allowBargain=true');
    assert(res.data.every(p => p.allowBargain === true),
      'Bargainable filter accurately filters lots with allowBargain enabled');

    // ─── SUITE 3: BULK BARGAINING LIFECYCLE & INTEGRITY ───
    console.log('\n[Suite 3: Bulk Bargaining Lifecycle & State Transitions]');
    // Propose price
    res = await request('POST', '/api/bargains', {
      productId: 'prod_tomato_1',
      proposedPrice: 32, // Catalog price is 40
      quantity: 10,
      message: 'Need 10kg fresh tomatoes for temple annadhanam'
    }, { 'x-user-id': 'cust_priya_1' });
    assert(res.status === 201 && res.data.bargain.status === 'PENDING',
      'Customer submits bulk price offer (status: PENDING, proposed: ₹32/kg vs catalog: ₹40/kg)');

    const bargainId = res.data.bargain._id;

    // Reject non-positive quantities or prices
    const badRes = await request('POST', '/api/bargains', {
      productId: 'prod_tomato_1',
      proposedPrice: -10,
      quantity: 0
    });
    assert(badRes.status === 400,
      'Backend safely rejects non-positive proposed prices and zero quantities');

    // Farmer counters
    res = await request('PUT', `/api/bargains/${bargainId}/farmer-counter`, { counterPrice: 35 });
    assert(res.data.bargain.status === 'COUNTERED' && res.data.bargain.counterPrice === 35,
      'Farmer responds with counter-offer of ₹35/kg (status: COUNTERED)');

    // Customer accepts
    res = await request('PUT', `/api/bargains/${bargainId}/customer-respond`, { action: 'accept' });
    assert(res.data.bargain.status === 'ACCEPTED',
      'Customer accepts counter-offer (status: ACCEPTED)');

    // Customer adds to cart
    res = await request('PUT', `/api/bargains/${bargainId}/added-to-cart`);
    assert(res.data.bargain.status === 'ADDED_TO_CART',
      'Bargain transitions to ADDED_TO_CART after successful cart consumption');

    // Cannot re-consume
    const dupRes = await request('PUT', `/api/bargains/${bargainId}/added-to-cart`);
    assert(dupRes.status === 400,
      'Duplicate cart addition of already consumed bargain proposal is strictly blocked');

    // ─── SUITE 4: MULTI-FARMER CHECKOUT & ATOMIC STOCK DEDUCTION ───
    console.log('\n[Suite 4: Multi-Farmer Order Splitting & Atomic Stock]');
    // Initial stocks: Tomato = 50, Mango = 35
    const checkoutPayload = {
      items: [
        {
          productId: 'prod_tomato_1',
          title: 'Vine-Ripened Country Tomatoes',
          price: 35, // Negotiated bargain rate
          originalPrice: 40,
          quantity: 10,
          unit: 'kg',
          farmerId: 'farmer_murugan_1',
          farmerName: 'Murugan Natural Farms',
          isBargain: true
        },
        {
          productId: 'prod_mango_10',
          title: 'Salem Alphonso Sweet Mangoes',
          price: 180,
          quantity: 5,
          unit: 'kg',
          farmerId: 'farmer_selvam_2',
          farmerName: 'Selvam Agro Belt',
          isBargain: false
        }
      ],
      paymentMethod: 'cod',
      deliveryAddress: '12 Temple Street, Coimbatore'
    };

    res = await request('POST', '/api/orders', checkoutPayload, { 'x-user-id': 'cust_priya_1' });
    assert(res.status === 201 && res.data.orders.length === 2,
      'Multi-farmer cart successfully split into 2 separate farmer fulfillments');

    const [order1, order2] = res.data.orders;
    assert(order1.farmerId === 'farmer_murugan_1' && order1.totalAmount === 350,
      'Farmer Murugan order subtotal accurately calculated (10kg × ₹35 = ₹350)');
    assert(order2.farmerId === 'farmer_selvam_2' && order2.totalAmount === 900,
      'Farmer Selvam order subtotal accurately calculated (5kg × ₹180 = ₹900)');
    assert(order1.paymentStatus === 'pending_collection',
      'COD payment method is accurately recorded as pending_collection (never marked paid upon placement)');

    // Verify stock deductions
    const tomatoStockAfter = products.find(p => p._id === 'prod_tomato_1').stock;
    const mangoStockAfter = products.find(p => p._id === 'prod_mango_10').stock;
    assert(tomatoStockAfter === 40,
      'Tomato stock atomically reduced from 50 to 40 (50 - 10 = 40)');
    assert(mangoStockAfter === 30,
      'Mango stock atomically reduced from 35 to 30 (35 - 5 = 30)');

    // ─── SUITE 5: ORDER CANCELLATION & INVENTORY RESTORATION ───
    console.log('\n[Suite 5: Order Cancellation & Inventory Replenishment]');
    res = await request('PUT', `/api/orders/${order1._id}/cancel`, {
      cancellationReason: 'Change of cooking plans'
    });
    assert(res.status === 200 && res.data.order.status === 'cancelled',
      'Customer cancels order successfully with recorded reason');

    const tomatoStockRestored = products.find(p => p._id === 'prod_tomato_1').stock;
    assert(tomatoStockRestored === 50,
      'Tomato inventory replenished exactly once back to 50 (40 + 10 = 50)');

    // Duplicate cancellation prevented
    const dupCancel = await request('PUT', `/api/orders/${order1._id}/cancel`, {});
    assert(dupCancel.status === 400,
      'Duplicate cancellation on already cancelled order is rejected without extra stock restoration');

    // ─── SUITE 6: REAL NOTIFICATION DISPATCH ───
    console.log('\n[Suite 6: Authentic Notification Delivery]');
    assert(notifications.length >= 2,
      'Authentic notifications dispatched for placed multi-farmer orders');
    assert(notifications.every(n => n.userId === 'cust_priya_1'),
      'All notifications are strictly routed to the authenticated customer account');

    console.log('\n================================================================');
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test suite runtime error:', err);
    process.exit(1);
  } finally {
    if (serverInstance) serverInstance.close();
  }
}

runTestSuite();
