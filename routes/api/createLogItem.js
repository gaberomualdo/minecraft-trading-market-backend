const Log = require('../../models/Log');

// create log item
module.exports = async (message, date) => {
    try {
        // find current log
        let logs = await Log.find();

        let log;

        if (logs.length == 0) {
            log = new Log({ items: [] });
        } else {
            log = logs[0];
        }

        // add message
        log.items.push(`${message} at ${date.toISOString()}`);
        await log.save();

        // log updated log message
        console.log(`Updated Log at ${new Date().toISOString()}`);
    } catch (err) {
        console.error(`Failed to add new log item with error: ${err.message}`);
    }
};
