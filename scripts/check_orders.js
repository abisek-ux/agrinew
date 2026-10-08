const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/GitHub/agrilink - Copy (2)/server/.env' });

async function checkAllOrders() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const orders = await Order.find().lean();
  console.log('Total orders in DB:', orders.length);
  for (const o of orders) {
    const cust = await User.findById(o.customerId).lean();
    console.log(`Order ${o._id}: date=${o.createdAt}, cust=${cust?.email || o.customerId}, status=${o.status}, total=${o.totalAmount || o.total}`);
  }

  // Also check products for 6ab898ae3f63690be9405c41
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const prods41 = await Product.find({ farmerId: '6ab898ae3f63690be9405c41' }).lean();
  console.log('\nProducts for 6ab898ae3f63690be9405c41:', prods41.length);
  for (const p of prods41) {
    console.log(`- [${p._id}] ${p.title} (${p.farmerName})`);
  }

  await mongoose.disconnect();
}
checkAllOrders().catch(console.error);
