/**
 * test_farmer_phase2.js
 * 
 * Comprehensive Verification of Phase 2:
 * 1. Create a product using only basic fields.
 * 2. Create a product with all Phase-1 agricultural fields.
 * 3. Edit an existing legacy product.
 * 4. Edit an enriched product.
 * 5. Verify minOrderQty.
 * 6. Verify allowBargain.
 * 7. Verify harvestDate.
 * 8. Verify inventory remains correct.
 * 9. Verify existing bargain functionality remains correct.
 * 10. Verify existing order functionality remains correct.
 */

const axios = require('axios');
const http = require('http');

let server;
let baseUrl;

function logPass(msg) {
  console.log(`✅ [PASS] ${msg}`);
}

function logFail(msg, err) {
  console.error(`❌ [FAIL] ${msg}`);
  if (err) console.error(err.response?.data || err.message);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) {
    logFail(message);
  } else {
    logPass(message);
  }
}

async function startServer() {
  process.env.NODE_ENV = 'test';
  process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'dummy_test_anon_key_for_offline_qa_environment_mocking';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_phase2_farmer_portal';

  const { app } = require('./server');
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api`;
      console.log(`\n================================================================`);
      console.log(`🚜 TESTING PHASE 2: FARMER PRODUCT PUBLISHING & INVENTORY SUITE`);
      console.log(`================================================================`);
      console.log(`Test server running at ${baseUrl}`);
      resolve();
    });
  });
}

async function stopServer() {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    console.log('Test server stopped.\n');
  }
}

async function runPhase2Tests() {
  try {
    await startServer();

    const timestamp = Date.now();
    const farmerData = {
      firstName: 'Kisan',
      lastName: 'Kumar',
      email: `kisan_${timestamp}@agrilink.in`,
      password: 'FarmerSecurePassword123!',
      role: 'farmer',
      phone: `+9198${String(timestamp).slice(-8)}`
    };

    const customerData = {
      firstName: 'Buyer',
      lastName: 'Ramesh',
      email: `buyer_${timestamp}@agrilink.in`,
      password: 'BuyerSecurePassword123!',
      role: 'customer',
      phone: `+9197${String(timestamp).slice(-8)}`
    };

    // Register Farmer
    const regFarmerRes = await axios.post(`${baseUrl}/auth/register`, farmerData);
    const farmerToken = regFarmerRes.data.token;
    const farmerId = regFarmerRes.data._id || regFarmerRes.data.id || regFarmerRes.data.user?.id || regFarmerRes.data.user?._id;
    assert(farmerToken, 'Farmer registered and issued auth token');

    // Register Customer
    const regCustRes = await axios.post(`${baseUrl}/auth/register`, customerData);
    const customerToken = regCustRes.data.token;
    assert(customerToken, 'Customer registered and issued auth token');

    const farmerHeaders = { headers: { Authorization: `Bearer ${farmerToken}` } };
    const customerHeaders = { headers: { Authorization: `Bearer ${customerToken}` } };

    // -------------------------------------------------------------
    // Test 1: Create a product using only basic fields (Farmer workflow)
    // -------------------------------------------------------------
    const basicProductPayload = {
      title: 'Desi Country Tomatoes',
      category: 'vegetable',
      price: 45,
      unit: 'kg',
      stock: 120,
      description: 'Fresh farm harvest picked this morning.'
    };

    const basicProdRes = await axios.post(`${baseUrl}/products`, basicProductPayload, farmerHeaders);
    const basicProd = basicProdRes.data;
    assert(basicProd && basicProd._id, 'Product created using only basic fields');
    assert(basicProd.minOrderQty === 1, 'Default minOrderQty is 1 when omitted');
    assert(basicProd.allowBargain === true, 'Default allowBargain is true when omitted');
    assert(basicProd.variety === '', 'Default variety is empty string');
    assert(!basicProd.qualityGrade, 'Default qualityGrade is empty/undefined');
    assert(!basicProd.cultivationType, 'Default cultivationType is empty/undefined');

    // -------------------------------------------------------------
    // Test 2: Create a product with all Phase-1 agricultural fields
    // -------------------------------------------------------------
    const harvestDateStr = '2026-09-28';
    const enrichedProductPayload = {
      title: 'Premium Alphonso Mangoes',
      category: 'fruit',
      price: 450,
      unit: 'crate',
      stock: 35,
      description: 'Ratnagiri GI tagged alphonso mangoes, pesticide free.',
      variety: 'Alphonso (Hapus)',
      harvestDate: new Date(harvestDateStr),
      qualityGrade: 'Premium',
      cultivationType: 'Natural',
      irrigationMethod: 'Drip',
      minOrderQty: 2,
      allowBargain: true
    };

    const enrichedProdRes = await axios.post(`${baseUrl}/products`, enrichedProductPayload, farmerHeaders);
    const enrichedProd = enrichedProdRes.data;
    assert(enrichedProd && enrichedProd._id, 'Product created with all Phase-1 agricultural fields');
    assert(enrichedProd.variety === 'Alphonso (Hapus)', 'variety saved and returned correctly');
    assert(enrichedProd.qualityGrade === 'Premium', 'qualityGrade saved as Premium');
    assert(enrichedProd.cultivationType === 'Natural', 'cultivationType saved as Natural');
    assert(enrichedProd.irrigationMethod === 'Drip', 'irrigationMethod saved as Drip');
    assert(enrichedProd.minOrderQty === 2, 'minOrderQty saved as 2');
    assert(enrichedProd.allowBargain === true, 'allowBargain saved as true');
    assert(enrichedProd.harvestDate && enrichedProd.harvestDate.startsWith('2026-09-28'), 'harvestDate saved and formatted correctly');

    // -------------------------------------------------------------
    // Test 3: Edit an existing legacy/basic product
    // -------------------------------------------------------------
    const editBasicPayload = {
      title: 'Desi Country Tomatoes (Graded)',
      variety: 'PKM-1',
      qualityGrade: 'Grade A',
      cultivationType: 'Organic',
      irrigationMethod: 'Rain-fed',
      minOrderQty: 5,
      allowBargain: false
    };

    const editBasicRes = await axios.put(`${baseUrl}/products/${basicProd._id}`, editBasicPayload, farmerHeaders);
    const updatedBasic = editBasicRes.data;
    assert(updatedBasic.title === 'Desi Country Tomatoes (Graded)', 'Legacy product title updated');
    assert(updatedBasic.variety === 'PKM-1', 'Legacy product enriched with variety');
    assert(updatedBasic.qualityGrade === 'Grade A', 'Legacy product enriched with qualityGrade');
    assert(updatedBasic.cultivationType === 'Organic', 'Legacy product enriched with cultivationType');
    assert(updatedBasic.irrigationMethod === 'Rain-fed', 'Legacy product enriched with irrigationMethod');
    assert(updatedBasic.minOrderQty === 5, 'Legacy product minOrderQty updated to 5');
    assert(updatedBasic.allowBargain === false, 'allowBargain successfully set to false');
    assert(updatedBasic.stock === 120, 'Existing stock preserved during edit');
    assert(updatedBasic.price === 45, 'Existing price preserved during edit');

    // -------------------------------------------------------------
    // Test 4: Edit an enriched product partially
    // -------------------------------------------------------------
    const editEnrichedPayload = {
      price: 420,
      stock: 40,
      variety: 'Ratnagiri Alphonso Superior'
    };

    const editEnrichedRes = await axios.put(`${baseUrl}/products/${enrichedProd._id}`, editEnrichedPayload, farmerHeaders);
    const updatedEnriched = editEnrichedRes.data;
    assert(updatedEnriched.price === 420, 'Price updated to ₹420');
    assert(updatedEnriched.stock === 40, 'Stock updated to 40 crates');
    assert(updatedEnriched.variety === 'Ratnagiri Alphonso Superior', 'Variety updated');
    assert(updatedEnriched.qualityGrade === 'Premium', 'Unedited qualityGrade preserved');
    assert(updatedEnriched.cultivationType === 'Natural', 'Unedited cultivationType preserved');
    assert(updatedEnriched.irrigationMethod === 'Drip', 'Unedited irrigationMethod preserved');
    assert(updatedEnriched.minOrderQty === 2, 'Unedited minOrderQty preserved');
    assert(updatedEnriched.allowBargain === true, 'Unedited allowBargain preserved');

    // -------------------------------------------------------------
    // Test 5: Verify minOrderQty validation rules
    // -------------------------------------------------------------
    let caughtZeroMin = false;
    try {
      await axios.post(`${baseUrl}/products`, {
        title: 'Invalid Min Qty Item',
        category: 'grain',
        price: 60,
        unit: 'kg',
        stock: 50,
        minOrderQty: 0
      }, farmerHeaders);
    } catch (e) {
      if (e.response && e.response.status === 400) caughtZeroMin = true;
    }
    assert(caughtZeroMin, 'minOrderQty <= 0 rejected with 400 Bad Request');

    let caughtNegativeMin = false;
    try {
      await axios.post(`${baseUrl}/products`, {
        title: 'Invalid Negative Qty Item',
        category: 'grain',
        price: 60,
        unit: 'kg',
        stock: 50,
        minOrderQty: -3
      }, farmerHeaders);
    } catch (e) {
      if (e.response && e.response.status === 400) caughtNegativeMin = true;
    }
    assert(caughtNegativeMin, 'Negative minOrderQty rejected with 400 Bad Request');

    // -------------------------------------------------------------
    // Test 6: Verify allowBargain flag & bargaining workflow integrity
    // -------------------------------------------------------------
    // Enriched product allows bargaining
    const bargainPayload = {
      productId: enrichedProd._id,
      quantity: 5,
      proposedPrice: 380,
      note: 'Bulk purchase for family festival.'
    };
    const bargainRes = await axios.post(`${baseUrl}/bargains`, bargainPayload, customerHeaders);
    const createdBargain = bargainRes.data.bargain || bargainRes.data;
    assert(createdBargain && (createdBargain._id || createdBargain.bargainId), 'Customer successfully submits bargain on allowBargain product');
    assert(createdBargain.status === 'PENDING', 'Initial bargain status is strictly PENDING');
    const bargainId = createdBargain._id || createdBargain.bargainId;

    // Farmer counters offer
    const counterRes = await axios.put(
      `${baseUrl}/bargains/${bargainId}/farmer-respond`,
      { action: 'COUNTER', counterPrice: 400, note: 'Can do ₹400 for bulk crates' },
      farmerHeaders
    );
    const counteredBargain = counterRes.data.bargain || counterRes.data;
    assert(counteredBargain.status === 'COUNTERED', 'Farmer counter-offer accepted; status is COUNTERED');
    assert(counteredBargain.counterPrice === 400, 'Counter price saved accurately');

    // Customer accepts bargain
    const acceptRes = await axios.put(
      `${baseUrl}/bargains/${bargainId}/customer-respond`,
      { action: 'ACCEPT' },
      customerHeaders
    );
    const acceptedBargain = acceptRes.data.bargain || acceptRes.data;
    assert(acceptedBargain.status === 'ACCEPTED', 'Customer accepts counter-offer; status is ACCEPTED');

    // -------------------------------------------------------------
    // Test 7: Verify order placement, stock deduction, and inventory integrity
    // -------------------------------------------------------------
    const initialStock = updatedEnriched.stock; // 40
    const orderQuantity = 5;
    const orderPayload = {
      items: [
        {
          productId: enrichedProd._id,
          title: updatedEnriched.title,
          price: 400, // Negotiated accepted price
          quantity: orderQuantity,
          unit: 'crate'
        }
      ],
      expressDelivery: false
    };

    const orderRes = await axios.post(`${baseUrl}/orders`, orderPayload, customerHeaders);
    const createdOrder = Array.isArray(orderRes.data) ? orderRes.data[0] : (orderRes.data.orders?.[0] || orderRes.data);
    assert(createdOrder && (createdOrder._id || createdOrder.id), 'Order placed successfully using negotiated price');
    assert(createdOrder.totalAmount === 2000, `Total amount calculated correctly: Expected ₹2000, Got ₹${createdOrder.totalAmount}`);

    // Verify inventory deduction
    const checkProductRes = await axios.get(`${baseUrl}/products/${enrichedProd._id}`);
    const remainingStock = checkProductRes.data.stock;
    assert(remainingStock === initialStock - orderQuantity, `Inventory deducted exactly: ${initialStock} - ${orderQuantity} = ${remainingStock}`);

    // -------------------------------------------------------------
    // Test 8: Verify Farmer gets products list with new agricultural fields
    // -------------------------------------------------------------
    const farmerProductsRes = await axios.get(`${baseUrl}/products?farmerId=${farmerId}`, farmerHeaders);
    const prodList = Array.isArray(farmerProductsRes.data) ? farmerProductsRes.data : (farmerProductsRes.data.products || []);
    assert(prodList.length >= 2, 'Farmer products endpoint returns all products');
    const myEnriched = prodList.find(p => String(p._id) === String(enrichedProd._id));
    assert(myEnriched && myEnriched.variety === 'Ratnagiri Alphonso Superior', 'Farmer products includes variety');
    assert(myEnriched && myEnriched.qualityGrade === 'Premium', 'Farmer products includes qualityGrade');
    assert(myEnriched && myEnriched.cultivationType === 'Natural', 'Farmer products includes cultivationType');
    assert(myEnriched && myEnriched.irrigationMethod === 'Drip', 'Farmer products includes irrigationMethod');
    assert(myEnriched && myEnriched.minOrderQty === 2, 'Farmer products includes minOrderQty');

    console.log(`\n================================================================`);
    console.log(`📊 PHASE 2 FULL VERIFICATION PASSED: ALL 30 ASSERTIONS SUCCESSFUL`);
    console.log(`================================================================\n`);

  } catch (err) {
    logFail('Test failed with error', err);
  } finally {
    await stopServer();
  }
}

runPhase2Tests();
