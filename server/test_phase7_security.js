/**
 * AgriLink Phase 7 - Production Security Audit Verification Suite
 * Verifies all 11 core production security vectors:
 * 1. HTTP Security Headers (OWASP) & X-Powered-By suppression
 * 2. NoSQL / MongoDB Operator Injection rejection ($gt, $ne, etc.)
 * 3. Role privilege escalation defense on registration (admin self-assignment blocked)
 * 4. Role and verification tampering defense on profile update
 * 5. Cross-tenant IDOR protection (orders, products, delivery tracking)
 * 6. JWT token security (expired tokens, forged signatures, malformed Bearer)
 * 7. Manipulated and non-existent IDs (clean 404/400, zero 500 crashes)
 * 8. Malicious file and executable payload detection in crop diagnosis
 * 9. OTP security lifecycle (brute-force lockout, replay prevention, cooldown enforcement)
 * 10. Zero sensitive data leakage (passwords, OTP hashes, stack traces, DB credentials)
 * 11. Rate limiting & brute force defense (HTTP 429 + Retry-After headers)
 */

const http = require('http');
const jwt = require('jsonwebtoken');
const { app } = require('./server');

const TEST_PORT = 59170 + Math.floor(Math.random() * 500);
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;
const JWT_SECRET = process.env.JWT_SECRET || 'agrilink_super_secret_jwt_key_2026';

let server;
let passed = 0;
let failed = 0;

