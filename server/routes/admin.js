const router = require('express').Router();
const { User, Product, Order } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', async (req, res) => {
  const [users, products, orders, revenue, recent] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, sum: { $sum: '$total' } } }]),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
  ]);
  res.json({ users, products, orders, revenue: revenue[0]?.sum || 0, recent });
});

router.get('/orders', async (req, res) => {
  res.json(await Order.find().sort({ createdAt: -1 }).populate('user', 'name email'));
});

router.put('/orders/:id', async (req, res) => {
  const o = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true })
    .populate('user', 'name email');
  if (!o) return res.status(404).json({ message: 'Order not found' });
  res.json(o);
});

router.get('/users', async (req, res) => {
  res.json(await User.find().select('-password -wishlist').sort({ createdAt: -1 }));
});

router.delete('/users/:id', async (req, res) => {
  if (String(req.user._id) === req.params.id) return res.status(400).json({ message: 'You cannot delete yourself' });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

module.exports = router;
