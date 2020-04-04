const mongoose = require('mongoose');

const MarketItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    sold: {
        type: Boolean,
        required: true,
    },
    trader: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    offers: {
        type: [Object],
    },
    winningOffer: {
        type: Object,
    },
});

module.exports = MarketItem = mongoose.model('marketitem', MarketItemSchema);
