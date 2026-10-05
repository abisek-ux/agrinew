/**
 * AgriLink Customer Portal Comprehensive Automated Test Suite
 * Tests:
 * 1. Customer Wishlist / Saved Produce Persistence (GET, PUT toggle, Cloud Sync)
 * 2. Customer Profile Safe Updates (Name, Phone, Delivery Address, Native Place)
 * 3. Customer Profile Security & Privilege Tamper Protection (Strict Role Immutability)
 * 4. Advanced Product Filtering & Real Catalog Querying (Min/Max Price, inStock, farmerId, category, sorting)
 * 5. Customer Notification System & Real Order Event Milestones (Placed -> Confirmed -> Packed -> Dispatched -> Delivered)
 * 6. Customer Data Isolation & Authorization Protection
 */

require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'agrilink_super_secret_jwt_key_2026';

const makeToken = (id, role = 'customer') => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1h' });
};

const customerToken = makeToken('cust_alice_101', 'customer');
const customerBToken = makeToken('cust_bob_202', 'customer');
const farmerToken = makeToken('farmer_kavitha_1', 'farmer');
const deliveryToken = makeToken('driver_david_1', 'delivery');

let appServer;
let BASE_URL;

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json;
        try { json = JSON.parse(data); } catch { json = data; }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(message);
  } else {
    console.log(`  ✅ PASS: ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Starting Customer Portal Automated Suite...\n');

  const { app } = require('./server');
  const { seedMemoryUser } = require('./controllers/authController');
  const { seedMemoryProduct } = require('./controllers/productController');

  // Seed test users
  seedMemoryUser({
    id: 'cust_alice_101',
    _id: 'cust_alice_101',
    firstName: 'Alice',
    lastName: 'Green',
    email: 'alice@farmtest.in',
    phone: '+919840111111',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
    role: 'customer',
    nativePlace: 'Bengaluru, Karnataka',
    location: { lat: 12.9716, lng: 77.5946, address: 'Indiranagar, Bengaluru' },
    wishlist: []
  });

  seedMemoryUser({
    id: 'cust_bob_202',
    _id: 'cust_bob_202',
    firstName: 'Bob',
    lastName: 'Stone',
    email: 'bob@farmtest.in',
    phone: '+919840222222',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
    role: 'customer',
    nativePlace: 'Mysuru, Karnataka',
    location: { lat: 12.2958, lng: 76.6394, address: 'Gokulam, Mysuru' },
    wishlist: []
  });

  seedMemoryUser({
    id: 'farmer_kavitha_1',
    _id: 'farmer_kavitha_1',
    firstName: 'Kavitha',
    lastName: 'Ramasamy',
    email: 'kavitha@farmtest.in',
    phone: '+919840333333',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
    role: 'farmer',
    nativePlace: 'Ratnagiri, Maharashtra',
    location: { lat: 16.9902, lng: 73.3120, address: 'Kavitha Organic Farm' }
  });

  seedMemoryUser({
    id: 'driver_david_1',
    _id: 'driver_david_1',
    firstName: 'David',
    lastName: 'Courier',
    email: 'david@farmtest.in',
    phone: '+919840444444',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
    role: 'delivery',
    location: { lat: 12.9800, lng: 77.6000, address: 'Central Hub' }
  });

  // Seed sample products
  seedMemoryProduct({
    id: 'prod_mango_alphonso',
    _id: 'prod_mango_alphonso',
    title: 'Alphonso Mango Organic',
    category: 'fruit',
    price: 180,
    unit: 'kg',
    stock: 45,
    description: 'Sweet, natural Alphonso mangoes from Ratnagiri partner farms.',
    farmerId: 'farmer_kavitha_1',
    farmerName: 'Kavitha Farm',
    rating: 4.8,
    numReviews: 12
  });

  seedMemoryProduct({
    id: 'prod_tomato_country',
    _id: 'prod_tomato_country',
    title: 'Country Tomatoes Direct',
    category: 'vegetable',
    price: 35,
    unit: 'kg',
    stock: 120,
    description: 'Juicy local country tomatoes picked daily.',
    farmerId: 'farmer_kavitha_1',
    farmerName: 'Kavitha Farm',
    rating: 4.2,
    numReviews: 6
  });

  seedMemoryProduct({
    id: 'prod_coffee_arabica',
    _id: 'prod_coffee_arabica',
    title: 'Coorg Single-Estate Coffee',
    category: 'grain',
    price: 320,
    unit: 'kg',
    stock: 0, // Out of stock
    description: 'Shade-grown Arabica coffee beans from Kodagu hills.',
    farmerId: 'farmer_coorg_2',
    farmerName: 'Kodagu Estate',
    rating: 4.9,
    numReviews: 24
  });

  await new Promise((resolve) => {
    appServer = app.listen(0, () => {
      const port = appServer.address().port;
      BASE_URL = `http://127.0.0.1:${port}`;
      console.log(`📡 Customer Portal test server listening on ${BASE_URL}\n`);
      resolve();
    });
  });

  let passed = 0;

  try {
    // 1. Wishlist Persistence: GET initial empty wishlist
    const res1 = await makeRequest('GET', '/api/auth/wishlist', null, customerToken);
    assert(res1.status === 200 && Array.isArray(res1.data.wishlist), 'Test 1: Authenticated customer retrieves wishlist');
    passed++;

    // 2. Wishlist Persistence: Add product to wishlist
    const res2 = await makeRequest('PUT', '/api/auth/wishlist/toggle', { productId: 'prod_mango_alphonso' }, customerToken);
    assert(res2.status === 200 && res2.data.isSaved === true && res2.data.wishlist.includes('prod_mango_alphonso'), 'Test 2a: Customer toggles product into wishlist (isSaved: true)');
    passed++;

    // 2b. Wishlist Persistence: Verify persistence across consecutive query
    const res2b = await makeRequest('GET', '/api/auth/wishlist', null, customerToken);
    assert(res2b.data.wishlist.includes('prod_mango_alphonso'), 'Test 2b: Wishlist persists product ID in customer record across requests');
    passed++;

    // 2c. Wishlist Persistence: Remove product from wishlist
    const res2c = await makeRequest('PUT', '/api/auth/wishlist/toggle', { productId: 'prod_mango_alphonso' }, customerToken);
    assert(res2c.status === 200 && res2c.data.isSaved === false && !res2c.data.wishlist.includes('prod_mango_alphonso'), 'Test 2c: Customer removes product from wishlist by toggling again');
    passed++;

    // 2d. Wishlist Isolation: Customer B wishlist is isolated from Customer A
    const res2d = await makeRequest('GET', '/api/auth/wishlist', null, customerBToken);
    assert(res2d.status === 200 && res2d.data.wishlist.length === 0, 'Test 2d: Customer B has their own independent wishlist');
    passed++;

    // 3. Customer Profile Updates: Safe fields (Name, Phone, Address)
    const res3 = await makeRequest('PUT', '/api/auth/profile', {
      firstName: 'Alicia',
      lastName: 'Greenfield',
      phone: '+919840999888',
      nativePlace: 'Bengaluru Tech Corridor',
      location: {
        address: 'Villa 42, Green Glen Layout, Bellandur, Bengaluru',
        placeName: 'Bengaluru'
      }
    }, customerToken);
    assert(res3.status === 200 && res3.data.user.firstName === 'Alicia', 'Test 3a: Customer successfully updates their profile name and address');
    assert(res3.data.user.phone === '+919840999888', 'Test 3b: Customer phone number is updated safely');
    passed++;

    // 4. Customer Profile Security: Attempt privilege escalation (role, admin)
    const res4 = await makeRequest('PUT', '/api/auth/profile', {
      role: 'admin',
      isAdmin: true,
      roleTier: 'superadmin'
    }, customerBToken);
    assert(res4.status === 200 && res4.data.user.role === 'customer', 'Test 4: Privilege escalation tampering is strictly prohibited (role remains "customer")');
    passed++;

    // 5. Product Marketplace: Min and Max Price Filtering
    const res5 = await makeRequest('GET', '/api/products?minPrice=50&maxPrice=200');
    assert(res5.status === 200 && res5.data.length > 0, 'Test 5a: Products queried with minPrice=50 and maxPrice=200');
    assert(res5.data.every(p => Number(p.price) >= 50 && Number(p.price) <= 200), 'Test 5b: Every returned product respects the price range boundaries');
    passed++;

    // 6. Product Marketplace: In-Stock Only Filtering
    const res6 = await makeRequest('GET', '/api/products?inStock=true');
    assert(res6.status === 200, 'Test 6a: Products queried with inStock=true');
    assert(res6.data.every(p => Number(p.stock) > 0), 'Test 6b: Out of stock products (stock = 0) are excluded when inStock=true');
    passed++;

    // 7. Product Marketplace: Filter by Farmer ID
    const res7 = await makeRequest('GET', '/api/products?farmerId=farmer_kavitha_1');
    assert(res7.status === 200 && res7.data.length >= 2, 'Test 7: Products filtered by farmerId correctly isolates farmer produce');
    passed++;

    // 8. Product Marketplace: Sorting by Rating
    const res8 = await makeRequest('GET', '/api/products?sortBy=rating');
    assert(res8.status === 200 && res8.data.length > 1, 'Test 8a: Products sorted by rating returned successfully');
    assert(Number(res8.data[0].rating) >= Number(res8.data[1].rating), 'Test 8b: First product has higher or equal rating than second product');
    passed++;

    // 9. Order Creation & Milestone Notifications
    const res9 = await makeRequest('POST', '/api/orders', {
      items: [{ productId: 'prod_mango_alphonso', quantity: 2 }]
    }, customerToken);
    assert(res9.status === 201 && (res9.data.orderId || res9.data.id), 'Test 9a: Customer places farm order');
    const placedOrder = res9.data;
    const orderId = placedOrder._id || placedOrder.id;
    passed++;

    // 9b. Verify customer notification received for order placed
    const notifs1 = await makeRequest('GET', `/api/notifications?userId=cust_alice_101&role=customer`, null, customerToken);
    assert(notifs1.status === 200 && notifs1.data.notifications.some(n => n.title.includes('Order Placed')), 'Test 9b: Real notification dispatched to customer for Order Placed');
    passed++;

    // 10. Farmer Confirms and Packs Order -> Customer receives milestone notifications
    await makeRequest('PUT', `/api/orders/${orderId}/status`, { status: 'confirmed' }, farmerToken);
    await makeRequest('PUT', `/api/orders/${orderId}/status`, { status: 'packed' }, farmerToken);

    const notifs2 = await makeRequest('GET', `/api/notifications?userId=cust_alice_101&role=customer`, null, customerToken);
    assert(notifs2.data.notifications.some(n => n.title.includes('Farmer Confirmed')), 'Test 10a: Notification dispatched to customer when farmer confirms order');
    assert(notifs2.data.notifications.some(n => n.title.includes('Order Packed')), 'Test 10b: Notification dispatched to customer when order is packed at the farm');
    passed++;

    // 11. Courier Assignment & Transit -> Customer receives transit updates
    await makeRequest('PUT', `/api/orders/${orderId}/assign`, {}, deliveryToken);
    await makeRequest('PUT', `/api/orders/${orderId}/status`, { status: 'in_transit' }, deliveryToken);

    const notifs3 = await makeRequest('GET', `/api/notifications?userId=cust_alice_101&role=customer`, null, customerToken);
    assert(notifs3.data.notifications.some(n => n.title.includes('Out for Delivery') || n.title.includes('Delivery Courier Assigned')), 'Test 11: Real delivery transit notification received by customer');
    passed++;

    // 12. Notification Isolation: Customer B does not receive Customer A's private order notifications
    const notifsB = await makeRequest('GET', `/api/notifications?userId=cust_bob_202&role=customer`, null, customerBToken);
    assert(!notifsB.data.notifications.some(n => n.orderId === placedOrder.orderId), 'Test 12: Customer B is isolated and cannot see Customer A order notifications');
    passed++;

    console.log(`\n======================================================`);
    console.log(`🏁 CUSTOMER PORTAL SUITE: ${passed} Passed, 0 Failed`);
    console.log(`======================================================\n`);
  } finally {
    if (appServer) appServer.close();
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
