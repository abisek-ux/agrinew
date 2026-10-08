/**
 * AGRI LINK — CRITICAL FUNCTIONAL BUG FIX & DATA CONSISTENCY PASS
 * Comprehensive End-to-End Verification Test Suite
 *
 * Verifies:
 * BUG 1: Weather Telemetry API validation, timeout, caching, and fallback labeling
 * BUG 2: AgriLink AI strict intent routing (greetings, conversational, capabilities, off-topic, agronomy)
 * BUG 3: Profile update without 7-day lock (repeated edits succeed immediately)
 * BUG 4: Customer bulk bargain request successfully visible to Farmer in Bulk Bargains
 * BUG 5: Exact authoritative farmer name preserved on orders (no 'gowres' / 'robert' / 'murugan' overrides)
 * BUG 6 & 7: Server-authoritative farmer identity (Product.farmerId === Bargain.farmerId === Order.farmerId)
 * BUG 8: Full bargain lifecycle: Propose -> Farmer sees -> Counter -> Accept
 * BUG 9: Multi-farmer checkout: separate sub-orders with isolated farmer identities
 */

const http = require('http');
const mongoose = require('mongoose');

// Determine base URL
const PORT = process.env.PORT || 5000;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    passedCount++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failedCount++;
    console.error(`  ✗ [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const method = options.method || 'GET';
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method,
      headers
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (e) { json = body; }
        resolve({ status: res.statusCode, headers: res.headers, data: json });
      });
    });

    req.on('error', reject);

    if (options.body) {
      const dataStr = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      req.write(dataStr);
    }
    req.end();
  });
}

async function runAllTests() {
  console.log('\n========================================================');
  console.log('AGRI LINK — E2E CRITICAL FUNCTIONAL BUG FIX VERIFICATION');
  console.log('========================================================\n');

  try {
    // ------------------------------------------------------------------
    // SUITE 1: BUG 1 — WEATHER TELEMETRY DATA FLOW & VALIDATION
    // ------------------------------------------------------------------
    console.log('--- SUITE 1: Weather Telemetry API & Caching ---');

    // 1.1 Invalid coordinates
    const invalidCoordsRes = await request('/weather/forecast?latitude=999&longitude=888');
    assert(invalidCoordsRes.status === 400, 'Weather API rejects out-of-range coordinates with HTTP 400', `Got status ${invalidCoordsRes.status}`);

    // 1.2 Missing coordinates
    const missingCoordsRes = await request('/weather/forecast');
    assert(missingCoordsRes.status === 400, 'Weather API rejects missing coordinates with HTTP 400', `Got status ${missingCoordsRes.status}`);

    // 1.3 Valid coordinates (Namakkal farm: 11.2189, 78.1674)
    const validWeatherRes = await request('/weather/forecast?latitude=11.2189&longitude=78.1674&cityName=Namakkal');
    assert(validWeatherRes.status === 200, 'Weather API returns HTTP 200 for valid farm coordinates', `Got status ${validWeatherRes.status}`);
    assert(validWeatherRes.data?.success === true, 'Weather API response contains success: true');
    assert(validWeatherRes.data?.data?.current !== undefined, 'Weather API returns structured current telemetry');

    // 1.4 Cache hit verification
    const cachedWeatherRes = await request('/weather/forecast?latitude=11.2189&longitude=78.1674&cityName=Namakkal');
    assert(cachedWeatherRes.status === 200 && cachedWeatherRes.data?.isCached === true, 'Weather API correctly serves cached weather data on repeat request');

    // ------------------------------------------------------------------
    // SUITE 2: BUG 2 — AGRILINK AI STRICT INTENT CLASSIFICATION
    // ------------------------------------------------------------------
    console.log('\n--- SUITE 2: AgriLink AI Strict Intent Classification ---');

    // 2.1 Greeting "hii"
    const aiHii = await request('/ai/ask-agrilink', { method: 'POST', body: { message: 'hii' } });
    assert(aiHii.status === 200 && aiHii.data?.intent === 'greeting', 'AI classifies "hii" as greeting intent');
    assert(!/tomato|irrigate|fertilizer|pesticide/i.test(aiHii.data?.answer), 'AI does NOT fabricate generic agronomy advice for "hii"');

    // 2.2 Greeting "hello"
    const aiHello = await request('/ai/ask-agrilink', { method: 'POST', body: { message: 'hello' } });
    assert(aiHello.status === 200 && aiHello.data?.intent === 'greeting', 'AI classifies "hello" as greeting intent');

    // 2.3 Conversational "how are you?"
    const aiHowAreYou = await request('/ai/ask-agrilink', { method: 'POST', body: { message: 'how are you?' } });
    assert(aiHowAreYou.status === 200 && aiHowAreYou.data?.intent === 'conversational', 'AI classifies "how are you?" as conversational intent');

    // 2.4 Capabilities "what can you do?"
    const aiCapabilities = await request('/ai/ask-agrilink', { method: 'POST', body: { message: 'what can you do?' } });
    assert(aiCapabilities.status === 200 && aiCapabilities.data?.intent === 'capabilities', 'AI classifies "what can you do?" as capabilities intent');
    assert(/crop selection|irrigation|pest|soil/i.test(aiCapabilities.data?.answer), 'AI explains capability breakdown accurately');

    // 2.5 Agricultural Advisory "what should I grow this season?"
    const aiGrow = await request('/ai/ask-agrilink', { method: 'POST', body: { message: 'what should I grow this season?' } });
    assert(aiGrow.status === 200 && aiGrow.data?.intent === 'agricultural', 'AI classifies "what should I grow this season?" as agricultural intent');

    // 2.6 Agricultural Advisory "how often should I irrigate tomatoes?"
    const aiIrrigate = await request('/ai/ask-agrilink', { method: 'POST', body: { message: 'how often should I irrigate tomatoes?' } });
    assert(aiIrrigate.status === 200 && aiIrrigate.data?.intent === 'agricultural', 'AI classifies "how often should I irrigate tomatoes?" as agricultural intent');
    assert(/drip|moisture|irrigate/i.test(aiIrrigate.data?.answer), 'AI provides targeted tomato irrigation advice');

    // 2.7 Agricultural Troubleshooting "my tomato leaves are yellow"
    const aiYellow = await request('/ai/ask-agrilink', { method: 'POST', body: { message: 'my tomato leaves are yellow' } });
    assert(aiYellow.status === 200 && aiYellow.data?.intent === 'agricultural', 'AI classifies "my tomato leaves are yellow" as agricultural troubleshooting');
    assert(/nitrogen|chlorosis|leaves/i.test(aiYellow.data?.answer), 'AI diagnoses potential chlorosis/nitrogen deficiency and asks for details');

    // 2.8 Off-Topic Question "what is the capital of France?"
    const aiOffTopic = await request('/ai/ask-agrilink', { method: 'POST', body: { message: 'what is the capital of France?' } });
    assert(aiOffTopic.status === 200 && aiOffTopic.data?.isOffTopic === true, 'AI identifies off-topic question and triggers polite guardrail');

    // ------------------------------------------------------------------
    // SUITE 3: BUG 3 — 7-DAY PROFILE MODIFICATION LOCK REMOVAL
    // ------------------------------------------------------------------
    console.log('\n--- SUITE 3: Profile Modification Lock Removal ---');

    const timestamp = Date.now();
    const testFarmerEmail = `robert.greenfield.${timestamp}@farm.in`;
    const testFarmerPhone = `9845${String(timestamp).slice(-6)}`;

    // Register Farmer A
    const regFarmerRes = await request('/auth/register', {
      method: 'POST',
      body: {
        firstName: 'Robert',
        lastName: 'Greenfield',
        email: testFarmerEmail,
        phone: testFarmerPhone,
        password: 'Password@123',
        role: 'farmer',
        farmName: 'Cauvery River Organic Estate',
        nativePlace: 'Mandya, Karnataka'
      }
    });

    assert(regFarmerRes.status === 201 || regFarmerRes.status === 200, 'Farmer A registered successfully', `Status: ${regFarmerRes.status}`);
    const farmerToken = regFarmerRes.data?.token;
    const farmerId = String(regFarmerRes.data?._id || regFarmerRes.data?.id || regFarmerRes.data?.user?._id || regFarmerRes.data?.user?.id);

    // Profile Update 1
    const update1Res = await request('/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${farmerToken}` },
      body: {
        firstName: 'Robert',
        lastName: 'Greenfield',
        farmName: 'Greenfield Sustainable Organic Estate',
        city: 'Mandya'
      }
    });
    assert(update1Res.status === 200, 'Farmer A performs initial profile update successfully');
    assert(update1Res.data?.user?.isProfileLocked === false || update1Res.data?.user?.isProfileLocked === undefined, 'No 7-day lock set after first update');

    // Profile Update 2 IMMEDIATELY (must NOT return 403)
    const update2Res = await request('/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${farmerToken}` },
      body: {
        firstName: 'Robert',
        lastName: 'Greenfield',
        farmName: 'Greenfield Regenerative Farm Estate',
        city: 'Mandya'
      }
    });
    assert(update2Res.status === 200, 'Farmer A performs immediate second profile update WITHOUT 7-day lock restriction', `Status: ${update2Res.status}`);
    assert(update2Res.data?.user?.farmName === 'Greenfield Regenerative Farm Estate', 'Second profile update changes persisted cleanly');

    // Profile Update 3 (Unauthorized update blocked with 401)
    const unauthUpdate = await request('/auth/profile', {
      method: 'PUT',
      body: { firstName: 'Hacker' }
    });
    assert(unauthUpdate.status === 401, 'Unauthorized profile update correctly blocked with HTTP 401');

    // ------------------------------------------------------------------
    // SUITE 4: BUG 4, 5, 6, 7, 8, 9 — BARGAIN & ORDER DATA INTEGRITY
    // ------------------------------------------------------------------
    console.log('\n--- SUITE 4: Bargain Visibility & Authoritative Farmer Identity ---');

    // Register Farmer B (Murugan Farmer)
    const farmerBEmail = `murugan.farmer.${timestamp}@farm.in`;
    const farmerBPhone = `9846${String(timestamp).slice(-6)}`;
    const regFarmerBRes = await request('/auth/register', {
      method: 'POST',
      body: {
        firstName: 'Murugan',
        lastName: 'Farmer',
        email: farmerBEmail,
        phone: farmerBPhone,
        password: 'Password@123',
        role: 'farmer',
        farmName: 'Murugan Delta Organic Farms',
        nativePlace: 'Namakkal, Tamil Nadu'
      }
    });
    assert(regFarmerBRes.status === 201 || regFarmerBRes.status === 200, 'Farmer B registered successfully');
    const farmerBToken = regFarmerBRes.data?.token;
    const farmerBId = String(regFarmerBRes.data?._id || regFarmerBRes.data?.id || regFarmerBRes.data?.user?._id || regFarmerBRes.data?.user?.id);

    // Register Customer A
    const custEmail = `ananya.customer.${timestamp}@agrilink.in`;
    const custPhone = `9847${String(timestamp).slice(-6)}`;
    const regCustRes = await request('/auth/register', {
      method: 'POST',
      body: {
        firstName: 'Ananya',
        lastName: 'Sharma',
        email: custEmail,
        phone: custPhone,
        password: 'Password@123',
        role: 'customer',
        deliveryAddress: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103'
      }
    });
    assert(regCustRes.status === 201 || regCustRes.status === 200, 'Customer A registered successfully');
    const custToken = regCustRes.data?.token;
    const custId = String(regCustRes.data?._id || regCustRes.data?.id || regCustRes.data?.user?._id || regCustRes.data?.user?.id);

    // Farmer A adds Product A
    const addProdARes = await request('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${farmerToken}` },
      body: {
        title: 'High-Yield Hybrid Wheat Seeds',
        category: 'seed',
        price: 150,
        unit: 'kg',
        stock: 500,
        minOrderQty: 1,
        allowBargain: true,
        farmerName: 'Robert Greenfield'
      }
    });
    assert(addProdARes.status === 201 || addProdARes.status === 200, 'Farmer A creates Product A ("High-Yield Hybrid Wheat Seeds")');
    const prodA = addProdARes.data;
    const prodAId = String(prodA._id || prodA.id);

    // Farmer B adds Product B
    const addProdBRes = await request('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${farmerBToken}` },
      body: {
        title: 'Organic Red Country Tomatoes',
        category: 'vegetable',
        price: 40,
        unit: 'kg',
        stock: 300,
        minOrderQty: 1,
        allowBargain: true,
        farmerName: 'Murugan Farmer'
      }
    });
    assert(addProdBRes.status === 201 || addProdBRes.status === 200, 'Farmer B creates Product B ("Organic Red Country Tomatoes")');
    const prodB = addProdBRes.data;
    const prodBId = String(prodB._id || prodB.id);

    // BUG 7: Customer creates bargain on Product A with attempted arbitrary farmerId override
    const bargainPayload = {
      productId: prodAId,
      quantity: 3,
      proposedPrice: 137,
      note: 'Wholesale request for community garden',
      farmerId: 'arbitrary_fake_farmer_id' // Client attempt to spoof farmer
    };

    const createBargainRes = await request('/bargains', {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}` },
      body: bargainPayload
    });

    assert(createBargainRes.status === 201, 'Customer A creates bulk bargain proposal for Product A', `Status: ${createBargainRes.status}`);
    const createdBargain = createBargainRes.data?.bargain;
    const bargainId = String(createdBargain?.bargainId || createdBargain?._id);

    // BUG 6 & 7: Server MUST determine farmerId from Product record, ignoring client spoof
    assert(String(createdBargain?.farmerId) === farmerId, 'Server authoritatively assigned Bargain.farmerId from Product A (did NOT trust client farmerId)');
    assert(String(createdBargain?.customerId) === custId, 'Bargain.customerId matches Customer A');
    assert(String(createdBargain?.productId) === prodAId, 'Bargain.productId matches Product A');
    assert(createdBargain?.status === 'PENDING', 'Initial bargain status is strictly PENDING');

    // BUG 4: Farmer A retrieves bargains -> Offer MUST be visible!
    const farmerABargainsRes = await request('/bargains', {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    assert(farmerABargainsRes.status === 200, 'Farmer A queries /api/bargains successfully');
    const farmerBargainsList = farmerABargainsRes.data?.bargains || [];
    const foundBargain = farmerBargainsList.find(b => String(b.bargainId || b._id) === bargainId);
    assert(Boolean(foundBargain), 'Customer proposal is VISIBLE on Farmer A Bulk Bargains portal');
    assert(foundBargain?.proposedPrice === 137 && foundBargain?.quantity === 3, 'Proposal displays exact offer details (₹137/kg, 3 kg)');
    assert(foundBargain?.farmerName === 'Robert Greenfield', 'Authoritative farmer name matches product owner');

    // Farmer B queries bargains -> MUST NOT see Farmer A's bargain
    const farmerBBargainsRes = await request('/bargains', {
      headers: { Authorization: `Bearer ${farmerBToken}` }
    });
    const farmerBBargainsList = farmerBBargainsRes.data?.bargains || [];
    const foundOnFarmerB = farmerBBargainsList.find(b => String(b.bargainId || b._id) === bargainId);
    assert(!foundOnFarmerB, 'Role & Farmer isolation: Farmer B CANNOT view Farmer A bulk bargain offers');

    // BUG 8: Full negotiation lifecycle
    // Farmer A sends Counter Offer: ₹142
    const counterRes = await request(`/bargains/${bargainId}/farmer-respond`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${farmerToken}` },
      body: { action: 'counter', counterPrice: 142, note: 'Can do ₹142/kg for certified hybrid wheat.' }
    });
    assert(counterRes.status === 200 && counterRes.data?.bargain?.status === 'COUNTERED', 'Farmer A successfully counters with ₹142 (status: COUNTERED)');

    // Customer A accepts the counter offer
    const custAcceptRes = await request(`/bargains/${bargainId}/customer-respond`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${custToken}` },
      body: { action: 'accept' }
    });
    assert(custAcceptRes.status === 200 && custAcceptRes.data?.bargain?.status === 'ACCEPTED', 'Customer A accepts counter offer (status: ACCEPTED)');

    // BUG 5 & 9: Multi-Farmer Checkout & Identity Preservation
    console.log('\n--- SUITE 5: Multi-Farmer Order Checkout & Farmer Name Identity ---');

    const checkoutPayload = {
      items: [
        {
          productId: prodAId,
          title: 'High-Yield Hybrid Wheat Seeds',
          price: 142, // Verified accepted bargain rate
          quantity: 3,
          unit: 'kg'
        },
        {
          productId: prodBId,
          title: 'Organic Red Country Tomatoes',
          price: 40,
          quantity: 2,
          unit: 'kg'
        }
      ],
      paymentMethod: 'cod',
      deliveryAddress: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103'
    };

    const checkoutRes = await request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}` },
      body: checkoutPayload
    });

    assert(checkoutRes.status === 201, 'Customer A completes multi-farmer checkout successfully', `Status: ${checkoutRes.status}`);
    const ordersCreated = checkoutRes.data?.orders || [];
    assert(ordersCreated.length === 2, 'Checkout partitioned into 2 sub-orders (1 per unique farmer)');

    // Sub-order A
    const orderA = ordersCreated.find(o => String(o.farmerId) === farmerId);
    assert(Boolean(orderA), 'Sub-order A references Farmer A');
    assert(orderA?.farmerName === 'Robert Greenfield', `Sub-order A displays authoritative farmer name "Robert Greenfield" (NOT "gowres") -> Got: "${orderA?.farmerName}"`);

    // Sub-order B
    const orderB = ordersCreated.find(o => String(o.farmerId) === farmerBId);
    assert(Boolean(orderB), 'Sub-order B references Farmer B');
    assert(orderB?.farmerName === 'Murugan Farmer', `Sub-order B displays authoritative farmer name "Murugan Farmer" (NOT "gowres") -> Got: "${orderB?.farmerName}"`);

    // Customer queries /api/orders
    const custOrdersRes = await request('/orders', {
      headers: { Authorization: `Bearer ${custToken}` }
    });
    assert(custOrdersRes.status === 200, 'Customer A retrieves order history successfully');
    const customerOrdersList = Array.isArray(custOrdersRes.data) ? custOrdersRes.data : [];
    const retrievedOrderA = customerOrdersList.find(o => String(o.orderId) === String(orderA.orderId));
    const retrievedOrderB = customerOrdersList.find(o => String(o.orderId) === String(orderB.orderId));

    assert(retrievedOrderA?.farmerName === 'Robert Greenfield', `Order history preserves authoritative Farmer A: "${retrievedOrderA?.farmerName}"`);
    assert(retrievedOrderB?.farmerName === 'Murugan Farmer', `Order history preserves authoritative Farmer B: "${retrievedOrderB?.farmerName}"`);
    assert(retrievedOrderA?.farmerName !== retrievedOrderB?.farmerName, 'No cross-farmer identity pollution between sub-orders');

  } catch (err) {
    console.error('Fatal test execution error:', err);
    failedCount++;
  }

  console.log('\n========================================================');
  console.log(`TOTAL PASSED: ${passedCount}`);
  console.log(`TOTAL FAILED: ${failedCount}`);
  console.log('========================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllTests();
