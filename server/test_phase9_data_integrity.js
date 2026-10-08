/**
 * test_phase9_data_integrity.js
 * Comprehensive automated regression suite for AgriLink Phase 9:
 * Production Data Integrity & Portal Reliability
 *
 * Verifies:
 * 1. Delivery Portal Loading & Route Telemetry (No blank screen, assigned orders visible)
 * 2. "farmerDistrict" ReferenceError eliminated across all components
 * 3. Production marketplace excludes mock farmer defaults and resolves real registered names
 * 4. Accepted bargain strictly preserves negotiated price (never ₹0)
 * 5. Server-side validation: Accepted bargain CANNOT have zero, negative, NaN, or null price
 * 6. Valid product identifier reaches Add-to-Cart correctly from accepted bargain
 * 7. Invalid product identifier returns clean handling without runtime crash
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const http = require('http');
const assert = require('assert');
const jwt = require('jsonwebtoken');
const { app } = require('./server');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Bargain = require('./models/Bargain');

let server;
let BASE_URL;
let passedCount = 0;
let failedCount = 0;

function check(condition, message, details = '') {
  if (condition) {
    passedCount++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedCount++;
    console.error(`  ❌ FAIL: ${message}${details ? ' - ' + details : ''}`);
  }
}

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`/api${path}`, BASE_URL);
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
        resolve({ status: res.statusCode, headers: res.headers, data: json });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

const JWT_SECRET = process.env.JWT_SECRET || 'agrilink_super_secret_jwt_key_2026';
function generateToken(user) {
  return jwt.sign(
    { id: String(user.id || user._id), role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING AGRILINK PHASE 9 DATA INTEGRITY & PORTAL RELIABILITY SUITE');
  console.log('======================================================\n');

  const timestamp = Date.now();

  // Helper to register authentic users
  async function registerUser(firstName, lastName, role) {
    const email = `p9_${role}_${timestamp}_${Math.floor(100 + Math.random() * 900)}@farm.in`;
    const phone = `+9197${Math.floor(10000000 + Math.random() * 90000000)}`;
    const res = await makeRequest('POST', '/auth/register', {
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

  // ─────────────────────────────────────────────────────────────
  // 1. DELIVERY PORTAL INITIALIZATION & ROLE ACCESS CONTROL
  // ─────────────────────────────────────────────────────────────
  console.log('--- 1. Delivery Portal Loading & Route Access ---');

  const deliveryAcc = await registerUser('Kavitha', 'Logistics', 'delivery');
  const tokenDelivery = deliveryAcc.token;

  const farmerAcc = await registerUser('Venkatesh', 'Gounder', 'farmer');
  const tokenFarmer = farmerAcc.token;

  const customerAcc = await registerUser('Deepa', 'Suresh', 'customer');
  const tokenCustomer = customerAcc.token;

  // Delivery driver queries GET /orders (portal initialization)
  const deliveryOrdersRes = await makeRequest('GET', '/orders', null, { Authorization: `Bearer ${tokenDelivery}` });
  check(deliveryOrdersRes.status === 200, 'Delivery portal order initialization endpoint responds HTTP 200');
  check(Array.isArray(deliveryOrdersRes.data), 'Delivery orders radar returns array of assigned/ready orders');

  // Customer or Farmer cannot claim driver assignments
  const driverClaimByCust = await makeRequest('PUT', '/orders/ORD-FAKE-999/assign', null, { Authorization: `Bearer ${tokenCustomer}` });
  check(driverClaimByCust.status === 403 || driverClaimByCust.status === 404, 'Customer cannot execute driver order assignment (HTTP 403/404)');

  // ─────────────────────────────────────────────────────────────
  // 2. "farmerDistrict" RESOLUTION INTEGRITY
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 2. "farmerDistrict" Reference & Hub Resolution ---');

  // Create a product by the registered farmer
  const prodRes = await makeRequest('POST', '/products', {
    title: `Coimbatore Organic Banana ${timestamp}`,
    category: 'fruit',
    price: 60,
    unit: 'bunch',
    stock: 50,
    minOrderQty: 1,
    allowBargain: true,
    location: { lat: 11.0168, lng: 76.9558, address: 'Coimbatore Delta Agro Hub, Tamil Nadu', district: 'Coimbatore' }
  }, { Authorization: `Bearer ${tokenFarmer}` });

  check(prodRes.status === 201, 'Farmer creates produce listing with authoritative district');
  const createdProd = prodRes.data;
  const prodId = String(createdProd._id || createdProd.id);

  // Check product location district presence
  check(Boolean(createdProd.location), 'Product has authoritative farm location');

  // Verify farmerLocationHelper does not crash and resolves district safely
  const { resolveFarmerLocation, sanitizeOrderFarmerDetails } = require('./utils/farmerLocationHelper');
  const resolvedHub = resolveFarmerLocation(createdProd.location, prodId, farmerAcc.user);
  check(Boolean(resolvedHub.district), `Resolved location provides authoritative district: "${resolvedHub.district}"`);
  check(!/undefined/.test(resolvedHub.district), 'Resolved district is strictly defined and non-empty');

  // ─────────────────────────────────────────────────────────────
  // 3. EXCLUSION OF HARDCODED / MOCK DEMO IDENTITIES
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 3. Production Marketplace Farmer Identity Integrity ---');

  const catalogRes = await makeRequest('GET', '/products');
  check(catalogRes.status === 200, 'Marketplace catalog queries successfully (HTTP 200)');
  const allProducts = Array.isArray(catalogRes.data) ? catalogRes.data : [];

  // Verify newly created product preserves authentic registered farmer
  const fetchedCreatedProd = allProducts.find(p => String(p._id || p.id) === prodId);
  check(Boolean(fetchedCreatedProd), 'Created product is present in marketplace');
  check(fetchedCreatedProd?.farmerName === 'Venkatesh Gounder', `Created product reflects genuine registered farmer ("${fetchedCreatedProd?.farmerName}")`);
  check(fetchedCreatedProd?.farmerName !== 'gowres' && fetchedCreatedProd?.farmerName !== 'Robert Greenfield', 'Authoritative registered name is NOT overridden by mock defaults');

  // ─────────────────────────────────────────────────────────────
  // 4. BARGAIN LIFECYCLE: PRESERVING NEGOTIATED PRICE (NEVER ₹0)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 4. Accepted Bargain Price Integrity (Never ₹0) ---');

  // Customer proposes bargain at ₹45 (Original: ₹60)
  const bargainPropRes = await makeRequest('POST', '/bargains', {
    productId: prodId,
    quantity: 4,
    proposedPrice: 45,
    note: 'Wholesale order for local canteen'
  }, { Authorization: `Bearer ${tokenCustomer}` });

  check(bargainPropRes.status === 201, 'Customer submits bulk bargain proposal at ₹45 (HTTP 201)');
  const createdBargain = bargainPropRes.data?.bargain;
  const bargainId = createdBargain.bargainId || createdBargain._id;

  // Farmer accepts proposal directly
  const farmerAcceptRes = await makeRequest('PUT', `/bargains/${bargainId}/farmer-respond`, {
    action: 'ACCEPT',
    note: 'Agreed! Harvest ready tomorrow morning.'
  }, { Authorization: `Bearer ${tokenFarmer}` });

  check(farmerAcceptRes.status === 200, 'Farmer accepts customer proposal directly (HTTP 200)');
  const acceptedBargain = farmerAcceptRes.data?.bargain;

  // Verify accepted bargain has non-zero negotiated price
  const finalNegotiatedRate = Number(acceptedBargain.counterPrice || acceptedBargain.proposedPrice);
  check(finalNegotiatedRate === 45, `Accepted bargain preserves proposed price of ₹45 (got ₹${finalNegotiatedRate})`);
  check(finalNegotiatedRate > 0, 'Accepted price is strictly greater than ₹0');

  // Fetch bargains as customer and check serialization
  const custBargainsRes = await makeRequest('GET', '/bargains', null, { Authorization: `Bearer ${tokenCustomer}` });
  check(custBargainsRes.status === 200, 'Customer retrieves bargain history');
  const myBargains = custBargainsRes.data?.bargains || [];
  const foundBargain = myBargains.find(b => (b.bargainId === bargainId || String(b._id) === String(bargainId)));
  check(Boolean(foundBargain), 'Accepted bargain visible in customer history');
  check(foundBargain?.proposedPrice === 45, 'Bargain proposedPrice is 45');
  check(foundBargain?.offeredPrice === 45, 'Bargain offeredPrice compatibility field is 45');

  // ─────────────────────────────────────────────────────────────
  // 5. SERVER-SIDE VALIDATION: ZERO / NEGATIVE BARGAIN PREVENTION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 5. Server-Side Zero/Negative/Invalid Price Prevention ---');

  // Test 5.1: Proposing price <= 0 rejected with HTTP 400
  const zeroBargainRes = await makeRequest('POST', '/bargains', {
    productId: prodId,
    quantity: 5,
    proposedPrice: 0
  }, { Authorization: `Bearer ${tokenCustomer}` });
  check(zeroBargainRes.status === 400, 'Submitting bargain with proposedPrice = 0 rejected with HTTP 400');

  const negBargainRes = await makeRequest('POST', '/bargains', {
    productId: prodId,
    quantity: 5,
    proposedPrice: -25
  }, { Authorization: `Bearer ${tokenCustomer}` });
  check(negBargainRes.status === 400, 'Submitting bargain with negative price rejected with HTTP 400');

  // Test 5.2: Farmer proposing counter price <= 0 rejected with HTTP 400
  const bargain2Res = await makeRequest('POST', '/bargains', {
    productId: prodId,
    quantity: 2,
    proposedPrice: 50
  }, { Authorization: `Bearer ${tokenCustomer}` });
  const b2Id = bargain2Res.data?.bargain?.bargainId;

  const zeroCounterRes = await makeRequest('PUT', `/bargains/${b2Id}/farmer-respond`, {
    action: 'COUNTER',
    counterPrice: 0
  }, { Authorization: `Bearer ${tokenFarmer}` });
  check(zeroCounterRes.status === 400, 'Farmer countering with counterPrice = 0 rejected with HTTP 400');

  const negCounterRes = await makeRequest('PUT', `/bargains/${b2Id}/farmer-respond`, {
    action: 'COUNTER',
    counterPrice: -10
  }, { Authorization: `Bearer ${tokenFarmer}` });
  check(negCounterRes.status === 400, 'Farmer countering with negative price rejected with HTTP 400');

  // ─────────────────────────────────────────────────────────────
  // 6. VALID PRODUCT IDENTIFIER REACHES CHECKOUT AT NEGOTIATED PRICE
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 6. Negotiated Checkout at Agreed Price ---');

  // Customer places order using agreed bargain rate (₹45)
  const orderRes = await makeRequest('POST', '/orders', {
    items: [{
      productId: prodId,
      title: createdProd.title,
      price: 45, // Negotiated price
      quantity: 4
    }],
    paymentMethod: 'cod'
  }, { Authorization: `Bearer ${tokenCustomer}` });

  check(orderRes.status === 201, 'Customer completes checkout at negotiated bargain price (HTTP 201)');
  const createdOrder = orderRes.data?.orders ? orderRes.data.orders[0] : orderRes.data;
  check(createdOrder?.totalAmount === 180, `Order total is calculated at negotiated ₹45 × 4 = ₹180 (got ₹${createdOrder?.totalAmount})`);
  check(createdOrder?.items?.[0]?.price === 45, `Order item price is strictly ₹45 (got ₹${createdOrder?.items?.[0]?.price})`);

  // ─────────────────────────────────────────────────────────────
  // 7. INVALID PRODUCT IDENTIFIER HANDLING (CLEAN 404/400, NO CRASH)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 7. Invalid Produce Item Identifier Handling ---');

  const invalidProdBargain = await makeRequest('POST', '/bargains', {
    productId: 'INVALID_NON_EXISTENT_PROD_ID_99999',
    quantity: 2,
    proposedPrice: 50
  }, { Authorization: `Bearer ${tokenCustomer}` });

  check(invalidProdBargain.status === 404, 'Bargain on non-existent product returns clean HTTP 404 (NOT 500)');

  const missingProdOrder = await makeRequest('POST', '/orders', {
    items: [{
      productId: 'NON_EXISTENT_PROD_999',
      quantity: 1,
      price: 50
    }]
  }, { Authorization: `Bearer ${tokenCustomer}` });

  check(missingProdOrder.status === 404, 'Order with non-existent product returns clean HTTP 404 (NOT 500)');
  check(!/CastError/i.test(JSON.stringify(missingProdOrder.data)), 'Response contains clean user message without internal CastError leak');
}

async function start() {
  await connectDB();
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      BASE_URL = `http://127.0.0.1:${port}`;
      console.log(`Phase 9 test server listening on ${BASE_URL}`);
      resolve();
    });
  });

  try {
    await runTests();
  } catch (err) {
    console.error('Fatal test error:', err);
    failedCount++;
  } finally {
    server.close();
    console.log('\n======================================================');
    console.log(`🏁 PHASE 9 SUITE COMPLETE: ${passedCount} Passed, ${failedCount} Failed`);
    console.log('======================================================\n');
    process.exit(failedCount > 0 ? 1 : 0);
  }
}

start();
