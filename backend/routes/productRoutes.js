const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

const {
    getProducts,
    createProduct,
    getProductById,
    deleteProduct,
    updateProduct
} = require('../controllers/productController');

// Public: Get all products
// Admin: Create product
router.route('/')
    .get(getProducts)
    .post(protect, admin, createProduct);

// Public: Get single product
// Admin: Update and delete product
router.route('/:id')
    .get(getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;