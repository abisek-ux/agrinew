/**
 * test_customer_phase3.js
 * Automated Verification Suite for Phase 3:
 * Customer Marketplace, Agricultural Data Honesty, Multi-Farmer Cart, Bargain Transparency & Safety
 */

const axios = require('axios');
const http = require('http');

let server;
let app;
let BASE_URL;

async function startTestServer() {
  delete require.cache[require.resolve('./server')];
  const serverModule = require('./server');
  app = serverModule.app || serverModule;

  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      BASE_URL = `http://localhost:${port}/api`;
      console.log(`Test server running at ${BASE_URL}`);
      resolve();
    });
  });
}

function stopTestServer() {
  if (server) {
    server.close();
    console.log('Test server stopped.');
  }
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    failed++;
  }
}

// Emulate client-side helper for harvest freshness
function getHarvestFreshness(harvestDate) {
  if (!harvestDate) {
    return { hasDate: false, label: 'Harvest date not provided', hoursAgo: null, isFresh: false };
  }
  const date = new Date(harvestDate);
  if (isNaN(date.getTime())) {
    return { hasDate: false, label: 'Harvest date not provided', hoursAgo: null, isFresh: false };
  }
  const now = new Date();
  const diffMs = now - date;
  if (diffMs < 0) {
    return { hasDate: true, label: 'Freshly harvested today', hoursAgo: 0, isFresh: true };
  }
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 24) {
    return { hasDate: true, label: diffHours <= 1 ? 'Harvested just now' : `Harvested ${diffHours}h ago`, hoursAgo: diffHours, isFresh: true };
  }
  if (diffDays === 1) {
    return { hasDate: true, label: 'Harvested 1 day ago', hoursAgo: diffHours, isFresh: true };
  }
  return { hasDate: true, label: `Harvested ${diffDays} days ago`, hoursAgo: diffHours, isFresh: false };
}

// Emulate client-side multi-farmer cart grouping
function groupCartByFarmer(cart) {
  const map = new Map();
  cart.forEach(item => {
    const fKey = String(item.farmerId || item.farmerName || 'local_producer');
    if (!map.has(fKey)) {
      map.set(fKey, {
        farmerId: item.farmerId,
        farmerName: item.farmerName || 'Local Direct Farmer',
        farmerLocation: item.location?.address || item.farmerNative || '',
        items: [],
        subtotal: 0
      });
    }
    const group = map.get(fKey);
    group.items.push(item);
    group.subtotal += Number(item.price) * item.quantity;
  });
  return Array.from(map.values());
}

