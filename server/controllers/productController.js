const Product = require('../models/Product');
const { isConnected } = require('../config/db');

const memoryProducts = [];

const getProducts = async (req, res) => {
  try {
    const { category, farmerId } = req.query;
    let query = {};
    if (category && typeof category === 'string' && category !== 'all') query.category = category;
    if (farmerId && typeof farmerId === 'string') query.farmerId = farmerId;

    if (isConnected()) {
      const products = await Product.find(query).sort({ createdAt: -1 });
      return res.json(products);
    } else {
      let filtered = [...memoryProducts];
      if (category && typeof category === 'string' && category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
      }
      if (farmerId && typeof farmerId === 'string') {
        filtered = filtered.filter(p => String(p.farmerId) === String(farmerId));
      }
      return res.json(filtered.reverse());
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addProduct = async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Only farmers can add products' });
    }

    const { title, category, price, unit, stock, description, image, farmerName, farmerPhone, farmerEmail, farmerNative, location } = req.body;
    const farmerId = req.user.id || req.user._id || 'farmer_1';

    const computedFarmerName = farmerName || `${req.user.firstName || 'Robert'} ${req.user.lastName || 'Greenfield'}`.trim();
    const computedFarmerPhone = farmerPhone || req.user.phone || '+15550199988';
    const computedFarmerEmail = farmerEmail || req.user.email || 'farmer@nexus.io';
    const computedFarmerNative = farmerNative || req.user.nativePlace || 'Mandya, Karnataka';
    const computedLocation = location || req.user.location || { lat: 12.5222, lng: 76.9004, address: 'Mandya Organic Farm, Karnataka, India' };

    const newProductData = {
      title: title || 'Fresh Harvest Item',
      category: category || 'seed',
      price: Number(price) || 0,
      unit: unit || 'kg',
      stock: Number(stock) || 100,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b',
      farmerId: String(farmerId),
      farmerName: computedFarmerName,
      farmerPhone: computedFarmerPhone,
      farmerEmail: computedFarmerEmail,
      farmerNative: computedFarmerNative,
      location: computedLocation
    };

    if (isConnected()) {
      const product = await Product.create(newProductData);
      return res.status(201).json(product);
    } else {
      const prodId = 'prod_' + Date.now();
      const product = { id: prodId, _id: prodId, ...newProductData, createdAt: new Date() };
      memoryProducts.push(product);
      return res.status(201).json(product);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, stock, title, unit, description, image, category, location } = req.body;
    const userId = String(req.user.id || req.user._id);

    if (isConnected()) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      if (req.user.role !== 'farmer' || String(product.farmerId) !== userId) {
        return res.status(403).json({ message: 'You can only update your own products' });
      }

      if (price !== undefined) product.price = Number(price);
      if (stock !== undefined) product.stock = Number(stock);
      if (title !== undefined) product.title = title;
      if (unit !== undefined) product.unit = unit;
      if (description !== undefined) product.description = description;
      if (image !== undefined) product.image = image;
      if (category !== undefined) product.category = category;
      if (location !== undefined) product.location = location;

      await product.save();
      return res.json(product);
    } else {
      const product = memoryProducts.find(p => p.id === id || p._id === id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      if (req.user.role !== 'farmer' || String(product.farmerId) !== userId) {
        return res.status(403).json({ message: 'You can only update your own products' });
      }

      if (price !== undefined) product.price = Number(price);
      if (stock !== undefined) product.stock = Number(stock);
      if (title !== undefined) product.title = title;
      if (unit !== undefined) product.unit = unit;
      if (description !== undefined) product.description = description;
      if (image !== undefined) product.image = image;
      if (category !== undefined) product.category = category;
      if (location !== undefined) product.location = location;

      return res.json(product);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = String(req.user.id || req.user._id);

    if (isConnected()) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      if (req.user.role !== 'farmer' || String(product.farmerId) !== userId) {
        return res.status(403).json({ message: 'You can only delete your own products' });
      }
      await Product.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Product deleted successfully' });
    } else {
      const index = memoryProducts.findIndex(p => p.id === id || p._id === id);
      if (index === -1) return res.status(404).json({ message: 'Product not found' });
      const product = memoryProducts[index];
      if (req.user.role !== 'farmer' || String(product.farmerId) !== userId) {
        return res.status(403).json({ message: 'You can only delete your own products' });
      }
      memoryProducts.splice(index, 1);
      return res.json({ success: true, message: 'Product deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const seedMemoryProduct = (prod) => memoryProducts.push(prod);

module.exports = { getProducts, addProduct, updateProduct, deleteProduct, seedMemoryProduct };
