const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { db } = require('./config/firebase');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Astrology API is running',
        timestamp: new Date().toISOString()
    });
});

// Import Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Routes
// app.use('/api/whatsapp', require('./routes/whatsapp')); // Deprecated
app.use('/api/notifications', require('./routes/notifications'));
// const userRoutes = require('./routes/user');
// const ruleRoutes = require('./routes/rules');
// app.use('/api/users', userRoutes);
// app.use('/api/rules', ruleRoutes);


// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

const { initJob } = require('./jobs/dailyForecast');

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Initialize Jobs
    initJob();
});
