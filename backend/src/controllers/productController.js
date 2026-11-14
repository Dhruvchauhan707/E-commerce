const productModel = require('../models/productModel');
const mongoose = require('mongoose');
const imagekit = require('../config/imagekit');

const uploadImage = async (file) => {
  if (!file) return undefined;
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
    const error = new Error('Only image files are allowed'); error.status = 400; throw error;
  }
  const uploaded = await imagekit.upload({ file: file.buffer, fileName: `${Date.now()}-${file.originalname}` });
  return uploaded.url;
};
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const addProductController = async (req, res) => {
  const { name, description, price, category, stock } = req.body;
  if (!String(name || '').trim() || !String(description || '').trim() || !mongoose.isValidObjectId(category) || !req.file) {
    return res.status(400).json({ message: 'Name, description, valid category and product image are required' });
  }
  const parsedPrice = Number(price); const parsedStock = Number(stock);
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0 || !Number.isInteger(parsedStock) || parsedStock < 0) {
    return res.status(400).json({ message: 'Price and stock must be valid non-negative numbers' });
  }
  const image = await uploadImage(req.file);
  const product = await productModel.create({ name: name.trim(), description: description.trim(), price: parsedPrice, category, stock: parsedStock, image, user: req.user.id });
  return res.status(201).json({ message: 'Product created successfully', newProduct: product });
};

const getAllProductsController = async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 24));
  const [products, total] = await Promise.all([
    productModel.find().select('-__v').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    productModel.countDocuments(),
  ]);
  return res.json({ products, total, page, pages: Math.ceil(total / limit) });
};

const getProductByIdController = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid product id' });
  const product = await productModel.findById(req.params.id).populate('category').lean();
  if (!product) return res.status(404).json({ message: 'Product not found' });
  return res.json(product);
};

const updateProductController = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid product id' });
  const updates = {};
  for (const key of ['name', 'description']) if (req.body[key] !== undefined) updates[key] = String(req.body[key]).trim();
  for (const key of ['price', 'stock']) if (req.body[key] !== undefined) {
    const value = Number(req.body[key]);
    if (!Number.isFinite(value) || value < 0 || (key === 'stock' && !Number.isInteger(value))) return res.status(400).json({ message: `Invalid ${key}` });
    updates[key] = value;
  }
  if (req.body.category !== undefined) {
    if (!mongoose.isValidObjectId(req.body.category)) return res.status(400).json({ message: 'Invalid category' });
    updates.category = req.body.category;
  }
  if (req.file) updates.image = await uploadImage(req.file);
  const product = await productModel.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  return res.json(product);
};

const deleteProductController = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid product id' });
  const product = await productModel.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  return res.json({ message: 'Product deleted successfully' });
};

const buildProductQuery = (query) => {
  const filter = {};
  if (query.category && query.category !== 'All' && query.category !== 'all') {
    if (!mongoose.isValidObjectId(query.category)) { const error = new Error('Invalid category'); error.status = 400; throw error; }
    filter.category = query.category;
  }
  if (query.search) filter.name = { $regex: escapeRegex(String(query.search).slice(0, 80)), $options: 'i' };
  if (query.price !== undefined && query.price !== '') {
    const price = Number(query.price);
    if (!Number.isFinite(price) || price < 0) { const error = new Error('Invalid price filter'); error.status = 400; throw error; }
    filter.price = { $lte: price };
  }
  return filter;
};

const filterProducts = async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 24));
  const query = buildProductQuery(req.query);
  const [products, total] = await Promise.all([
    productModel.find(query).populate('category').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    productModel.countDocuments(query),
  ]);
  return res.json({ products, total, page, pages: Math.ceil(total / limit) });
};

const getLatestProducts = async (_req, res) => {
  const products = await productModel.find().sort({ createdAt: -1 }).limit(10).lean();
  return res.json(products);
};
module.exports = { addProductController, getAllProductsController, getProductByIdController, filterProducts, updateProductController, deleteProductController, getLatestProducts };
