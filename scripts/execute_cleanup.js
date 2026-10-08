const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/GitHub/agrilink - Copy (2)/server/.env' });

async function executeCleanup() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas for execution');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
  const Bargain = mongoose.model('Bargain', new mongoose.Schema({}, { strict: false }));
  const Cart = mongoose.model('Cart', new mongoose.Schema({}, { strict: false }));

  const retainedFarmerEmails = [
    'farmer@nexus.io',
    'mgowres@gmail.com',
    'yogalakshmi32008@gmail.com',
    'mugunthannabhisek@gmail.com',
    'aashif2182007@gmail.com'
  ];

  // 1. Identify retained farmers
  const retainedFarmers = await User.find({
    role: 'farmer',
    email: { $in: retainedFarmerEmails }
  }).lean();
  console.log(`Retained farmers found: ${retainedFarmers.length}`);

  const retainedFarmerIds = retainedFarmers.map(f => f._id.toString());
  console.log('Retained Farmer IDs:', retainedFarmerIds);

  // 2. Restore User 1 profile name (farmer@nexus.io)
  const user1 = await User.findOne({ email: 'farmer@nexus.io' });
  if (user1) {
    user1.name = 'Gowres ms';
    user1.firstName = 'Gowres';
    user1.lastName = 'ms';
    await user1.save();
    console.log(`Updated farmer@nexus.io profile name to "${user1.name}"`);
  }

  // 3. Fix denormalized fields on products owned by retained farmers
  const pNexusUpdate = await Product.updateMany(
    { farmerId: '6ab898ad3f63690be9405c35' },
    { $set: { farmerName: 'Gowres ms', farmerEmail: 'farmer@nexus.io' } }
  );
  console.log(`Updated ${pNexusUpdate.modifiedCount} products for Gowres ms (farmer@nexus.io)`);

  const pGowresUpdate = await Product.updateMany(
    { farmerId: '6ab898ae3f63690be9405c41' },
    { $set: { farmerName: 'gowres ms', farmerEmail: 'mgowres@gmail.com' } }
  );
  console.log(`Updated ${pGowresUpdate.modifiedCount} products for gowres ms (mgowres@gmail.com)`);

  // 4. Delete products of non-retained farmers
  const prodDeleteResult = await Product.deleteMany({
    farmerId: { $nin: retainedFarmerIds }
  });
  console.log(`Deleted ${prodDeleteResult.deletedCount} products belonging to non-retained farmers`);

  // 5. Delete test farmers
  const userDeleteResult = await User.deleteMany({
    role: 'farmer',
    email: { $nin: retainedFarmerEmails }
  });
  console.log(`Deleted ${userDeleteResult.deletedCount} non-retained farmer accounts`);

  // 6. Delete test bargains referencing deleted products or non-retained farmers
  const bargainDeleteResult = await Bargain.deleteMany({
    $or: [
      { farmerId: { $nin: retainedFarmerIds } },
      { farmerEmail: { $nin: retainedFarmerEmails } }
    ]
  });
  console.log(`Deleted ${bargainDeleteResult.deletedCount} test bargains`);

  // 7. Delete test orders placed on test products / non-retained farmers
  const orderDeleteResult = await Order.deleteMany({
    $or: [
      { farmerId: { $nin: retainedFarmerIds } },
      { 'items.farmerId': { $nin: retainedFarmerIds } }
    ]
  });
  console.log(`Deleted ${orderDeleteResult.deletedCount} test orders`);

  // 8. Clean up any cart items referencing non-existent products
  const remainingProducts = await Product.find().lean();
  const remainingProductIds = remainingProducts.map(p => p._id.toString());
  const carts = await Cart.find().lean();
  let cleanedCartCount = 0;
  for (const c of carts) {
    if (c.items && c.items.length > 0) {
      const validItems = c.items.filter(item => remainingProductIds.includes(String(item.productId)));
      if (validItems.length !== c.items.length) {
        await Cart.updateOne({ _id: c._id }, { $set: { items: validItems } });
        cleanedCartCount++;
      }
    }
  }
  console.log(`Cleaned ${cleanedCartCount} carts with stale test product items`);

  // 9. Integrity checks
  console.log('\n--- POST-CLEANUP INTEGRITY AUDIT ---');
  const totalFarmers = await User.countDocuments({ role: 'farmer' });
  const totalProducts = await Product.countDocuments();
  const invalidProducts = await Product.countDocuments({ farmerId: { $nin: retainedFarmerIds } });
  const totalBargains = await Bargain.countDocuments();
  const invalidBargains = await Bargain.countDocuments({ farmerId: { $nin: retainedFarmerIds } });

  console.log(`Total legitimate farmers: ${totalFarmers} (Expected: 5)`);
  console.log(`Total marketplace products: ${totalProducts} (Expected: 11)`);
  console.log(`Products with invalid farmerId: ${invalidProducts} (Expected: 0)`);
  console.log(`Total bargains: ${totalBargains}`);
  console.log(`Bargains with invalid farmerId: ${invalidBargains} (Expected: 0)`);

  const remainingFarmers = await User.find({ role: 'farmer' }).lean();
  console.log('\nRemaining 5 Legitimate Farmers:');
  remainingFarmers.forEach(f => {
    console.log(`- [${f._id}] ${f.name} (${f.email})`);
  });

  console.log('\nRemaining Products in Marketplace:');
  remainingProducts.forEach(p => {
    console.log(`- [${p._id}] "${p.title}" | farmerId: ${p.farmerId} | farmerName: "${p.farmerName}" | ₹${p.price}`);
  });

  await mongoose.disconnect();
}

executeCleanup().catch(err => {
  console.error(err);
  process.exit(1);
});
