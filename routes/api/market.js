const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const uuid = require('uuid');

const createLogItem = require('./createLogItem');

const MarketItem = require('../../models/MarketItem');

// @route   POST api/market
// @desc    Create market item
// @access  Private
router.post(
    '/',
    [auth, [check('name', 'Name is required.').not().isEmpty(), check('description', 'Description is required.').not().isEmpty()]],
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
            trader: req.user.username,
            date: new Date(),
        };

        try {
            // Create market item
            const marketItem = new MarketItem(marketItemFields);

            await marketItem.save();
            res.json(marketItem);

            // add to log
            createLogItem(`"${marketItemFields.trader}" created a new market item titled "${marketItemFields.name}"`, marketItemFields.date);
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
        let marketItems = JSON.parse(JSON.stringify(await MarketItem.find()));

        // remove offers list if trader is not current user
        // add hasOffer as true if offers include one by current user
        marketItems.forEach((item, ind) => {
            marketItems[ind].hasOffer = false;

            if (item.trader != req.user.username) {
                item.offers.forEach((offer) => {
                    if (offer.buyer == req.user.username) {
                        marketItems[ind].hasOffer = true;
                    }
                });

                delete marketItems[ind].offers;
            }
        });

        res.json(marketItems);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

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
            marketItem.offers.splice(currentBuyerOfferIndex, 1);
        }

        marketItem.offers.unshift(newOffer);

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

        // add to log
        createLogItem(
            `"Trader "${marketItem.trader}" accepted the offer of "${winningOffer.description}" by buyer "${winningOffer.buyer}" for "${marketItem.name}"`,
            winningOffer.winDate
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
