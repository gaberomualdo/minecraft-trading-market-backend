const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

app.get('/', (req, res) => res.send('API Running'));

// Init Middleware
app.use(express.json({ extended: false }));

// Define routes
app.use('/api/auth', require('./routes/api/auth.js'));
app.use('/api/log', require('./routes/api/log.js'));

const PORT = process.env.PORT || 7280;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
