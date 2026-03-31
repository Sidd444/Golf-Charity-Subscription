const express = require('express');
const router = express.Router();
const Charity = require('../models/Charity');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ msg: 'Admin access denied' });
        }
        next();
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

router.get('/', async (req, res) => {
    try {
        const charities = await Charity.find().sort({ name: 1 });
        res.json(charities);
    } catch (err) {
        res.status(500).json([]);
    }
});

router.post('/', [auth, isAdmin], async (req, res) => {
    try {
        const { name, description } = req.body;
        const charity = new Charity({ name, description });
        await charity.save();
        res.status(201).json(charity);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

router.delete('/:id', [auth, isAdmin], async (req, res) => {
    try {
        await Charity.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Deleted' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;