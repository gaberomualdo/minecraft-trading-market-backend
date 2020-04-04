const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const uuid = require('uuid');

const MarketItem = require('../../models/MarketItem');

/*// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({
                errors: [
                    {
                        msg: 'No profile found for given user',
                    },
                ],
            });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});*/

// @route   POST api/market
// @desc    Create market item
// @access  Private
router.post(
    '/',
    [
        auth,
        [
            check('name', 'Name is required.').not().isEmpty(),
            check('description', 'Description is required.').not().isEmpty(),
            check('trader', 'Trader is required.').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        // build market item object
        const marketItemFields = {
            name: req.body.name,
            description: req.body.description,
            sold: false,
            trader: req.body.trader,
            date: new Date(),
        };

        try {
            // Create market item
            const marketItem = new MarketItem(marketItemFields);

            await marketItem.save();
            res.json(marketItem);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET api/market
// @desc    Get all market items
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const marketItems = await MarketItem.find();
        res.json(marketItems);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/*// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);

        if (!profile) return res.status(400).json({ errors: [{ msg: 'Profile not found' }] });

        res.json(profile);
    } catch (err) {
        console.error(err.message);

        if (err.kind == 'ObjectId') {
            return res.status(400).json({ errors: [{ msg: 'Profile not found' }] });
        }

        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/profile
// @desc    Delete profile, user and posts
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        // @todo --> remove user's posts

        // remove profile
        await Profile.findOneAndRemove({ user: req.user.id });

        await User.findOneAndRemove({ _id: req.user.id });

        res.json({
            msg: 'User deleted',
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});*/

// @route   POST api/market/:item_id/offer
// @desc    Add new offer to market item
// @access  Private
router.post('/:item_id/offer', [auth, [check('content', 'Content is required.').not().isEmpty()]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
        });
    }

    const newOffer = {
        id: uuid.v4(),
        buyer: req.user.username,
        content: req.body.content,
        date: new Date(),
    };

    try {
        const marketItem = await MarketItem.findById(req.params.item_id);

        if (!marketItem) {
            return res.status(400).json({
                errors: [
                    {
                        msg: 'Market item does not exist',
                    },
                ],
            });
        }

        // throw error if buyer is the same user as trader
        if (marketItem.trader == newOffer.buyer) {
            return res.status(400).json({
                errors: [
                    {
                        msg: 'Buyer cannot be the same user as trader.',
                    },
                ],
            });
        }

        if (!marketItem.offers) {
            marketItem.offers = [];
        }

        // check if buyer has already made an offer; if so, replace that offer
        let currentBuyerOfferIndex = -1;
        marketItem.offers.forEach((item, ind) => {
            if (item.buyer == newOffer.buyer) {
                currentBuyerOfferIndex = ind;
                return;
            }
        });

        if (currentBuyerOfferIndex > -1) {
            marketItem.offers[currentBuyerOfferIndex] = newOffer;
        } else {
            marketItem.offers.unshift(newOffer);
        }

        await marketItem.save();

        res.json(marketItem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/market/:item_id/winningoffer
// @desc    Add winning offer to market item
// @access  Private
router.post('/:item_id/winningoffer', [auth, [check('offerId', 'Offer ID is required.').not().isEmpty()]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
        });
    }

    try {
        const marketItem = await MarketItem.findById(req.params.item_id);

        // winning offer can only be set if user is the trader
        if (req.user.username != marketItem.trader) {
            return res.status(400).json({
                errors: [
                    {
                        msg: 'Winning offer can only be set by trader.',
                    },
                ],
            });
        }

        if (marketItem.winningOffer || marketItem.sold) {
            return res.status(400).json({
                errors: [
                    {
                        msg: 'Winning offer already exists',
                    },
                ],
            });
        }

        let winningOffer;
        // find offer with winning offer id and set winningOffer variable
        marketItem.offers.forEach((item) => {
            if (item.id == req.body.offerId) {
                winningOffer = JSON.parse(JSON.stringify(item));
                return;
            }
        });

        delete winningOffer.date;

        winningOffer.winDate = new Date();

        marketItem.winningOffer = winningOffer;
        marketItem.sold = true;

        await marketItem.save();

        res.json(marketItem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/*// @route   DELETE api/profile/experience/:exp_id
// @desc    Remove profile experience
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // Get index to remove
        const removeIndex = profile.experience.map((item) => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put(
    '/education',
    [
        auth,
        [
            check('school', 'Title is required').not().isEmpty(),
            check('degree', 'Degree is required').not().isEmpty(),
            check('fieldofstudy', 'Field of study is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { school, degree, fieldofstudy, from, to, current, description } = req.body;

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description,
        };

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.education.unshift(newEdu);

            await profile.save();

            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   DELETE api/profile/education/:exp_id
// @desc    Remove profile education
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // Get index to remove
        const removeIndex = profile.education.map((item) => item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/profile/github/:username
// @desc    Get user repos from Github
// @access  Public
router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get(
                'githubClientId'
            )}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' },
        };

        request(options, (error, response, body) => {
            if (error) console.error(error);
            if (response.statusCode !== 200) {
                return res.status(404).json({ errors: [{ msg: 'No GitHub Profile Found' }] });
            }
            res.json(JSON.parse(body));
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});*/

module.exports = router;
