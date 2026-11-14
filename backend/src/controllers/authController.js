const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 10 * 60 * 60 * 1000,
  path: '/',
});
const createToken = (user) => jwt.sign(
  { id: user._id.toString() },
  process.env.JWT_SECRET,
  { expiresIn: '10h' }
);

const registerController = async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    return res.status(400).json({ message: 'Valid name, email and password (minimum 8 characters) are required' });
  }
  if (!process.env.JWT_SECRET) return res.status(500).json({ message: 'Authentication is not configured' });
  const existingUser = await userModel.findOne({ email }).lean();
  if (existingUser) return res.status(409).json({ message: 'User already exists' });
  const user = await userModel.create({ name, email, password: await bcrypt.hash(password, 12) });
  res.cookie('token', createToken(user), cookieOptions());
  return res.status(201).json({ message: 'User created successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

const loginController = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = await userModel.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (user.isBlocked || user.isDeleted) return res.status(403).json({ message: 'This account is unavailable' });
  if (!process.env.JWT_SECRET) return res.status(500).json({ message: 'Authentication is not configured' });
  res.cookie('token', createToken(user), cookieOptions());
  return res.status(200).json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

const getProfile = async (req, res) => {
  const user = await userModel.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json(user);
};

const logoutController = (_req, res) => {
  res.clearCookie('token', { ...cookieOptions(), maxAge: undefined });
  return res.json({ message: 'Logged out successfully' });
};

module.exports = { registerController, loginController, getProfile, logoutController };
