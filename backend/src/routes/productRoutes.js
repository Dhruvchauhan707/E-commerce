const express = require('express');
const multer = require('multer');
const {
  addProductController, getAllProductsController, getProductByIdController,
  updateProductController, deleteProductController, filterProducts, getLatestProducts,
} = require('../controllers/productController');
const { adminMiddleware, protectedMiddleware } = require('../middleware/authMiddleware');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)),
});
const router = express.Router();
router.post('/add', protectedMiddleware, adminMiddleware, upload.single('image'), addProductController);
router.get('/all', getAllProductsController);
router.get('/filter', filterProducts);
router.get('/latest', getLatestProducts);
router.get('/:id', getProductByIdController);
router.put('/:id', protectedMiddleware, adminMiddleware, upload.single('image'), updateProductController);
router.delete('/:id', protectedMiddleware, adminMiddleware, deleteProductController);
module.exports = router;
