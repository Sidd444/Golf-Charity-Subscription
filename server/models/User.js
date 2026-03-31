const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    subscriptionStatus: { type: String, enum: ['active', 'inactive', 'lapsed'], default: 'inactive' },
    subscriptionPlan: { type: String, enum: ['monthly', 'yearly', 'none'], default: 'none' },
    renewalDate: { type: Date },
    selectedCharity: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity' },
    charityPercentage: { type: Number, default: 10 },
    scores: [{
        value: Number,
        date: { type: Date, default: Date.now }
    }],
    totalWinnings: { type: Number, default: 0 }
});
module.exports = mongoose.model('User', UserSchema);