const express = require('express');
const multer = require('multer');
const { imageSearch } = require('../controllers/imagesearchController');
const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype)),
});
router.post('/image-search', upload.single('image'), imageSearch);
module.exports = router;
