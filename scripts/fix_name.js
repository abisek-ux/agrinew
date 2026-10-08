const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/GitHub/agrilink - Copy (2)/server/.env' });

async function fixName() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const res = await User.updateOne(
    { email: 'farmer@nexus.io' },
    { $set: { name: 'Gowres ms', firstName: 'Gowres', lastName: 'ms' } }
  );
  console.log('Update result:', res);
  const u = await User.findOne({ email: 'farmer@nexus.io' }).lean();
  console.log('Verified user in DB:', u.name, u.firstName, u.lastName);
  await mongoose.disconnect();
}
fixName().catch(console.error);
