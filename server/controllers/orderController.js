const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentDetails, shopName, shopAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items specified' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.phone) {
      return res.status(400).json({ success: false, message: 'Please provide complete delivery address' });
    }

    // Verify stock and calculate subtotal
    let itemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name} no longer available` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} items left in stock.`,
        });
      }

      // Decrement stock
      product.stock -= item.quantity;
      if (product.stock === 0) {
        product.isAvailable = false;
      }
      await product.save();

      const itemEffectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
      itemsPrice += itemEffectivePrice * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: itemEffectivePrice,
        quantity: item.quantity,
        unit: product.unit,
        image: product.image,
      });
    }

    const deliveryFee = itemsPrice > 500 ? 0 : 40; // Free delivery for orders > 500, else 40
    const taxPrice = Math.round(itemsPrice * 0.05); // 5% GST/tax
    const totalAmount = itemsPrice + deliveryFee + taxPrice;

    const initialStatus = 'Pending';
    const isPrepaid = paymentMethod === 'UPI' || paymentMethod === 'Credit Card';

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: isPrepaid ? 'Paid' : 'Pending',
      paymentDetails: {
        transactionId: paymentDetails?.transactionId || (isPrepaid ? `TXN_${Date.now()}` : ''),
        upiId: paymentDetails?.upiId || '',
        cardLast4: paymentDetails?.cardLast4 || '',
      },
      orderStatus: initialStatus,
      itemsPrice,
      deliveryFee,
      taxPrice,
      totalAmount,
      shopName: shopName || 'FreshCart Central Organic Mart',
      shopAddress: shopAddress || 'Shop #14, Sector 4, Koramangala, Bengaluru',
      estimatedDeliveryTime: new Date(Date.now() + 15 * 60000),
      statusHistory: [
        {
          status: initialStatus,
          updatedAt: new Date(),
          updatedBy: req.user._id,
          note: 'Order placed by customer',
        },
      ],
    });

    const savedOrder = await order.save();
    res.status(201).json({ success: true, data: savedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin & Delivery Agent)
// @route   GET /api/orders
// @access  Private (Admin & Delivery)
const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'All') {
      filter.orderStatus = status;
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('assignedDeliveryAgent', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('assignedDeliveryAgent', 'name phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Customer can only view their own order
    if (
      req.user.role === 'customer' &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin & Delivery Agent)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin & Delivery)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, assignedDeliveryAgent } = req.body;
    const validStatuses = ['Pending', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Role-based status constraints
    if (req.user.role === 'delivery') {
      // Delivery agent cannot cancel or change to Pending
      if (status === 'Pending' || status === 'Cancelled') {
        return res.status(403).json({
          success: false,
          message: 'Delivery agents can only update status between Packed, Out for Delivery, and Delivered',
        });
      }
      // Automatically assign delivery agent if none assigned
      if (!order.assignedDeliveryAgent) {
        order.assignedDeliveryAgent = req.user._id;
      }
    }

    order.orderStatus = status;

    if (assignedDeliveryAgent) {
      order.assignedDeliveryAgent = assignedDeliveryAgent;
    }

    const now = new Date();
    if (status === 'Packed' && !order.packedAt) {
      order.packedAt = now;
    }
    if (status === 'Out for Delivery' && !order.outForDeliveryAt) {
      order.outForDeliveryAt = now;
    }
    if (status === 'Delivered') {
      order.deliveredAt = now;
      order.paymentStatus = 'Paid';
    }

    order.statusHistory.push({
      status,
      updatedAt: now,
      updatedBy: req.user._id,
      note: note || `Status updated to ${status} by ${req.user.name} (${req.user.role})`,
    });

    const updatedOrder = await order.save();
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};
