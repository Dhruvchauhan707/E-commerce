const ProductModel = require('../models/productModel');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateKeywords = async (imagePart) => {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error('Image search is not configured. Add GEMINI_API_KEY to the backend environment.');
    error.status = 503;
    throw error;
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });
  const result = await model.generateContent([
    'Identify this product image. Return 5 concise product type, brand, or descriptive keywords separated by commas. Do not add explanations.',
    imagePart,
  ]);
  return result.response.text().split(',').map((word) => word.trim().toLowerCase()).filter(Boolean).slice(0, 8);
};

const imageSearch = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please upload an image' });
  if (!/^image\/(jpeg|png|webp)$/.test(req.file.mimetype)) return res.status(400).json({ message: 'Upload a JPG, PNG or WebP image' });
  try {
    const keywords = await generateKeywords({
      inlineData: { data: req.file.buffer.toString('base64'), mimeType: req.file.mimetype },
    });
    if (!keywords.length) return res.json({ keywords: [], totalFound: 0, products: [] });
    const expressions = keywords.map((keyword) => new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    const products = await ProductModel.find({
      $or: [{ name: { $in: expressions } }, { description: { $in: expressions } }],
    }).populate('category').limit(40).lean();
    return res.json({ keywords, totalFound: products.length, products });
  } catch (error) {
    console.error('Image search failed:', error.message);
    const status = error.status || (error.statusCode === 429 ? 429 : 500);
    return res.status(status).json({ message: status === 429 ? 'AI request quota reached. Please try again later.' : error.message });
  }
};
module.exports = { imageSearch };
