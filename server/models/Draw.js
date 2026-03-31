const mongoose = require('mongoose');

const DrawSchema = new mongoose.Schema({
    drawDate: { type: Date, default: Date.now },
    winningNumbers: [Number],
    status: { type: String, enum: ['simulated', 'published'], default: 'simulated' },
    logicType: { type: String, enum: ['random', 'algorithmic'], default: 'random' },
    totalPool: { type: Number, default: 0 },
    jackpotRollover: { type: Number, default: 0 },
    poolShares: {
        match5: { type: Number, default: 0 },
        match4: { type: Number, default: 0 },
        match3: { type: Number, default: 0 }
    },
    winners: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        matchType: { type: Number, enum: [3, 4, 5] },
        prize: { type: Number },
        verified: { type: Boolean, default: false }
    }]
});

module.exports = mongoose.model('Draw', DrawSchema);