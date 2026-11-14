const cartModel = require('../models/cartModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');

const addToCart = async (req, res) => {
  const { productId } = req.body;
  const quantity = Number(req.body.quantity ?? 1);
  if (!mongoose.isValidObjectId(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return res.status(400).json({ message: 'Valid product and quantity (1-99) are required' });
  }
  const product = await Product.findById(productId).select('_id stock');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const existing = await cartModel.findOne({ user: req.user.id, product: productId });
  const nextQuantity = (existing?.quantity || 0) + quantity;
  if (nextQuantity > product.stock) return res.status(400).json({ message: 'Requested quantity is not available in stock' });
  const cartItem = existing
    ? await cartModel.findByIdAndUpdate(existing._id, { quantity: nextQuantity }, { new: true, runValidators: true })
    : await cartModel.create({ user: req.user.id, product: productId, quantity });
  return res.status(existing ? 200 : 201).json(cartItem);
};

const getCart = async (req, res) => {
  const cartItems = await cartModel.find({ user: req.user.id }).populate('product').sort({ createdAt: -1 }).lean();
  return res.json(cartItems.filter((item) => item.product));
};

const removeCartItem = async (req, res) => {
  const result = await cartModel.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!result) return res.status(404).json({ message: 'Cart item not found' });
  return res.json({ message: 'Item removed from cart' });
};

const updateCartItem = async (req, res) => {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return res.status(400).json({ message: 'Quantity must be between 1 and 99' });
  const item = await cartModel.findOne({ _id: req.params.id, user: req.user.id }).populate('product');
  if (!item) return res.status(404).json({ message: 'Cart item not found' });
  if (!item.product || quantity > item.product.stock) return res.status(400).json({ message: 'Requested quantity is not available in stock' });
  item.quantity = quantity;
  await item.save();
  return res.json(item);
};
module.exports = { addToCart, getCart, removeCartItem, updateCartItem };
