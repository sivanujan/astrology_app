const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas
 * Handles connection errors and logs success messages
 */
const connectDB = async () => {
    try {
        // Check if MONGO_URI is provided
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        // MongoDB connection options
        const options = {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        };

        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGO_URI, options);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database Name: ${conn.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB Connection Error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB Disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB Reconnected');
        });

    } catch (error) {
        console.error(`❌ MongoDB Connection Failed: ${error.message}`);
        console.error('Stack:', error.stack);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
