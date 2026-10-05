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
    firstName: 'gowres',
    lastName: 'ms',
    name: 'gowres',
    email: 'mgowres@gmail.com',
    phone: '9952712633',
    password: 'Password123!',
    role: 'farmer',
    nativePlace: 'Namakkal, Tamil Nadu',
    location: { lat: 11.2189, lng: 78.1674, address: 'AgriLink Agro Farm Gate, Mohanur Road, Namakkal, Tamil Nadu 637001, India', placeName: 'Namakkal, Tamil Nadu' }
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
    description: 'Certified premium drought-resistant hybrid wheat seeds curated by Namakkal Agro Farms.',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    farmerId: 'user_farmer',
    farmerName: 'gowres (Namakkal Farmer)',
    farmerPhone: '9952712633',
    farmerEmail: 'mgowres@gmail.com',
    farmerNative: 'Namakkal, Tamil Nadu',
    location: { lat: 11.2189, lng: 78.1674, address: 'AgriLink Agro Farm Gate, Mohanur Road, Namakkal, Tamil Nadu 637001, India', placeName: 'Namakkal, Tamil Nadu' }
  },
  {
    title: 'Fresh Alphonso Mangoes',
    category: 'fruit',
    price: 350.00,
    unit: 'box (3kg)',
    stock: 120,
    description: 'Tree-ripened organic Salem mangoes with rich tropical aroma and natural sweetness.',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
    farmerId: 'user_farmer',
    farmerName: 'Selvam P (Salem Orchard)',
    farmerPhone: '9952712633',
    farmerEmail: 'mgowres@gmail.com',
    farmerNative: 'Salem, Tamil Nadu',
    location: { lat: 11.6643, lng: 78.1460, address: 'AgriLink Organic Orchard Depot, Omalur Main Road, Salem, Tamil Nadu 636004, India', placeName: 'Salem, Tamil Nadu' }
  },
  {
    title: 'Organic Vine-Ripened Tomatoes',
    category: 'vegetable',
    price: 45.00,
    unit: 'kg',
    stock: 250,
    description: 'Crisp, juicy vine-ripened organic tomatoes grown in Coimbatore delta without synthetic sprays.',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    farmerId: 'user_farmer',
    farmerName: 'Kandasamy R (Coimbatore Agro)',
    farmerPhone: '9952712633',
    farmerEmail: 'mgowres@gmail.com',
    farmerNative: 'Coimbatore, Tamil Nadu',
    location: { lat: 11.0168, lng: 76.9558, address: 'AgriLink Regional Farm Hub, Pollachi Highway, Coimbatore, Tamil Nadu 641021, India', placeName: 'Coimbatore, Tamil Nadu' }
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
    farmerName: 'gowres (Namakkal Farmer)',
    farmerPhone: '9952712633',
    farmerEmail: 'mgowres@gmail.com',
    farmerNative: 'Namakkal, Tamil Nadu',
    location: { lat: 11.2189, lng: 78.1674, address: 'AgriLink Agro Farm Gate, Mohanur Road, Namakkal, Tamil Nadu 637001, India', placeName: 'Namakkal, Tamil Nadu' }
  },
  {
    title: 'Farm-Fresh Baby Spinach',
    category: 'vegetable',
    price: 30.00,
    unit: 'bunch',
    stock: 300,
    description: 'Tender baby spinach leaves harvested early morning in Salem, packed with iron and vitamins.',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    farmerId: 'user_farmer',
    farmerName: 'Selvam P (Salem Orchard)',
    farmerPhone: '9952712633',
    farmerEmail: 'mgowres@gmail.com',
    farmerNative: 'Salem, Tamil Nadu',
    location: { lat: 11.6643, lng: 78.1460, address: 'AgriLink Organic Orchard Depot, Omalur Main Road, Salem, Tamil Nadu 636004, India', placeName: 'Salem, Tamil Nadu' }
  },
  {
    title: 'Crunchy Orange Carrots',
    category: 'vegetable',
    price: 50.00,
    unit: 'kg',
    stock: 220,
    description: 'Sweet, earthy garden carrots freshly pulled from organic Coimbatore loam soil.',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
    farmerId: 'user_farmer',
    farmerName: 'Kandasamy R (Coimbatore Agro)',
    farmerPhone: '9952712633',
    farmerEmail: 'mgowres@gmail.com',
    farmerNative: 'Coimbatore, Tamil Nadu',
    location: { lat: 11.0168, lng: 76.9558, address: 'AgriLink Regional Farm Hub, Pollachi Highway, Coimbatore, Tamil Nadu 641021, India', placeName: 'Coimbatore, Tamil Nadu' }
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
    farmerName: 'gowres (Namakkal Farmer)',
    farmerPhone: '9952712633',
    farmerEmail: 'mgowres@gmail.com',
    farmerNative: 'Namakkal, Tamil Nadu',
    location: { lat: 11.2189, lng: 78.1674, address: 'AgriLink Agro Farm Gate, Mohanur Road, Namakkal, Tamil Nadu 637001, India', placeName: 'Namakkal, Tamil Nadu' }
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
    farmerName: 'Selvam P (Salem Orchard)',
    farmerPhone: '9952712633',
    farmerEmail: 'mgowres@gmail.com',
    farmerNative: 'Salem, Tamil Nadu',
    location: { lat: 11.6643, lng: 78.1460, address: 'AgriLink Organic Orchard Depot, Omalur Main Road, Salem, Tamil Nadu 636004, India', placeName: 'Salem, Tamil Nadu' }
  },
  {
    title: 'Golden Basmati Rice Paddy',
    category: 'seed',
    price: 240.00,
    unit: 'bag (10kg)',
    stock: 350,
    description: 'Extra-long grain aromatic basmati seed crop harvested from Coimbatore delta basins.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    farmerId: 'user_farmer',
    farmerName: 'Kandasamy R (Coimbatore Agro)',
    farmerPhone: '9952712633',
    farmerEmail: 'mgowres@gmail.com',
    farmerNative: 'Coimbatore, Tamil Nadu',
    location: { lat: 11.0168, lng: 76.9558, address: 'AgriLink Regional Farm Hub, Pollachi Highway, Coimbatore, Tamil Nadu 641021, India', placeName: 'Coimbatore, Tamil Nadu' }
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
    farmerName: 'gowres (Namakkal Farmer)',
    farmerPhone: '9952712633',
    farmerEmail: 'mgowres@gmail.com',
    farmerNative: 'Namakkal, Tamil Nadu',
    location: { lat: 11.2189, lng: 78.1674, address: 'AgriLink Agro Farm Gate, Mohanur Road, Namakkal, Tamil Nadu 637001, India', placeName: 'Namakkal, Tamil Nadu' }
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
    customerLocation: { lat: 11.0168, lng: 76.9558, address: 'RS Puram, Coimbatore, Tamil Nadu, India' },
    farmerId: 'user_farmer',
    farmerName: 'gowres (Namakkal Farmer)',
    farmerPhone: '9952712633',
    farmerEmail: 'mgowres@gmail.com',
    farmerLocation: { lat: 11.2189, lng: 78.1674, address: 'AgriLink Agro Farm Gate, Mohanur Road, Namakkal, Tamil Nadu 637001, India', placeName: 'Namakkal, Tamil Nadu' },
    farmerGpsLink: 'https://www.google.com/maps?q=11.2189,78.1674',
    gpsTrackingLink: 'https://www.google.com/maps/dir/?api=1&origin=11.2189,78.1674&destination=11.0168,76.9558',
    deliveryId: 'user_delivery',
    deliveryName: 'David Swift',
    deliveryPhone: '+15550197766',
    deliveryEmail: 'driver@nexus.io',
    deliveryLocation: { lat: 11.3500, lng: 77.8000, address: 'En Route to Namakkal Hub, Tamil Nadu' },
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
      const farmer = await User.findOne({ email: 'mgowres@gmail.com' }).select('_id');
      const seededProducts = farmer
        ? sampleProducts.map((product) => ({ ...product, farmerId: String(farmer._id) }))
        : sampleProducts;

      if (farmer && prodCount > 0) {
        await Product.updateMany(
          { farmerId: 'user_farmer', farmerEmail: 'mgowres@gmail.com' },
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
