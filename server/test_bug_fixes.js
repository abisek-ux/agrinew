const assert = require('assert');
const { resolveFarmerLocation, sanitizeOrderFarmerDetails } = require('./utils/farmerLocationHelper');

console.log('========================================================');
console.log('🧪 RUNNING COMPREHENSIVE VERIFICATION FOR BUG FIXES');
console.log('========================================================\n');

// ─────────────────────────────────────────────────────────────
// TEST 1: Farmer Location Resolution & String Deduplication (Bug 3)
// ─────────────────────────────────────────────────────────────
console.log('▶ Test 1: Farmer Location Resolution & String Deduplication');

// Case 1a: Duplicate Hub string in address
const duplicateLocation = {
  address: 'AgriLink Regional Farm Hub (AgriLink Regional Farm Hub)',
  lat: 11.2189,
  lng: 78.1674,
  placeName: 'AgriLink Regional Farm Hub'
};
const cleaned1a = resolveFarmerLocation(duplicateLocation, 'seed_1');
assert(!cleaned1a.address.includes('(AgriLink Regional Farm Hub)'), 'Must eliminate duplicate hub in parentheses');
assert.strictEqual(cleaned1a.address, 'AgriLink Regional Farm Hub', 'Cleaned address should equal AgriLink Regional Farm Hub');
console.log('  ✓ Successfully removed parenthetical hub duplication');

// Case 1b: Farmer verified farm address priority
const farmerWithAddress = {
  farmAddress: 'Green Valley Organic Farms, Plot 42, Namakkal, Tamil Nadu',
  city: 'Namakkal',
  isFarmAddressVerified: true,
  role: 'farmer'
};
const resolved1b = resolveFarmerLocation(null, 'seed_2', farmerWithAddress);
assert.strictEqual(resolved1b.address, 'Green Valley Organic Farms, Plot 42, Namakkal, Tamil Nadu');
assert.strictEqual(resolved1b.source, 'verified_farm_address');
console.log('  ✓ Verified farm address prioritized over city and fallback');

// Case 1c: City / native place fallback
const farmerWithCity = {
  city: 'Salem',
  state: 'Tamil Nadu',
  role: 'farmer'
};
const resolved1c = resolveFarmerLocation(null, 'seed_3', farmerWithCity);
assert.strictEqual(resolved1c.address, 'Salem, Tamil Nadu');
assert.strictEqual(resolved1c.source, 'city_native_place');
console.log('  ✓ Native city/state fallback resolved authentically');

// Case 1d: Preserving historical order snapshot
const historicalSnapshot = {
  address: 'Historical Farm Gate at Thindal, Erode, Tamil Nadu',
  lat: 11.3410,
  lng: 77.7172,
  source: 'historical_order_snapshot'
};
const preserved1d = resolveFarmerLocation(historicalSnapshot, 'seed_4', { farmAddress: 'New Relocated Farm Address' });
assert.strictEqual(preserved1d.address, 'Historical Farm Gate at Thindal, Erode, Tamil Nadu');
assert.strictEqual(preserved1d.source, 'historical_order_snapshot');
console.log('  ✓ Historical order location snapshot preserved against silent overwrite');

// ─────────────────────────────────────────────────────────────
// TEST 2: AI Recipe Assistant Intents & Guardrails (Bug 1)
// ─────────────────────────────────────────────────────────────
console.log('\n▶ Test 2: AI Recipe Studio Intents & Entity Detection');
const { recipeAssistant } = require('./controllers/aiController');

// Mock Express req/res
const runAiPrompt = async (prompt, lastRecipeName = null, cartItems = []) => {
  return new Promise((resolve) => {
    const req = {
      body: { prompt, lastRecipeName, cartItems },
      user: { id: 'cust_123', role: 'customer' }
    };
    const res = {
      status: (code) => ({
        json: (data) => resolve({ statusCode: code, data })
      }),
      json: (data) => resolve({ statusCode: 200, data })
    };
    recipeAssistant(req, res);
  });
};

