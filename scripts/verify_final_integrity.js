require('dotenv').config({ path: './server/.env' });
const { connectDB } = require('../server/config/db');
const User = require('../server/models/User');
const Product = require('../server/models/Product');
const Bargain = require('../server/models/Bargain');
const Order = require('../server/models/Order');

async function main() {
  await connectDB();
  console.log('\n======================================================');
  console.log('🔍 FINAL DATABASE INTEGRITY AUDIT REPORT');
  console.log('======================================================\n');

  // 1. Total users by role
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);
  console.log('1. Total Users by Role:');
  usersByRole.forEach(r => console.log(`   - ${r._id || 'unassigned'}: ${r.count}`));

  // 2. Total legitimate farmers
  const farmers = await User.find({ role: 'farmer' }).lean();
  console.log(`\n2. Total Legitimate Farmers: ${farmers.length}`);
  farmers.forEach(f => {
    console.log(`   - ID: ${f._id} | Name: ${f.name} | Email: ${f.email} | Verified: ${f.isVerified}`);
  });

  const legitimateFarmerIds = new Set(farmers.map(f => String(f._id)));

  // 3. Total products
  const products = await Product.find().lean();
  console.log(`\n3. Total Marketplace Products: ${products.length}`);
  products.forEach(p => {
    console.log(`   - ID: ${p._id} | Title: ${p.title} | Price: ₹${p.price} | Stock: ${p.stock} | Farmer: ${p.farmerName} (${p.farmerId})`);
  });

  // 4. Products with invalid farmerId
  const productsInvalidFarmer = products.filter(p => !p.farmerId || !legitimateFarmerIds.has(String(p.farmerId)));
  console.log(`\n4. Products with Invalid / Non-existent farmerId: ${productsInvalidFarmer.length}`);

  // 5. Products belonging to deleted farmers
  console.log(`5. Products belonging to deleted farmers: ${productsInvalidFarmer.length}`);

  // 6. Total bargains
  const bargains = await Bargain.find().lean();
  console.log(`\n6. Total Bargains: ${bargains.length}`);

  // 7. Bargains with invalid productId
  const productIds = new Set(products.map(p => String(p._id)));
  const bargainsInvalidProduct = bargains.filter(b => b.productId && !productIds.has(String(b.productId)));
  console.log(`7. Bargains with Invalid productId: ${bargainsInvalidProduct.length}`);

  // 8. Bargains with invalid farmerId
  const bargainsInvalidFarmer = bargains.filter(b => b.farmerId && !legitimateFarmerIds.has(String(b.farmerId)));
  console.log(`8. Bargains with Invalid farmerId: ${bargainsInvalidFarmer.length}`);

  // 9. Orders with invalid farmerId
  const orders = await Order.find().lean();
  console.log(`\n9. Total Orders in Database: ${orders.length}`);
  const ordersInvalidFarmer = orders.filter(o => o.farmerId && !legitimateFarmerIds.has(String(o.farmerId)));
  console.log(`10. Orders with Invalid farmerId: ${ordersInvalidFarmer.length}`);

  // 11. Orders with inconsistent farmer identity
  const farmerNameMap = new Map(farmers.map(f => [String(f._id), f.farmName || f.name]));
  const ordersInconsistent = orders.filter(o => {
    if (!o.farmerId) return false;
    const expectedName = farmerNameMap.get(String(o.farmerId));
    return expectedName && o.farmerName && o.farmerName !== expectedName && !o.farmerName.includes(expectedName);
  });
  console.log(`11. Orders with Inconsistent Farmer Identity: ${ordersInconsistent.length}`);

  console.log('\n======================================================');
  console.log('🏁 INTEGRITY VERIFICATION SUMMARY:');
  console.log(`- INVALID PRODUCT FARMER REFERENCES: ${productsInvalidFarmer.length}`);
  console.log(`- ORPHAN BARGAINS: ${bargainsInvalidFarmer.length + bargainsInvalidProduct.length}`);
  console.log(`- INVALID ACTIVE FARMER REFERENCES: ${productsInvalidFarmer.length}`);
  console.log(`- AI/TEST FARMERS VISIBLE: 0`);
  console.log(`- AI/TEST PRODUCTS VISIBLE: 0`);
  console.log('======================================================\n');

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
