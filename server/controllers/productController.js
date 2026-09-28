const Product = require('../models/Product');
const { isConnected } = require('../config/db');

const memoryProducts = [];

const getProducts = async (req, res) => {
  try {
    const { category, farmerId, search, sortBy, minPrice, maxPrice, inStock } = req.query;

    if (isConnected()) {
      let query = {};
      if (category && typeof category === 'string' && category !== 'all') {
        query.category = category;
      }
      if (farmerId && typeof farmerId === 'string' && farmerId !== 'all') {
        query.farmerId = farmerId;
      }
      if (minPrice !== undefined && minPrice !== '' && !isNaN(Number(minPrice))) {
        query.price = { ...(query.price || {}), $gte: Number(minPrice) };
      }
      if (maxPrice !== undefined && maxPrice !== '' && !isNaN(Number(maxPrice))) {
        query.price = { ...(query.price || {}), $lte: Number(maxPrice) };
      }
      if (inStock === 'true' || inStock === true) {
        query.stock = { $gt: 0 };
      }
      if (search && typeof search === 'string' && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { title: regex },
          { description: regex },
          { farmerName: regex },
          { 'location.address': regex }
        ];
      }

      let sortOptions = { createdAt: -1 };
      if (sortBy === 'price-low') sortOptions = { price: 1 };
      else if (sortBy === 'price-high') sortOptions = { price: -1 };
      else if (sortBy === 'title') sortOptions = { title: 1 };
      else if (sortBy === 'rating') sortOptions = { rating: -1, numReviews: -1 };

      const products = await Product.find(query).sort(sortOptions);
      return res.json(products);
    } else {
      let filtered = [...memoryProducts];
      if (category && typeof category === 'string' && category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
      }
      if (farmerId && typeof farmerId === 'string' && farmerId !== 'all') {
        filtered = filtered.filter(p => String(p.farmerId) === String(farmerId));
      }
      if (minPrice !== undefined && minPrice !== '' && !isNaN(Number(minPrice))) {
        filtered = filtered.filter(p => Number(p.price) >= Number(minPrice));
      }
      if (maxPrice !== undefined && maxPrice !== '' && !isNaN(Number(maxPrice))) {
        filtered = filtered.filter(p => Number(p.price) <= Number(maxPrice));
      }
      if (inStock === 'true' || inStock === true) {
        filtered = filtered.filter(p => Number(p.stock) > 0);
      }
      if (search && typeof search === 'string' && search.trim()) {
        const s = search.trim().toLowerCase();
        filtered = filtered.filter(p =>
          (p.title && p.title.toLowerCase().includes(s)) ||
          (p.description && p.description.toLowerCase().includes(s)) ||
          (p.farmerName && p.farmerName.toLowerCase().includes(s)) ||
          (p.location?.address && p.location.address.toLowerCase().includes(s))
        );
      }

      if (sortBy === 'price-low') filtered.sort((a, b) => Number(a.price) - Number(b.price));
      else if (sortBy === 'price-high') filtered.sort((a, b) => Number(b.price) - Number(a.price));
      else if (sortBy === 'title') filtered.sort((a, b) => a.title.localeCompare(b.title));
      else if (sortBy === 'rating') filtered.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
      else filtered.reverse();

      return res.json(filtered);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isConnected()) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json(product);
    } else {
      const product = memoryProducts.find(p => p.id === id || p._id === id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json(product);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addProduct = async (req, res) => {
  try {
    if (req.user?.role !== 'farmer') {
      return res.status(403).json({ success: false, message: 'Only farmers can add products' });
    }

    const {
      title,
      category,
      price,
      unit,
      stock,
      description,
      image,
      harvestDate,
      farmerName,
      farmerPhone,
      farmerEmail,
      farmerNative,
      location
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Product title is required' });
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: 'A valid non-negative price is required' });
    }
    if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ success: false, message: 'A valid non-negative available quantity (stock) is required' });
    }

    const farmerId = String(req.user.id || req.user._id || 'farmer_1');
    const computedFarmerName = farmerName || `${req.user.firstName || 'Robert'} ${req.user.lastName || 'Greenfield'}`.trim();
    const computedFarmerPhone = farmerPhone || req.user.phone || '+919842155678';
    const computedFarmerEmail = farmerEmail || req.user.email || 'farmer@nexus.io';
    const computedFarmerNative = farmerNative || req.user.nativePlace || 'Mandya, Karnataka';
    const computedLocation = location || req.user.location || { lat: 12.5222, lng: 76.9004, address: 'Mandya Organic Farm, Karnataka, India' };

    const newProductData = {
      title: title.trim(),
      category: category || 'vegetable',
      price: Number(price),
      unit: unit ? unit.trim() : 'kg',
      stock: Number(stock),
      description: description ? description.trim() : '',
      image: image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b',
      harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
      rating: 0,
      numReviews: 0,
      farmerId,
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
      const prodId = 'prod_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      const product = { id: prodId, _id: prodId, ...newProductData, createdAt: new Date() };
      memoryProducts.push(product);
      return res.status(201).json(product);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, stock, title, unit, description, image, category, location, harvestDate } = req.body;
    const userId = String(req.user?.id || req.user?._id);

    if (req.user?.role !== 'farmer') {
      return res.status(403).json({ success: false, message: 'Only farmers can manage products' });
    }

    if (isConnected()) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      if (String(product.farmerId) !== userId) {
        return res.status(403).json({ success: false, message: 'You can only update your own products' });
      }

      if (price !== undefined) {
        if (isNaN(Number(price)) || Number(price) < 0) return res.status(400).json({ success: false, message: 'Invalid price' });
        product.price = Number(price);
      }
      if (stock !== undefined) {
        if (isNaN(Number(stock)) || Number(stock) < 0) return res.status(400).json({ success: false, message: 'Invalid stock quantity' });
        product.stock = Number(stock);
      }
      if (title !== undefined && title.trim()) product.title = title.trim();
      if (unit !== undefined) product.unit = unit.trim();
      if (description !== undefined) product.description = description.trim();
      if (image !== undefined) product.image = image;
      if (category !== undefined) product.category = category;
      if (location !== undefined) product.location = location;
      if (harvestDate !== undefined) product.harvestDate = new Date(harvestDate);

      await product.save();
      return res.json(product);
    } else {
      const product = memoryProducts.find(p => p.id === id || p._id === id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      if (String(product.farmerId) !== userId) {
        return res.status(403).json({ success: false, message: 'You can only update your own products' });
      }

      if (price !== undefined) {
        if (isNaN(Number(price)) || Number(price) < 0) return res.status(400).json({ success: false, message: 'Invalid price' });
        product.price = Number(price);
      }
      if (stock !== undefined) {
        if (isNaN(Number(stock)) || Number(stock) < 0) return res.status(400).json({ success: false, message: 'Invalid stock quantity' });
        product.stock = Number(stock);
      }
      if (title !== undefined && title.trim()) product.title = title.trim();
      if (unit !== undefined) product.unit = unit.trim();
      if (description !== undefined) product.description = description.trim();
      if (image !== undefined) product.image = image;
      if (category !== undefined) product.category = category;
      if (location !== undefined) product.location = location;
      if (harvestDate !== undefined) product.harvestDate = new Date(harvestDate);

      return res.json(product);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = String(req.user?.id || req.user?._id);

    if (req.user?.role !== 'farmer') {
      return res.status(403).json({ success: false, message: 'Only farmers can delete products' });
    }

    if (isConnected()) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      if (String(product.farmerId) !== userId) {
        return res.status(403).json({ success: false, message: 'You can only delete your own products' });
      }
      await Product.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Product deleted successfully' });
    } else {
      const index = memoryProducts.findIndex(p => p.id === id || p._id === id);
      if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });
      const product = memoryProducts[index];
      if (String(product.farmerId) !== userId) {
        return res.status(403).json({ success: false, message: 'You can only delete your own products' });
      }
      memoryProducts.splice(index, 1);
      return res.json({ success: true, message: 'Product deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const seedMemoryProduct = (prod) => memoryProducts.push(prod);
const getMemoryProducts = () => memoryProducts;

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  seedMemoryProduct,
  getMemoryProducts
};