(async () => {
  // 2a. Greeting intent - MUST NOT return carrot juice or any recipe
  const greetRes = await runAiPrompt('hello there');
  assert.strictEqual(greetRes.data.success, true);
  assert.strictEqual(greetRes.data.intent, 'greeting');
  assert.strictEqual(greetRes.data.recipe, null, 'Greeting should return null recipe');
  assert(!greetRes.data.reply.toLowerCase().includes('carrot juice'), 'Greeting must never return carrot juice');
  console.log('  ✓ Greeting intent handled politely without returning recipe or carrot juice');

  // 2b. Grapes Juice request - MUST NOT return carrot juice
  const grapeRes = await runAiPrompt('I want grapes juice, give me the recipe');
  assert.strictEqual(grapeRes.data.success, true);
  assert(grapeRes.data.recipe, 'Should return a structured recipe');
  assert(grapeRes.data.recipe.title.toLowerCase().includes('grape'), `Expected grape juice recipe, got: ${grapeRes.data.recipe.title}`);
  assert(!grapeRes.data.recipe.title.toLowerCase().includes('carrot'), 'Must NOT return carrot juice');
  assert(Array.isArray(grapeRes.data.recipe.ingredients) && grapeRes.data.recipe.ingredients.length > 0, 'Recipe must have ingredients');
  assert(Array.isArray(grapeRes.data.recipe.procedure) && grapeRes.data.recipe.procedure.length > 0, 'Recipe must have procedure');
  console.log(`  ✓ Grape juice intent correctly returned: "${grapeRes.data.recipe.title}"`);

  // 2c. Tomato soup request
  const tomatoRes = await runAiPrompt('How do I make fresh tomato soup?');
  assert.strictEqual(tomatoRes.data.success, true);
  assert(tomatoRes.data.recipe.title.toLowerCase().includes('tomato'), `Expected tomato recipe, got: ${tomatoRes.data.recipe.title}`);
  console.log(`  ✓ Tomato soup intent correctly returned: "${tomatoRes.data.recipe.title}"`);

  // 2d. Banana smoothie request
  const bananaRes = await runAiPrompt('banana smoothie recipe please');
  assert.strictEqual(bananaRes.data.success, true);
  assert(bananaRes.data.recipe.title.toLowerCase().includes('banana'), `Expected banana smoothie, got: ${bananaRes.data.recipe.title}`);
  console.log(`  ✓ Banana smoothie intent correctly returned: "${bananaRes.data.recipe.title}"`);

  // 2e. Cabbage curry request
  const cabbageRes = await runAiPrompt('How to cook cabbage curry?');
  assert.strictEqual(cabbageRes.data.success, true);
  assert(cabbageRes.data.recipe.title.toLowerCase().includes('cabbage'), `Expected cabbage recipe, got: ${cabbageRes.data.recipe.title}`);
  console.log(`  ✓ Cabbage recipe intent correctly returned: "${cabbageRes.data.recipe.title}"`);

  // 2f. Cart produce recipe request
  const cartRes = await runAiPrompt('What can I cook with the fresh produce in my cart?', null, [
    { title: 'Fresh Spinach', quantity: 2 },
    { title: 'Country Tomatoes', quantity: 1 }
  ]);
  assert.strictEqual(cartRes.data.success, true);
  assert(cartRes.data.recipe, 'Should generate recipe from cart items');
  console.log(`  ✓ Cart produce recipe correctly returned: "${cartRes.data.recipe.title}"`);

  // 2g. Non-food / off-topic guardrail
  const offTopicRes = await runAiPrompt('Who won the world cup in 2022?');
  assert.strictEqual(offTopicRes.data.success, true);
  assert.strictEqual(offTopicRes.data.recipe, null);
  assert(offTopicRes.data.reply.toLowerCase().includes('culinary') || offTopicRes.data.reply.toLowerCase().includes('recipe'));
  console.log('  ✓ Off-topic request rejected safely with culinary guardrail guidance');

  // ─────────────────────────────────────────────────────────────
  // TEST 3: Order Controller COD & Payment Collection (Bug 4)
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ Test 3: Cash on Delivery Integrity & Handover Payment Collection');
  const { processOrderPayment, collectCodPayment, seedMemoryOrder } = require('./controllers/orderController');

  // Mock an order in memory
  const testOrder = {
    _id: 'ord_test_cod_001',
    orderId: 'ORD-TEST-001',
    customerId: 'cust_001',
    customerName: 'Aarav Kumar',
    deliveryId: 'driver_001',
    deliveryName: 'David Swift',
    totalAmount: 480,
    paymentMethod: 'COD',
    paymentStatus: 'pending',
    status: 'arrived',
    save: async function() { return this; }
  };
  seedMemoryOrder(testOrder);

  // 3a. Rejection of online payment attempt on COD orders
  const onlinePayReq = {
    params: { id: 'ord_test_cod_001' },
    body: { orderId: 'ord_test_cod_001', paymentMethod: 'upi', amount: 480 },
    user: { id: 'cust_001', role: 'customer' }
  };
  const mockOrderModel = require('./models/Order');
  // Inject into memory for test run
  const originalFindById = mockOrderModel.findById;
  const originalFindOne = mockOrderModel.findOne;
  mockOrderModel.findById = async () => testOrder;
  mockOrderModel.findOne = async () => testOrder;

  const onlinePayRes = await new Promise(resolve => {
    processOrderPayment(onlinePayReq, {
      status: (code) => ({ json: (d) => resolve({ statusCode: code, data: d }) }),
      json: (d) => resolve({ statusCode: 200, data: d })
    });
  });

  assert.strictEqual(onlinePayRes.statusCode, 400, 'Online payment attempt on COD order must return 400');
  assert(onlinePayRes.data.message.includes('Cash on Delivery'), 'Error message must specify COD cannot be processed via online gateway');
  assert.strictEqual(testOrder.paymentStatus, 'pending', 'Order paymentStatus must remain pending');
  console.log('  ✓ Online payment gateway attempt on COD orders successfully rejected (HTTP 400)');

  // 3b. Non-delivery role cannot collect COD payment
  const unauthCollectReq = {
    params: { id: 'ord_test_cod_001' },
    body: { method: 'CASH', amount: 480 },
    user: { id: 'cust_001', role: 'customer' }
  };
  const unauthCollectRes = await new Promise(resolve => {
    collectCodPayment(unauthCollectReq, {
      status: (code) => ({ json: (d) => resolve({ statusCode: code, data: d }) }),
      json: (d) => resolve({ statusCode: 200, data: d })
    });
  });
  assert.strictEqual(unauthCollectRes.statusCode, 403, 'Customer or non-delivery role cannot collect cash');
  console.log('  ✓ Unauthorized role COD collection blocked with HTTP 403');

  // 3c. Authorized driver collection
  const authCollectReq = {
    params: { id: 'ord_test_cod_001' },
    body: { method: 'CASH', amount: 480 },
    user: { id: 'driver_001', role: 'delivery' }
  };
  const authCollectRes = await new Promise(resolve => {
    collectCodPayment(authCollectReq, {
      status: (code) => ({ json: (d) => resolve({ statusCode: code, data: d }) }),
      json: (d) => resolve({ statusCode: 200, data: d })
    });
  });
  assert.strictEqual(authCollectRes.statusCode, 200);
  assert.strictEqual(testOrder.paymentStatus, 'collected');
  assert.strictEqual(testOrder.paymentCollectionMethod, 'CASH');
  assert(testOrder.paymentCollectedAt, 'Should set paymentCollectedAt timestamp');
  console.log('  ✓ Authorized courier recorded cash collection as "collected"');

  // 3d. Duplicate collection prevention
  const dupCollectRes = await new Promise(resolve => {
    collectCodPayment(authCollectReq, {
      status: (code) => ({ json: (d) => resolve({ statusCode: code, data: d }) }),
      json: (d) => resolve({ statusCode: 200, data: d })
    });
  });
  assert(dupCollectRes.statusCode === 400 || dupCollectRes.statusCode === 409, 'Duplicate payment collection must be rejected with 400 or 409');
  assert(dupCollectRes.data.message.includes('already been collected'), 'Error message must indicate duplicate collection');
  console.log('  ✓ Duplicate payment collection attempt blocked idempotently (HTTP 409 Conflict)');

  // Restore mock
  mockOrderModel.findById = originalFindById;
  mockOrderModel.findOne = originalFindOne;

  console.log('\n========================================================');
  console.log('🎉 ALL BUG FIX VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('========================================================\n');
  process.exit(0);
})().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
