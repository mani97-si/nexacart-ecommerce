import { Router } from 'express';
import {
  createOrder,
  myOrders,
  getOrder,
  adminOrders,
  updateOrder,
  cancelOrder,
  deleteOrder
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const r = Router();

// Protect all order routes with JWT auth
r.use(protect);

// 1. Root Collection Routes (Must be declared before parameterized `/:id`)
r.post('/', createOrder);
r.get('/', adminOnly, adminOrders);

// 2. Specific Sub-resource Routes
r.get('/mine', myOrders);

// 3. Status Updates & Actions (Supports both PUT and PATCH)
r.put('/:id/status', adminOnly, updateOrder);
r.patch('/:id/status', adminOnly, updateOrder);
r.put('/:id/cancel', cancelOrder);
r.patch('/:id/cancel', cancelOrder);

// 4. Parameterized Routes (Keep at the bottom to avoid capturing literal paths)
r.get('/:id', getOrder);
r.delete('/:id', deleteOrder);

export default r;