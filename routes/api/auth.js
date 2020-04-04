const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

// @route   POST api/auth
// @desc    Check if user is authenticated
// @access  Public
router.get('/', auth, (req, res) => {
    res.json({ msg: 'Authorization Accepted' });
});

module.exports = router;
