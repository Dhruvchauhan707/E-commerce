const orderModel = require('../models/orderModel');
const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const mongoose = require('mongoose');

const placeOrder = async (req, res) => {

  const { shippingAddress, paymentMethod } = req.body;

  if (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.postalCode || !shippingAddress?.country) {
    return res.status(400).json({ message: 'Complete shipping address is required' });
  }

  if (!['cod', 'upi', 'card'].includes(String(paymentMethod).toLowerCase())) {
    return res.status(400).json({ message: 'Invalid payment method' });
  }

  const cart = await cartModel.find({ user: req.user.id }).populate('product');

  if (!cart.length) return res.status(400).json({ message: 'Your cart is empty' });

  const items = cart.filter((item) => item.product);
  if (items.length !== cart.length) return res.status(400).json({ message: 'One or more cart products are no longer available' });

  const orderItems = [];
  let itemsPrice = 0;

  for (const item of items) {
    const product = item.product;

    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > product.stock) {
      return res.status(400).json({ message: `${product.name} does not have enough stock` });
    }

    orderItems.push({ product: product._id, name: product.name, image: product.image, price: product.price, quantity: item.quantity });
    itemsPrice += product.price * item.quantity;
  }

  const shippingPrice = Number(req.body.shippingPrice) === 99 ? 99 : 0;
  const updatedProducts = [];
  try {
    for (const item of items) {
      const updated = await productModel.findOneAndUpdate(
        { _id: item.product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updated) throw new Error(`${item.product.name} stock changed; please retry checkout`);
      updatedProducts.push({ id: item.product._id, quantity: item.quantity });
    }
    const order = await orderModel.create({
      user: req.user.id, orderItems, shippingAddress,
      paymentMethod: String(paymentMethod).toLowerCase(), itemsPrice,
      shippingPrice, totalPrice: itemsPrice + shippingPrice,
    });
    await cartModel.deleteMany({ user: req.user.id });
    return res.status(201).json(order);
  } catch (error) {
    if (updatedProducts.length) {
      await Promise.all(updatedProducts.map(({ id, quantity }) => productModel.updateOne({ _id: id }, { $inc: { stock: quantity } })));
    }
    throw error;
  }
};

const getMyOrders = async (req, res) => res.json(await orderModel.find({ user: req.user.id }).sort({ createdAt: -1 }).lean());

const getSingleOrder = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid order id' });

  const order = await orderModel.findById(req.params.id).populate('user', 'name email').populate('orderItems.product');

  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (order.user?._id?.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  return res.json(order);
};

const getAllOrders = async (_req, res) => res.json(await orderModel.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(200).lean());

const deleteOrder = async (req, res) => {

  const order = await orderModel.findByIdAndDelete(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  return res.json({ message: 'Order deleted' });
  
};

const updateOrderStatus = async (req, res) => {

  const allowed = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status' });
  const order = await orderModel.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = req.body.status;
  order.isDelivered = req.body.status === 'Delivered';
  order.deliveredAt = order.isDelivered ? new Date() : undefined;
  await order.save();
  return res.json({ message: 'Status updated', order });
};
module.exports = { placeOrder, getMyOrders, getSingleOrder, getAllOrders, updateOrderStatus, deleteOrder };
