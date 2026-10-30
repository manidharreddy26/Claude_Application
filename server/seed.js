require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Product } = require('./models');

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;
const products = [
  ['Wireless Headphones', 'Over-ear, 30 hour battery, deep bass.', 2999, 'photo-1505740420928-5e560c06d30e', 'Electronics', 25],
  ['Smart Watch', 'Heart-rate, sleep tracking and 7 day battery.', 3999, 'photo-1523275335684-37898b6baf30', 'Electronics', 18],
  ['Running Shoes', 'Light cushioned shoes for daily runs.', 2499, 'photo-1542291026-7eec264c27ff', 'Fashion', 40],
  ['Leather Backpack', 'Water-resistant, fits a 15 inch laptop.', 1899, 'photo-1553062407-98eeb64c6a62', 'Fashion', 30],
  ['Sunglasses', 'UV400 polarised lenses, metal frame.', 899, 'photo-1572635196237-14b3f281503f', 'Fashion', 50],
  ['Ceramic Coffee Mug', 'Hand glazed 350 ml mug.', 349, 'photo-1514228742587-6b1558fcf93a', 'Home', 80],
  ['Desk Lamp', 'Warm LED lamp with touch dimmer.', 1299, 'photo-1507473885765-e6ed057f782c', 'Home', 22],
  ['Bluetooth Speaker', 'Portable, waterproof, 12 hour playtime.', 1599, 'photo-1608043152269-423dbba4e7e1', 'Electronics', 35],
].map(([name, description, price, i, category, stock]) => ({ name, description, price, image: img(i), category, stock }));

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = process.env.ADMIN_EMAIL || 'admin@mani.co';
  const pass = process.env.ADMIN_PASSWORD || 'Admin@123';
  if (!(await User.findOne({ email })))
    await User.create({ name: 'Mani Admin', email, password: await bcrypt.hash(pass, 10), role: 'admin' });
  if ((await Product.countDocuments()) === 0) await Product.insertMany(products);
  console.log(`Seed done. Admin login: ${email} / ${pass}`);
  process.exit(0);
})();
