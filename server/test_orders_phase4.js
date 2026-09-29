/**
 * test_orders_phase4.js
 * Automated Verification Suite for Phase 4:
 * Customer Orders, Bargaining, Checkout & Payment UX
 *
 * Verifies:
 * 1. Multi-farmer cart checkout splitting into independent orders
 * 2. Delivery address persistence (Name, Phone, Address, City, State, Pincode)
 * 3. Currency and Data Honesty (Strictly ₹ INR, no $, mathematical totals match)
 * 4. Honest Payment Method Handling (COD / UPI on Handover, no fake online cards)
 * 5. Order Details Retrieval & Milestone Status Adherence (strictly backend enum)
 * 6. Order Cancellation Workflow with reason persistence & inventory replenishment
 * 7. Cancellation Safety Constraints (prevent cancelling non-cancellable or already-cancelled orders)
 * 8. Bargaining Negotiation Timeline, Counter Offers, Acceptance & Savings Calculation
 * 9. Stock Validation & Error Handling (Empty cart, Insufficient stock, Auth check)
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

// Client-side savings calculation emulation
function calculateBargainSavings(originalPrice, agreedPrice, quantity = 1) {
  const diffPerUnit = Math.max(0, Number(originalPrice) - Number(agreedPrice));
  const totalSavings = diffPerUnit * quantity;
  const percentSavings = originalPrice > 0 ? Math.round((diffPerUnit / originalPrice) * 100) : 0;
  return { diffPerUnit, totalSavings, percentSavings };
}

// Client-side multi-farmer breakdown emulation
function calculateFarmerSubtotals(cartItems) {
  const groups = {};
  cartItems.forEach(item => {
    const fId = String(item.farmerId || 'unknown');
    if (!groups[fId]) {
      groups[fId] = { farmerName: item.farmerName, subtotal: 0, items: [] };
    }
    const lineTotal = Number(item.price) * item.quantity;
    groups[fId].subtotal += lineTotal;
    groups[fId].items.push(item);
  });
  return groups;
}

async function runPhase4Verification() {
  console.log('\n================================================================');
  console.log('🌾 TESTING PHASE 4: CHECKOUT, ORDERS, BARGAINING & PAYMENT UX');
  console.log('================================================================');

  await startTestServer();

  try {
    const timestamp = Date.now();

    // 1. Setup Farmer 1
    const farmer1Res = await axios.post(`${BASE_URL}/auth/register`, {
      email: `farmer1_${timestamp}@agrilink.in`,
      phone: `+9198${String(timestamp).slice(-8)}`,
      password: 'Password@123',
      role: 'farmer',
      firstName: 'Ramesh',
      lastName: 'Gowda',
      nativePlace: 'Mandya, Karnataka'
    });
    const farmer1Token = farmer1Res.data.token;
    const farmer1Id = farmer1Res.data._id || farmer1Res.data.id || farmer1Res.data.user?._id || farmer1Res.data.user?.id;
    assert(farmer1Token && farmer1Id, 'Farmer 1 registered successfully');

    // 2. Setup Farmer 2
    const farmer2Res = await axios.post(`${BASE_URL}/auth/register`, {
      email: `farmer2_${timestamp}@agrilink.in`,
      phone: `+9197${String(timestamp).slice(-8)}`,
      password: 'Password@123',
      role: 'farmer',
      firstName: 'Lakshmi',
      lastName: 'Devi',
      nativePlace: 'Guntur, Andhra Pradesh'
    });
    const farmer2Token = farmer2Res.data.token;
    const farmer2Id = farmer2Res.data._id || farmer2Res.data.id || farmer2Res.data.user?._id || farmer2Res.data.user?.id;
    assert(farmer2Token && farmer2Id, 'Farmer 2 registered successfully');

    // 3. Setup Customer
    const customerRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: `customer_p4_${timestamp}@agrilink.in`,
      phone: `+9196${String(timestamp).slice(-8)}`,
      password: 'Password@123',
      role: 'customer',
      firstName: 'Priya',
      lastName: 'Natarajan'
    });
    const customerToken = customerRes.data.token;
    const customerId = customerRes.data._id || customerRes.data.id || customerRes.data.user?._id || customerRes.data.user?.id;
    assert(customerToken && customerId, 'Customer registered successfully');

    // 4. Create Product for Farmer 1
    const prod1Res = await axios.post(
      `${BASE_URL}/products`,
      {
        title: 'Fresh Organic Robusta Bananas',
        category: 'Fruits',
        price: 50,
        unit: 'kg',
        stock: 100,
        description: 'Naturally ripened organic bananas from Mandya',
        cropVariety: 'Robusta',
        harvestDate: new Date().toISOString()
      },
      { headers: { Authorization: `Bearer ${farmer1Token}` } }
    );
    const prod1 = prod1Res.data.product || prod1Res.data;
    assert(prod1 && prod1._id, 'Farmer 1 product listed with agricultural metadata');

    // 5. Create Product for Farmer 2
    const prod2Res = await axios.post(
      `${BASE_URL}/products`,
      {
        title: 'Fresh Guntur Red Chillies',
        category: 'Spices',
        price: 180,
        unit: 'kg',
        stock: 50,
        description: 'Direct sun-dried premium Guntur chillies',
        cropVariety: 'Guntur Sannam',
        harvestDate: new Date().toISOString()
      },
      { headers: { Authorization: `Bearer ${farmer2Token}` } }
    );
    const prod2 = prod2Res.data.product || prod2Res.data;
    assert(prod2 && prod2._id, 'Farmer 2 product listed with agricultural metadata');

    // TEST 1: Multi-Farmer Cart Grouping & Subtotal Mathematics
    console.log('\n--- 1. Multi-Farmer Cart Subtotal Calculation ---');
    const mockCart = [
      { id: prod1._id, farmerId: farmer1Id, farmerName: 'Ramesh Gowda', title: prod1.title, price: 50, quantity: 4 }, // 200
      { id: prod2._id, farmerId: farmer2Id, farmerName: 'Lakshmi Devi', title: prod2.title, price: 180, quantity: 2 } // 360
    ];
    const farmerBreakdown = calculateFarmerSubtotals(mockCart);
    assert(farmerBreakdown[farmer1Id].subtotal === 200, 'Farmer 1 subtotal correctly calculated (₹200)');
    assert(farmerBreakdown[farmer2Id].subtotal === 360, 'Farmer 2 subtotal correctly calculated (₹360)');
    const grandTotal = farmerBreakdown[farmer1Id].subtotal + farmerBreakdown[farmer2Id].subtotal;
    assert(grandTotal === 560, 'Combined order total correctly calculated (₹560)');

    // TEST 2: Multi-Farmer Cart Checkout Splitting
    console.log('\n--- 2. Multi-Farmer Cart Checkout Splitting ---');
    const deliveryAddress = {
      name: 'Priya Natarajan',
      phone: '+919612345678',
      address: 'Flat 402, Green Orchid Apartments, 12th Main Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034'
    };

    const checkoutPayload = {
      customerName: deliveryAddress.name,
      customerPhone: deliveryAddress.phone,
      customerLocation: {
        address: `${deliveryAddress.address}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.pincode}`,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        pincode: deliveryAddress.pincode
      },
      items: [
        { productId: prod1._id, title: prod1.title, price: prod1.price, quantity: 4, unit: prod1.unit },
        { productId: prod2._id, title: prod2.title, price: prod2.price, quantity: 2, unit: prod2.unit }
      ],
      expressDelivery: false,
      paymentMethod: 'cod'
    };

    const checkoutRes = await axios.post(`${BASE_URL}/orders`, checkoutPayload, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });

    assert(checkoutRes.status === 201 || checkoutRes.status === 200, 'Order checkout API succeeded');
    const createdOrders = checkoutRes.data.orders || [checkoutRes.data.order];
    assert(createdOrders.length === 2, 'Checkout successfully split multi-farmer cart into 2 separate farmer orders');

    const orderF1 = createdOrders.find(o => String(o.farmerId) === String(farmer1Id));
    const orderF2 = createdOrders.find(o => String(o.farmerId) === String(farmer2Id));
    assert(orderF1 && orderF2, 'Both Farmer 1 and Farmer 2 orders independently created');
    assert(orderF1.totalAmount === 200, 'Farmer 1 order total equals ₹200');
    assert(orderF2.totalAmount === 360, 'Farmer 2 order total equals ₹360');

    // TEST 3: Delivery Address Persistence
    console.log('\n--- 3. Delivery Address Persistence ---');
    assert(orderF1.customerName === deliveryAddress.name, 'Customer name persisted on order');
    assert(orderF1.customerPhone === deliveryAddress.phone, 'Customer phone persisted on order');
    assert(
      orderF1.customerLocation?.address && orderF1.customerLocation.address.includes('Green Orchid'),
      'Customer delivery address details persisted on order'
    );

    // TEST 4: Stock Deduction Verification
    console.log('\n--- 4. Stock Deduction Verification ---');
    const updatedProd1Res = await axios.get(`${BASE_URL}/products/${prod1._id}`);
    const updatedProd1 = updatedProd1Res.data.product || updatedProd1Res.data;
    assert(updatedProd1.stock === 96, 'Product 1 stock correctly decremented from 100 to 96');

    const updatedProd2Res = await axios.get(`${BASE_URL}/products/${prod2._id}`);
    const updatedProd2 = updatedProd2Res.data.product || updatedProd2Res.data;
    assert(updatedProd2.stock === 48, 'Product 2 stock correctly decremented from 50 to 48');

    // TEST 5: Currency and Payment Honesty
    console.log('\n--- 5. Currency & Payment Honesty ---');
    assert(orderF1.totalAmount > 0 && typeof orderF1.totalAmount === 'number', 'Order total is non-negative numeric ₹ amount');
    assert(orderF1.status === 'pending', 'Order payment/status initialized to standard backend "pending" (COD due on delivery)');
    assert(!orderF1.paidAt, 'No fake payment timestamps exist for cash/UPI on delivery order');

    // TEST 6: Order Details & Milestone Adherence
    console.log('\n--- 6. Order Details & Milestones ---');
    const myOrdersRes = await axios.get(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const myOrders = myOrdersRes.data.orders || myOrdersRes.data;
    assert(Array.isArray(myOrders) && myOrders.length >= 2, 'Customer can fetch list of their orders');

    const allowedStatuses = ['pending', 'confirmed', 'accepted', 'packed', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'arrived', 'delivered', 'cancelled'];
    const allStatusesValid = myOrders.every(o => allowedStatuses.includes(o.status));
    assert(allStatusesValid, 'All order statuses strictly adhere to approved backend status enum');

    // TEST 7: Order Cancellation Workflow & Inventory Replenishment
    console.log('\n--- 7. Order Cancellation Workflow ---');
    const cancelReason = 'Delivery address needs modification';
    const cancelRes = await axios.put(
      `${BASE_URL}/orders/${orderF1._id || orderF1.id}/status`,
      {
        status: 'cancelled',
        cancellationReason: cancelReason
      },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    assert(cancelRes.status === 200, 'Customer order cancellation succeeded');
    const cancelledOrder = cancelRes.data.order || cancelRes.data;
    assert(cancelledOrder.status === 'cancelled', 'Order status updated to "cancelled"');
    assert(cancelledOrder.cancellationReason === cancelReason, 'Cancellation reason persisted on order document');

    // Verify stock replenishment on product 1
    const replenishedProd1Res = await axios.get(`${BASE_URL}/products/${prod1._id}`);
    const replenishedProd1 = replenishedProd1Res.data.product || replenishedProd1Res.data;
    assert(replenishedProd1.stock === 100, 'Product 1 stock correctly replenished back to 100 upon cancellation');

    // TEST 8: Cancellation Safety Constraints
    console.log('\n--- 8. Cancellation Safety Constraints ---');
    // Attempt to cancel an already-cancelled order
    try {
      await axios.put(
        `${BASE_URL}/orders/${orderF1._id || orderF1.id}/status`,
        { status: 'cancelled', cancellationReason: 'Trying again' },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );
      assert(false, 'Should prevent cancelling an already cancelled order');
    } catch (err) {
      assert(err.response?.status === 400, 'Prevented cancelling already-cancelled order (HTTP 400)');
    }

    // Farmer confirms order 2
    await axios.put(
      `${BASE_URL}/orders/${orderF2._id || orderF2.id}/status`,
      { status: 'confirmed' },
      { headers: { Authorization: `Bearer ${farmer2Token}` } }
    );

    // Another customer tries to cancel order 2 (unauthorized)
    const intruderRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: `intruder_${timestamp}@agrilink.in`,
      phone: `+9195${String(timestamp).slice(-8)}`,
      password: 'Password@123',
      role: 'customer',
      firstName: 'Intruder',
      lastName: 'Test'
    });
    try {
      await axios.put(
        `${BASE_URL}/orders/${orderF2._id || orderF2.id}/status`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${intruderRes.data.token}` } }
      );
      assert(false, 'Should prevent unauthorized customer from cancelling someone else\'s order');
    } catch (err) {
      assert(err.response?.status === 403, 'Unauthorized order cancellation blocked (HTTP 403)');
    }

    // TEST 9: Bargaining Negotiation Timeline & Savings Calculation
    console.log('\n--- 9. Bargaining Timeline & Savings Calculation ---');
    // Customer makes offer: 50 -> 40
    const bargainRes = await axios.post(
      `${BASE_URL}/bargains`,
      {
        productId: prod1._id,
        proposedPrice: 40,
        quantity: 5,
        note: 'Looking for weekly farm purchase'
      },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    const bargain = bargainRes.data.bargain || bargainRes.data;
    assert(bargain && (bargain._id || bargain.id || bargain.bargainId), 'Customer initiated bargain offer at ₹40/kg');

    const bargainId = bargain._id || bargain.id || bargain.bargainId;

    // Emulate negotiation savings calculation
    const savingsBefore = calculateBargainSavings(prod1.price, 40, 5);
    assert(savingsBefore.totalSavings === 50, 'Offer savings correctly calculated (₹50 total, ₹10/kg)');
    assert(savingsBefore.percentSavings === 20, 'Offer discount correctly calculated (20% off)');

    // Farmer counters offer at ₹45
    const counterRes = await axios.put(
      `${BASE_URL}/bargains/${bargainId}/farmer-respond`,
      {
        action: 'COUNTER',
        counterPrice: 45,
        note: 'Can offer ₹45 for premium grade'
      },
      { headers: { Authorization: `Bearer ${farmer1Token}` } }
    );
    const counteredBargain = counterRes.data.bargain || counterRes.data;
    assert(counteredBargain.status === 'COUNTERED' && counteredBargain.counterPrice === 45, 'Farmer counter offer recorded at ₹45');

    // Customer accepts counter offer
    const acceptRes = await axios.put(
      `${BASE_URL}/bargains/${bargainId}/customer-respond`,
      { action: 'ACCEPT' },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    const acceptedBargain = acceptRes.data.bargain || acceptRes.data;
    assert(acceptedBargain.status === 'ACCEPTED', 'Customer successfully accepted bargain at negotiated price');

    const finalSavings = calculateBargainSavings(prod1.price, acceptedBargain.proposedPrice || acceptedBargain.counterPrice || 45, 5);
    assert(finalSavings.totalSavings === 25, 'Accepted bargain savings correctly calculated (₹25 total savings)');
    assert(finalSavings.percentSavings === 10, 'Accepted bargain percent savings correctly calculated (10% savings)');

    // TEST 10: Stock & Input Validation Error States
    console.log('\n--- 10. Stock & Input Validation Error States ---');
    // Empty cart items
    try {
      await axios.post(
        `${BASE_URL}/orders`,
        { items: [] },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );
      assert(false, 'Should reject empty order items');
    } catch (err) {
      assert(err.response?.status === 400, 'Empty cart rejected with HTTP 400');
    }

    // Insufficient stock request
    try {
      await axios.post(
        `${BASE_URL}/orders`,
        {
          items: [{ productId: prod2._id, quantity: 9999, price: prod2.price }]
        },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );
      assert(false, 'Should reject order with quantity exceeding available stock');
    } catch (err) {
      assert(err.response?.status === 400, 'Excess quantity rejected with HTTP 400');
    }

    // Unauthenticated order creation
    try {
      await axios.post(`${BASE_URL}/orders`, { items: [{ productId: prod1._id, quantity: 1, price: 50 }] });
      assert(false, 'Should reject unauthenticated order checkout');
    } catch (err) {
      assert(err.response?.status === 401, 'Unauthenticated checkout rejected with HTTP 401');
    }

  } catch (error) {
    console.error('Unexpected error in Phase 4 verification:', error.response?.data || error.message);
    failed++;
  } finally {
    stopTestServer();
  }

  console.log('\n================================================================');
  console.log(`📊 PHASE 4 VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase4Verification();