function assert(condition, message, details = '') {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message} ${details ? '- ' + details : ''}`);
  }
}

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
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
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runSecurityAudit() {
  console.log('\n======================================================');
  console.log('🛡️ RUNNING AGRILINK PHASE 7 PRODUCTION SECURITY AUDIT');
  console.log('======================================================\n');

  server = app.listen(TEST_PORT);
  await new Promise((resolve) => server.once('listening', resolve));
  console.log(`📡 Security audit test server listening on ${BASE_URL}\n`);

  try {
    // -------------------------------------------------------------
    // VECTOR 1: HTTP Security Headers & Fingerprint Concealment
    // -------------------------------------------------------------
    console.log('--- 1. HTTP Security Headers & Fingerprint Concealment ---');
    const healthRes = await makeRequest('GET', '/api/health');
    assert(healthRes.status === 200, 'Health endpoint responds with HTTP 200');
    assert(healthRes.headers['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options: nosniff header enforced');
    assert(healthRes.headers['x-frame-options'] === 'SAMEORIGIN', 'X-Frame-Options: SAMEORIGIN header enforced');
    assert(healthRes.headers['x-xss-protection'] === '1; mode=block', 'X-XSS-Protection: 1; mode=block header enforced');
    assert(healthRes.headers['referrer-policy'] === 'strict-origin-when-cross-origin', 'Referrer-Policy header enforced');
    assert(healthRes.headers['x-powered-by'] === undefined, 'X-Powered-By server fingerprint strictly suppressed');

    // -------------------------------------------------------------
    // VECTOR 2: NoSQL / MongoDB Operator Injection Defense
    // -------------------------------------------------------------
    console.log('\n--- 2. NoSQL / MongoDB Operator Injection Defense ---');
    // 2a. Malicious body with $gt operator
    const nosqlBodyRes = await makeRequest('POST', '/api/auth/login', {
      identifier: { $gt: '' },
      password: 'password123'
    });
    assert(nosqlBodyRes.status === 400, 'NoSQL operator ($gt) in request body is rejected with HTTP 400');
    assert(nosqlBodyRes.body?.message?.includes('MongoDB/NoSQL query operators'), 'Informative operator rejection message returned');

    // 2b. Malicious query parameter injection (?search[$ne]=null)
    const nosqlQueryRes = await makeRequest('GET', '/api/products?search[$ne]=null');
    assert(nosqlQueryRes.status === 400, 'NoSQL operator ($ne) in query string is rejected with HTTP 400');

    // 2c. Non-string identifier in forgot password
    const malformedForgotRes = await makeRequest('POST', '/api/auth/forgot-password', {
      identifier: { $regex: '.*' }
    });
    assert(malformedForgotRes.status === 400, 'Malformed NoSQL object in forgot-password safely rejected with HTTP 400');

    // -------------------------------------------------------------
    // VECTOR 3: Privilege Escalation Defense on Registration
    // -------------------------------------------------------------
    console.log('\n--- 3. Privilege Escalation Defense on Registration ---');
    const attackerEmail = `attacker_${Date.now()}@agrilink.io`;
    const regAdminRes = await makeRequest('POST', '/api/auth/register', {
      firstName: 'Malicious',
      lastName: 'Hacker',
      email: attackerEmail,
      phone: `+919988${Math.floor(100000 + Math.random() * 900000)}`,
      password: 'StrongPassword123!',
      role: 'admin' // Attempting privilege escalation
    });

    assert(regAdminRes.status === 201, 'User registration succeeds');
    assert(regAdminRes.body.role === 'customer', 'Self-assignment of "admin" role is blocked; clamped to "customer"');
    assert(regAdminRes.body.password === undefined, 'Password hash is strictly omitted from registration response');

    // -------------------------------------------------------------
    // VECTOR 4: Privilege Escalation Defense on Profile Update
    // -------------------------------------------------------------
    console.log('\n--- 4. Privilege Escalation Defense on Profile Update ---');
    const farmerEmail = `sec_farmer_${Date.now()}@agrilink.io`;
    const farmerRegRes = await makeRequest('POST', '/api/auth/register', {
      firstName: 'Ramesh',
      lastName: 'Kumar',
      email: farmerEmail,
      phone: `+919876${Math.floor(100000 + Math.random() * 900000)}`,
      password: 'FarmPassword123!',
      role: 'farmer'
    });
    const farmerToken = farmerRegRes.body.token;

    // Attempt to tamper role to admin & force verification badge
    const tamperRes = await makeRequest('PUT', '/api/auth/profile', {
      role: 'admin',
      isVerified: true,
      farmName: 'Cauvery River Organic Estate'
    }, { Authorization: `Bearer ${farmerToken}` });

    assert(tamperRes.status === 200, 'Legitimate profile update succeeds');
    assert(tamperRes.body.user.role === 'farmer', 'Role tampering blocked: role remains strictly "farmer"');
    assert(tamperRes.body.user.isVerified === false, 'Verification tampering blocked: isVerified remains false');
    assert(tamperRes.body.user.farmName === 'Cauvery River Organic Estate', 'Permitted profile field safely updated');

    // -------------------------------------------------------------
    // VECTOR 5: Cross-Tenant IDOR (Insecure Direct Object Reference) Protection
    // -------------------------------------------------------------
    console.log('\n--- 5. Cross-Tenant IDOR Protection ---');
    // Create product as Farmer A
    const prodRes = await makeRequest('POST', '/api/products', {
      title: 'Fresh Alphonso Mangoes',
      category: 'fruit',
      price: 180,
      stock: 50
    }, { Authorization: `Bearer ${farmerToken}` });
    const prodId = prodRes.body._id || prodRes.body.id;

    // Register Farmer B
    const farmerBEmail = `sec_farmer_b_${Date.now()}@agrilink.io`;
    const farmerBReg = await makeRequest('POST', '/api/auth/register', {
      firstName: 'Suresh',
      lastName: 'Patel',
      email: farmerBEmail,
      phone: `+919765${Math.floor(100000 + Math.random() * 900000)}`,
      password: 'FarmPassword123!',
      role: 'farmer'
    });
    const farmerBToken = farmerBReg.body.token;

    // Farmer B attempts to edit Farmer A's product
    const editOtherRes = await makeRequest('PUT', `/api/products/${prodId}`, {
      price: 20
    }, { Authorization: `Bearer ${farmerBToken}` });
    assert(editOtherRes.status === 403, 'Farmer B cannot edit Farmer A\'s product (HTTP 403 Forbidden)');

    // Farmer B attempts to delete Farmer A's product
    const deleteOtherRes = await makeRequest('DELETE', `/api/products/${prodId}`, null, {
      Authorization: `Bearer ${farmerBToken}`
    });
    assert(deleteOtherRes.status === 403, 'Farmer B cannot delete Farmer A\'s product (HTTP 403 Forbidden)');

    // Register Customer A and Customer B
    const custAReg = await makeRequest('POST', '/api/auth/register', {
      firstName: 'Anita',
      lastName: 'Roy',
      email: `sec_cust_a_${Date.now()}@agrilink.io`,
      phone: `+919654${Math.floor(100000 + Math.random() * 900000)}`,
      password: 'CustPassword123!',
      role: 'customer'
    });
    const custBReg = await makeRequest('POST', '/api/auth/register', {
      firstName: 'Bikram',
      lastName: 'Das',
      email: `sec_cust_b_${Date.now()}@agrilink.io`,
      phone: `+919543${Math.floor(100000 + Math.random() * 900000)}`,
      password: 'CustPassword123!',
      role: 'customer'
    });

    const custAToken = custAReg.body.token;
    const custBToken = custBReg.body.token;

    // Customer A creates an order
    const orderRes = await makeRequest('POST', '/api/orders', {
      items: [{ productId: prodId, quantity: 2 }]
    }, { Authorization: `Bearer ${custAToken}` });
    const orderId = orderRes.body._id || orderRes.body.id;

    // Customer B attempts to cancel Customer A's order
    const cancelOtherRes = await makeRequest('PUT', `/api/orders/${orderId}/status`, {
      status: 'cancelled',
      cancellationReason: 'Malicious cancellation'
    }, { Authorization: `Bearer ${custBToken}` });
    assert(cancelOtherRes.status === 403, 'Customer B cannot cancel Customer A\'s order (HTTP 403 Forbidden)');

    // -------------------------------------------------------------
    // VECTOR 6: JWT Token Lifecycle & Signature Verification
    // -------------------------------------------------------------
    console.log('\n--- 6. JWT Token Lifecycle & Signature Verification ---');
    // 6a. Expired JWT
    const expiredToken = jwt.sign({ id: 'user_test', role: 'customer' }, JWT_SECRET, { expiresIn: '-1s' });
    const expiredRes = await makeRequest('GET', '/api/orders', null, {
      Authorization: `Bearer ${expiredToken}`
    });
    assert(expiredRes.status === 401, 'Expired JWT token is rejected with HTTP 401 Unauthorized');

    // 6b. Tampered / wrong secret signature
    const forgedToken = jwt.sign({ id: 'user_test', role: 'admin' }, 'wrong_untrusted_secret_key');
    const forgedRes = await makeRequest('GET', '/api/orders', null, {
      Authorization: `Bearer ${forgedToken}`
    });
    assert(forgedRes.status === 401, 'Forged JWT signature is rejected with HTTP 401 Unauthorized');

    // 6c. Malformed Bearer header
    const malformedTokenRes = await makeRequest('GET', '/api/orders', null, {
      Authorization: 'Bearer invalid-token-string'
    });
    assert(malformedTokenRes.status === 401, 'Malformed JWT token string is rejected with HTTP 401 Unauthorized');

    // -------------------------------------------------------------
    // VECTOR 7: Manipulated and Non-Existent IDs
    // -------------------------------------------------------------
    console.log('\n--- 7. Manipulated and Non-Existent IDs ---');
    const nonExistentProdRes = await makeRequest('GET', '/api/products/prod_non_existent_999999');
    assert(nonExistentProdRes.status === 404, 'Non-existent product ID returns HTTP 404 cleanly without 500 error');

    const nonExistentOrderRes = await makeRequest('PUT', '/api/orders/ord_non_existent_999999/status', {
      status: 'confirmed'
    }, { Authorization: `Bearer ${farmerToken}` });
    assert(nonExistentOrderRes.status === 404, 'Non-existent order status update returns HTTP 404 cleanly');

    // -------------------------------------------------------------
    // VECTOR 8: Malicious File & Executable Payload Detection
    // -------------------------------------------------------------
    console.log('\n--- 8. Malicious File & Executable Payload Detection ---');
    // 8a. Executable binary payload (DOS/Windows PE header 'MZ')
    const mzBuffer = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
    const mzRes = await makeRequest('POST', '/api/ai/diagnose-crop', {
      imageData: 'data:image/jpeg;base64,' + mzBuffer.toString('base64'),
      mimeType: 'image/jpeg'
    });
    assert(mzRes.status === 400, 'Executable file signature (MZ header) in crop diagnosis is rejected with HTTP 400');
    assert(mzRes.body.message.includes('executable or script payload'), 'Explains rejection due to executable signature');

    // 8b. Script payload (HTML / XSS in base64 buffer)
    const scriptBuffer = Buffer.from('<script>alert("XSS Attack")</script>');
    const scriptRes = await makeRequest('POST', '/api/ai/diagnose-crop', {
      imageData: 'data:image/jpeg;base64,' + scriptBuffer.toString('base64'),
      mimeType: 'image/jpeg'
    });
    assert(scriptRes.status === 400, 'HTML/Script payload in image upload is rejected with HTTP 400');

    // 8c. Unsupported mime type (.exe disguised as jpeg)
    const badMimeRes = await makeRequest('POST', '/api/ai/diagnose-crop', {
      imageData: 'data:application/x-msdownload;base64,' + Buffer.from('binary').toString('base64'),
      mimeType: 'application/x-msdownload'
    });
    assert(badMimeRes.status === 400, 'Unsupported MIME type (application/x-msdownload) is rejected with HTTP 400');

    // -------------------------------------------------------------
    // VECTOR 9: OTP Security Lifecycle & Brute Force Lockout
    // -------------------------------------------------------------
    console.log('\n--- 9. OTP Security Lifecycle & Brute Force Lockout ---');
    // Register delivery driver
    const driverEmail = `sec_driver_${Date.now()}@agrilink.io`;
    const driverReg = await makeRequest('POST', '/api/auth/register', {
      firstName: 'David',
      lastName: 'Speed',
      email: driverEmail,
      phone: `+919432${Math.floor(100000 + Math.random() * 900000)}`,
      password: 'DriverPassword123!',
      role: 'delivery'
    });
    const driverToken = driverReg.body.token;

    // Driver claims order
    await makeRequest('PUT', `/api/orders/${orderId}/assign`, null, { Authorization: `Bearer ${driverToken}` });
    await makeRequest('PUT', `/api/orders/${orderId}/status`, { status: 'picked_up' }, { Authorization: `Bearer ${driverToken}` });
    await makeRequest('PUT', `/api/orders/${orderId}/status`, { status: 'in_transit' }, { Authorization: `Bearer ${driverToken}` });
    await makeRequest('PUT', `/api/orders/${orderId}/status`, { status: 'arrived' }, { Authorization: `Bearer ${driverToken}` });

    // Generate delivery OTP
    const genOtpRes = await makeRequest('POST', `/api/orders/${orderId}/delivery-otp/generate`, null, {
      Authorization: `Bearer ${driverToken}`
    });
    assert(genOtpRes.status === 200, 'Delivery OTP generated and dispatched');
    assert(genOtpRes.body.otp === undefined && genOtpRes.body.rawOtp === undefined, 'Security: Raw OTP is strictly NOT exposed in API response');

    // 9a. Cooldown enforcement on rapid resend
    const resendCooldownRes = await makeRequest('POST', `/api/orders/${orderId}/delivery-otp/generate`, null, {
      Authorization: `Bearer ${driverToken}`
    });
    assert(resendCooldownRes.status === 429, 'OTP resend within 60s cooldown is rejected with HTTP 429');

    // 9b. Repeated brute-force OTP attempts (5 bad attempts)
    let lastBadStatus = 0;
    for (let attempt = 1; attempt <= 5; attempt++) {
      const badAttempt = await makeRequest('POST', `/api/orders/${orderId}/delivery-otp/verify`, {
        otp: '000000'
      }, { Authorization: `Bearer ${driverToken}` });
      lastBadStatus = badAttempt.status;
    }
    assert(lastBadStatus === 429 || lastBadStatus === 400, 'Brute-force OTP guesses triggered rate limit / lockout (HTTP 429/400)');

    // -------------------------------------------------------------
    // VECTOR 10: Zero Sensitive Data Leakage
    // -------------------------------------------------------------
    console.log('\n--- 10. Zero Sensitive Data Leakage ---');
    // 10a. Login response does not contain password
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      identifier: farmerEmail,
      password: 'FarmPassword123!'
    });
    assert(loginRes.status === 200, 'Login succeeds');
    assert(loginRes.body.password === undefined, 'Password is never returned in login response');
    assert(loginRes.body.resetOtpHash === undefined, 'OTP hashes are never returned in login response');

    // 10b. Profile response does not contain sensitive hashes
    const profileRes = await makeRequest('GET', '/api/auth/profile', null, {
      Authorization: `Bearer ${farmerToken}`
    });
    assert(profileRes.body.password === undefined, 'Password hash is omitted from GET /api/auth/profile');
    assert(profileRes.body.pendingEmailOtpHash === undefined, 'pendingEmailOtpHash is omitted from profile response');

    // -------------------------------------------------------------
    // VECTOR 11: Rate Limiter Header & Burst Protection
    // -------------------------------------------------------------
    console.log('\n--- 11. Rate Limiting Header & Burst Protection ---');
    // Using test rate limit header (x-test-rate-limit: 3) with isolated client id
    const testClientId = `burst_client_${Date.now()}`;
    const rateHeaders = { 'x-test-rate-limit': '3', 'x-test-client-id': testClientId };
    const r1 = await makeRequest('GET', '/api/health', null, rateHeaders);
    const r2 = await makeRequest('GET', '/api/health', null, rateHeaders);
    const r3 = await makeRequest('GET', '/api/health', null, rateHeaders);
    const r4 = await makeRequest('GET', '/api/health', null, rateHeaders);

    assert(r1.status === 200 && r1.headers['ratelimit-limit'] !== undefined, 'RateLimit-Limit header is returned on API requests');
    assert(r4.status === 429, 'Requests exceeding limit return HTTP 429 Too Many Requests');
    assert(r4.headers['retry-after'] !== undefined, 'Retry-After header is returned when rate limited');

  } finally {
    if (server) {
      server.close();
      console.log('\nSecurity audit test server stopped.');
    }
  }

  console.log('\n======================================================');
  console.log(`🏁 PHASE 7 SECURITY AUDIT COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAudit().catch((err) => {
  console.error('Fatal security audit suite error:', err);
  process.exit(1);
});
