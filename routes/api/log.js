const express = require('express');
const router = express.Router();
const fs = require('fs');
const auth = require('../../middleware/auth');

// @route   POST api/log
// @desc    Get log as String
// @access  Private
router.get('/', auth, (req, res) => {
    try {
        res.send(fs.readFileSync('./data/log.txt').toString());
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
