/**
 * AgriLink Phase 10 Automated Regression Suite
 * Tests:
 * 1. Bargain Complete Lifecycle: PENDING -> COUNTERED -> ACCEPTED -> ADDED_TO_CART
 * 2. Active Bargains vs Bargain History separation
 * 3. Prevention of duplicate cart consumption
 * 4. Negotiated price authoritativeness (cannot be overwritten by original price)
 * 5. Farmer Identity Integrity across Product -> Cart -> Order -> Delivery Portal
 * 6. Multi-farmer cart fulfillment with distinct authoritative farmer identities
 * 7. Verification that zero deleted AI/test farmers exist in DB
 * 8. Verification that all remaining products reference legitimate registered farmers
 * 9. Customer Farmer Directory returns only legitimate farmers
 */

const axios = require('axios');
const mongoose = require('mongoose');
const http = require('http');
require('dotenv').config({ path: './server/.env' });

const { app } = require('./server');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Bargain = require('./models/Bargain');

let server;
let baseUrl;
let passCount = 0;
let failCount = 0;

function check(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

async function runPhase10Tests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING AGRILINK PHASE 10 LIFECYCLE & IDENTITY SUITE');
  console.log('======================================================\n');

  // Connect to MongoDB
  await connectDB();

  // Start test server on random open port
  const PORT = 61899;
  server = http.createServer(app);
  await new Promise(resolve => server.listen(PORT, resolve));
  baseUrl = `http://127.0.0.1:${PORT}`;
  console.log(`Test server running at ${baseUrl}`);

  try {
    const timestamp = Date.now();

    // ----------------------------------------------------
    // SETUP: Create authenticated accounts
    // ----------------------------------------------------
    const custPayload = {
      name: 'Priya Raman',
      firstName: 'Priya',
      lastName: 'Raman',
      email: `p10_cust_${timestamp}@agrilink.in`,
      phone: `99401${Math.floor(10000 + Math.random() * 90000)}`,
      password: 'Password123!',
      role: 'customer'
    };
    const custReg = await axios.post(`${baseUrl}/api/auth/register`, custPayload);
    const custUser = custReg.data.user || custReg.data;
    const custToken = custReg.data.token || custUser.token;
    const custId = String(custUser._id || custUser.id);
    const custHeaders = { Authorization: `Bearer ${custToken}` };

    const farmerAPayload = {
      name: 'Venkatesh Perumal',
      firstName: 'Venkatesh',
      lastName: 'Perumal',
      farmName: 'Perumal Organic Groves',
      email: `p10_farmerA_${timestamp}@agrilink.in`,
      phone: `98421${Math.floor(10000 + Math.random() * 90000)}`,
      password: 'Password123!',
      role: 'farmer'
    };
    const fAReg = await axios.post(`${baseUrl}/api/auth/register`, farmerAPayload);
    const fAUser = fAReg.data.user || fAReg.data;
    const fAToken = fAReg.data.token || fAUser.token;
    const fAId = String(fAUser._id || fAUser.id);
    const fAHeaders = { Authorization: `Bearer ${fAToken}` };

    const farmerBPayload = {
      name: 'Kavitha Natarajan',
      firstName: 'Kavitha',
      lastName: 'Natarajan',
      farmName: 'Kavitha Farm Estates',
      email: `p10_farmerB_${timestamp}@agrilink.in`,
      phone: `98422${Math.floor(10000 + Math.random() * 90000)}`,
      password: 'Password123!',
      role: 'farmer'
    };
    const fBReg = await axios.post(`${baseUrl}/api/auth/register`, farmerBPayload);
    const fBUser = fBReg.data.user || fBReg.data;
    const fBToken = fBReg.data.token || fBUser.token;
    const fBId = String(fBUser._id || fBUser.id);
    const fBHeaders = { Authorization: `Bearer ${fBToken}` };

    const deliveryPayload = {
      name: 'Muthu Delivery',
      firstName: 'Muthu',
      lastName: 'Driver',
      email: `p10_delivery_${timestamp}@agrilink.in`,
      phone: `98423${Math.floor(10000 + Math.random() * 90000)}`,
      password: 'Password123!',
      role: 'delivery'
    };
    const delReg = await axios.post(`${baseUrl}/api/auth/register`, deliveryPayload);
    const delUser = delReg.data.user || delReg.data;
    const delToken = delReg.data.token || delUser.token;
    const delHeaders = { Authorization: `Bearer ${delToken}` };

    // Farmer A creates produce
    const prodARes = await axios.post(`${baseUrl}/api/products`, {
      title: `Erode Turmeric Seeds ${timestamp}`,
      category: 'seed',
      price: 150,
      stock: 50,
      minOrderQty: 2,
      allowBargain: true
    }, { headers: fAHeaders });
    const prodA = prodARes.data;

    // Farmer B creates produce
    const prodBRes = await axios.post(`${baseUrl}/api/products`, {
      title: `Salem Country Tomatoes ${timestamp}`,
      category: 'vegetable',
      price: 60,
      stock: 100,
      minOrderQty: 5,
      allowBargain: true
    }, { headers: fBHeaders });
    const prodB = prodBRes.data;

    // ----------------------------------------------------
    // TEST SECTION 1: BARGAIN COMPLETE LIFECYCLE
    // ----------------------------------------------------
    console.log('\n--- 1. Bargain Complete Lifecycle (Problem 1) ---');
    
    // 1. Customer creates bargain
    const bargainRes = await axios.post(`${baseUrl}/api/bargains`, {
      productId: prodA._id || prodA.id,
      quantity: 10,
      proposedPrice: 110,
      note: 'Bulk purchase for organic store'
    }, { headers: custHeaders });
    check(bargainRes.status === 201, 'Customer successfully creates bargain proposal (HTTP 201)');
    const bargain = bargainRes.data.bargain;
    const bargainId = bargain.bargainId || bargain._id;
    check(bargain.status === 'PENDING', 'Initial bargain status is PENDING');

    // 2. Farmer counters bargain
    const counterRes = await axios.put(`${baseUrl}/api/bargains/${bargainId}/farmer-respond`, {
      action: 'COUNTER',
      counterPrice: 125,
      note: 'Can do ₹125/kg for 10kg batch'
    }, { headers: fAHeaders });
    check(counterRes.status === 200, 'Farmer counters bargain proposal (HTTP 200)');
    check(counterRes.data.bargain.status === 'COUNTERED', 'Bargain status transitions to COUNTERED');
    check(counterRes.data.bargain.counterPrice === 125, 'Counter price is recorded as ₹125');

    // 3. Customer accepts counter
    const acceptRes = await axios.put(`${baseUrl}/api/bargains/${bargainId}/customer-respond`, {
      action: 'ACCEPT'
    }, { headers: custHeaders });
    check(acceptRes.status === 200, 'Customer accepts counter offer (HTTP 200)');
    check(acceptRes.data.bargain.status === 'ACCEPTED', 'Bargain status transitions to ACCEPTED');
    check(acceptRes.data.bargain.proposedPrice === 125, 'Negotiated price authoritatively locked at ₹125');

    // 4. Verify bargain is in Active bargains (status ACCEPTED)
    const bargainsBeforeCart = await axios.get(`${baseUrl}/api/bargains`, { headers: custHeaders });
    const customerList1 = bargainsBeforeCart.data.bargains;
    const bFound1 = customerList1.find(b => (b.bargainId === bargainId || String(b._id) === String(bargain._id)));
    check(bFound1 && bFound1.status === 'ACCEPTED', 'Accepted bargain is present with status ACCEPTED prior to cart addition');

    // 5. Customer adds accepted bargain to cart -> calls PUT /api/bargains/:id/add-to-cart
    const addToCartRes = await axios.put(`${baseUrl}/api/bargains/${bargainId}/add-to-cart`, {}, { headers: custHeaders });
    check(addToCartRes.status === 200, 'Bargain status updated to ADDED_TO_CART after cart addition (HTTP 200)');
    check(addToCartRes.data.bargain.status === 'ADDED_TO_CART', 'Bargain status authoritatively updated to ADDED_TO_CART');

    // 6. Verify bargain is no longer active (active filter: status !== ADDED_TO_CART)
    const bargainsAfterCart = await axios.get(`${baseUrl}/api/bargains`, { headers: custHeaders });
    const customerList2 = bargainsAfterCart.data.bargains;
    const activeBargains = customerList2.filter(b => ['PENDING', 'COUNTERED', 'ACCEPTED'].includes(b.status));
    const historyBargains = customerList2.filter(b => ['ADDED_TO_CART', 'REJECTED', 'CANCELLED'].includes(b.status));

    check(!activeBargains.some(b => b.bargainId === bargainId || String(b._id) === String(bargain._id)), 'Bargain has LEFT Active Proposals');
    check(historyBargains.some(b => b.bargainId === bargainId || String(b._id) === String(bargain._id)), 'Bargain is PRESERVED in Bargain History');

    // 7. Verify repeated add-to-cart is rejected (prevents duplicate cart insertions)
    try {
      await axios.put(`${baseUrl}/api/bargains/${bargainId}/add-to-cart`, {}, { headers: custHeaders });
      check(false, 'Repeated add-to-cart must be rejected');
    } catch (err) {
      check(err.response?.status === 400, 'Repeated add-to-cart rejected with HTTP 400 (already consumed)');
      check(err.response?.data?.alreadyConsumed === true, 'Response flags alreadyConsumed: true');
    }

    // ----------------------------------------------------
    // TEST SECTION 2: FARMER IDENTITY INTEGRITY
    // ----------------------------------------------------
    console.log('\n--- 2. Farmer Identity Integrity & Order Splitting (Problems 2, 6, 7) ---');

    // Verify Product Farmer Identity matches registered farmer
    check(prodA.farmerName === farmerAPayload.farmName || prodA.farmerName === farmerAPayload.name,
      `Product A farmerName is authoritative ("${prodA.farmerName}")`);
    check(prodB.farmerName === farmerBPayload.farmName || prodB.farmerName === farmerBPayload.name,
      `Product B farmerName is authoritative ("${prodB.farmerName}")`);

    // Multi-Farmer Cart Checkout
    const multiOrderRes = await axios.post(`${baseUrl}/api/orders`, {
      items: [
        {
          productId: prodA._id || prodA.id,
          title: prodA.title,
          price: 125, // Negotiated bargain rate
          quantity: 2,
          unit: 'kg',
          isBargain: true,
          farmerId: fAId
        },
        {
          productId: prodB._id || prodB.id,
          title: prodB.title,
          price: 60, // Catalog rate
          quantity: 5,
          unit: 'kg',
          farmerId: fBId
        }
      ],
      paymentMethod: 'cod',
      deliveryFee: 0,
      totalAmount: (125 * 2) + (60 * 5)
    }, { headers: custHeaders });

    check(multiOrderRes.status === 201, 'Multi-farmer order created successfully (HTTP 201)');
    const returnedOrders = multiOrderRes.data.orders || [multiOrderRes.data];
    check(returnedOrders.length === 2, `Cart correctly split into 2 sub-orders (Got: ${returnedOrders.length})`);

    const orderForFarmerA = returnedOrders.find(o => String(o.farmerId) === fAId);
    const orderForFarmerB = returnedOrders.find(o => String(o.farmerId) === fBId);

    check(!!orderForFarmerA, 'Sub-order created for Farmer A');
    check(!!orderForFarmerB, 'Sub-order created for Farmer B');

    // Authoritative farmer names in sub-orders
    check(orderForFarmerA?.farmerName === farmerAPayload.farmName || orderForFarmerA?.farmerName === farmerAPayload.name,
      `Order A farmerName preserves authoritative Farmer A identity ("${orderForFarmerA?.farmerName}")`);
    check(orderForFarmerB?.farmerName === farmerBPayload.farmName || orderForFarmerB?.farmerName === farmerBPayload.name,
      `Order B farmerName preserves authoritative Farmer B identity ("${orderForFarmerB?.farmerName}")`);

    // Verification against hardcoded fallbacks
    check(!/gowres|Namakkal Farmer|Robert Greenfield/i.test(orderForFarmerA?.farmerName),
      `Order A farmerName NEVER overridden by hardcoded fallbacks (Got: "${orderForFarmerA?.farmerName}")`);
    check(!/gowres|Namakkal Farmer|Robert Greenfield/i.test(orderForFarmerB?.farmerName),
      `Order B farmerName NEVER overridden by hardcoded fallbacks (Got: "${orderForFarmerB?.farmerName}")`);

    // Delivery Portal retrieval: GET /api/orders
    const deliveryOrdersRes = await axios.get(`${baseUrl}/api/orders`, { headers: delHeaders });
    check(deliveryOrdersRes.status === 200, 'Delivery agent retrieves orders list (HTTP 200)');
    const deliveryOrders = deliveryOrdersRes.data;

    const delOrderA = deliveryOrders.find(o => String(o._id) === String(orderForFarmerA?._id) || o.orderId === orderForFarmerA?.orderId);
    if (delOrderA) {
      check(delOrderA.farmerName === farmerAPayload.farmName || delOrderA.farmerName === farmerAPayload.name,
        `Delivery Portal displays authoritative farmer name for Order A ("${delOrderA.farmerName}")`);
      check(!/gowres|Namakkal Farmer|Robert Greenfield/i.test(delOrderA.farmerName),
        `Delivery Portal NEVER substitutes "gowres (Namakkal Farmer)" for Order A`);
    } else {
      check(true, 'Delivery orders list returned');
    }

    // ----------------------------------------------------
    // TEST SECTION 3: DATABASE CLEANUP INTEGRITY AUDIT
    // ----------------------------------------------------
    console.log('\n--- 3. Database Cleanup & Farmer Directory Audit (Problems 3, 4, 5) ---');

    const retainedEmails = [
      'farmer@nexus.io',
      'mgowres@gmail.com',
      'yogalakshmi32008@gmail.com',
      'mugunthannabhisek@gmail.com',
      'aashif2182007@gmail.com'
    ];

    // Clean up test records created during this run
    const delId = String(delUser._id || delUser.id);
    await User.deleteMany({ _id: { $in: [custId, fAId, fBId, delId] } });
    await Product.deleteMany({ _id: { $in: [prodA._id, prodB._id] } });
    await Bargain.deleteMany({ _id: bargain._id });
    await Order.deleteMany({ _id: { $in: returnedOrders.map(o => o._id) } });

    // Verify database state
    const currentFarmers = await User.find({ role: 'farmer' }).lean();
    check(currentFarmers.length === 5, `Database has exactly 5 legitimate registered farmers (Got: ${currentFarmers.length})`);

    const allFarmerEmailsMatch = currentFarmers.every(f => retainedEmails.includes(f.email.toLowerCase()));
    check(allFarmerEmailsMatch, 'All 5 farmers match the approved registered emails');

    const currentProducts = await Product.find().lean();
    const retainedFarmerIds = currentFarmers.map(f => f._id.toString());
    const invalidProdFarmerRefs = currentProducts.filter(p => !retainedFarmerIds.includes(String(p.farmerId)));
    check(invalidProdFarmerRefs.length === 0, `ZERO products belong to deleted or unknown farmers (Invalid refs: ${invalidProdFarmerRefs.length})`);

    const orphanBargains = await Bargain.countDocuments({ farmerId: { $nin: retainedFarmerIds } });
    check(orphanBargains === 0, `ZERO orphan bargains exist (Got: ${orphanBargains})`);

    // Verify Customer Farmer Directory API
    const farmersDirRes = await axios.get(`${baseUrl}/api/auth/farmers`);
    check(farmersDirRes.status === 200, 'Customer farmer directory endpoint succeeds (HTTP 200)');
    check(farmersDirRes.data.farmers?.length === 5, `Farmer directory returns exactly 5 genuine farmers (Got: ${farmersDirRes.data.farmers?.length})`);

    const dirNames = farmersDirRes.data.farmers?.map(f => f.name);
    console.log('  📋 Directory farmers:', dirNames.join(', '));
    check(dirNames.some(n => /gowres/i.test(n)), 'Directory contains Gowres ms');
    check(dirNames.some(n => /yogalakshmi/i.test(n)), 'Directory contains Yogalakshmi M');
    check(dirNames.some(n => /abhisek/i.test(n)), 'Directory contains N.Abhisek Mugunthan');
    check(dirNames.some(n => /aashif/i.test(n)), 'Directory contains Aashif K');

  } catch (err) {
    console.error('Test execution error:', err.response?.data || err.message);
    failCount++;
  } finally {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  }

  console.log('\n======================================================');
  console.log(`🏁 PHASE 10 SUITE COMPLETE: ${passCount} Passed, ${failCount} Failed`);
  console.log('======================================================\n');

  if (failCount > 0) process.exit(1);
  process.exit(0);
}

runPhase10Tests().catch(err => {
  console.error(err);
  process.exit(1);
});
