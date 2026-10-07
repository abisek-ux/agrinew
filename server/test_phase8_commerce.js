/**
 * AgriLink Phase 8 - Commerce & Inventory Reliability Test Suite
 * Validates:
 * 1. Atomic inventory decrement (never negative, no overselling under concurrency)
 * 2. Idempotent checkout & duplicate prevention (Idempotency-Key support)
 * 3. Idempotent cancellation and single stock restoration (stock never restored twice)
 * 4. Server-authoritative pricing (ignores client-manipulated prices)
 * 5. Server-enforced minimum order quantity (minOrderQty)
 * 6. Compensating rollback on multi-item cart partial failure
 * 7. State machine valid vs invalid transitions & terminal state immutability
 * 8. Role-based transition authorization
 * 9. Delivery status idempotency
 * 10. Bargain resolution concurrency safety
 */

require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');
const { app } = require('./server');

let TEST_PORT;
let BASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'agrilink_super_secret_jwt_key_2026';

let server;
let passed = 0;
let failed = 0;

function assert(condition, message, details = '') {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message} ${details ? '- ' + details : ''}`);
  }
}

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;

    const reqHeaders = { ...headers };
    if (postData && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
    }
    if (postData && !reqHeaders['Content-Length']) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id || user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

async function runTests() {
  console.log('\n======================================================');
  console.log('📦 RUNNING AGRILINK PHASE 8 COMMERCE RELIABILITY SUITE');
  console.log('======================================================\n');

  // Helper to register user and obtain genuine token & DB document
  async function registerUser(firstName, lastName, role) {
    const email = `p8_${role}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}@agrilink.io`;
    const phone = `+9198${Math.floor(10000000 + Math.random() * 90000000)}`;
    const res = await makeRequest('POST', '/api/auth/register', {
      firstName,
      lastName,
      email,
      phone,
      password: 'SecurePassword123!',
      role
    });
    return {
      user: res.data?.user || res.data,
      token: res.data?.token
    };
  }

  // Register Test Accounts
  const farmerAccA = await registerUser('Murugan', 'Farmer', 'farmer');
  const farmerAccB = await registerUser('Ramesh', 'Agri', 'farmer');
  const customerAccA = await registerUser('Priya', 'Buyer', 'customer');
  const customerAccB = await registerUser('Anand', 'Shopper', 'customer');
  const driverAccA = await registerUser('David', 'Speedy', 'delivery');

  const tokenFarmerA = farmerAccA.token;
  const tokenFarmerB = farmerAccB.token;
  const tokenCustomerA = customerAccA.token;
  const tokenCustomerB = customerAccB.token;
  const tokenDriverA = driverAccA.token;

  // Helper to create a test product
  async function createTestProduct(farmerToken, data) {
    const res = await makeRequest('POST', '/api/products', data, { Authorization: `Bearer ${farmerToken}` });
    return res.data?.product || res.data;
  }

  // --------------------------------------------------------------------------
  console.log('--- 1. Atomic Inventory Decrement: Last-Stock Concurrency Race ---');
  // --------------------------------------------------------------------------
  const p1 = await createTestProduct(tokenFarmerA, {
    title: 'Rare Organic Mangoes (Single Box)',
    category: 'fruit',
    price: 150,
    stock: 1, // EXACTLY 1 unit
    unit: 'box',
    minOrderQty: 1
  });
  const p1Id = p1._id || p1.id;

  // Register 10 distinct customers to simulate 10 distinct concurrent shoppers
  const raceCustomers = [];
  for (let i = 0; i < 10; i++) {
    const c = await registerUser(`Shopper${i}`, 'Test', 'customer');
    raceCustomers.push(c);
  }

  // Fire 10 simultaneous orders from concurrent customer requests
  const concurrentOrders = raceCustomers.map((cust) => {
    return makeRequest('POST', '/api/orders', {
      items: [{ productId: p1Id, quantity: 1, price: 150 }]
    }, { Authorization: `Bearer ${cust.token}` });
  });

  const raceResults = await Promise.all(concurrentOrders);
  const successes = raceResults.filter(r => r.status === 201);
  const failures = raceResults.filter(r => r.status === 400);

  assert(successes.length === 1, `Exactly 1 concurrent request succeeded for stock=1 (got: ${successes.length})`);
  assert(failures.length === 9, `Remaining 9 concurrent requests were safely rejected with HTTP 400 (got: ${failures.length})`);

  // Verify stock in catalog
  const p1Check = await makeRequest('GET', `/api/products/${p1Id}`);
  assert(Number(p1Check.data?.stock) === 0, `Product stock is exactly 0 and never went negative (got: ${p1Check.data?.stock})`);

  // --------------------------------------------------------------------------
  console.log('\n--- 2. Idempotency: Duplicate Checkouts & Retries ---');
  // --------------------------------------------------------------------------
  const p2 = await createTestProduct(tokenFarmerA, {
    title: 'Fresh Farm Carrots',
    category: 'vegetable',
    price: 40,
    stock: 20,
    unit: 'kg',
    minOrderQty: 1
  });
  const p2Id = p2._id || p2.id;
  const idempotencyKey = `IDEMP_KEY_TEST_${Date.now()}_999`;

  const orderReqPayload = {
    items: [{ productId: p2Id, quantity: 2, price: 40 }]
  };

  // First request
  const firstCheckout = await makeRequest('POST', '/api/orders', orderReqPayload, {
    Authorization: `Bearer ${tokenCustomerA}`,
    'Idempotency-Key': idempotencyKey
  });
  assert(firstCheckout.status === 201, 'Initial checkout with Idempotency-Key succeeds (HTTP 201)');
  const initialOrderId = firstCheckout.data?.orderId || firstCheckout.data?._id;

  // Replay exactly same request 4 times
  let replayAllMatched = true;
  for (let r = 0; r < 4; r++) {
    const replay = await makeRequest('POST', '/api/orders', orderReqPayload, {
      Authorization: `Bearer ${tokenCustomerA}`,
      'Idempotency-Key': idempotencyKey
    });
    const repOrderId = replay.data?.orderId || replay.data?._id;
    if (replay.status !== 201 || repOrderId !== initialOrderId) {
      replayAllMatched = false;
    }
  }
  assert(replayAllMatched, '4 immediate retries returned cached order without duplicate insertions');

  // Verify stock was decremented ONLY ONCE (20 - 2 = 18, NOT 20 - 10 = 10)
  const p2Check = await makeRequest('GET', `/api/products/${p2Id}`);
  assert(Number(p2Check.data?.stock) === 18, `Stock was decremented exactly once to 18 despite 5 requests (got: ${p2Check.data?.stock})`);

  // --------------------------------------------------------------------------
  console.log('\n--- 3. Idempotent Cancellation: Single Stock Restoration ---');
  // --------------------------------------------------------------------------
  const p3 = await createTestProduct(tokenFarmerA, {
    title: 'Green Cabbage',
    category: 'vegetable',
    price: 30,
    stock: 15,
    unit: 'kg',
    minOrderQty: 1
  });
  const p3Id = p3._id || p3.id;

  // Order 5 kg (stock goes 15 -> 10)
  const cancelTestOrder = await makeRequest('POST', '/api/orders', {
    items: [{ productId: p3Id, quantity: 5, price: 30 }]
  }, { Authorization: `Bearer ${tokenCustomerA}` });
  const ord3Id = cancelTestOrder.data?._id || cancelTestOrder.data?.id;

  const p3MidCheck = await makeRequest('GET', `/api/products/${p3Id}`);
  assert(Number(p3MidCheck.data?.stock) === 10, 'Stock decremented to 10 after order');

  // First cancellation: succeeds, stock should return to 15
  const firstCancel = await makeRequest('PUT', `/api/orders/${ord3Id}/status`, { status: 'cancelled' }, {
    Authorization: `Bearer ${tokenCustomerA}`
  });
  assert(firstCancel.status === 200, 'First cancellation succeeds with HTTP 200');

  const p3AfterCancel = await makeRequest('GET', `/api/products/${p3Id}`);
  assert(Number(p3AfterCancel.data?.stock) === 15, `Stock restored to exactly 15 (got: ${p3AfterCancel.data?.stock})`);

  // Repeated cancellation attempts (double clicks, retries)
  const repeatCancel1 = await makeRequest('PUT', `/api/orders/${ord3Id}/status`, { status: 'cancelled' }, {
    Authorization: `Bearer ${tokenCustomerA}`
  });
  const repeatCancel2 = await makeRequest('PUT', `/api/orders/${ord3Id}/status`, { status: 'cancelled' }, {
    Authorization: `Bearer ${tokenCustomerA}`
  });
  assert(repeatCancel1.status === 400 && repeatCancel2.status === 400, 'Repeated cancellation attempts rejected with HTTP 400 (already cancelled)');

  const p3FinalCheck = await makeRequest('GET', `/api/products/${p3Id}`);
  assert(Number(p3FinalCheck.data?.stock) === 15, `Stock remains strictly 15 and was NEVER restored twice (got: ${p3FinalCheck.data?.stock})`);

  // --------------------------------------------------------------------------
  console.log('\n--- 4. Server-Authoritative Pricing: Manipulated Price Rejection ---');
  // --------------------------------------------------------------------------
  const p4 = await createTestProduct(tokenFarmerA, {
    title: 'Premium Basmati Rice',
    category: 'grain',
    price: 120, // Authoritative DB price
    stock: 50,
    unit: 'kg',
    minOrderQty: 1
  });
  const p4Id = p4._id || p4.id;

  // Malicious client tampers with price (sends price: 1, totalAmount: 2)
  const tamperedOrder = await makeRequest('POST', '/api/orders', {
    items: [{ productId: p4Id, quantity: 2, price: 1 }]
  }, { Authorization: `Bearer ${tokenCustomerB}` });

  assert(tamperedOrder.status === 201, 'Order request processed');
  const actualPriceCharged = tamperedOrder.data?.items?.[0]?.price;
  const actualTotalAmount = tamperedOrder.data?.totalAmount;

  assert(Number(actualPriceCharged) === 120, `Server enforced authoritative DB price of ₹120 (got: ₹${actualPriceCharged})`);
  assert(Number(actualTotalAmount) === 240, `Server computed authoritative total ₹240 (got: ₹${actualTotalAmount})`);

  // --------------------------------------------------------------------------
  console.log('\n--- 5. Server-Enforced Minimum Order Quantity (minOrderQty) ---');
  // --------------------------------------------------------------------------
  const p5 = await createTestProduct(tokenFarmerA, {
    title: 'Bulk Farm Potatoes',
    category: 'vegetable',
    price: 25,
    stock: 100,
    unit: 'kg',
    minOrderQty: 5 // Min 5 kg
  });
  const p5Id = p5._id || p5.id;

  // Attempting to buy 2 kg (below minimum 5 kg)
  const belowMinOrder = await makeRequest('POST', '/api/orders', {
    items: [{ productId: p5Id, quantity: 2 }]
  }, { Authorization: `Bearer ${tokenCustomerA}` });

  assert(belowMinOrder.status === 400, 'Ordering below minOrderQty rejected with HTTP 400');
  assert(String(belowMinOrder.data?.message).includes('Minimum order quantity'), 'Informative minOrderQty error message returned');

  // Ordering exactly 5 kg
  const validMinOrder = await makeRequest('POST', '/api/orders', {
    items: [{ productId: p5Id, quantity: 5 }]
  }, { Authorization: `Bearer ${tokenCustomerA}` });
  assert(validMinOrder.status === 201, 'Ordering at or above minOrderQty succeeds with HTTP 201');

  // --------------------------------------------------------------------------
  console.log('\n--- 6. Compensating Rollback: Multi-Item Cart Partial Failure ---');
  // --------------------------------------------------------------------------
  const p6A = await createTestProduct(tokenFarmerA, {
    title: 'Organic Tomatoes',
    category: 'vegetable',
    price: 35,
    stock: 10,
    unit: 'kg'
  });
  const p6B = await createTestProduct(tokenFarmerA, {
    title: 'Fresh Mint Leaves',
    category: 'vegetable',
    price: 15,
    stock: 2, // Only 2 in stock
    unit: 'bunch'
  });
  const p6AId = p6A._id || p6A.id;
  const p6BId = p6B._id || p6B.id;

  // Cart requests 4 Tomatoes (available: 10) + 5 Mint (available: only 2!)
  const mixedCartOrder = await makeRequest('POST', '/api/orders', {
    items: [
      { productId: p6AId, quantity: 4 },
      { productId: p6BId, quantity: 5 }
    ]
  }, { Authorization: `Bearer ${tokenCustomerA}` });

  assert(mixedCartOrder.status === 400, 'Cart checkout fails due to out-of-stock item (HTTP 400)');

  // Verify compensating rollback: Item A's stock MUST be completely restored to 10
  const p6ACheck = await makeRequest('GET', `/api/products/${p6AId}`);
  const p6BCheck = await makeRequest('GET', `/api/products/${p6BId}`);
  assert(Number(p6ACheck.data?.stock) === 10, `Item A was safely rolled back to 10 stock (got: ${p6ACheck.data?.stock})`);
  assert(Number(p6BCheck.data?.stock) === 2, `Item B remained at 2 stock (got: ${p6BCheck.data?.stock})`);

  // --------------------------------------------------------------------------
  console.log('\n--- 7. State Machine: Invalid & Terminal Transitions ---');
  // --------------------------------------------------------------------------
  const p7 = await createTestProduct(tokenFarmerA, {
    title: 'Sweet Corn',
    category: 'grain',
    price: 30,
    stock: 20
  });
  const order7 = await makeRequest('POST', '/api/orders', {
    items: [{ productId: p7._id || p7.id, quantity: 2 }]
  }, { Authorization: `Bearer ${tokenCustomerA}` });
  const ord7Id = order7.data?._id || order7.data?.id;

  // Attempt direct jump to 'delivered' via status endpoint (MUST BE BLOCKED; requires OTP verify)
  const directDeliver = await makeRequest('PUT', `/api/orders/${ord7Id}/status`, { status: 'delivered' }, {
    Authorization: `Bearer ${tokenDriverA}`
  });
  assert(directDeliver.status === 400, 'Direct transition to "delivered" is blocked (requires OTP verify)');

  // Farmer cancels order
  await makeRequest('PUT', `/api/orders/${ord7Id}/status`, { status: 'cancelled' }, {
    Authorization: `Bearer ${tokenFarmerA}`
  });

  // Attempt to pack or confirm a cancelled order (terminal state violation)
  const packCancelled = await makeRequest('PUT', `/api/orders/${ord7Id}/status`, { status: 'packed' }, {
    Authorization: `Bearer ${tokenFarmerA}`
  });
  assert(packCancelled.status === 400, 'Cannot transition terminal "cancelled" order to "packed" (HTTP 400)');

  // --------------------------------------------------------------------------
  console.log('\n--- 8. Role-Based Transition Authorization ---');
  // --------------------------------------------------------------------------
  const p8 = await createTestProduct(tokenFarmerA, {
    title: 'Fresh Ginger',
    category: 'spices',
    price: 90,
    stock: 20
  });
  const order8 = await makeRequest('POST', '/api/orders', {
    items: [{ productId: p8._id || p8.id, quantity: 2 }]
  }, { Authorization: `Bearer ${tokenCustomerA}` });
  const ord8Id = order8.data?._id || order8.data?.id;

  // Customer tries to mark order as 'packed' (Farmer-only permission)
  const custPack = await makeRequest('PUT', `/api/orders/${ord8Id}/status`, { status: 'packed' }, {
    Authorization: `Bearer ${tokenCustomerA}`
  });
  assert(custPack.status === 403, 'Customer cannot mark order as "packed" (HTTP 403 Forbidden)');

  // Farmer B tries to confirm Farmer A's order
  const farmerBConfirm = await makeRequest('PUT', `/api/orders/${ord8Id}/status`, { status: 'confirmed' }, {
    Authorization: `Bearer ${tokenFarmerB}`
  });
  assert(farmerBConfirm.status === 403, 'Farmer B cannot modify Farmer A\'s order (HTTP 403 Forbidden)');

  // --------------------------------------------------------------------------
  console.log('\n--- 9. Delivery Logistics Idempotency ---');
  // --------------------------------------------------------------------------
  // Legitimate workflow: Farmer confirms and packs
  await makeRequest('PUT', `/api/orders/${ord8Id}/status`, { status: 'confirmed' }, { Authorization: `Bearer ${tokenFarmerA}` });
  await makeRequest('PUT', `/api/orders/${ord8Id}/status`, { status: 'packed' }, { Authorization: `Bearer ${tokenFarmerA}` });

  // Driver assigns
  await makeRequest('PUT', `/api/orders/${ord8Id}/assign`, {}, { Authorization: `Bearer ${tokenDriverA}` });

  // Driver picks up
  const pickup1 = await makeRequest('PUT', `/api/orders/${ord8Id}/status`, { status: 'picked_up' }, { Authorization: `Bearer ${tokenDriverA}` });
  assert(pickup1.status === 200, 'Driver transitions status to "picked_up"');

  // Driver resends 'picked_up' (duplicate network packet / retry)
  const pickup2 = await makeRequest('PUT', `/api/orders/${ord8Id}/status`, { status: 'picked_up' }, { Authorization: `Bearer ${tokenDriverA}` });
  assert(pickup2.status === 200, 'Duplicate "picked_up" status update handled cleanly and idempotently (HTTP 200)');

  // Driver assigns again (duplicate assign call)
  const assignRetry = await makeRequest('PUT', `/api/orders/${ord8Id}/assign`, {}, { Authorization: `Bearer ${tokenDriverA}` });
  assert(assignRetry.status === 200, 'Duplicate driver assignment handled idempotently without status regression');

  // --------------------------------------------------------------------------
  console.log('\n--- 10. Bargain Resolution Concurrency Safety ---');
  // --------------------------------------------------------------------------
  const p10 = await createTestProduct(tokenFarmerA, {
    title: 'Special Turmeric Powder',
    category: 'spices',
    price: 200,
    stock: 50,
    allowBargain: true
  });
  const p10Id = p10._id || p10.id;

  // Customer proposes bargain
  const bRes = await makeRequest('POST', '/api/bargains', {
    productId: p10Id,
    quantity: 10,
    proposedPrice: 160
  }, { Authorization: `Bearer ${tokenCustomerA}` });

  const bargainId = bRes.data?.bargain?._id || bRes.data?.bargain?.bargainId || bRes.data?.bargain?.id;

  // Farmer accepts bargain
  const bAccept1 = await makeRequest('PUT', `/api/bargains/${bargainId}/farmer-respond`, {
    action: 'ACCEPT'
  }, { Authorization: `Bearer ${tokenFarmerA}` });
  assert(bAccept1.status === 200, 'Farmer accepts bulk bargain proposal (HTTP 200)');

  // Immediate duplicate attempt to counter or accept already resolved bargain
  const bDuplicate = await makeRequest('PUT', `/api/bargains/${bargainId}/farmer-respond`, {
    action: 'COUNTER',
    counterPrice: 170
  }, { Authorization: `Bearer ${tokenFarmerA}` });
  assert(bDuplicate.status === 400, 'Duplicate resolution of already ACCEPTED bargain rejected with HTTP 400');
}

async function start() {
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      TEST_PORT = server.address().port;
      BASE_URL = `http://127.0.0.1:${TEST_PORT}`;
      console.log(`📡 Commerce test server listening on ${BASE_URL}`);
      resolve();
    });
  });

  try {
    await runTests();
  } catch (err) {
    console.error('Test runner fatal error:', err);
    failed++;
  } finally {
    server.close();
    console.log('\n======================================================');
    console.log(`🏁 PHASE 8 COMMERCE SUITE COMPLETE: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

start();
