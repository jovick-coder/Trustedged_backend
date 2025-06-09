const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notification: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification', required: true, default: null },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['debit', "credit", "card"], required: true },
  account: {
    code: { type: String, required: true },
    name: { type: String },
    channel: { type: String },
  },
  description: { type: String },
  date: { type: Date, default: Date.now() },
  deleted: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'success' }
}, { timestamps: true });
module.exports = mongoose.model('Transaction', TransactionSchema);
