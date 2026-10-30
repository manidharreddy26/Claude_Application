const mongoose = require('mongoose');
const { Schema } = mongoose;

const User = mongoose.model('User', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true }));

const Product = mongoose.model('Product', new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: '' },
  category: { type: String, default: 'General', trim: true },
  stock: { type: Number, default: 0, min: 0 },
}, { timestamps: true }));

const Order = mongoose.model('Order', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: String, price: Number, qty: Number, image: String,
  }],
  total: Number,
  address: { fullName: String, phone: String, street: String, city: String, state: String, pincode: String },
  paymentMethod: { type: String, enum: ['COD', 'CARD', 'UPI'], default: 'COD' },
  status: { type: String, enum: ['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' },
}, { timestamps: true }));

module.exports = { User, Product, Order };
