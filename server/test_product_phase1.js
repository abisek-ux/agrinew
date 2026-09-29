const http = require('http');
const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

async function runTests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  console.log(`\n================================================================`);
  console.log(`🌾 TESTING PHASE 1: ENRICHED PRODUCT MODEL & CONTROLLER`);
  console.log(`================================================================\n`);

  async function api(path, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }
    return { status: res.status, data };
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, label) {
    if (condition) {
      console.log(`✅ [PASS] ${label}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${label}`);
      failed++;
    }
  }

  try {
    // 1. Register a test Farmer
    const farmerEmail = `farmer_phase1_${Date.now()}@test.agrilink.in`;
    const regFarmer = await api('/api/auth/register', 'POST', {
      email: farmerEmail,
      phone: '+91' + String(Math.floor(6000000000 + Math.random() * 3999999999)),
      password: 'FarmerSecurePassword123!',
      firstName: 'Ramesh',
      lastName: 'Patel',
      role: 'farmer',
      nativePlace: 'Mandya, Karnataka'
    });
    assert(regFarmer.status === 201 && regFarmer.data.token, 'Farmer registered successfully and issued JWT token');
    const farmerToken = regFarmer.data.token;

    // 2. Test 1 & 4: Old/Basic product creation WITHOUT new optional fields
    const basicProd = await api('/api/products', 'POST', {
      title: 'Traditional Country Tomatoes',
      category: 'vegetable',
      price: 40,
      stock: 50,
      unit: 'kg'
    }, farmerToken);
    assert(basicProd.status === 201 && basicProd.data._id, 'Product creation WITHOUT optional fields succeeds (Backwards Compatible)');
    assert(basicProd.data.minOrderQty === 1, 'Default minOrderQty is 1 when omitted');
    assert(basicProd.data.allowBargain === true, 'Default allowBargain is true when omitted');
    assert(basicProd.data.variety === '', 'Default variety is empty string when omitted');
    const basicProdId = basicProd.data._id || basicProd.data.id;

    // 3. Test 3: Product creation WITH ALL NEW optional fields
    const enrichedProd = await api('/api/products', 'POST', {
      title: 'Premium Sona Masoori Rice',
      category: 'grain',
      price: 75,
      stock: 200,
      unit: 'kg',
      variety: 'Sona Masoori BPT 5204',
      qualityGrade: 'Grade A Export',
      cultivationType: 'Natural Zero-Budget',
      irrigationMethod: 'Canal / Cauvery Basin',
      minOrderQty: 10,
      allowBargain: true
    }, farmerToken);
    assert(enrichedProd.status === 201 && enrichedProd.data._id, 'Product creation WITH ALL new agricultural fields succeeds');
    assert(enrichedProd.data.variety === 'Sona Masoori BPT 5204', 'variety field saved and returned');
    assert(enrichedProd.data.qualityGrade === 'Grade A Export', 'qualityGrade field saved and returned');
    assert(enrichedProd.data.cultivationType === 'Natural Zero-Budget', 'cultivationType field saved and returned');
    assert(enrichedProd.data.irrigationMethod === 'Canal / Cauvery Basin', 'irrigationMethod field saved and returned');
    assert(enrichedProd.data.minOrderQty === 10, 'Custom minOrderQty (10) saved and returned');
    assert(enrichedProd.data.allowBargain === true, 'allowBargain saved as true');
    const enrichedProdId = enrichedProd.data._id || enrichedProd.data.id;

    // 4. Test 7 & 8: minOrderQty validation (zero, negative, non-number)
    const zeroMinOrder = await api('/api/products', 'POST', {
      title: 'Invalid Min Order Product',
      category: 'fruit',
      price: 50,
      stock: 100,
      minOrderQty: 0
    }, farmerToken);
    assert(zeroMinOrder.status === 400, 'minOrderQty = 0 correctly rejected with 400 Bad Request');

    const negMinOrder = await api('/api/products', 'POST', {
      title: 'Negative Min Order Product',
      category: 'fruit',
      price: 50,
      stock: 100,
      minOrderQty: -5
    }, farmerToken);
    assert(negMinOrder.status === 400, 'minOrderQty = -5 correctly rejected with 400 Bad Request');

    // 5. Test string validation (reject unexpected object/array structures)
    const invalidVarietyType = await api('/api/products', 'POST', {
      title: 'Invalid Object Variety Product',
      category: 'fruit',
      price: 50,
      stock: 100,
      variety: { nested: 'invalid' }
    }, farmerToken);
    assert(invalidVarietyType.status === 400, 'Non-string variety object correctly rejected with 400 Bad Request');

    // 6. Test 5: Product update can ADD the new fields to an existing basic product
    const updateAdd = await api(`/api/products/${basicProdId}`, 'PUT', {
      variety: 'Desi Heirloom',
      qualityGrade: 'Standard Market Grade',
      cultivationType: 'Organic',
      irrigationMethod: 'Drip',
      minOrderQty: 2,
      allowBargain: false
    }, farmerToken);
    assert(updateAdd.status === 200, 'Updating an existing basic product with new agricultural fields succeeds');
    assert(updateAdd.data.variety === 'Desi Heirloom', 'variety successfully updated on existing product');
    assert(updateAdd.data.allowBargain === false, 'allowBargain successfully set to false');
    assert(updateAdd.data.minOrderQty === 2, 'minOrderQty successfully updated to 2');

    // 7. Test 6: Product update can MODIFY existing new fields
    const updateMod = await api(`/api/products/${enrichedProdId}`, 'PUT', {
      minOrderQty: 25,
      qualityGrade: 'Super Premium'
    }, farmerToken);
    assert(updateMod.status === 200, 'Modifying agricultural fields on enriched product succeeds');
    assert(updateMod.data.minOrderQty === 25, 'minOrderQty modified to 25');
    assert(updateMod.data.qualityGrade === 'Super Premium', 'qualityGrade modified to Super Premium');
    assert(updateMod.data.variety === 'Sona Masoori BPT 5204', 'variety preserved unchanged during partial update');

    // 8. Test update minOrderQty validation (zero/negative)
    const updateInvalidMin = await api(`/api/products/${enrichedProdId}`, 'PUT', {
      minOrderQty: 0
    }, farmerToken);
    assert(updateInvalidMin.status === 400, 'Update with minOrderQty = 0 correctly rejected with 400');

    // 9. Test 9 & 10: Marketplace retrieval returns both basic and enriched products
    const marketplace = await api('/api/products', 'GET');
    assert(marketplace.status === 200 && Array.isArray(marketplace.data), 'Marketplace products successfully retrieved');
    const foundBasic = marketplace.data.find(p => String(p._id || p.id) === String(basicProdId));
    const foundEnriched = marketplace.data.find(p => String(p._id || p.id) === String(enrichedProdId));
    assert(foundBasic && foundBasic.title === 'Traditional Country Tomatoes', 'Existing product retrieved accurately');
    assert(foundEnriched && foundEnriched.variety === 'Sona Masoori BPT 5204', 'Enriched product retrieved with all agricultural fields');

    // 10. Test Single Product Fetch by ID
    const singleProd = await api(`/api/products/${enrichedProdId}`, 'GET');
    assert(singleProd.status === 200 && singleProd.data.variety === 'Sona Masoori BPT 5204', 'Single product fetch returns complete agricultural data');

    console.log(`\n================================================================`);
    console.log(`📊 PHASE 1 AUDIT COMPLETE: ${passed}/${passed + failed} TESTS PASSED`);
    console.log(`================================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();