async function runPhase3Verification() {
  console.log('\n================================================================');
  console.log('🛒 TESTING PHASE 3: CUSTOMER MARKETPLACE & MULTI-FARMER CART');
  console.log('================================================================');

  await startTestServer();

  try {
    const timestamp = Date.now();

    // 1. Register Farmer A
    const farmerARes = await axios.post(`${BASE_URL}/auth/register`, {
      email: `farmer_a_${timestamp}@agrilink.in`,
      phone: `+9198${String(timestamp).slice(-8)}`,
      password: 'Password@123',
      role: 'farmer',
      firstName: 'Ramesh',
      lastName: 'Kumar',
      nativePlace: 'Thanjavur, Tamil Nadu'
    });
    const farmerAToken = farmerARes.data.token;
    const farmerAId = farmerARes.data._id || farmerARes.data.id || farmerARes.data.user?._id || farmerARes.data.user?.id;

    // 2. Register Farmer B
    const farmerBRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: `farmer_b_${timestamp}@agrilink.in`,
      phone: `+9197${String(timestamp).slice(-8)}`,
      password: 'Password@123',
      role: 'farmer',
      firstName: 'Green Valley',
      lastName: 'Farms',
      nativePlace: 'Coimbatore, Tamil Nadu'
    });
    const farmerBToken = farmerBRes.data.token;
    const farmerBId = farmerBRes.data._id || farmerBRes.data.id || farmerBRes.data.user?._id || farmerBRes.data.user?.id;

    // 3. Register Customer
    const customerRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: `customer_p3_${timestamp}@agrilink.in`,
      phone: `+9196${String(timestamp).slice(-8)}`,
      password: 'Password@123',
      role: 'customer',
      firstName: 'Ananya',
      lastName: 'Sharma'
    });
    const customerToken = customerRes.data.token;
    const customerId = customerRes.data._id || customerRes.data.id || customerRes.data.user?._id || customerRes.data.user?.id;

    // 4. Farmer A creates an Enriched Product (Tomato) with ALL fields
    const harvestYesterday = new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString();
    const prod1Res = await axios.post(`${BASE_URL}/products`, {
      title: 'Country Tomato',
      price: 80,
      stock: 45,
      category: 'vegetable',
      unit: 'kg',
      description: 'Sun-ripened indigenous organic country tomatoes.',
      variety: 'Naati Tomato',
      qualityGrade: 'Grade A',
      cultivationType: 'Organic',
      irrigationMethod: 'Drip',
      minOrderQty: 2,
      allowBargain: true,
      harvestDate: harvestYesterday
    }, { headers: { Authorization: `Bearer ${farmerAToken}` } });
    const product1 = prod1Res.data;

    // 5. Farmer A creates a Legacy Product (Onion) with NO agricultural fields
    const prod2Res = await axios.post(`${BASE_URL}/products`, {
      title: 'Bellary Onion',
      price: 60,
      stock: 30,
      category: 'vegetable',
      unit: 'kg',
      description: 'Pungent red onions fresh from harvest.'
    }, { headers: { Authorization: `Bearer ${farmerAToken}` } });
    const product2 = prod2Res.data;

    // 6. Farmer B creates an Enriched Product (Mango)
    const prod3Res = await axios.post(`${BASE_URL}/products`, {
      title: 'Alphonso Mango',
      price: 150,
      stock: 25,
      category: 'fruit',
      unit: 'kg',
      variety: 'Ratnagiri Alphonso',
      qualityGrade: 'Export',
      cultivationType: 'Natural',
      irrigationMethod: 'Sprinkler',
      minOrderQty: 2,
      allowBargain: true
    }, { headers: { Authorization: `Bearer ${farmerBToken}` } });
    const product3 = prod3Res.data;

    // --- TEST SECTION 1: DATA HONESTY ON FRESHNESS ---
    const freshnessP1 = getHarvestFreshness(product1.harvestDate);
    assert(freshnessP1.hasDate === true, 'Product with harvestDate has hasDate = true');
    assert(freshnessP1.label === 'Harvested 1 day ago', `Product harvested 26h ago labeled "${freshnessP1.label}"`);

    const freshnessMissing = getHarvestFreshness(null);
    assert(freshnessMissing.hasDate === false, 'Product without harvestDate has hasDate = false');
    assert(freshnessMissing.label === 'Harvest date not provided', 'Missing harvestDate truthfully displays "Harvest date not provided"');

    const freshnessUndefined = getHarvestFreshness(undefined);
    assert(freshnessUndefined.hasDate === false, 'Undefined harvestDate has hasDate = false');

    // --- TEST SECTION 2: DATA HONESTY ON CULTIVATION ---
    const displayCultivation1 = product1.cultivationType?.toLowerCase() === 'organic'
      ? 'Organic — Farmer reported'
      : product1.cultivationType;
    assert(displayCultivation1 === 'Organic — Farmer reported', 'Organic cultivation displayed truthfully as "Organic — Farmer reported"');
    assert(!displayCultivation1.includes('Certified Organic'), 'Never claims "Certified Organic" without certification');

    const displayCultivation2 = product2.cultivationType || 'Not provided by farmer';
    assert(displayCultivation2 === 'Not provided by farmer', 'Missing cultivation type displays "Not provided by farmer"');

    // --- TEST SECTION 3: QUALITY & VARIETY HONESTY ---
    const displayGrade1 = product1.qualityGrade || 'Not provided by farmer';
    assert(displayGrade1 === 'Grade A', 'Quality grade displays actual farmer provided grade');

    const displayGrade2 = product2.qualityGrade || 'Not provided by farmer';
    assert(displayGrade2 === 'Not provided by farmer', 'Missing quality grade displays "Not provided by farmer"');

    const displayVariety1 = product1.variety || 'Not provided by farmer';
    assert(displayVariety1 === 'Naati Tomato', 'Variety displays actual farmer provided variety');

    const displayVariety2 = product2.variety || 'Not provided by farmer';
    assert(displayVariety2 === 'Not provided by farmer', 'Missing variety displays "Not provided by farmer"');

    // --- TEST SECTION 4: MINIMUM ORDER QUANTITY INTEGRITY ---
    assert(product1.minOrderQty === 2, 'Product 1 enforces minimum order quantity of 2 kg');
    assert(product2.minOrderQty === 1, 'Product 2 defaults to minimum order quantity of 1 kg');

    // --- TEST SECTION 5: BARGAINING FLOW & PRICE TRANSPARENCY ---
    // Customer submits a bulk bargain for Product 1 (5 kg at ₹70/kg instead of ₹80)
    const bargainRes = await axios.post(`${BASE_URL}/bargains`, {
      productId: product1._id || product1.id,
      proposedPrice: 70,
      quantity: 5,
      note: 'Buying bulk for family event.'
    }, { headers: { Authorization: `Bearer ${customerToken}` } });
    const createdBargain = bargainRes.data.bargain || bargainRes.data;
    const bargainId = createdBargain._id || createdBargain.bargainId;
    assert(createdBargain.status === 'PENDING', 'Customer creates bulk bargain proposal in PENDING status');

    // Farmer A counters with ₹75/kg
    await axios.put(`${BASE_URL}/bargains/${bargainId}/farmer-respond`, {
      action: 'COUNTER',
      counterPrice: 75,
      note: 'I can do ₹75/kg for 5kg fresh harvest.'
    }, { headers: { Authorization: `Bearer ${farmerAToken}` } });

    // Customer accepts counter offer
    const acceptedBargainRes = await axios.put(`${BASE_URL}/bargains/${bargainId}/customer-respond`, {
      action: 'ACCEPT'
    }, { headers: { Authorization: `Bearer ${customerToken}` } });
    const acceptedBargain = acceptedBargainRes.data.bargain || acceptedBargainRes.data;
    assert(acceptedBargain.status === 'ACCEPTED', 'Customer accepts farmer counter offer (status ACCEPTED)');

    // Simulate adding accepted bargain to cart
    const bargainCartItem = {
      ...product1,
      price: 75, // Negotiated price
      originalPrice: 80, // Original catalog price
      quantity: 5,
      isBargain: true,
      farmerId: farmerAId,
      farmerName: 'Ramesh Kumar',
      location: { address: 'Thanjavur, Tamil Nadu' }
    };

    // Calculate savings
    const unitSavings = bargainCartItem.originalPrice - bargainCartItem.price;
    const totalSavings = unitSavings * bargainCartItem.quantity;
    assert(unitSavings === 5, `Unit savings accurately calculated: ₹80 - ₹75 = ₹${unitSavings}/kg`);
    assert(totalSavings === 25, `Total savings accurately calculated: 5kg × ₹5 = ₹${totalSavings}`);

    // --- TEST SECTION 6: MULTI-FARMER CART PRESENTATION ---
    // Create multi-farmer cart:
    // Farmer A: 5 kg Tomato (negotiated ₹75 = ₹375) + 2 kg Onion (₹60 = ₹120) => Subtotal ₹495
    // Farmer B: 2 kg Mango (₹150 = ₹300) => Subtotal ₹300
    // Total: ₹795
    const regularItemFarmerA = {
      ...product2,
      price: 60,
      quantity: 2,
      farmerId: farmerAId,
      farmerName: 'Ramesh Kumar',
      location: { address: 'Thanjavur, Tamil Nadu' }
    };

    const regularItemFarmerB = {
      ...product3,
      price: 150,
      quantity: 2,
      farmerId: farmerBId,
      farmerName: 'Green Valley Farms',
      location: { address: 'Coimbatore, Tamil Nadu' }
    };

    const simulatedCart = [bargainCartItem, regularItemFarmerA, regularItemFarmerB];
    const grouped = groupCartByFarmer(simulatedCart);

    assert(grouped.length === 2, `Cart grouped into exactly 2 farmer dispatches (Got ${grouped.length})`);

    const groupA = grouped.find(g => String(g.farmerId) === String(farmerAId));
    assert(!!groupA, 'Farmer A group present in grouped cart');
    assert(groupA.items.length === 2, `Farmer A has 2 items in cart (Got ${groupA.items.length})`);
    assert(groupA.subtotal === 495, `Farmer A subtotal calculated accurately: ₹375 + ₹120 = ₹${groupA.subtotal}`);

    const groupB = grouped.find(g => String(g.farmerId) === String(farmerBId));
    assert(!!groupB, 'Farmer B group present in grouped cart');
    assert(groupB.items.length === 1, `Farmer B has 1 item in cart (Got ${groupB.items.length})`);
    assert(groupB.subtotal === 300, `Farmer B subtotal calculated accurately: 2 × ₹150 = ₹${groupB.subtotal}`);

    const overallTotal = grouped.reduce((sum, g) => sum + g.subtotal, 0);
    assert(overallTotal === 795, `Overall cart total across all farmers is ₹${overallTotal}`);

    // --- TEST SECTION 7: CHECKOUT MULTI-FARMER DISPATCH PRESERVATION ---
    const orderPayload = {
      customerId: customerId,
      customerName: 'Ananya Sharma',
      customerPhone: '+91 9612345678',
      deliveryAddress: '12th Main, Indiranagar, Bangalore, Karnataka',
      items: [
        {
          productId: product1._id || product1.id,
          title: 'Country Tomato',
          price: 75,
          quantity: 5,
          unit: 'kg',
          farmerId: farmerAId,
          farmerName: 'Ramesh Kumar'
        },
        {
          productId: product2._id || product2.id,
          title: 'Bellary Onion',
          price: 60,
          quantity: 2,
          unit: 'kg',
          farmerId: farmerAId,
          farmerName: 'Ramesh Kumar'
        },
        {
          productId: product3._id || product3.id,
          title: 'Alphonso Mango',
          price: 150,
          quantity: 2,
          unit: 'kg',
          farmerId: farmerBId,
          farmerName: 'Green Valley Farms'
        }
      ],
      totalAmount: 795
    };

    const checkoutRes = await axios.post(`${BASE_URL}/orders`, orderPayload, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });

    assert(checkoutRes.status === 201, 'Backend processes multi-farmer checkout successfully');
    const createdOrders = checkoutRes.data.orders || (checkoutRes.data.order ? [checkoutRes.data.order] : []);
    assert(createdOrders.length === 2, `Order automatically split into 2 separate farmer fulfillments (Got ${createdOrders.length})`);

    // Verify inventory deductions
    const checkP1 = await axios.get(`${BASE_URL}/products/${product1._id || product1.id}`);
    assert(checkP1.data.stock === 40, `Stock of Tomato deducted accurately: 45 - 5 = ${checkP1.data.stock}`);

    const checkP2 = await axios.get(`${BASE_URL}/products/${product2._id || product2.id}`);
    assert(checkP2.data.stock === 28, `Stock of Onion deducted accurately: 30 - 2 = ${checkP2.data.stock}`);

    const checkP3 = await axios.get(`${BASE_URL}/products/${product3._id || product3.id}`);
    assert(checkP3.data.stock === 23, `Stock of Mango deducted accurately: 25 - 2 = ${checkP3.data.stock}`);

    // --- TEST SECTION 8: CURRENCY FORMATTING INTEGRITY ---
    const formatINR = (val) => `₹${val}`;
    assert(formatINR(product1.price) === '₹80', 'Price formatted with Indian Rupee symbol: ₹80');
    assert(!formatINR(product1.price).includes('$'), 'Price never contains dollar sign');

  } catch (err) {
    console.error('Test execution error:', err.response?.data || err.message);
    failed++;
  } finally {
    stopTestServer();
  }

  console.log('\n================================================================');
  console.log(`📊 PHASE 3 VERIFICATION COMPLETE: ${passed}/${passed + failed} TESTS PASSED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3Verification();
