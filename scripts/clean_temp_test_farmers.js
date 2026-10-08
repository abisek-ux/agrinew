require('dotenv').config({ path: './server/.env' });
const { connectDB } = require('../server/config/db');
const User = require('../server/models/User');
const Product = require('../server/models/Product');
const Bargain = require('../server/models/Bargain');
const Order = require('../server/models/Order');

async function main() {
  await connectDB();
  const retainedEmails = [
    'farmer@nexus.io',
    'mgowres@gmail.com',
    'yogalakshmi32008@gmail.com',
    'mugunthannabhisek@gmail.com',
    'aashif2182007@gmail.com'
  ];

  const allFarmers = await User.find({ role: 'farmer' }).lean();
  console.log('Total farmers before:', allFarmers.length);
  for (const f of allFarmers) {
    console.log(`- ${f._id}: ${f.name} (${f.email})`);
  }

  const toDelete = allFarmers.filter(f => !retainedEmails.includes(f.email.toLowerCase()));
  if (toDelete.length > 0) {
    console.log('Deleting temporary test farmers:', toDelete.map(f => f.email));
    const toDeleteIds = toDelete.map(f => f._id);
    await User.deleteMany({ _id: { $in: toDeleteIds } });
    await Product.deleteMany({ farmerId: { $in: toDeleteIds } });
    await Bargain.deleteMany({ farmerId: { $in: toDeleteIds } });
    await Order.deleteMany({ farmerId: { $in: toDeleteIds } });
  }

  // Also clean any test customers or delivery users from test runs
  await User.deleteMany({ email: /test_cust_|del_agent_/i });

  const remaining = await User.find({ role: 'farmer' }).lean();
  console.log('Remaining farmers:', remaining.length);
  for (const f of remaining) {
    console.log(`- ${f._id}: ${f.name} (${f.email})`);
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
