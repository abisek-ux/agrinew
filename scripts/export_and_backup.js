const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: 'd:/GitHub/agrilink - Copy (2)/server/.env' });

async function backup() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas for backup');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
  const Bargain = mongoose.model('Bargain', new mongoose.Schema({}, { strict: false }));

  const retainedFarmerEmails = [
    'farmer@nexus.io',
    'mgowres@gmail.com',
    'yogalakshmi32008@gmail.com',
    'mugunthannabhisek@gmail.com',
    'aashif2182007@gmail.com'
  ];

  const retainedFarmers = await User.find({
    role: 'farmer',
    email: { $in: retainedFarmerEmails }
  }).lean();
  const retainedFarmerIds = retainedFarmers.map(f => f._id.toString());

  const testFarmers = await User.find({
    role: 'farmer',
    email: { $nin: retainedFarmerEmails }
  }).lean();
  const testFarmerIds = testFarmers.map(f => f._id.toString());

  const testProducts = await Product.find({
    farmerId: { $in: testFarmerIds }
  }).lean();
  const testProductIds = testProducts.map(p => p._id.toString());

  const testBargains = await Bargain.find({
    $or: [
      { farmerId: { $in: testFarmerIds } },
      { productId: { $in: testProductIds } }
    ]
  }).lean();

  const testOrders = await Order.find({
    $or: [
      { farmerId: { $in: testFarmerIds } },
      { 'items.farmerId': { $in: testFarmerIds } },
      { 'items.productId': { $in: testProductIds } }
    ]
  }).lean();

  const backupData = {
    timestamp: new Date().toISOString(),
    testFarmers,
    testProducts,
    testBargains,
    testOrders
  };

  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupPath = path.join(backupDir, `phase10_backup_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`Backup saved successfully to: ${backupPath}`);
  console.log(`Saved: ${testFarmers.length} farmers, ${testProducts.length} products, ${testBargains.length} bargains, ${testOrders.length} orders`);

  await mongoose.disconnect();
}

backup().catch(console.error);
