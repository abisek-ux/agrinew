const http = require('http');
const jwt = require('jsonwebtoken');
const { app } = require('./server');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');
const phoneOtpService = require('./services/phoneOtpService');

const secret = process.env.JWT_SECRET || 'nexus_super_secret_jwt_key_2025';

// Real fixture user IDs from users.json
const CUSTOMER_A_ID = '6ab94f4042b3f01aa7e76825'; // Alex Rivers
const CUSTOMER_B_ID = '6ab94f4142b3f01aa7e76832'; // Abisek P
const FARMER_A_ID   = '6ab94f4042b3f01aa7e76829'; // Robert Greenfield
const FARMER_B_ID   = '6ab94f4142b3f01aa7e76835'; // Gowres MS
const DRIVER_A_ID   = '6ab94f4142b3f01aa7e7682c'; // David Swift
const DRIVER_B_ID   = '6ab94f4142b3f01aa7e7682f'; // Aravinth P

const tokenCustomerA = jwt.sign({ id: CUSTOMER_A_ID, role: 'customer' }, secret, { expiresIn: '1h' });
const tokenCustomerB = jwt.sign({ id: CUSTOMER_B_ID, role: 'customer' }, secret, { expiresIn: '1h' });
const tokenFarmerA   = jwt.sign({ id: FARMER_A_ID,   role: 'farmer'   }, secret, { expiresIn: '1h' });
const tokenFarmerB   = jwt.sign({ id: FARMER_B_ID,   role: 'farmer'   }, secret, { expiresIn: '1h' });
const tokenDriverA   = jwt.sign({ id: DRIVER_A_ID,   role: 'delivery' }, secret, { expiresIn: '1h' });
const tokenDriverB   = jwt.sign({ id: DRIVER_B_ID,   role: 'delivery' }, secret, { expiresIn: '1h' });

let baseUrl = '';

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqHeaders = { 'Content-Type': 'application/json', ...headers };
    let reqBody = '';
    if (body) reqBody = JSON.stringify(body);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on('error', reject);
    if (reqBody) req.write(reqBody);
    req.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    if (details) console.error(`     Details: ${details}`);
    failed++;
  }
}

