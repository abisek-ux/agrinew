/**
 * AgriLink Farmer Portal Comprehensive Automated Test Suite
 * Tests:
 * 1. Farmer Authentication & Token Authorization
 * 2. Farmer Product Creation & Stock/Price Validation
 * 3. Farmer Product Editing (all fields: price, stock, category, description, harvestDate, image)
 * 4. Product Ownership Protection (Farmer B cannot edit/delete Farmer A's product; Customer cannot modify products)
 * 5. Farmer Product Deletion by Owner
 * 6. Farmer Order Isolation (Farmer sees only orders containing their listed products)
 * 7. Farmer Order Confirmation & Packing Workflow (Strict status transition checks)
 * 8. Farmer Order Cancellation with Inventory Replenishment (automatic stock rollback)
 * 9. Invalid Status Transition Rejection (Cannot arbitrarily skip milestones)
 * 10. Farmer Profile Safe Updates (firstName, lastName, farmName, phone, nativePlace, description)
 * 11. Farmer Privilege Tampering Prevention (Role escalation & self-verification strictly blocked)
 * 12. Real-time Farmer Notifications for Order Milestones
 */

require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'agrilink_super_secret_jwt_key_2026';

const makeToken = (id, role = 'farmer') => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1h' });
};

const farmerAToken = makeToken('farmer_alice_1', 'farmer');
const farmerBToken = makeToken('farmer_bob_2', 'farmer');
const customerToken = makeToken('cust_charlie_3', 'customer');
const deliveryToken = makeToken('driver_david_4', 'delivery');

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
  console.log('🌾 Starting Farmer Portal Automated Suite...\n');

  const { app } = require('./server');
  const { seedMemoryUser, memoryUsers } = require('./controllers/authController');
  const { seedMemoryProduct, memoryProducts } = require('./controllers/productController');
  const { memoryOrders } = require('./controllers/orderController');

  // Seed test users
  seedMemoryUser({
    id: 'farmer_alice_1',
    _id: 'farmer_alice_1',
    firstName: 'Alice',
    lastName: 'Kavitha',
    farmName: 'Cauvery River Organics',
    email: 'alice@farmer.in',
    phone: '+919840111111',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
    role: 'farmer',
    isVerified: true,
    nativePlace: 'Chidambaram, Tamil Nadu',
    description: 'Specializing in pesticide-free Ponni paddy and heirloom vegetables.',
    location: { lat: 11.3992, lng: 79.6936, address: 'Delta Basin Gate 1' }
  });

  seedMemoryUser({
    id: 'farmer_bob_2',
    _id: 'farmer_bob_2',
    firstName: 'Bob',
    lastName: 'Rao',
    farmName: 'Malnad Hillside Plantation',
    email: 'bob@farmer.in',
    phone: '+919840222222',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
    role: 'farmer',
    isVerified: false,
    nativePlace: 'Shimoga, Karnataka',
    description: 'Arabica coffee and black pepper cultivation.',
    location: { lat: 13.9299, lng: 75.5681, address: 'Hill Gate 4' }
  });

  seedMemoryUser({
    id: 'cust_charlie_3',
    _id: 'cust_charlie_3',
    firstName: 'Charlie',
    lastName: 'Buyer',
    email: 'charlie@buyer.in',
    phone: '+919840333333',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
    role: 'customer',
    nativePlace: 'Bengaluru, Karnataka'
  });

  seedMemoryUser({
    id: 'driver_david_4',
    _id: 'driver_david_4',
    firstName: 'David',
    lastName: 'Courier',
    email: 'david@delivery.in',
    phone: '+919840444444',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
    role: 'delivery'
  });

  await new Promise((resolve) => {
    appServer = app.listen(0, () => {
      const port = appServer.address().port;
      BASE_URL = `http://127.0.0.1:${port}`;
      console.log(`📡 Farmer Portal test server listening on ${BASE_URL}\n`);
      resolve();
    });
  });

  let passed = 0;
  let createdProductId = null;
  let testOrderId = null;

  try {
    // ==========================================
    // 1. PRODUCT MANAGEMENT: CREATE PRODUCE
    // ==========================================
    console.log('--- TEST 1: Farmer Product Creation & Validation ---');
    
    // Attempt invalid negative price
    const invalidPriceRes = await makeRequest('POST', '/api/products', {
      title: 'Invalid Tomato',
      price: -50,
      stock: 100,
      category: 'vegetable'
    }, farmerAToken);
    assert(invalidPriceRes.status === 400, 'Rejects produce with negative price (HTTP 400)');
    passed++;

    // Attempt invalid negative stock
    const invalidStockRes = await makeRequest('POST', '/api/products', {
      title: 'Invalid Tomato',
      price: 45,
      stock: -20,
      category: 'vegetable'
    }, farmerAToken);
    assert(invalidStockRes.status === 400, 'Rejects produce with negative stock (HTTP 400)');
    passed++;

    // Valid product creation by Farmer A
    const validCreateRes = await makeRequest('POST', '/api/products', {
      title: 'Organic Ponni Paddy Seed Lot #4',
      category: 'grain',
      price: 75.50,
      unit: 'kg',
      stock: 200,
      description: 'Purity guaranteed naturally grown Ponni paddy seed crop.',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c',
      harvestDate: new Date().toISOString()
    }, farmerAToken);

    assert(validCreateRes.status === 201, 'Farmer A successfully creates new produce (HTTP 201)');
    assert(validCreateRes.data.title === 'Organic Ponni Paddy Seed Lot #4', 'Product title matches input');
    assert(Number(validCreateRes.data.stock) === 200, 'Product initial stock is 200 units');
    assert(validCreateRes.data.farmerId === 'farmer_alice_1', 'Backend sets farmerId to authenticated user identity');
    createdProductId = validCreateRes.data._id || validCreateRes.data.id;
    passed += 4;

    // ==========================================
    // 2. PRODUCT MANAGEMENT: EDIT PRODUCE
    // ==========================================
    console.log('\n--- TEST 2: Farmer Product Editing by Authenticated Owner ---');
    
    const updateRes = await makeRequest('PUT', `/api/products/${createdProductId}`, {
      title: 'Organic Ponni Paddy Seed Lot #4 (Prime Grade)',
      price: 80.00,
      stock: 180,
      unit: 'kg',
      category: 'seed',
      description: 'Updated description: Certified 99% germination rate.'
    }, farmerAToken);

    assert(updateRes.status === 200, 'Owner Farmer A successfully updates produce (HTTP 200)');
    assert(Number(updateRes.data.price) === 80.00, 'Price updated to 80.00');
    assert(Number(updateRes.data.stock) === 180, 'Stock updated to 180 units');
    assert(updateRes.data.category === 'seed', 'Category updated to seed');
    passed += 4;

    // ==========================================
    // 3. PRODUCT OWNERSHIP & ACCESS PROTECTION
    // ==========================================
    console.log('\n--- TEST 3: Product Ownership Protection & Authorization Checks ---');

    // Farmer B tries to edit Farmer A's product
    const tamperUpdateRes = await makeRequest('PUT', `/api/products/${createdProductId}`, {
      price: 10.00,
      stock: 0
    }, farmerBToken);
    assert(tamperUpdateRes.status === 403, 'Farmer B cannot edit Farmer A product (HTTP 403 Forbidden)');
    passed++;

    // Customer tries to edit Farmer A's product
    const custEditRes = await makeRequest('PUT', `/api/products/${createdProductId}`, {
      price: 1.00
    }, customerToken);
    assert(custEditRes.status === 403, 'Customer cannot edit Farmer product (HTTP 403 Forbidden)');
    passed++;

    // Unauthenticated user tries to edit
    const unauthEditRes = await makeRequest('PUT', `/api/products/${createdProductId}`, {
      price: 5.00
    }, null);
    assert(unauthEditRes.status === 401, 'Unauthenticated user cannot edit Farmer product (HTTP 401)');
    passed++;

    // Farmer B tries to delete Farmer A's product
    const tamperDeleteRes = await makeRequest('DELETE', `/api/products/${createdProductId}`, null, farmerBToken);
    assert(tamperDeleteRes.status === 403, 'Farmer B cannot delete Farmer A product (HTTP 403 Forbidden)');
    passed++;

    // ==========================================
    // 4. FARMER ORDER ISOLATION
    // ==========================================
    console.log('\n--- TEST 4: Farmer Order Isolation ---');

    // Create a product for Farmer B as well
    const prodBRes = await makeRequest('POST', '/api/products', {
      title: 'Malnad Fresh Cardamom Pods',
      category: 'spice',
      price: 250,
      stock: 50
    }, farmerBToken);
    const prodBId = prodBRes.data._id || prodBRes.data.id;

    // Customer places order for Farmer A's product (quantity: 10)
    const orderRes = await makeRequest('POST', '/api/orders', {
      items: [
        {
          productId: createdProductId,
          product: createdProductId,
          title: 'Organic Ponni Paddy Seed Lot #4 (Prime Grade)',
          quantity: 10,
          price: 80,
          farmerId: 'farmer_alice_1'
        }
      ],
      deliveryAddress: 'Green Garden Apt, Bengaluru',
      customerPhone: '+919840333333'
    }, customerToken);

    assert(orderRes.status === 201, 'Customer successfully places order for Farmer A product (HTTP 201)');
    testOrderId = orderRes.data._id || orderRes.data.id;
    passed++;

    // Check Farmer A sees this order
    const farmerAOrdersRes = await makeRequest('GET', '/api/orders', null, farmerAToken);
    assert(farmerAOrdersRes.status === 200, 'Farmer A can fetch their incoming orders (HTTP 200)');
    const aFound = (farmerAOrdersRes.data || []).some(o => String(o._id || o.id) === String(testOrderId));
    assert(aFound, 'Farmer A order list contains the newly placed order');
    passed += 2;

    // Check Farmer B DOES NOT see Farmer A's order
    const farmerBOrdersRes = await makeRequest('GET', '/api/orders', null, farmerBToken);
    const bFound = (farmerBOrdersRes.data || []).some(o => String(o._id || o.id) === String(testOrderId));
    assert(!bFound, 'Farmer B order list DOES NOT contain Farmer A order (Strict Farmer Order Isolation)');
    passed++;

    // Verify product stock was decremented from 180 to 170
    const checkStockRes = await makeRequest('GET', `/api/products/${createdProductId}`);
    assert(Number(checkStockRes.data.stock) === 170, 'Product stock automatically decremented to 170 upon order placement');
    passed++;

    // ==========================================
    // 5. ORDER WORKFLOW: CONFIRM & PACK
    // ==========================================
    console.log('\n--- TEST 5: Farmer Order Confirmation & Packing Workflow ---');

    // Farmer A confirms order
    const confirmRes = await makeRequest('PUT', `/api/orders/${testOrderId}/status`, {
      status: 'confirmed'
    }, farmerAToken);
    assert(confirmRes.status === 200, 'Farmer A confirms order (status: confirmed)');
    assert(confirmRes.data.status === 'confirmed', 'Order status correctly changed to confirmed');
    passed += 2;

    // Farmer A marks packed
    const packRes = await makeRequest('PUT', `/api/orders/${testOrderId}/status`, {
      status: 'packed'
    }, farmerAToken);
    assert(packRes.status === 200, 'Farmer A marks order as packed (status: packed)');
    assert(packRes.data.status === 'packed', 'Order status correctly changed to packed');
    passed += 2;

    // Farmer cannot jump status to 'delivered' directly (courier OTP required)
    const invalidJumpRes = await makeRequest('PUT', `/api/orders/${testOrderId}/status`, {
      status: 'delivered'
    }, farmerAToken);
    assert(invalidJumpRes.status === 403 || invalidJumpRes.status === 400, 'Farmer cannot directly mark order delivered (HTTP 400/403)');
    passed++;

    // ==========================================
    // 6. ORDER CANCELLATION & STOCK REPLENISHMENT
    // ==========================================
    console.log('\n--- TEST 6: Order Cancellation & Automatic Stock Replenishment ---');

    // Create another order of 5 units to test cancellation replenishment
    const order2Res = await makeRequest('POST', '/api/orders', {
      items: [
        {
          productId: createdProductId,
          product: createdProductId,
          title: 'Organic Ponni Paddy Seed Lot #4 (Prime Grade)',
          quantity: 5,
          price: 80,
          farmerId: 'farmer_alice_1'
        }
      ],
      deliveryAddress: 'Whitefield, Bengaluru',
      customerPhone: '+919840333333'
    }, customerToken);
    const cancelOrderId = order2Res.data._id || order2Res.data.id;

    // Stock should now be 170 - 5 = 165
    const preStockRes = await makeRequest('GET', `/api/products/${createdProductId}`);
    assert(Number(preStockRes.data.stock) === 165, 'Stock before cancellation is 165 units');
    passed++;

    // Farmer A rejects/cancels the order
    const cancelRes = await makeRequest('PUT', `/api/orders/${cancelOrderId}/status`, {
      status: 'cancelled'
    }, farmerAToken);
    assert(cancelRes.status === 200, 'Farmer A successfully cancels order (HTTP 200)');
    assert(cancelRes.data.status === 'cancelled', 'Order status changed to cancelled');
    passed += 2;

    // Stock should now be automatically replenished back to 170 (165 + 5)
    const postStockRes = await makeRequest('GET', `/api/products/${createdProductId}`);
    assert(Number(postStockRes.data.stock) === 170, 'Product stock automatically replenished to 170 units on order cancellation');
    passed++;

    // ==========================================
    // 7. FARMER PROFILE SAFE EDITING
    // ==========================================
    console.log('\n--- TEST 7: Farmer Profile Updates & Tampering Prevention ---');

    const profileUpdateRes = await makeRequest('PUT', '/api/auth/profile', {
      firstName: 'Alice',
      lastName: 'Kavitha Devi',
      farmName: 'Cauvery River Organic Delta Farms',
      phone: '+919840777555',
      nativePlace: 'Chidambaram Coastal Basin',
      description: 'Award-winning SRI method organic rice producers with solar irrigation.',
      // ATTEMPT PRIVILEGE ESCALATION:
      role: 'admin',
      isVerified: true
    }, farmerAToken);

    assert(profileUpdateRes.status === 200, 'Farmer profile update succeeds (HTTP 200)');
    assert(profileUpdateRes.data.user.lastName === 'Kavitha Devi', 'Last name updated safely');
    assert(profileUpdateRes.data.user.farmName === 'Cauvery River Organic Delta Farms', 'Farm name updated safely');
    assert(profileUpdateRes.data.user.role === 'farmer', 'PRIVILEGE ESCALATION BLOCKED: Role remains strictly "farmer"');
    passed += 4;

    // Test Farmer B (unverified) cannot forge isVerified
    const bobProfileRes = await makeRequest('PUT', '/api/auth/profile', {
      isVerified: true,
      role: 'delivery'
    }, farmerBToken);
    assert(bobProfileRes.data.user.isVerified === false, 'SELF-VERIFICATION BLOCKED: Unverified farmer cannot forge isVerified: true');
    assert(bobProfileRes.data.user.role === 'farmer', 'ROLE TAMPERING BLOCKED: Farmer cannot change role to delivery');
    passed += 2;

    // ==========================================
    // 8. FARMER NOTIFICATIONS ON REAL EVENTS
    // ==========================================
    console.log('\n--- TEST 8: Real Farmer Notifications on Milestone Events ---');

    const notifRes = await makeRequest('GET', '/api/notifications', null, farmerAToken);
    assert(notifRes.status === 200, 'Farmer A fetches notifications (HTTP 200)');
    const notifs = notifRes.data.notifications || (Array.isArray(notifRes.data) ? notifRes.data : []);
    assert(notifs.length > 0, 'Farmer A has received real notifications');
    const orderNotif = notifs.find(n => n.title && n.title.includes('New Customer Order Received'));
    assert(!!orderNotif, 'Farmer A received notification for new customer order');
    passed += 3;

    // ==========================================
    // 9. PRODUCT DELETION BY OWNER
    // ==========================================
    console.log('\n--- TEST 9: Farmer Product Deletion by Owner ---');

    const delRes = await makeRequest('DELETE', `/api/products/${createdProductId}`, null, farmerAToken);
    assert(delRes.status === 200, 'Owner Farmer A deletes product successfully (HTTP 200)');

    const fetchDeletedRes = await makeRequest('GET', `/api/products/${createdProductId}`);
    assert(fetchDeletedRes.status === 404, 'Deleted product is no longer found in catalog (HTTP 404)');
    passed += 2;

    console.log(`\n🎉 All ${passed} Farmer Portal tests PASSED successfully!`);
  } catch (err) {
    console.error('\n❌ Farmer Portal Test Suite Encountered Error:', err);
    process.exitCode = 1;
  } finally {
    if (appServer) {
      appServer.close();
    }
  }
}

runTests();
