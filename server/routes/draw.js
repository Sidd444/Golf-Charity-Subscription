const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Draw = require('../models/Draw');
const User = require('../models/User');

const isAdmin = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ msg: 'Admin access denied' });
    next();
};

router.post('/simulate', [auth, isAdmin], async (req, res) => {
    try {
        const { logicType } = req.body;
        let winningNumbers = [];

        if (logicType === 'algorithmic') {
            const freq = await User.aggregate([
                { $unwind: "$scores" },
                { $group: { _id: "$scores.value", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);
            winningNumbers = freq.slice(0, 5).map(f => f._id);
            while (winningNumbers.length < 5) {
                let n = Math.floor(Math.random() * 45) + 1;
                if (!winningNumbers.includes(n)) winningNumbers.push(n);
            }
        } else {
            while (winningNumbers.length < 5) {
                let n = Math.floor(Math.random() * 45) + 1;
                if (!winningNumbers.includes(n)) winningNumbers.push(n);
            }
        }

        const activeUsers = await User.find({ subscriptionStatus: 'active' });
        const totalPool = activeUsers.length * 10; 

        const prev = await Draw.findOne({ status: 'published' }).sort({ drawDate: -1 });
        const rollover = prev ? prev.jackpotRollover : 0;
        const currentMatch5Pool = (totalPool * 0.40) + rollover;

        let winners = [];
        activeUsers.forEach(u => {
            const userNums = u.scores.map(s => s.value);
            const matches = userNums.filter(n => winningNumbers.includes(n)).length;
            if (matches >= 3) winners.push({ userId: u._id, matchType: matches });
        });

        const counts = { 
            5: winners.filter(w => w.matchType === 5).length,
            4: winners.filter(w => w.matchType === 4).length,
            3: winners.filter(w => w.matchType === 3).length
        };

        const finalWinners = winners.map(w => ({
            ...w,
            prize: w.matchType === 5 ? currentMatch5Pool / (counts[5] || 1) :
                   w.matchType === 4 ? (totalPool * 0.35) / (counts[4] || 1) :
                   (totalPool * 0.25) / (counts[3] || 1)
        }));

        const newDraw = new Draw({
            winningNumbers,
            totalPool,
            jackpotRollover: counts[5] === 0 ? currentMatch5Pool : 0,
            winners: finalWinners,
            status: 'simulated',
            logicType
        });

        await newDraw.save();
        res.json(newDraw);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/publish/:id', [auth, isAdmin], async (req, res) => {
    try {
        const draw = await Draw.findById(req.params.id);
        draw.status = 'published';
        await draw.save();
        res.json(draw);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.get('/history', async (req, res) => {
    try {
        const draws = await Draw.find().sort({ drawDate: -1 });
        res.json(draws);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.get('/latest', async (req, res) => {
    try {
        const draw = await Draw.findOne({ status: 'published' }).sort({ drawDate: -1 });
        res.json(draw);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;