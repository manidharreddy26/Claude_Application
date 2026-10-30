const router = require('express').Router();
const { Order, Product } = require('../models');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  const { items, address, paymentMethod } = req.body;
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Your cart is empty' });
  const a = address || {};
  if (!a.fullName || !a.phone || !a.street || !a.city || !a.pincode)
    return res.status(400).json({ message: 'Please fill in the full delivery address' });

  const lines = [];
  let total = 0;
  for (const it of items) {
    const p = await Product.findById(it._id);
    const qty = Math.max(1, parseInt(it.qty) || 1);
    if (!p) return res.status(400).json({ message: 'A product in your cart no longer exists' });
    if (p.stock < qty) return res.status(400).json({ message: `Only ${p.stock} left of ${p.name}` });
    lines.push({ product: p._id, name: p.name, price: p.price, qty, image: p.image });
    total += p.price * qty; // price always taken from the database
  }
  for (const l of lines) await Product.updateOne({ _id: l.product }, { $inc: { stock: -l.qty } });
  const order = await Order.create({ user: req.user._id, items: lines, total, address: a, paymentMethod: paymentMethod || 'COD' });
  res.status(201).json(order);
});

router.get('/mine', protect, async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
});

router.put('/:id/cancel', protect, async (req, res) => {
  const o = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!o) return res.status(404).json({ message: 'Order not found' });
  if (o.status !== 'Placed') return res.status(400).json({ message: 'Only newly placed orders can be cancelled' });
  o.status = 'Cancelled';
  await o.save();
  for (const l of o.items) await Product.updateOne({ _id: l.product }, { $inc: { stock: l.qty } });
  res.json(o);
});

module.exports = router;
