const mongoose = require('mongoose');
const WinnerProofSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  drawId: { type: mongoose.Schema.Types.ObjectId, ref: 'Draw' },
  proofImage: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('WinnerProof', WinnerProofSchema);