async function runSuite() {
  console.log('🧪 Starting AgriLink Core Marketplace & Delivery Flow Suite...\n');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  console.log(`📡 Suite test server listening on ${baseUrl}\n`);

  try {
    // -------------------------------------------------------------
    // Test 1: Farmer creates product with price, stock, category, harvestDate
    // -------------------------------------------------------------
    const prodResA = await makeRequest('POST', '/api/products', {
      title: 'Mandya Heritage Organic Rice',
      category: 'grain',
      price: 120,
      stock: 50,
      unit: 'kg',
      description: 'Drought resilient native grain paddy',
      harvestDate: new Date('2026-09-01').toISOString(),
      farmerName: 'Robert Greenfield'
    }, { Authorization: `Bearer ${tokenFarmerA}` });

    assert(
      prodResA.status === 201 && (prodResA.body._id || prodResA.body.id) && prodResA.body.stock === 50,
      'Test 1: Farmer A creates a product with valid price, stock, category, harvest date',
      `Status: ${prodResA.status}, Body: ${JSON.stringify(prodResA.body)}`
    );
    const prodAId = String(prodResA.body._id || prodResA.body.id);

    // Farmer B creates a product
    const prodResB = await makeRequest('POST', '/api/products', {
      title: 'Namakkal Farm Fresh Eggs',
      category: 'dairy',
      price: 90,
      stock: 40,
      unit: 'tray',
      description: 'Free-range pasture organic eggs',
      farmerName: 'Gowres MS'
    }, { Authorization: `Bearer ${tokenFarmerB}` });

    assert(
      prodResB.status === 201 && prodResB.body.stock === 40,
      'Test 1b: Farmer B creates product successfully'
    );
    const prodBId = String(prodResB.body._id || prodResB.body.id);

    // -------------------------------------------------------------
    // Test 2: Farmer edits own product; unauthorized farmer is rejected
    // -------------------------------------------------------------
    const editResA = await makeRequest('PUT', `/api/products/${prodAId}`, {
      price: 130,
      stock: 60
    }, { Authorization: `Bearer ${tokenFarmerA}` });

    assert(
      editResA.status === 200 && editResA.body.price === 130 && editResA.body.stock === 60,
      'Test 2a: Farmer A edits own product price and available stock',
      `Status: ${editResA.status}`
    );

    const editResUnauthorized = await makeRequest('PUT', `/api/products/${prodAId}`, {
      price: 50
    }, { Authorization: `Bearer ${tokenFarmerB}` });

    assert(
      editResUnauthorized.status === 403,
      'Test 2b: Farmer B cannot edit Farmer A\'s product (HTTP 403 Forbidden)',
      `Status: ${editResUnauthorized.status}`
    );

    // -------------------------------------------------------------
    // Test 3: Customer views products, filters by category, sorts by price
    // -------------------------------------------------------------
    const marketRes = await makeRequest('GET', '/api/products?category=grain&sortBy=price-high');
    assert(
      marketRes.status === 200 && Array.isArray(marketRes.body) && marketRes.body.some(p => String(p._id || p.id) === prodAId),
      'Test 3: Customer can view, filter by category, and sort products from backend',
      `Count: ${marketRes.body?.length}`
    );

    // -------------------------------------------------------------
    // Test 4: Insufficient stock validation on backend
    // -------------------------------------------------------------
    const overStockRes = await makeRequest('POST', '/api/orders', {
      items: [{ productId: prodAId, quantity: 999 }]
    }, { Authorization: `Bearer ${tokenCustomerA}` });

    assert(
      overStockRes.status === 400 && overStockRes.body.message.includes('Insufficient stock'),
      'Test 4: Ordering more than available stock is rejected with HTTP 400',
      `Status: ${overStockRes.status}, Body: ${JSON.stringify(overStockRes.body)}`
    );

    // -------------------------------------------------------------
    // Test 5: Multi-Farmer Cart Checkout (Splits into 2 separate orders)
    // -------------------------------------------------------------
    const multiFarmerCartCheckout = await makeRequest('POST', '/api/orders', {
      items: [
        { productId: prodAId, quantity: 2 }, // from Farmer A (Stock: 60 -> 58)
        { productId: prodBId, quantity: 3 }  // from Farmer B (Stock: 40 -> 37)
      ],
      expressDelivery: true
    }, { Authorization: `Bearer ${tokenCustomerA}` });

    assert(
      multiFarmerCartCheckout.status === 201 &&
      multiFarmerCartCheckout.body.orders &&
      multiFarmerCartCheckout.body.orders.length === 2,
      'Test 5: Multi-farmer cart checkout splits into separate orders per farmer',
      `Status: ${multiFarmerCartCheckout.status}, Body: ${JSON.stringify(multiFarmerCartCheckout.body)}`
    );

    const orderFarmerA = multiFarmerCartCheckout.body.orders.find(o => String(o.farmerId) === FARMER_A_ID);
    const orderFarmerB = multiFarmerCartCheckout.body.orders.find(o => String(o.farmerId) === FARMER_B_ID);

    assert(
      orderFarmerA && orderFarmerB &&
      orderFarmerA.items.length === 1 && String(orderFarmerA.items[0].productId) === prodAId &&
      orderFarmerB.items.length === 1 && String(orderFarmerB.items[0].productId) === prodBId,
      'Test 5b: Each split order contains strictly the items belonging to that farmer'
    );

    const orderAId = String(orderFarmerA._id || orderFarmerA.id);
    const orderBId = String(orderFarmerB._id || orderFarmerB.id);

    // -------------------------------------------------------------
    // Test 6: Verify stock was decremented safely
    // -------------------------------------------------------------
    const getProdARes = await makeRequest('GET', `/api/products/${prodAId}`);
    assert(
      getProdARes.status === 200 && getProdARes.body.stock === 58,
      'Test 6: Stock decremented safely on backend (60 - 2 = 58)',
      `Current stock: ${getProdARes.body.stock}`
    );

    // -------------------------------------------------------------
    // Test 7: Farmer order isolation (Farmer B cannot access Farmer A's order)
    // -------------------------------------------------------------
    const farmerBOrders = await makeRequest('GET', '/api/orders', null, { Authorization: `Bearer ${tokenFarmerB}` });
    const hasOrderA = Array.isArray(farmerBOrders.body) && farmerBOrders.body.some(o => String(o._id || o.id) === orderAId);

    assert(
      farmerBOrders.status === 200 && !hasOrderA,
      'Test 7a: Farmer B cannot view Farmer A\'s order information in orders list',
      `Order A leaked: ${hasOrderA}`
    );

    const farmerBUpdateOrderA = await makeRequest('PUT', `/api/orders/${orderAId}/status`, {
      status: 'confirmed'
    }, { Authorization: `Bearer ${tokenFarmerB}` });

    assert(
      farmerBUpdateOrderA.status === 403,
      'Test 7b: Farmer B cannot modify Farmer A\'s order status (HTTP 403 Forbidden)',
      `Status: ${farmerBUpdateOrderA.status}`
    );

    // -------------------------------------------------------------
    // Test 8: Farmer order lifecycle: Confirm and Pack
    // -------------------------------------------------------------
    const confirmRes = await makeRequest('PUT', `/api/orders/${orderAId}/status`, {
      status: 'confirmed'
    }, { Authorization: `Bearer ${tokenFarmerA}` });

    assert(
      confirmRes.status === 200 && confirmRes.body.status === 'confirmed',
      'Test 8a: Farmer A confirms incoming order (status -> confirmed)'
    );

    const packRes = await makeRequest('PUT', `/api/orders/${orderAId}/status`, {
      status: 'packed'
    }, { Authorization: `Bearer ${tokenFarmerA}` });

    assert(
      packRes.status === 200 && packRes.body.status === 'packed',
      'Test 8b: Farmer A marks order as packed & ready for delivery driver'
    );

    // -------------------------------------------------------------
    // Test 9: Delivery driver assignment and transit status updates
    // -------------------------------------------------------------
    const assignRes = await makeRequest('PUT', `/api/orders/${orderAId}/assign`, {}, {
      Authorization: `Bearer ${tokenDriverA}`
    });

    assert(
      assignRes.status === 200 && assignRes.body.order.deliveryId === DRIVER_A_ID && assignRes.body.order.status === 'assigned',
      'Test 9a: Delivery Driver A assigns themselves to the packed order',
      `Status: ${assignRes.status}`
    );

    // Driver updates status: picked_up -> in_transit -> arrived
    await makeRequest('PUT', `/api/orders/${orderAId}/status`, { status: 'picked_up' }, { Authorization: `Bearer ${tokenDriverA}` });
    await makeRequest('PUT', `/api/orders/${orderAId}/status`, { status: 'in_transit' }, { Authorization: `Bearer ${tokenDriverA}` });
    const arrivedRes = await makeRequest('PUT', `/api/orders/${orderAId}/status`, { status: 'arrived' }, { Authorization: `Bearer ${tokenDriverA}` });

    assert(
      arrivedRes.status === 200 && arrivedRes.body.status === 'arrived',
      'Test 9b: Driver progresses order through picked_up -> in_transit -> arrived'
    );

    // Driver B cannot modify Driver A's assigned order
    const driverBHijack = await makeRequest('PUT', `/api/orders/${orderAId}/status`, {
      status: 'arrived'
    }, { Authorization: `Bearer ${tokenDriverB}` });

    assert(
      driverBHijack.status === 403,
      'Test 9c: Unauthorized driver cannot update another driver\'s assigned order'
    );

    // -------------------------------------------------------------
    // Test 10: Direct status change to 'delivered' is blocked (requires OTP)
    // -------------------------------------------------------------
    const directDeliveredAttempt = await makeRequest('PUT', `/api/orders/${orderAId}/status`, {
      status: 'delivered'
    }, { Authorization: `Bearer ${tokenDriverA}` });

    assert(
      directDeliveredAttempt.status === 400 && directDeliveredAttempt.body.message.includes('OTP verification'),
      'Test 10: Direct transition to "delivered" via status API is rejected (handover OTP required)',
      `Status: ${directDeliveredAttempt.status}`
    );

    // -------------------------------------------------------------
    // Test 11: Delivery Handover OTP: Generate -> Verify
    // -------------------------------------------------------------
    const genOtpRes = await makeRequest('POST', `/api/orders/${orderAId}/delivery-otp/generate`, {}, {
      Authorization: `Bearer ${tokenDriverA}`
    });

    assert(
      genOtpRes.status === 200 && genOtpRes.body.success === true && genOtpRes.body.demoOtp,
      'Test 11a: Driver triggers delivery handover OTP generation to customer',
      `Response: ${JSON.stringify(genOtpRes.body)}`
    );

    const deliveryOtp = genOtpRes.body.demoOtp;

    // Wrong OTP verification attempt
    const wrongOtpRes = await makeRequest('POST', `/api/orders/${orderAId}/delivery-otp/verify`, {
      otp: '000000'
    }, { Authorization: `Bearer ${tokenDriverA}` });

    assert(
      wrongOtpRes.status === 400 && wrongOtpRes.body.success === false,
      'Test 11b: Incorrect handover OTP is rejected with HTTP 400'
    );

    // Correct OTP verification
    const correctOtpRes = await makeRequest('POST', `/api/orders/${orderAId}/delivery-otp/verify`, {
      otp: deliveryOtp
    }, { Authorization: `Bearer ${tokenDriverA}` });

    assert(
      correctOtpRes.status === 200 &&
      correctOtpRes.body.delivered === true &&
      correctOtpRes.body.order.status === 'delivered' &&
      correctOtpRes.body.order.deliveryOtpVerifiedAt,
      'Test 11c: Correct OTP marks order as delivered and records deliveryOtpVerifiedAt',
      `Delivered status: ${correctOtpRes.body.order?.status}`
    );

    // Reusing the same OTP is rejected
    const reuseOtpRes = await makeRequest('POST', `/api/orders/${orderAId}/delivery-otp/verify`, {
      otp: deliveryOtp
    }, { Authorization: `Bearer ${tokenDriverA}` });

    assert(
      reuseOtpRes.status === 400 && reuseOtpRes.body.success === false,
      'Test 11d: Reusing the same delivery OTP is strictly rejected'
    );

    // Delivered order cannot be delivered again
    const redeliveryRes = await makeRequest('POST', `/api/orders/${orderAId}/delivery-otp/generate`, {}, {
      Authorization: `Bearer ${tokenDriverA}`
    });

    assert(
      redeliveryRes.status === 400 && redeliveryRes.body.message.includes('already'),
      'Test 11e: An already delivered order cannot have another delivery OTP generated'
    );

    // -------------------------------------------------------------
    // Test 12: Verified Customer Review Submission & Aggregate Rating
    // -------------------------------------------------------------
    // Review before delivery on Order B (still pending) should be rejected
    const earlyReview = await makeRequest('POST', '/api/reviews', {
      orderId: orderBId,
      productId: prodBId,
      rating: 5,
      comment: 'Reviewing before delivery'
    }, { Authorization: `Bearer ${tokenCustomerA}` });

    assert(
      earlyReview.status === 400 && earlyReview.body.message.includes('only allowed after delivery'),
      'Test 12a: Review submitted before delivery is rejected (HTTP 400)',
      `Status: ${earlyReview.status}, Body: ${JSON.stringify(earlyReview.body)}`
    );

    // Non-purchasing customer cannot review Order A
    const unauthorizedReview = await makeRequest('POST', '/api/reviews', {
      orderId: orderAId,
      productId: prodAId,
      rating: 5,
      comment: 'I did not buy this'
    }, { Authorization: `Bearer ${tokenCustomerB}` });

    assert(
      unauthorizedReview.status === 403,
      'Test 12b: Customer B cannot review Customer A\'s purchased order (HTTP 403 Forbidden)'
    );

    // Valid review on delivered Order A
    const validReview = await makeRequest('POST', '/api/reviews', {
      orderId: orderAId,
      productId: prodAId,
      rating: 5,
      comment: 'Super fresh heritage rice, excellent fragrance and quality!'
    }, { Authorization: `Bearer ${tokenCustomerA}` });

    assert(
      validReview.status === 201 && validReview.body.success === true,
      'Test 12c: Customer A submits verified purchase review for delivered product',
      `Status: ${validReview.status}`
    );

    // Duplicate review attempt
    const duplicateReview = await makeRequest('POST', '/api/reviews', {
      orderId: orderAId,
      productId: prodAId,
      rating: 4,
      comment: 'Second review attempt'
    }, { Authorization: `Bearer ${tokenCustomerA}` });

    assert(
      duplicateReview.status === 409,
      'Test 12d: Duplicate review on the same product and order is rejected (HTTP 409 Conflict)'
    );

    // Verify product average rating updated
    const finalProduct = await makeRequest('GET', `/api/products/${prodAId}`);
    assert(
      finalProduct.status === 200 && finalProduct.body.rating === 5 && finalProduct.body.numReviews === 1,
      'Test 12e: Product average rating and review count updated accurately (rating: 5.0, count: 1)',
      `Rating: ${finalProduct.body.rating}, Reviews: ${finalProduct.body.numReviews}`
    );

  } finally {
    server.close();
  }

  console.log(`\n======================================================`);
  console.log(`🏁 MARKETPLACE & DELIVERY SUITE: ${passed} Passed, ${failed} Failed`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Fatal suite error:', err);
  process.exit(1);
});
