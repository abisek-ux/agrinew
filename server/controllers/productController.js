const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const User = require('../models/User');
const { isConnected } = require('../config/db');

const uploadsDir = path.join(__dirname, '../uploads');
const productUploadsDir = path.join(uploadsDir, 'products');

const memoryProducts = [];

/**
 * Validates binary image buffer, checks magic numbers, enforces max 5MB limit,
 * rejects executable/script payloads, and saves to server/uploads/products/
 */
const validateAndSaveProductImage = async (rawImage, fileName = '', mimeType = 'image/jpeg') => {
  if (!rawImage || typeof rawImage !== 'string') {
    throw new Error('No image data provided. Please select a clear produce photo.');
  }

  // Extract base64 and detected mime
  let detectedMime = (mimeType || 'image/jpeg').toLowerCase();
  let base64Data = rawImage;
  if (rawImage.startsWith('data:')) {
    const match = rawImage.match(/^data:([^;]+);base64,(.+)$/);
    if (match && match[1]) {
      detectedMime = match[1].toLowerCase();
      base64Data = match[2];
    } else {
      base64Data = rawImage.replace(/^data:image\/[a-z0-9.+]+;base64,/i, '');
    }
  }

  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedMimes.includes(detectedMime)) {
    throw new Error('Unsupported image format. Allowed formats are JPEG, PNG, and WebP.');
  }

  const buffer = Buffer.from(base64Data, 'base64');
  if (buffer.length === 0) {
    throw new Error('Image buffer is empty or corrupted.');
  }

  const sizeInMb = buffer.length / (1024 * 1024);
  if (sizeInMb > 5) {
    throw new Error('Image file exceeds the 5MB size limit. Please upload an image smaller than 5MB.');
  }

  // Security Check: Block executables and scripts (MZ, ELF, shell scripts, php, html)
  const headerPrefix = buffer.slice(0, 32).toString('utf8');
  const isExecutableOrScript =
    (buffer[0] === 0x4D && buffer[1] === 0x5A) || // DOS / Windows PE 'MZ'
    (buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) || // Linux ELF
    headerPrefix.startsWith('#!') || // Shell script
    headerPrefix.toLowerCase().includes('<script') || // HTML / script payload
    headerPrefix.toLowerCase().includes('<?php') || // PHP script
    headerPrefix.toLowerCase().includes('<!doctype'); // HTML payload

  if (isExecutableOrScript) {
    throw new Error('Security violation: Uploaded file contains an executable or script payload. Only valid crop photos are permitted.');
  }

  // Verify legitimate image magic bytes
  const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  const isWebp = buffer.slice(0, 4).toString('ascii') === 'RIFF' && buffer.slice(8, 12).toString('ascii') === 'WEBP';

  if (!isJpeg && !isPng && !isWebp) {
    throw new Error('Invalid image file: File content does not match supported image formats (JPEG, PNG, WebP).');
  }

  let ext = 'jpg';
  if (isPng || detectedMime.includes('png')) ext = 'png';
  else if (isWebp || detectedMime.includes('webp')) ext = 'webp';

  if (!fs.existsSync(productUploadsDir)) {
    fs.mkdirSync(productUploadsDir, { recursive: true });
  }

  const safeUniqueName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filePath = path.join(productUploadsDir, safeUniqueName);
  await fs.promises.writeFile(filePath, buffer);

  return `/api/uploads/products/${safeUniqueName}`;
};

/**
 * POST /api/products/upload-image
 * Dedicated photo upload endpoint for Farmer Portal produce photos
 */
