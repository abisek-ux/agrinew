require('dotenv').config({ path: './server/.env' });
const { connectDB } = require('../server/config/db');
const User = require('../server/models/User');
const fs = require('fs');

async function run() {
  await connectDB();

  console.log('\n--- MONGODB ATLAS USER AUDIT ---');
  const mongoUsers = await User.find({ email: { $regex: '^mgowres@gmail\\.com$', $options: 'i' } }).lean();
  console.log(`Found ${mongoUsers.length} user(s) matching mgowres@gmail.com in MongoDB Atlas:`);
  
  for (const u of mongoUsers) {
    const isBcrypt = typeof u.password === 'string' && (u.password.startsWith('$2a$') || u.password.startsWith('$2b$'));
    console.log({
      _id: String(u._id),
      name: u.name,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      hasPassword: Boolean(u.password),
      passwordType: typeof u.password,
      passwordValidBcrypt: isBcrypt,
      passwordLen: u.password ? u.password.length : 0,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    });
  }

  console.log('\n--- MEMORY USERS AUDIT ---');
  const memData = JSON.parse(fs.readFileSync('./server/data/users.json', 'utf8'));
  const memUsers = memData.filter(u => (u.email || '').toLowerCase() === 'mgowres@gmail.com');
  console.log(`Found ${memUsers.length} user(s) matching mgowres@gmail.com in server/data/users.json:`);
  
  for (const m of memUsers) {
    const isBcrypt = typeof m.password === 'string' && (m.password.startsWith('$2a$') || m.password.startsWith('$2b$'));
    console.log({
      id: m.id || m._id,
      name: m.name,
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      phone: m.phone,
      role: m.role,
      hasPassword: Boolean(m.password),
      passwordType: typeof m.password,
      passwordValidBcrypt: isBcrypt,
      passwordLen: m.password ? m.password.length : 0
    });
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
