import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Create a new order from user's active cart
// @route   POST /api/orders
export async function createOrder(req, res) {
  try {
    const c = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!c || !c.items || c.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const items = [];
    let subtotal = 0;

    for (const x of c.items) {
      // Guard against deleted products
      if (!x.product) {
        return res.status(400).json({ message: 'One or more items in your cart are no longer available' });
      }

      // Check inventory availability
      if (x.quantity > x.product.stock) {
        return res.status(400).json({
          message: `Only ${x.product.stock} units left for "${x.product.name}"`
        });
      }

      subtotal += x.product.price * x.quantity;
      items.push({
        product: x.product._id,
        name: x.product.name,
        image: x.product.images?.[0] || '',
        price: x.product.price,
        quantity: x.quantity
      });
    }

    // Pricing calculation
    const shipping = subtotal >= 100 ? 0 : 9.99;
    const tax = Number((subtotal * 0.05).toFixed(2));
    const total = Number((subtotal + shipping + tax).toFixed(2));

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress: req.body.shippingAddress,
      subtotal,
      shipping,
      tax,
      total,
      paymentMethod: req.body.paymentMethod || 'Cash on Delivery',
      status: 'Placed'
    });

    // Deduct stock from database
    for (const x of c.items) {
      await Product.findByIdAndUpdate(x.product._id, {
        $inc: { stock: -x.quantity }
      });
    }

    // Clear customer cart
    c.items = [];
    await c.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error creating order' });
  }
}

// @desc    Get logged in user orders
// @route   GET /api/orders/mine
export async function myOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch user orders' });
  }
}

// @desc    Get single order by ID
// @route   GET /api/orders/:id
export async function getOrder(req, res) {
  try {
    const o = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product');

    if (!o) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorize owner or admin
    const isOwner = String(o.user?._id || o.user) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You cannot access this order' });
    }

    res.json(o);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch order' });
  }
}

// @desc    Get all customer orders (Admin only)
// @route   GET /api/orders
export async function adminOrders(req, res) {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch admin orders' });
  }
}

// @desc    Update order status (Admin only)
// @route   PUT/PATCH /api/orders/:id/status
export async function updateOrder(req, res) {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (status === 'Delivered') {
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update order' });
  }
}

// @desc    Cancel order & restore inventory stock
// @route   PUT/PATCH /api/orders/:id/cancel
export async function cancelOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorize owner or admin
    const isOwner = String(order.user) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You cannot cancel this order' });
    }

    if (order.status === 'Delivered') {
      return res.status(400).json({ message: 'Delivered orders cannot be cancelled' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    // Safely restore stock
    for (const item of order.items) {
      const productId = item.product?._id || item.product;
      if (productId) {
        await Product.findByIdAndUpdate(productId, {
          $inc: { stock: item.quantity }
        });
      }
    }

    order.status = 'Cancelled';
    const updatedOrder = await order.save();

    res.json({ message: 'Order cancelled successfully', order: updatedOrder });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to cancel order' });
  }
}

// @desc    Delete order permanently
// @route   DELETE /api/orders/:id
export async function deleteOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorize owner or admin
    const isOwner = String(order.user) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You cannot delete this order' });
    }

    // Restore stock if the order wasn't already cancelled or completed
    if (order.status !== 'Cancelled' && order.status !== 'Delivered') {
      for (const item of order.items) {
        const productId = item.product?._id || item.product;
        if (productId) {
          await Product.findByIdAndUpdate(productId, {
            $inc: { stock: item.quantity }
          });
        }
      }
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order permanently deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to delete order' });
  }
}