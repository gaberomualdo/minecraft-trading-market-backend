const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

app.get('/', (req, res) => res.send('API Running'));

// allow CORS requests
const allowCORSRequests = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    next();
};

// Init Middleware
app.use(allowCORSRequests);
app.use(express.json({ extended: false }));

// Define routes
app.use('/api/auth', require('./routes/api/auth.js'));
app.use('/api/log', require('./routes/api/log.js'));
app.use('/api/market', require('./routes/api/market.js'));

const PORT = process.env.PORT || 7280;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
