import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// Public product routes
router.get('/', listProducts);
router.get('/:id', getProduct);

// Protected Admin product management routes
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;