const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const { seedMemoryUser } = require('./controllers/authController');
const { seedMemoryProduct } = require('./controllers/productController');
const { seedMemoryOrder } = require('./controllers/orderController');
const { isConnected } = require('./config/db');

const sampleUsers = [
  {
    firstName: 'Alex',
    lastName: 'Rivers',
    email: 'alex@nexus.io',
    phone: '+15550192834',
    password: 'Password123!',
    role: 'customer',
    nativePlace: 'Bengaluru, Karnataka',
    location: { lat: 12.9716, lng: 77.5946, address: 'Bengaluru, Karnataka, India' }
  },
  {
    firstName: 'Robert',
    lastName: 'Greenfield',
    email: 'farmer@nexus.io',
    phone: '+15550199988',
    password: 'Password123!',
    role: 'farmer',
    nativePlace: 'Mandya, Karnataka',
    location: { lat: 12.5222, lng: 76.9004, address: 'Mandya Organic Farm, Karnataka, India' }
  },
  {
    firstName: 'David',
    lastName: 'Swift',
    email: 'driver@nexus.io',
    phone: '+15550197766',
    password: 'Password123!',
    role: 'delivery',
    nativePlace: 'Mysuru, Karnataka',
    location: { lat: 12.2958, lng: 76.6394, address: 'Mysuru Delivery Hub, Karnataka, India' }
  }
];

const sampleProducts = [
  {
    title: 'High-Yield Hybrid Wheat Seeds',
    category: 'seed',
    price: 185.00,
    unit: 'kg',
    stock: 500,
    description: 'Certified premium drought-resistant hybrid wheat seeds curated by Greenfield Farms.',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    farmerId: 'user_farmer',
    farmerName: 'Robert Greenfield',
    farmerPhone: '+15550199988',
    farmerEmail: 'farmer@nexus.io',
    farmerNative: 'Mandya, Karnataka',
    location: { lat: 12.5222, lng: 76.9004, address: 'Mandya Organic Farm, Karnataka, India' }
  },
  {
    title: 'Fresh Alphonso Mangoes',
    category: 'fruit',
    price: 350.00,
    unit: 'box (3kg)',
    stock: 120,
    description: 'Tree-ripened organic Alphonso mangoes with rich tropical aroma and natural sweetness.',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
    farmerId: 'user_farmer',
    farmerName: 'Robert Greenfield',
    farmerPhone: '+15550199988',
    farmerEmail: 'farmer@nexus.io',
    farmerNative: 'Mandya, Karnataka',
    location: { lat: 12.5222, lng: 76.9004, address: 'Mandya Organic Farm, Karnataka, India' }
  },
  {
    title: 'Organic Vine-Ripened Tomatoes',
    category: 'vegetable',
    price: 45.00,
    unit: 'kg',
    stock: 250,
    description: 'Crisp, juicy vine-ripened organic tomatoes grown with compost without synthetic sprays.',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    farmerId: 'user_farmer',
    farmerName: 'Robert Greenfield',
    farmerPhone: '+15550199988',
    farmerEmail: 'farmer@nexus.io',
    farmerNative: 'Mandya, Karnataka',
    location: { lat: 12.5222, lng: 76.9004, address: 'Mandya Organic Farm, Karnataka, India' }
  },
  {
    title: 'Crisp Honeycrisp Apples',
    category: 'fruit',
    price: 160.00,
    unit: 'kg',
    stock: 180,
    description: 'Hand-picked organic Honeycrisp apples, sweet and crunchy with vibrant red blush.',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    farmerId: 'user_farmer',
    farmerName: 'Robert Greenfield',
    farmerPhone: '+15550199988',
    farmerEmail: 'farmer@nexus.io',
    farmerNative: 'Mandya, Karnataka',
    location: { lat: 12.5222, lng: 76.9004, address: 'Mandya Organic Farm, Karnataka, India' }
  },
  {
    title: 'Farm-Fresh Baby Spinach',
    category: 'vegetable',
    price: 30.00,
    unit: 'bunch',
    stock: 300,
    description: 'Tender baby spinach leaves harvested early morning, packed with iron and vitamins.',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    farmerId: 'user_farmer',
    farmerName: 'Robert Greenfield',
    farmerPhone: '+15550199988',
    farmerEmail: 'farmer@nexus.io',
    farmerNative: 'Mandya, Karnataka',
    location: { lat: 12.5222, lng: 76.9004, address: 'Mandya Organic Farm, Karnataka, India' }
  },
  {
    title: 'Crunchy Orange Carrots',
    category: 'vegetable',
    price: 50.00,
    unit: 'kg',
    stock: 220,
    description: 'Sweet, earthy garden carrots freshly pulled from organic sandy loam soil.',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
    farmerId: 'user_farmer',
    farmerName: 'Robert Greenfield',
    farmerPhone: '+15550199988',
    farmerEmail: 'farmer@nexus.io',
    farmerNative: 'Mandya, Karnataka',
    location: { lat: 12.5222, lng: 76.9004, address: 'Mandya Organic Farm, Karnataka, India' }
  },
  {
    title: 'Fresh Sweet Strawberries',
    category: 'fruit',
    price: 120.00,
    unit: 'pack',
    stock: 90,
    description: 'Bright red luscious strawberries with irresistible aroma and orchard freshness.',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80',
    farmerId: 'user_farmer',
    farmerName: 'Robert Greenfield',
    farmerPhone: '+15550199988',
    farmerEmail: 'farmer@nexus.io',
    farmerNative: 'Mandya, Karnataka',
    location: { lat: 12.5222, lng: 76.9004, address: 'Mandya Organic Farm, Karnataka, India' }
  },
  {
    title: 'Organic Tri-Color Bell Peppers',
    category: 'vegetable',
    price: 80.00,
    unit: 'kg',
    stock: 140,
    description: 'Vibrant red, yellow, and green bell peppers bursting with crisp freshness.',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
    farmerId: 'user_farmer',
    farmerName: 'Robert Greenfield',
    farmerPhone: '+15550199988',
    farmerEmail: 'farmer@nexus.io',
    farmerNative: 'Mandya, Karnataka',
    location: { lat: 12.5222, lng: 76.9004, address: 'Mandya Organic Farm, Karnataka, India' }
  },
  {
    title: 'Golden Basmati Rice Paddy',
    category: 'seed',
    price: 240.00,
    unit: 'bag (10kg)',
    stock: 350,
    description: 'Extra-long grain aromatic basmati seed crop harvested from rich alluvial basins.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    farmerId: 'user_farmer',
    farmerName: 'Robert Greenfield',
    farmerPhone: '+15550199988',
    farmerEmail: 'farmer@nexus.io',
    farmerNative: 'Mandya, Karnataka',
    location: { lat: 12.5222, lng: 76.9004, address: 'Mandya Organic Farm, Karnataka, India' }
  },
  {
    title: 'Certified Organic Sunflower Seeds',
    category: 'seed',
    price: 95.00,
    unit: 'pack',
    stock: 160,
    description: 'High-germination black oil sunflower seeds ideal for microgreens and pressing.',
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
    farmerId: 'user_farmer',
    farmerName: 'Robert Greenfield',
    farmerPhone: '+15550199988',
    farmerEmail: 'farmer@nexus.io',
    farmerNative: 'Mandya, Karnataka',
    location: { lat: 12.5222, lng: 76.9004, address: 'Mandya Organic Farm, Karnataka, India' }
  }
];

