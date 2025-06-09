const mongoose = require('mongoose');

const DetailsSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String },
  channel: { type: String },
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false, required: true },
}, { timestamps: true });
module.exports = mongoose.model('Details', DetailsSchema); 