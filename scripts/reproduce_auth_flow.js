require('dotenv').config({ path: './server/.env' });
const { app } = require('../server/server');
const { connectDB } = require('../server/config/db');
const User = require('../server/models/User');
const http = require('http');
const axios = require('axios');
const bcrypt = require('bcryptjs');

async function testFlow() {
  await connectDB();
  
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/auth`;
  console.log(`Test server running at ${baseUrl}`);

  try {
    // 1. Check mgowres@gmail.com in DB
    const farmer = await User.findOne({ email: 'mgowres@gmail.com' });
    console.log('\n--- 1. Farmer mgowres@gmail.com DB Record ---');
    console.log({
      _id: String(farmer._id),
      role: farmer.role,
      email: farmer.email,
      phone: farmer.phone,
      hasPassword: Boolean(farmer.password),
      passwordLen: farmer.password ? farmer.password.length : 0,
      passwordPrefix: farmer.password ? farmer.password.slice(0, 7) : null
    });

    // 2. Test login with wrong password
    console.log('\n--- 2. Test Login with Wrong Password ---');
    try {
      const res = await axios.post(`${baseUrl}/login`, {
        identifier: 'mgowres@gmail.com',
        password: 'WrongPassword123!',
        requiredRole: 'farmer'
      });
      console.log('Login result:', res.status, res.data);
    } catch (err) {
      console.log('HTTP Status:', err.response?.status);
      console.log('Response Body:', err.response?.data);
    }

    // 3. Test login with identifier casing / whitespace
    console.log('\n--- 3. Test Login with Whitespace / Casing ---');
    try {
      const res = await axios.post(`${baseUrl}/login`, {
        identifier: '  MGOWRES@GMAIL.COM  ',
        password: 'WrongPassword123!',
        requiredRole: 'farmer'
      });
      console.log('Login result:', res.status, res.data);
    } catch (err) {
      console.log('HTTP Status:', err.response?.status);
      console.log('Response Body:', err.response?.data);
    }

    // 4. Test login with Phone number
    console.log('\n--- 4. Test Login with Phone number ---');
    try {
      const res = await axios.post(`${baseUrl}/login`, {
        identifier: '9952712633',
        password: 'WrongPassword123!',
        requiredRole: 'farmer'
      });
      console.log('Login result:', res.status, res.data);
    } catch (err) {
      console.log('HTTP Status:', err.response?.status);
      console.log('Response Body:', err.response?.data);
    }

    // 5. Test registration with duplicate email
    console.log('\n--- 5. Test Registration with Duplicate Email ---');
    try {
      const res = await axios.post(`${baseUrl}/register`, {
        firstName: 'Test',
        lastName: 'Farmer',
        email: 'mgowres@gmail.com',
        phone: '9840199999',
        password: 'TestPassword123!',
        role: 'farmer'
      });
      console.log('Register duplicate email result:', res.status, res.data);
    } catch (err) {
      console.log('HTTP Status:', err.response?.status);
      console.log('Response Body:', err.response?.data);
    }

    // 6. Test registration with duplicate phone (plain vs normalized)
    console.log('\n--- 6. Test Registration with Duplicate Phone ---');
    try {
      const res = await axios.post(`${baseUrl}/register`, {
        firstName: 'Test',
        lastName: 'Farmer',
        email: 'newfarmer_unique_123@test.in',
        phone: '9952712633',
        password: 'TestPassword123!',
        role: 'farmer'
      });
      console.log('Register duplicate phone result:', res.status, res.data);
    } catch (err) {
      console.log('HTTP Status:', err.response?.status);
      console.log('Response Body:', err.response?.data);
    }

    // 7. Test registration with new temporary user
    console.log('\n--- 7. Test New Farmer Registration & Cleanup ---');
    const tempEmail = `temp_farmer_${Date.now()}@test.in`;
    const tempPhone = `98401${Math.floor(10000 + Math.random() * 90000)}`;
    const tempPass = 'ValidFarmerPass123!';
    let tempUser = null;
    try {
      const regRes = await axios.post(`${baseUrl}/register`, {
        firstName: 'Temp',
        lastName: 'Farmer',
        email: tempEmail,
        phone: tempPhone,
        password: tempPass,
        role: 'farmer',
        farmName: 'Temp Green Farms'
      });
      console.log('New farmer registered:', regRes.status, {
        _id: regRes.data._id,
        role: regRes.data.role,
        hasToken: Boolean(regRes.data.token)
      });
      tempUser = regRes.data;

      // Now test login with this new farmer!
      const loginRes = await axios.post(`${baseUrl}/login`, {
        identifier: tempEmail,
        password: tempPass,
        requiredRole: 'farmer'
      });
      console.log('Login with new farmer succeeded:', loginRes.status, {
        _id: loginRes.data._id,
        role: loginRes.data.role,
        hasToken: Boolean(loginRes.data.token)
      });

      // Test login with wrong role (e.g. requiredRole customer)
      try {
        await axios.post(`${baseUrl}/login`, {
          identifier: tempEmail,
          password: tempPass,
          requiredRole: 'customer'
        });
      } catch (roleErr) {
        console.log('Wrong role access blocked:', roleErr.response?.status, roleErr.response?.data?.message);
      }

    } finally {
      // Clean up temp farmer
      if (tempUser && tempUser._id) {
        await User.deleteOne({ _id: tempUser._id });
        console.log('Cleaned up temporary farmer:', tempEmail);
      }
    }

  } finally {
    server.close();
  }
  process.exit(0);
}

testFlow().catch(err => {
  console.error(err);
  process.exit(1);
});
