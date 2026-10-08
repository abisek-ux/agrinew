const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/GitHub/agrilink - Copy (2)/server/.env' });

async function dryRun() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
  const Bargain = mongoose.model('Bargain', new mongoose.Schema({}, { strict: false }));
  const Cart = mongoose.model('Cart', new mongoose.Schema({}, { strict: false }));

  const farmers = await User.find({ role: 'farmer' }).lean();
  console.log('Total farmers in DB:', farmers.length);

  const retainedEmails = [
    'farmer@nexus.io',
    'mgowres@gmail.com',
    'yogalakshmi32008@gmail.com',
    'mugunthannabhisek@gmail.com',
    'aashif2182007@gmail.com'
  ];

  const results = [];

  for (const f of farmers) {
    const fId = f._id.toString();
    const productCount = await Product.countDocuments({ farmerId: f._id });
    const orderCount = await Order.countDocuments({ farmerId: f._id });
    const orderItemCount = await Order.countDocuments({ 'items.farmerId': f._id });
    const bargainCount = await Bargain.countDocuments({ farmerId: f._id });
    const isRetained = retainedEmails.includes(f.email?.toLowerCase());

    let classification = 'AI/DEMO FARMER';
    if (isRetained) {
      classification = 'REAL/RETAINED FARMER';
    } else if (f.email && (f.email.includes('test') || f.email.includes('acceptance') || f.email.includes('p9_') || (f.name && f.name.toLowerCase().includes('test')))) {
      classification = 'AUTOMATED TEST FARMER';
    }

    results.push({
      farmerId: fId,
      name: f.name || `${f.firstName || ''} ${f.lastName || ''}`.trim(),
      email: f.email,
      role: f.role,
      isVerified: !!f.isVerified,
      productCount,
      orderCount: Math.max(orderCount, orderItemCount),
      bargainCount,
      classification,
      action: isRetained ? 'RETAIN' : 'DELETE'
    });
  }

  console.log('\n========================================================================================================================');
  console.log('| farmerId                 | name                   | email                         | role   | isVerified | products | orders | bargains | classification        | action |');
  console.log('========================================================================================================================');
  for (const r of results) {
    console.log(`| ${r.farmerId.padEnd(24)} | ${(r.name || '').padEnd(22)} | ${(r.email || '').padEnd(29)} | ${(r.role || '').padEnd(6)} | ${String(r.isVerified).padEnd(10)} | ${String(r.productCount).padEnd(8)} | ${String(r.orderCount).padEnd(6)} | ${String(r.bargainCount).padEnd(8)} | ${r.classification.padEnd(21)} | ${r.action.padEnd(6)} |`);
  }
  console.log('========================================================================================================================\n');

  const retainedFarmerIds = results.filter(r => r.action === 'RETAIN').map(r => new mongoose.Types.ObjectId(r.farmerId));
  const productsToDelete = await Product.find({ farmerId: { $nin: retainedFarmerIds } }).lean();

  console.log(`Total products belonging to non-retained farmers: ${productsToDelete.length}`);
  
  const affectedOrdersSet = new Set();
  const affectedBargainsSet = new Set();
  const affectedCartsSet = new Set();

  for (const p of productsToDelete) {
    const orders = await Order.find({ 'items.productId': p._id }).lean();
    orders.forEach(o => affectedOrdersSet.add(o._id.toString()));

    const bargains = await Bargain.find({ productId: p._id }).lean();
    bargains.forEach(b => affectedBargainsSet.add(b._id.toString()));

    const carts = await Cart.find({ 'items.productId': p._id }).lean();
    carts.forEach(c => affectedCartsSet.add(c._id.toString()));

    console.log(`- Product: [${p._id}] "${p.title}" | farmerId: ${p.farmerId} | farmerName: "${p.farmerName}" | Orders: ${orders.length} | Bargains: ${bargains.length} | Carts: ${carts.length}`);
  }

  console.log('\n--- IMPACT ON OTHER COLLECTIONS ---');
  console.log(`Affected Orders count: ${affectedOrdersSet.size} (IDs: ${Array.from(affectedOrdersSet).join(', ')})`);
  console.log(`Affected Bargains count: ${affectedBargainsSet.size} (IDs: ${Array.from(affectedBargainsSet).join(', ')})`);
  console.log(`Affected Carts count: ${affectedCartsSet.size}`);

  // Inspect the orders to see if they are test orders
  if (affectedOrdersSet.size > 0) {
    console.log('\n--- Details of Affected Orders ---');
    const affOrders = await Order.find({ _id: { $in: Array.from(affectedOrdersSet) } }).lean();
    for (const ord of affOrders) {
      console.log(`Order ${ord._id}: customerId=${ord.customerId}, total=${ord.totalAmount || ord.total}, status=${ord.status}, createdAt=${ord.createdAt}`);
    }
  }

  // Also check if any retained farmer has name mismatch
  const user1 = await User.findById('6ab898ad3f63690be9405c35').lean();
  console.log('\nRetained User 1 (farmer@nexus.io): name =', user1?.name, 'firstName =', user1?.firstName, 'lastName =', user1?.lastName);

  await mongoose.disconnect();
}

dryRun().catch(e => { console.error(e); process.exit(1); });
