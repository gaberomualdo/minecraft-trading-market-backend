const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Log = require('../../models/Log');

// @route   POST api/log
// @desc    Get log as String
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // arr of log(s), should only be one
        let logs = await Log.find();

        // find log
        let log;

        if (logs.length == 0) {
            console.log('No log found');
            log = { items: [] };
        } else if (logs.length == 1) {
            log = logs[0];
        } else if (logs.length > 1) {
            log = logs[0];
            console.warn(`Should only be one Log in database. Found ${logs.length}.`);
        }

        // newline separates each log item
        res.send(log.items.join('\n'));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
