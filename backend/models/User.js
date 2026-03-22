const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: null },
  avatarGridId: { type: mongoose.Schema.Types.ObjectId, default: null },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  isActive: { type: Boolean, default: true },
  phone: { type: String, default: '' },
  address: {
    street: String,
    city: String,
    country: String,
    postalCode: String
  },
  measurements: {
    height: Number,
    weight: Number,
    chest: Number,
    waist: Number,
    hips: Number
  },
  preferences: {
    style: [String],
    colors: [String],
    sizes: [String]
  },
  tryonHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TryOn' }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
