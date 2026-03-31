const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const WinnerProof = require('../models/WinnerProof');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${req.user.id}-${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').populate('selectedCharity');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.put('/profile', auth, async (req, res) => {
    const { name, charityId, percentage } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (name) user.name = name;
        if (charityId) user.selectedCharity = charityId;
        if (percentage) user.charityPercentage = Math.max(10, percentage);
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/score', auth, async (req, res) => {
    const { score } = req.body;
    if (score < 1 || score > 45) {
        return res.status(400).json({ msg: 'Score must be between 1 and 45' });
    }
    try {
        const user = await User.findById(req.user.id);
        user.scores.push({ value: score, date: new Date() });
        if (user.scores.length > 5) user.scores.shift();
        await user.save();
        res.json(user.scores);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.put('/score/:scoreId', auth, async (req, res) => {
    const { value } = req.body;
    if (value < 1 || value > 45) {
        return res.status(400).json({ msg: 'Score must be between 1 and 45' });
    }
    try {
        const user = await User.findById(req.user.id);
        const scoreEntry = user.scores.id(req.params.scoreId);
        if (!scoreEntry) return res.status(404).json({ msg: 'Score entry not found' });
        scoreEntry.value = value;
        await user.save();
        res.json(user.scores);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/subscribe/mock', auth, async (req, res) => {
    const { plan } = req.body;
    try {
        const user = await User.findById(req.user.id);
        user.subscriptionStatus = 'active';
        user.subscriptionPlan = plan;
        const renewal = new Date();
        plan === 'yearly' ? renewal.setFullYear(renewal.getFullYear() + 1) : renewal.setMonth(renewal.getMonth() + 1);
        user.renewalDate = renewal;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/upload-proof', [auth, upload.single('proof')], async (req, res) => {
    try {
        const proof = new WinnerProof({
            userId: req.user.id,
            proofImage: req.file.filename,
            status: 'pending'
        });
        await proof.save();
        res.json(proof);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;