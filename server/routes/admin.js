const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const WinnerProof = require('../models/WinnerProof');
const Draw = require('../models/Draw');

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') return res.status(403).json({ msg: 'Admin access denied' });
        next();
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

router.get('/users', [auth, isAdmin], async (req, res) => {
    try {
        const users = await User.find().populate('selectedCharity').select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json([]);
    }
});

router.put('/user/:id', [auth, isAdmin], async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('selectedCharity');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.get('/proofs', [auth, isAdmin], async (req, res) => {
    try {
        const proofs = await WinnerProof.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.json(proofs);
    } catch (err) {
        res.status(500).json([]);
    }
});

router.put('/verify-winner/:proofId', [auth, isAdmin], async (req, res) => {
    const { action, prize, drawId } = req.body;
    try {
        const proof = await WinnerProof.findById(req.params.proofId);
        if (!proof) return res.status(404).json({ msg: 'Proof not found' });
        if (proof.status !== 'pending') return res.status(400).json({ msg: 'This submission has already been processed' });
        
        proof.status = action === 'approve' ? 'approved' : 'rejected';
        await proof.save();

        if (action === 'approve') {
            await User.findByIdAndUpdate(proof.userId, { $inc: { totalWinnings: prize } });
            if (drawId) {
                await Draw.updateOne(
                    { _id: drawId, "winners.userId": proof.userId },
                    { $set: { "winners.$.verified": true } }
                );
            }
        }
        res.json({ msg: `Winner ${action}d successfully` });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.get('/stats', [auth, isAdmin], async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ subscriptionStatus: 'active' });
        const publishedDraws = await Draw.find({ status: 'published' });
        const totalPrizePool = publishedDraws.reduce((acc, d) => acc + (d.totalPool || 0), 0);
        
        const activeSubs = await User.find({ subscriptionStatus: 'active' });
        let charityTotal = 0;
        activeSubs.forEach(u => {
            const fee = u.subscriptionPlan === 'yearly' ? 200 : 20;
            charityTotal += (fee * (u.charityPercentage / 100));
        });

        const charityImpactAvg = activeSubs.length > 0 ? (activeSubs.reduce((acc, u) => acc + (u.charityPercentage || 10), 0) / activeSubs.length).toFixed(0) : 10;

        const drawStats = publishedDraws.map(d => ({
            date: d.drawDate,
            pool: d.totalPool,
            winners: d.winners.length
        }));

        res.json({ totalUsers, activeUsers, totalPrizePool, charityTotal, charityImpact: charityImpactAvg, drawStats });
    } catch (err) {
        res.status(500).json({ totalUsers: 0, activeUsers: 0, totalPrizePool: 0, charityTotal: 0, charityImpact: 10, drawStats: [] });
    }
});

router.put('/payout-complete', [auth, isAdmin], async (req, res) => {
    const { drawId, winnerId } = req.body;
    try {
        await Draw.updateOne(
            { _id: drawId, "winners.userId": winnerId },
            { $set: { "winners.$.verified": true } }
        );
        res.json({ msg: 'Payout marked as completed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;