const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    items: {
        type: [String],
        required: true,
    },
});

module.exports = Log = mongoose.model('log', LogSchema);
