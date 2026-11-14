const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

const protectedMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7) : null);
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select('_id role isBlocked isDeleted');
    if (!user || user.isDeleted) return res.status(401).json({ message: 'Account not found' });
    if (user.isBlocked) return res.status(403).json({ message: 'Account is blocked' });
    req.user = { id: user._id.toString(), role: user.role };
    return next();
  } catch (error) {
    return res.status(401).json({ message: error.name === 'TokenExpiredError' ? 'Session expired' : 'Invalid authentication' });
  }
};

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Authentication required' });
    const user = await userModel.findById(req.user.id).select('role isBlocked isDeleted');
    if (!user || user.isDeleted || user.isBlocked) return res.status(403).json({ message: 'Account is unavailable' });
    if (user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { adminMiddleware, protectedMiddleware };
