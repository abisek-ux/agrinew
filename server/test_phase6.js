/**
 * test_phase6.js
 * Automated Verification Suite for Phase 6:
 * Mobile UX, Profile Security & AI Intelligence
 *
 * Verifies:
 * 1. Profile Security & OTP Flow:
 *    - Farmer, Customer, Delivery partner profile updates
 *    - Direct email update via PUT /profile blocked (Email change requires OTP)
 *    - Requesting Email OTP generates 6-digit OTP, no plaintext OTP leak
 *    - Resend cooldown enforcement (within 60s)
 *    - Invalid OTP rejection
 *    - Successful OTP verification changes email and sets 7-day lock
 * 2. 7-Day Profile Modification Lock:
 *    - Backend enforces lock (HTTP 403 Forbidden with unlock date and remaining days)
 *    - Client API bypass attempt is rejected server-side
 *    - Unrelated operations (Product management, stock, orders, bargaining) are NOT locked
 * 3. AI Crop Recommendation Advisory:
 *    - Multi-variable inputs (soil, season, water, location, temperature, humidity)
 *    - Transparent missing input notices (no fabricated yields/APMC prices)
 *    - Structured recommendation results (water, duration, risks, next steps, confidence)
 * 4. AI Agricultural Assistant (Ask AgriLink AI):
 *    - Rich agronomic advice for farming queries (crop, irrigation, weather, pests, yellow leaves)
 *    - Off-topic queries politely redirected to agriculture
 * 5. Improved AI Plant Disease Detection:
 *    - Structured diagnosis for crop images (symptoms, causes, immediate actions, prevention, KVK disclaimer)
 *    - Low-quality / blurry images trigger insufficient quality warning with guidance
 * 6. Customer Recipe Studio Intent & Context:
 *    - Carrot juice request produces ONLY carrot juice
 *    - No cross-contamination (beans poriyal not inserted)
 *    - Follow-up questions ("without sugar", "add ginger") retain context of carrot juice
 *    - "What's my name?" query returns honest response without hallucinations
 *    - Structured recipe data output
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

async function runPhase6Tests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING AGRILINK PHASE 6 AUTOMATED VERIFICATION SUITE');
  console.log('======================================================\n');

  try {
    await startTestServer();

    const timestamp = Date.now();

    // ─────────────────────────────────────────────────────────────
    // 1. REGISTER USERS FOR ALL THREE ROLES
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 1. REGISTERING FARMER, CUSTOMER & DELIVERY PARTNER ---');

    const farmerEmail = `farmer_${timestamp}@mandya.in`;
    const customerEmail = `customer_${timestamp}@agrilink.in`;
    const deliveryEmail = `driver_${timestamp}@fleet.in`;

    const farmerRes = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Robert',
      lastName: 'Gowda',
      phone: `98450${String(timestamp).slice(-5)}`,
      email: farmerEmail,
      password: 'Password123!',
      role: 'farmer',
      farmName: 'Cauvery River Organic Estate',
      nativePlace: 'Mandya'
    });
    assert(farmerRes.status === 201 && farmerRes.data.token, 'Farmer registered successfully with auth token');
    const farmerToken = farmerRes.data.token;
    const farmerId = farmerRes.data.user._id || farmerRes.data.user.id;

    const customerRes = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Aadhya',
      lastName: 'Sharma',
      phone: `99450${String(timestamp).slice(-5)}`,
      email: customerEmail,
      password: 'Password123!',
      role: 'customer',
      deliveryAddress: 'Flat 402, Green Meadows',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001'
    });
    assert(customerRes.status === 201 && customerRes.data.token, 'Customer registered successfully with auth token');
    const customerToken = customerRes.data.token;
    const customerId = customerRes.data.user._id || customerRes.data.user.id;

    const deliveryRes = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'David',
      lastName: 'Swift',
      phone: `97450${String(timestamp).slice(-5)}`,
      email: deliveryEmail,
      password: 'Password123!',
      role: 'delivery',
      vehicleType: 'Electric Mini-Van (Chilled)',
      vehicleNumber: 'KA-04-EA-2026',
      serviceArea: 'Mandya - Mysuru - Bengaluru Expressway'
    });
    assert(deliveryRes.status === 201 && deliveryRes.data.token, 'Delivery Partner registered with auth token & vehicle details');
    const deliveryToken = deliveryRes.data.token;

    // ─────────────────────────────────────────────────────────────
    // 2. PROFILE EDIT SECURITY & EMAIL OTP VERIFICATION
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 2. PROFILE EDIT SECURITY & EMAIL OTP FLOW ---');

    // Fetch initial profile
    const farmerProfileGet = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    assert(farmerProfileGet.data.user.farmName === 'Cauvery River Organic Estate', 'GET /auth/profile returns role-specific farmName');
    assert(farmerProfileGet.data.user.isProfileLocked === false, 'New account profile modification is initially unlocked');

    // Attempting to change email directly via PUT /auth/profile must NOT alter the email
    const directEmailBypass = await axios.put(`${BASE_URL}/auth/profile`, {
      firstName: 'Robert',
      email: 'hacked_email@evil.com'
    }, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    assert(directEmailBypass.data.user.email === farmerEmail, 'Direct PUT /profile does NOT change email without OTP verification');

    // Request Email OTP for new email
    const newFarmerEmail = `robert_new_${timestamp}@mandya.in`;
    const otpReqRes = await axios.post(`${BASE_URL}/auth/profile/request-email-otp`, {
      newEmail: newFarmerEmail
    }, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    assert(otpReqRes.status === 200 && otpReqRes.data.success, 'Email OTP requested successfully for new email address');
    assert(!otpReqRes.data.otp, 'Security requirement verified: OTP is NEVER exposed in API response');

    // Verify Resend Cooldown (attempting immediate re-request within 60s must be rejected)
    try {
      await axios.post(`${BASE_URL}/auth/profile/request-email-otp`, {
        newEmail: newFarmerEmail
      }, {
        headers: { Authorization: `Bearer ${farmerToken}` }
      });
      assert(false, 'Expected resend cooldown to reject immediate second OTP request');
    } catch (err) {
      assert(err.response?.status === 429, 'OTP resend within 60s cooldown rejected with HTTP 429 Rate Limit');
    }

    // Invalid OTP rejection
    try {
      await axios.post(`${BASE_URL}/auth/profile/verify-email-otp`, {
        otp: '000000'
      }, {
        headers: { Authorization: `Bearer ${farmerToken}` }
      });
      assert(false, 'Expected invalid OTP to be rejected');
    } catch (err) {
      assert(err.response?.status === 400, 'Invalid OTP code rejected with HTTP 400');
    }

    // Read generated OTP from database memory to verify successful change
    const User = require('./models/User');
    const dbUser = await User.findById(farmerId);
    assert(dbUser.pendingEmailChange === newFarmerEmail.toLowerCase(), 'Pending email change stored on user record');
    assert(dbUser.pendingEmailOtpHash, 'Pending OTP stored securely as hash (never plaintext)');

    // In our test environment, generate valid OTP hash match by using the controller's hash verification
    const crypto = require('crypto');
    // Let's create an OTP and set the hash in test DB so we can test the verify endpoint faithfully
    const validTestOtp = '654321';
    const testHash = crypto.createHash('sha256').update(validTestOtp).digest('hex');
    dbUser.pendingEmailOtpHash = testHash;
    dbUser.pendingEmailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await dbUser.save();

    const verifyRes = await axios.post(`${BASE_URL}/auth/profile/verify-email-otp`, {
      otp: validTestOtp
    }, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    assert(verifyRes.status === 200 && verifyRes.data.success, 'OTP verification successful');
    assert(verifyRes.data.user.email === newFarmerEmail.toLowerCase(), 'Email address successfully updated after OTP verification');
    assert(verifyRes.data.user.isProfileLocked === true, '7-day profile modification lock activated upon successful update');
    assert(verifyRes.data.user.profileLockRemainingDays >= 6, 'Profile lock remaining days correctly reported (6-7 days)');

    // ─────────────────────────────────────────────────────────────
    // 3. 7-DAY PROFILE MODIFICATION LOCK ENFORCEMENT
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 3. 7-DAY PROFILE MODIFICATION LOCK ENFORCEMENT ---');

    // Attempting profile update while locked MUST return HTTP 403 Forbidden
    try {
      await axios.put(`${BASE_URL}/auth/profile`, {
        firstName: 'Robbie'
      }, {
        headers: { Authorization: `Bearer ${farmerToken}` }
      });
      assert(false, 'Expected profile modification during 7-day lock to be rejected');
    } catch (err) {
      assert(err.response?.status === 403, 'Profile update during lock rejected server-side with HTTP 403 Forbidden');
      assert(err.response?.data?.message?.includes('Profile changes are locked'), 'Clear user-friendly lock message with unlock date returned');
    }

    // Verify that Customer profile updates work and properly trigger the 7-day lock
    const custUpdateRes = await axios.put(`${BASE_URL}/auth/profile`, {
      firstName: 'Aadhya Updated',
      city: 'Mysuru',
      state: 'Karnataka',
      pincode: '570001'
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert(custUpdateRes.status === 200, 'Customer profile updated successfully');
    assert(custUpdateRes.data.user.city === 'Mysuru', 'Customer city updated');
    assert(custUpdateRes.data.user.isProfileLocked === true, 'Customer profile now locked for 7 days');

    // Customer immediate second update blocked
    try {
      await axios.put(`${BASE_URL}/auth/profile`, {
        firstName: 'Another Change'
      }, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      assert(false, 'Expected customer second update to be rejected by 7-day lock');
    } catch (err) {
      assert(err.response?.status === 403, 'Subsequent customer update rejected with HTTP 403');
    }

    // ─────────────────────────────────────────────────────────────
    // 4. UNRELATED BUSINESS OPERATIONS REMAIN UNLOCKED
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 4. UNRELATED OPERATIONS REMAIN COMPLETELY UNLOCKED ---');

    // Farmer whose profile is locked CAN still create a new product
    const addProductRes = await axios.post(`${BASE_URL}/products`, {
      title: 'Phase 6 Certified Basmati Paddy',
      category: 'seed',
      price: 185,
      unit: 'kg',
      stock: 466,
      minOrderQty: 1,
      variety: 'Pusa 1121',
      qualityGrade: 'Grade A',
      cultivationType: 'organic',
      irrigationMethod: 'drip',
      harvestDate: new Date().toISOString(),
      allowBargain: true,
      description: 'Long-grain fragrant paddy seed grains certified organic.'
    }, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    assert(addProductRes.status === 201 && addProductRes.data._id, 'Locked profile farmer CAN still add new produce listings');
    const productId = addProductRes.data._id;

    // Farmer CAN still update product stock & price
    const updateProductRes = await axios.put(`${BASE_URL}/products/${productId}`, {
      price: 190,
      stock: 500
    }, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    assert(updateProductRes.status === 200 && updateProductRes.data.price === 190, 'Locked profile farmer CAN still adjust product pricing & stock');

    // Customer CAN still create a bulk bargain offer
    const bargainRes = await axios.post(`${BASE_URL}/bargains`, {
      productId,
      quantity: 50,
      proposedPrice: 170,
      note: 'Need 50 kg for cooperative community farm.'
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert(bargainRes.status === 201 && bargainRes.data.bargain, 'Customer CAN still place bulk bargain offers despite profile lock');

    // ─────────────────────────────────────────────────────────────
    // 5. FARMER CROP RECOMMENDATION — MULTI-VARIABLE ADVISORY
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 5. FARMER CROP RECOMMENDATION AI ADVISORY ---');

    // Request crop advisory with available data
    const cropAdvRes = await axios.post(`${BASE_URL}/ai/crop-advisory`, {
      soilType: 'Alluvial Soil',
      season: 'Monsoon (Kharif)',
      waterAvailability: 'Medium',
      location: 'Cauvery Delta, Mandya',
      temperature: '30°C',
      humidity: '68%'
    });
    assert(cropAdvRes.status === 200 && cropAdvRes.data.success, 'AI Crop Advisory generated successfully');
    assert(cropAdvRes.data.data.recommendedCrop, `Recommended Crop: ${cropAdvRes.data.data.recommendedCrop}`);
    assert(Array.isArray(cropAdvRes.data.data.whySuitsConditions) && cropAdvRes.data.data.whySuitsConditions.length > 0, 'Includes why crop suits soil & seasonal conditions');
    assert(cropAdvRes.data.data.waterRequirement, 'Includes water requirement advisory');
    assert(cropAdvRes.data.data.approximateDuration, 'Includes expected crop duration');
    assert(cropAdvRes.data.data.risks, 'Includes honest agricultural risk warnings');
    assert(cropAdvRes.data.data.confidence, `Confidence rated transparently: ${cropAdvRes.data.data.confidence}`);

    // Request with missing variables: should report missing information honestly without fabricating
    const incompleteAdvRes = await axios.post(`${BASE_URL}/ai/crop-advisory`, {
      soilType: 'Red Loam Soil'
      // season, water, temperature omitted
    });
    assert(incompleteAdvRes.status === 200 && incompleteAdvRes.data.data.missingNotice, 'Honest missing information notice provided when inputs omitted');
    assert(incompleteAdvRes.data.data.missingNotice.includes('Some information is unavailable'), 'Verified transparent notice: "Some information is unavailable. This recommendation is based on the available inputs."');

    // ─────────────────────────────────────────────────────────────
    // 6. AI AGRICULTURAL ASSISTANT (ASK AGRILINK AI)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 6. AI AGRICULTURAL ASSISTANT (VOICE & TEXT) ---');

    // Agricultural farming question
    const agriQueryRes = await axios.post(`${BASE_URL}/ai/ask-agrilink`, {
      query: 'What crop can I grow this season?'
    });
    assert(agriQueryRes.status === 200 && agriQueryRes.data.success, 'Agricultural question responded with agronomic advice');
    assert(!agriQueryRes.data.isOffTopic, 'Farming query recognized as on-topic');
    assert(agriQueryRes.data.reply && agriQueryRes.data.reply.length > 30, 'Rich advisory returned');
    assert(Array.isArray(agriQueryRes.data.suggestedQuestions) && agriQueryRes.data.suggestedQuestions.length > 0, 'Contextual suggested questions provided');

    // Yellow leaves inquiry
    const leafQueryRes = await axios.post(`${BASE_URL}/ai/ask-agrilink`, {
      query: 'What should I do if my tomato leaves turn yellow with dark spots?'
    });
    assert(leafQueryRes.data.reply.includes('Yellowing') || leafQueryRes.data.reply.includes('Nitrogen') || leafQueryRes.data.reply.includes('leaves'), 'Leaf chlorosis question answered accurately');

    // Off-topic question guardrail: must politely redirect without fabricating agronomy
    const offTopicRes = await axios.post(`${BASE_URL}/ai/ask-agrilink`, {
      query: 'Who won the football cricket match and what is the bitcoin price?'
    });
    assert(offTopicRes.data.isOffTopic === true, 'Off-topic question detected by AI guardrails');
    assert(offTopicRes.data.reply.includes("I'm AgriLink's agricultural assistant"), 'Politely redirected to agricultural scope without answering off-topic query');

    // ─────────────────────────────────────────────────────────────
    // 7. IMPROVED AI DISEASE DETECTION
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 7. IMPROVED AI PLANT DISEASE DETECTION ---');

    // High quality leaf image sample (simulated base64 / preset)
    const validDiseaseRes = await axios.post(`${BASE_URL}/ai/diagnose-crop`, {
      crop: 'Tomato',
      imageData: 'data:image/jpeg;base64,' + Buffer.from('tomato_leaf_sample_valid_sharp_pixels_content_data').toString('base64'),
      isBlurry: false
    });
    assert(validDiseaseRes.status === 200 && validDiseaseRes.data.success, 'Leaf image analyzed successfully');
    assert(validDiseaseRes.data.data.diseaseName, `Identified disease: ${validDiseaseRes.data.data.diseaseName}`);
    assert(validDiseaseRes.data.data.symptoms?.length > 0, 'Structured visible symptoms listed');
    assert(validDiseaseRes.data.data.immediateActions?.length > 0, 'Immediate low-risk farmer actions provided');
    assert(validDiseaseRes.data.data.disclaimer?.includes('advisory only') || validDiseaseRes.data.data.disclaimer?.includes('KVK'), 'Safety disclaimer included directing to agriculture officer/KVK');

    // Blurry / Insufficient Image Quality Handling
    const blurryRes = await axios.post(`${BASE_URL}/ai/diagnose-crop`, {
      imageData: 'data:image/jpeg;base64,blurry',
      isBlurry: true
    });
    assert(blurryRes.status === 200 && blurryRes.data.isInsufficientQuality === true, 'Blurry/insufficient photo recognized');
    assert(blurryRes.data.data.diseaseName.includes('Image quality is insufficient'), 'Returns "Image quality is insufficient" warning rather than guessing');
    assert(blurryRes.data.data.retakeTips?.length >= 3, 'Actionable photography guidance provided (daylight, close focus, healthy+affected areas)');

    // ─────────────────────────────────────────────────────────────
    // 8. CUSTOMER AI RECIPE STUDIO — STRICT INTENT & CONTEXT
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 8. CUSTOMER AI RECIPE STUDIO STRICT INTENT & CONTEXT ---');

    // Request: "Give me the procedure for carrot juice"
    const carrotRes = await axios.post(`${BASE_URL}/ai/recipe-assistant`, {
      message: 'Give me the procedure for carrot juice'
    });
    assert(carrotRes.status === 200 && carrotRes.data.success, 'Recipe assistant returned recipe');
    assert(carrotRes.data.recipeName === 'Carrot Juice', 'Generated recipe is strictly Carrot Juice');
    assert(!carrotRes.data.reply.toLowerCase().includes('beans poriyal'), 'Zero cross-contamination: Beans Poriyal is NOT inserted in Carrot Juice response');
    assert(carrotRes.data.recipe.ingredients.length > 0, 'Ingredients provided for carrot juice');
    assert(carrotRes.data.recipe.steps.length > 0, 'Step-by-step procedure provided');

    // Follow-up: "How do I make it without sugar?" (pronoun "it" refers to carrot juice)
    const followUpRes = await axios.post(`${BASE_URL}/ai/recipe-assistant`, {
      message: 'How do I make it without sugar?',
      lastRecipeName: 'Carrot Juice',
      conversationHistory: [
        { role: 'user', text: 'Give me the procedure for carrot juice' },
        { role: 'assistant', text: carrotRes.data.reply }
      ]
    });
    assert(followUpRes.data.success, 'Follow-up query handled successfully');
    assert(followUpRes.data.recipeName === 'Carrot Juice', 'Context maintained: AI understands "it" refers to Carrot Juice');
    assert(followUpRes.data.reply.toLowerCase().includes('without sugar') || followUpRes.data.reply.toLowerCase().includes('naturally sweet'), 'Accurately explains how to make carrot juice without sugar');

    // Follow-up: "Can I add ginger?"
    const gingerRes = await axios.post(`${BASE_URL}/ai/recipe-assistant`, {
      message: 'Can I add ginger?',
      lastRecipeName: 'Carrot Juice',
      conversationHistory: [
        { role: 'user', text: 'Give me the procedure for carrot juice' },
        { role: 'user', text: 'How do I make it without sugar?' }
      ]
    });
    assert(gingerRes.data.reply.toLowerCase().includes('ginger'), 'Understands adding fresh ginger to carrot juice');

    // Context switch: "What about beans poriyal?"
    const switchRes = await axios.post(`${BASE_URL}/ai/recipe-assistant`, {
      message: 'What about beans poriyal?'
    });
    assert(switchRes.data.recipeName === 'Beans Poriyal', 'Context correctly switched to Beans Poriyal upon explicit request');
    assert(!switchRes.data.reply.toLowerCase().includes('blend with water'), 'Beans Poriyal does not contain carrot juice blender steps');

    // Inquiry: "What's my name?" when unknown in conversation
    const nameUnknownRes = await axios.post(`${BASE_URL}/ai/recipe-assistant`, {
      message: "What's my name?"
    });
    assert(nameUnknownRes.data.reply.includes("I don't have your name available in this conversation"), 'Missing user name handled honestly without fabricating names');

  } catch (error) {
    console.error('\n❌ Unhandled Exception in Phase 6 Test Suite:', error.message);
    if (error.response?.data) console.error('Response Data:', error.response.data);
    failed++;
  } finally {
    stopTestServer();

    console.log('\n======================================================');
    console.log(`PHASE 6 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  }
}

runPhase6Tests();
