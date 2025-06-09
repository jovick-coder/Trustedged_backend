const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  emailVaried: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true, required: true },
  phoneNumber: String,
  gender: String,
  country: String,
  age: String,
  username: { type: String, unique: true },
  password: String,
  profilePhoto: String,
  validID: String,
  deleted: { type: Boolean, default: false },
  account: {
    number: { type: Number, required: true },
    name: { type: String, required: true },
    balance: { type: Number, default: 0 },
    wallet: { type: String }
  },
});

module.exports = mongoose.model('User', UserSchema);
