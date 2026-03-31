const mongoose = require('mongoose');
const CharitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  website: { type: String },
  totalRaised: { type: Number, default: 0 }
});
module.exports = mongoose.model('Charity', CharitySchema);