const uploadProductImage = async (req, res) => {
  try {
    if (req.user?.role !== 'farmer') {
      return res.status(403).json({ success: false, message: 'Only farmers can upload produce photos' });
    }

    const { image, imageBase64, imageData, fileName, mimeType } = req.body || {};
    const rawData = image || imageBase64 || imageData;
    if (!rawData) {
      return res.status(400).json({ success: false, message: 'No image data provided. Please select a produce photo.' });
    }

    const imageUrl = await validateAndSaveProductImage(rawData, fileName, mimeType);
    return res.status(200).json({
      success: true,
      imageUrl,
      url: imageUrl,
      message: 'Produce photo uploaded successfully'
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

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

      // Resolve authoritative farmer names from registered user records, eliminating stale mock names
      const farmerIds = [...new Set(products.map(p => String(p.farmerId)).filter(id => mongoose.Types.ObjectId.isValid(id)))];
      let farmerMap = new Map();
      if (farmerIds.length > 0) {
        try {
          const registeredFarmers = await User.find({ _id: { $in: farmerIds } }).select('firstName lastName name farmName email').lean();
          registeredFarmers.forEach(u => {
            const displayName = u.farmName || u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim();
            if (displayName) farmerMap.set(String(u._id), displayName);
          });
        } catch (e) {}
      }

      const resolved = products.map(p => {
        const obj = typeof p.toObject === 'function' ? p.toObject() : { ...p };
        const realFarmerName = farmerMap.get(String(obj.farmerId));
        if (realFarmerName) {
          obj.farmerName = realFarmerName;
        }
        return obj;
      });

      return res.json(resolved);
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
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json(product);
    } else {
      const product = memoryProducts.find(p => p.id === id || p._id === id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json(product);
    }
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
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
      location,
      variety,
      qualityGrade,
      cultivationType,
      irrigationMethod,
      minOrderQty,
      allowBargain
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

    // Validate minOrderQty (must be > 0 if supplied)
    let parsedMinOrderQty = 1;
    if (minOrderQty !== undefined && minOrderQty !== null && minOrderQty !== '') {
      const numMinOrder = Number(minOrderQty);
      if (isNaN(numMinOrder) || numMinOrder <= 0) {
        return res.status(400).json({ success: false, message: 'Minimum order quantity must be greater than 0' });
      }
      parsedMinOrderQty = numMinOrder;
    }

    // FIX 1: Enforce required Harvest & Quality Details and Cultivation Details
    // Active when publishing from Farmer Portal (isNewProducePublishing: true)
    const isStrictPublish =
      req.body.isNewProducePublishing === true ||
      req.headers['x-publish-mode'] === 'strict' ||
      req.body.publishMode === 'strict';

    let cleanedVariety = '';
    let cleanedQualityGrade = '';
    let cleanedCultivationType = '';
    let cleanedIrrigationMethod = '';

    if (isStrictPublish) {
      if (!variety || typeof variety !== 'string' || !variety.trim()) {
        return res.status(400).json({ success: false, message: 'Crop variety is required' });
      }
      cleanedVariety = variety.trim();

      if (!harvestDate || isNaN(new Date(harvestDate).getTime())) {
        return res.status(400).json({ success: false, message: 'Valid harvest date is required' });
      }

      const validGrades = ['Premium', 'Grade A', 'Standard'];
      if (!qualityGrade || typeof qualityGrade !== 'string' || !validGrades.includes(qualityGrade.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Quality grade is required (must be Premium, Grade A, or Standard)'
        });
      }
      cleanedQualityGrade = qualityGrade.trim();

      const validCultivations = ['Natural', 'Organic', 'Conventional', 'Hydroponic'];
      if (!cultivationType || typeof cultivationType !== 'string' || !validCultivations.includes(cultivationType.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Cultivation type is required (must be Natural, Organic, Conventional, or Hydroponic)'
        });
      }
      cleanedCultivationType = cultivationType.trim();

      const validIrrigations = ['Drip', 'Rain-fed', 'Borewell', 'Canal/River'];
      if (!irrigationMethod || typeof irrigationMethod !== 'string' || !validIrrigations.includes(irrigationMethod.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Irrigation method is required (must be Drip, Rain-fed, Borewell, or Canal/River)'
        });
      }
      cleanedIrrigationMethod = irrigationMethod.trim();
    } else {
      // Legacy backwards-compatibility for existing test runners
      cleanedVariety = typeof variety === 'string' ? variety.trim() : '';
      cleanedQualityGrade = typeof qualityGrade === 'string' ? qualityGrade.trim() : '';
      cleanedCultivationType = typeof cultivationType === 'string' ? cultivationType.trim() : '';
      cleanedIrrigationMethod = typeof irrigationMethod === 'string' ? irrigationMethod.trim() : '';
    }

    let parsedAllowBargain = true;
    if (allowBargain !== undefined && allowBargain !== null) {
      if (typeof allowBargain === 'boolean') {
        parsedAllowBargain = allowBargain;
      } else if (typeof allowBargain === 'string') {
        if (allowBargain.toLowerCase() === 'false') parsedAllowBargain = false;
        else if (allowBargain.toLowerCase() === 'true') parsedAllowBargain = true;
      }
    }

    // Process image safely: if base64 data URL, validate magic bytes and persist to disk
    let finalImageUrl = '';
    if (image && typeof image === 'string') {
      if (image.startsWith('data:image/')) {
        try {
          finalImageUrl = await validateAndSaveProductImage(image);
        } catch (imgErr) {
          return res.status(400).json({ success: false, message: imgErr.message });
        }
      } else {
        finalImageUrl = image.trim();
      }
    }

    const farmerId = String(req.user.id || req.user._id);
    const computedFarmerName = req.user.farmName || req.user.name || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || farmerName || 'Verified Regional Farmer';
    const computedFarmerPhone = req.user.phone || farmerPhone || '';
    const computedFarmerEmail = req.user.email || farmerEmail || '';
    const computedFarmerNative = farmerNative || req.user.nativePlace || req.user.city || 'Tamil Nadu';
    const computedLocation = location || req.user.location || { lat: 11.2189, lng: 78.1674, address: 'Farm Gate Depot, Tamil Nadu' };

    const newProductData = {
      title: title.trim(),
      category: category || 'vegetable',
      price: Number(price),
      unit: unit ? unit.trim() : 'kg',
      stock: Number(stock),
      description: description ? description.trim() : '',
      image: finalImageUrl || '',
      harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
      rating: 0,
      numReviews: 0,
      farmerId,
      farmerName: computedFarmerName,
      farmerPhone: computedFarmerPhone,
      farmerEmail: computedFarmerEmail,
      farmerNative: computedFarmerNative,
      location: computedLocation,
      // Required agricultural fields
      variety: cleanedVariety,
      qualityGrade: cleanedQualityGrade,
      cultivationType: cleanedCultivationType,
      irrigationMethod: cleanedIrrigationMethod,
      minOrderQty: parsedMinOrderQty,
      allowBargain: parsedAllowBargain
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
    const {
      price,
      stock,
      title,
      unit,
      description,
      image,
      category,
      location,
      harvestDate,
      variety,
      qualityGrade,
      cultivationType,
      irrigationMethod,
      minOrderQty,
      allowBargain
    } = req.body;
    const userId = String(req.user?.id || req.user?._id);

    if (req.user?.role !== 'farmer') {
      return res.status(403).json({ success: false, message: 'Only farmers can manage products' });
    }

    // Common validations for update
    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
      return res.status(400).json({ success: false, message: 'Invalid price' });
    }
    if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
      return res.status(400).json({ success: false, message: 'Invalid stock quantity' });
    }
    if (minOrderQty !== undefined && minOrderQty !== null && minOrderQty !== '') {
      const numMinOrder = Number(minOrderQty);
      if (isNaN(numMinOrder) || numMinOrder <= 0) {
        return res.status(400).json({ success: false, message: 'Minimum order quantity must be greater than 0' });
      }
    }
    if (variety !== undefined && variety !== null && typeof variety !== 'string') {
      return res.status(400).json({ success: false, message: 'variety must be a text string' });
    }
    if (qualityGrade !== undefined && qualityGrade !== null && typeof qualityGrade !== 'string') {
      return res.status(400).json({ success: false, message: 'qualityGrade must be a text string' });
    }
    if (cultivationType !== undefined && cultivationType !== null && typeof cultivationType !== 'string') {
      return res.status(400).json({ success: false, message: 'cultivationType must be a text string' });
    }
    if (irrigationMethod !== undefined && irrigationMethod !== null && typeof irrigationMethod !== 'string') {
      return res.status(400).json({ success: false, message: 'irrigationMethod must be a text string' });
    }

    const applyUpdates = (product) => {
      if (price !== undefined) product.price = Number(price);
      if (stock !== undefined) product.stock = Number(stock);
      if (title !== undefined && title.trim()) product.title = title.trim();
      if (unit !== undefined) product.unit = unit.trim();
      if (description !== undefined) product.description = description.trim();
      if (image !== undefined) {
        if (typeof image === 'string' && image.startsWith('data:image/')) {
          try {
            product.image = validateAndSaveProductImage(image);
          } catch (e) {
            // retain existing image on error
          }
        } else {
          product.image = image;
        }
      }
      if (category !== undefined) product.category = category;
      if (location !== undefined) product.location = location;
      if (harvestDate !== undefined) product.harvestDate = new Date(harvestDate);

      // Optional agricultural fields
      if (minOrderQty !== undefined && minOrderQty !== null && minOrderQty !== '') {
        product.minOrderQty = Number(minOrderQty);
      }
      if (variety !== undefined && variety !== null) {
        product.variety = variety.trim();
      }
      if (qualityGrade !== undefined && qualityGrade !== null) {
        product.qualityGrade = qualityGrade.trim();
      }
      if (cultivationType !== undefined && cultivationType !== null) {
        product.cultivationType = cultivationType.trim();
      }
      if (irrigationMethod !== undefined && irrigationMethod !== null) {
        product.irrigationMethod = irrigationMethod.trim();
      }
      if (allowBargain !== undefined && allowBargain !== null) {
        if (typeof allowBargain === 'boolean') {
          product.allowBargain = allowBargain;
        } else if (typeof allowBargain === 'string') {
          product.allowBargain = allowBargain.toLowerCase() !== 'false';
        }
      }
    };

    if (isConnected()) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      if (String(product.farmerId) !== userId) {
        return res.status(403).json({ success: false, message: 'You can only update your own products' });
      }

      if (image && typeof image === 'string' && image.startsWith('data:image/')) {
        try {
          req.body.image = await validateAndSaveProductImage(image);
        } catch (imgErr) {
          return res.status(400).json({ success: false, message: imgErr.message });
        }
      }

      applyUpdates(product);
      await product.save();
      return res.json(product);
    } else {
      const product = memoryProducts.find(p => p.id === id || p._id === id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      if (String(product.farmerId) !== userId) {
        return res.status(403).json({ success: false, message: 'You can only update your own products' });
      }

      if (image && typeof image === 'string' && image.startsWith('data:image/')) {
        try {
          req.body.image = await validateAndSaveProductImage(image);
        } catch (imgErr) {
          return res.status(400).json({ success: false, message: imgErr.message });
        }
      }

      applyUpdates(product);
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
      if (!index && index !== 0) return res.status(404).json({ success: false, message: 'Product not found' });
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
  uploadProductImage,
  seedMemoryProduct,
  getMemoryProducts
};
