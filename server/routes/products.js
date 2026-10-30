const router = require('express').Router();
const { Product } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

// READ (public)
router.get('/', async (req, res) => {
  const { q, category, sort } = req.query;
  const filter = {};
  if (q) filter.name = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (category && category !== 'All') filter.category = category;
  const sorts = { low: { price: 1 }, high: { price: -1 }, new: { createdAt: -1 } };
  const products = await Product.find(filter).sort(sorts[sort] || { createdAt: -1 });
  const categories = await Product.distinct('category');
  res.json({ products, categories });
});

router.get('/:id', async (req, res) => {
  const p = await Product.findById(req.params.id).catch(() => null);
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json(p);
});

// CREATE / UPDATE / DELETE (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  const { name, price } = req.body;
  if (!name || price === undefined || price === '') return res.status(400).json({ message: 'Name and price are required' });
  res.status(201).json(await Product.create(req.body));
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json(p);
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted', _id: p._id });
});

module.exports = router;
