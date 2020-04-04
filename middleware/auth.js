const config = require('config');

module.exports = (req, res, next) => {
    // Get username and password from headers
    const authorizationHeader = req.header('Authorization');

    // Check if no header
    let authorizationContents;
    let username;
    let pin;
    try {
        authorizationContents = Buffer.from(authorizationHeader.split(' ')[1], 'base64').toString();
        username = authorizationContents.split(':')[0];
        pin = authorizationContents.split(':')[1];
    } catch (err) {
        return res.status(401).json({ msg: 'Authorization Denied' });
    }

    // check credentials against config vars
    const correctPin = config.get('authUsers')[username];
    if (!correctPin || correctPin != pin) {
        return res.status(401).json({ msg: 'Authorization Denied' });
    }

    next();
};