const seedDB = async () => {
  sampleUsers.forEach(u => seedMemoryUser({ id: 'user_' + u.role, _id: 'user_' + u.role, ...u }));
  sampleProducts.forEach((p, idx) => {
    const prodId = 'prod_' + (idx + 1);
    seedMemoryProduct({ id: prodId, _id: prodId, ...p, createdAt: new Date() });
  });

  seedMemoryOrder({
    id: 'ord_demo_1',
    _id: 'ord_demo_1',
    orderId: 'ORD-982145',
    customerId: 'user_customer',
    customerName: 'Alex Rivers',
    customerPhone: '+15550192834',
    customerEmail: 'alex@nexus.io',
    customerLocation: { lat: 12.9716, lng: 77.5946, address: 'Bengaluru, Karnataka, India' },
    farmerId: 'user_farmer',
    farmerName: 'Robert Greenfield',
    farmerPhone: '+15550199988',
    farmerEmail: 'farmer@nexus.io',
    farmerLocation: { lat: 12.5222, lng: 76.9004, address: 'Mandya Organic Farm, Karnataka, India' },
    deliveryId: 'user_delivery',
    deliveryName: 'David Swift',
    deliveryPhone: '+15550197766',
    deliveryEmail: 'driver@nexus.io',
    deliveryLocation: { lat: 12.2958, lng: 76.6394, address: 'Mysuru, Karnataka, India' },
    items: [{ productId: 'prod_1', title: 'High-Yield Hybrid Wheat Seeds', price: 185.00, quantity: 2, unit: 'kg' }],
    totalAmount: 370.00,
    status: 'in_transit',
    createdAt: new Date()
  });

  console.log('InMemory Database Seeded with 10+ Attractive Farm Produce Items!');

  if (isConnected()) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        let usersToSeed = [...sampleUsers];
        try {
          const fs = require('fs');
          const path = require('path');
          const jsonUsers = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/users.json'), 'utf8'));
          if (Array.isArray(jsonUsers) && jsonUsers.length > 0) {
            usersToSeed = jsonUsers.map(u => ({
              firstName: u.firstName,
              lastName: u.lastName,
              email: u.email,
              phone: u.phone,
              password: u.password,
              role: u.role || 'customer',
              nativePlace: u.nativePlace || 'Bengaluru, Karnataka',
              location: u.location || { lat: 12.9716, lng: 77.5946, address: 'Bengaluru, Karnataka, India' },
            }));
          }
        } catch (e) {
          console.warn('Could not load users.json:', e.message);
        }

        for (const u of usersToSeed) {
          const exists = await User.findOne({ $or: [{ email: u.email }, { phone: u.phone }] });
          if (!exists) {
            await User.create(u);
          }
        }
        console.log(`✅ MongoDB Atlas Seeded with Users!`);
      }

      const prodCount = await Product.countDocuments();
      const farmer = await User.findOne({ email: 'farmer@nexus.io' }).select('_id');
      const seededProducts = farmer
        ? sampleProducts.map((product) => ({ ...product, farmerId: String(farmer._id) }))
        : sampleProducts;

      if (farmer && prodCount > 0) {
        await Product.updateMany(
          { farmerId: 'user_farmer', farmerEmail: 'farmer@nexus.io' },
          { $set: { farmerId: String(farmer._id) } }
        );
      }

      if (prodCount === 0) {
        await Product.insertMany(seededProducts);
        console.log('✅ MongoDB Atlas Seeded with 10+ Products!');
      }
    } catch (err) {
      console.warn('MongoDB Atlas Seeding notice:', err.message);
    }
  }
};

if (require.main === module) {
  const { connectDB } = require('./config/db');
  connectDB().then(() => seedDB()).then(() => process.exit());
}
module.exports = { seedDB };
