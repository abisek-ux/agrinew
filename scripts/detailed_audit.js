const mongoose = require('mongoose');
require('dotenv').config({ path: 'd:/GitHub/agrilink - Copy (2)/server/.env' });

async function runDetailedAudit() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

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

  const retainedFarmerNames = {
    'farmer@nexus.io': 'Gowres ms',
    'mgowres@gmail.com': 'gowres ms',
    'yogalakshmi32008@gmail.com': 'Yogalakshmi M',
    'mugunthannabhisek@gmail.com': 'N.Abhisek Mugunthan',
    'aashif2182007@gmail.com': 'Aashif K'
  };

  const allFarmers = await User.find({ role: 'farmer' }).lean();

  const auditRows = [];
  const retainedFarmerIds = [];
  const deletedFarmers = [];

  for (const f of allFarmers) {
    const fId = f._id.toString();
    const emailLower = (f.email || '').toLowerCase();
    const isRetained = retainedFarmerEmails.includes(emailLower);

    const productCount = await Product.countDocuments({
      $or: [{ farmerId: fId }, { farmerId: f._id }]
    });

    const orderCount = await Order.countDocuments({
      $or: [
        { farmerId: fId },
        { farmerId: f._id },
        { 'items.farmerId': fId },
        { 'items.farmerId': f._id }
      ]
    });

    const bargainCount = await Bargain.countDocuments({
      $or: [{ farmerId: fId }, { farmerId: f._id }]
    });

    let classification = 'AI/DEMO FARMER';
    let action = 'DELETE';

    if (isRetained) {
      classification = 'REAL/RETAINED FARMER';
      action = 'RETAIN';
      retainedFarmerIds.push(fId);
    } else if (
      emailLower.includes('test') ||
      emailLower.includes('acceptance') ||
      emailLower.includes('p9_') ||
      (f.name && f.name.toLowerCase().includes('test'))
    ) {
      classification = 'AUTOMATED TEST FARMER';
      action = 'DELETE';
    }

    const row = {
      farmerId: fId,
      name: f.name || `${f.firstName || ''} ${f.lastName || ''}`.trim(),
      email: f.email,
      role: f.role,
      isVerified: !!f.isVerified,
      productCount,
      orderCount,
      bargainCount,
      classification,
      action
    };
    auditRows.push(row);

    if (action === 'DELETE') {
      deletedFarmers.push({
        id: fId,
        name: row.name,
        email: row.email,
        reason: classification === 'AUTOMATED TEST FARMER' 
          ? 'Automated regression/test account from previous testing phases' 
          : 'AI/Demo farmer account not in the 5 approved registered farmer profiles'
      });
    }
  }

  console.log('\n====================================================================================================================================');
  console.log('| farmerId                 | name                   | email                         | role   | isVerified | productCount | orderCount | bargainCount | classification        | action |');
  console.log('====================================================================================================================================');
  for (const r of auditRows) {
    console.log(`| ${r.farmerId.padEnd(24)} | ${(r.name || '').padEnd(22)} | ${(r.email || '').padEnd(29)} | ${(r.role || '').padEnd(6)} | ${String(r.isVerified).padEnd(10)} | ${String(r.productCount).padEnd(12)} | ${String(r.orderCount).padEnd(10)} | ${String(r.bargainCount).padEnd(12)} | ${r.classification.padEnd(21)} | ${r.action.padEnd(6)} |`);
  }
  console.log('====================================================================================================================================\n');

  // Products audit
  const allProducts = await Product.find().lean();
  const deleteProducts = [];
  const retainProducts = [];

  for (const p of allProducts) {
    const fId = String(p.farmerId);
    if (!retainedFarmerIds.includes(fId)) {
      deleteProducts.push({
        id: p._id.toString(),
        title: p.title,
        farmerId: fId,
        farmerName: p.farmerName
      });
    } else {
      retainProducts.push(p);
    }
  }

  // Cross check relations for products to delete
  const deleteProdIdStrs = deleteProducts.map(p => p.id);
  const deleteProdObjIds = deleteProducts.map(p => new mongoose.Types.ObjectId(p.id));

  const affectedOrders = await Order.find({
    $or: [
      { 'items.productId': { $in: [...deleteProdIdStrs, ...deleteProdObjIds] } },
      { 'items.farmerId': { $in: deletedFarmers.map(f => f.id) } },
      { farmerId: { $in: deletedFarmers.map(f => f.id) } }
    ]
  }).lean();

  const affectedBargains = await Bargain.find({
    $or: [
      { productId: { $in: [...deleteProdIdStrs, ...deleteProdObjIds] } },
      { farmerId: { $in: deletedFarmers.map(f => f.id) } }
    ]
  }).lean();

  const affectedCarts = await Cart.find({
    'items.productId': { $in: [...deleteProdIdStrs, ...deleteProdObjIds] }
  }).lean();

  console.log('--- DRY-RUN SUMMARY REPORT ---');
  console.log(`Total Farmers in Database: ${allFarmers.length}`);
  console.log(`Retained Farmers: ${retainedFarmerIds.length}`);
  console.log(`Farmers to Delete: ${deletedFarmers.length}`);
  console.log(`Total Marketplace Products: ${allProducts.length}`);
  console.log(`Retained Products: ${retainProducts.length}`);
  console.log(`Products to Delete: ${deleteProducts.length}`);
  console.log(`Affected Bargains: ${affectedBargains.length}`);
  console.log(`Affected Cart Items/Docs: ${affectedCarts.length}`);
  console.log(`Affected Orders: ${affectedOrders.length}`);

  console.log('\n--- DELETE FARMERS DETAILS ---');
  deletedFarmers.forEach((df, i) => {
    console.log(`${i+1}. [${df.id}] ${df.name} (${df.email}) -> ${df.reason}`);
  });

  console.log('\n--- DELETE PRODUCTS DETAILS ---');
  deleteProducts.forEach((dp, i) => {
    console.log(`${i+1}. [${dp.id}] "${dp.title}" (farmerId: ${dp.farmerId}, farmerName: "${dp.farmerName}")`);
  });

  console.log('\n--- AFFECTED BARGAINS ---');
  if (affectedBargains.length === 0) {
    console.log('None (0 bargains affected)');
  } else {
    affectedBargains.forEach(b => console.log(`Bargain: ${b._id} (Product: ${b.productId}, Farmer: ${b.farmerId})`));
  }

  console.log('\n--- AFFECTED CART ITEMS ---');
  if (affectedCarts.length === 0) {
    console.log('None (0 carts affected)');
  } else {
    affectedCarts.forEach(c => console.log(`Cart: ${c._id} (User: ${c.userId})`));
  }

  console.log('\n--- AFFECTED ORDERS ---');
  if (affectedOrders.length === 0) {
    console.log('None (0 orders affected)');
  } else {
    affectedOrders.forEach(o => console.log(`Order: ${o._id} (Status: ${o.status}, Customer: ${o.customerId})`));
  }

  console.log('\n--- RETAINED FARMERS VERIFICATION & PRODUCT CONSISTENCY ---');
  for (const rf of auditRows.filter(r => r.action === 'RETAIN')) {
    const userDoc = await User.findById(rf.farmerId).lean();
    console.log(`Farmer [${rf.farmerId}] DB name: "${userDoc.name}" (${userDoc.firstName} ${userDoc.lastName}) | expected: "${retainedFarmerNames[userDoc.email]}" | products: ${rf.productCount}`);
  }

  await mongoose.disconnect();
}

runDetailedAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
