const mongoose = require('mongoose');
const WithdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  account: {
    number: { type: Number, required: true },
    name: { type: String, required: true },
    bank: { type: String, required: true }
  },
  reason: { type: String },
  description: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });
module.exports = mongoose.model('Withdrawal', WithdrawalSchema);
