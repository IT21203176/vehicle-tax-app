const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if environment variables are available
    console.log('Environment check:', {
      MONGO_URI: process.env.MONGO_URI ? 'Present' : 'Missing',
      NODE_ENV: process.env.NODE_ENV || 'development'
    });

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    console.log('Attempting MongoDB connection...');

    // Connection options (removed deprecated ones)
    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log(`MongoDB connected successfully to: ${mongoose.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (err) {
    console.error('MongoDB connection failed:');
    console.error('Error message:', err.message);
    
    // Log specific connection errors
    if (err.message.includes('IP')) {
      console.error('IP whitelist error: Make sure your IP is whitelisted in MongoDB Atlas');
      console.error('Go to: https://cloud.mongodb.com/v2/your-project-id#/security/network/accessList');
    }
    
    if (err.message.includes('authentication')) {
      console.error('Authentication error: Check your MongoDB credentials');
    }

    // In serverless environment, don't exit process
    if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
      process.exit(1);
    }
    
    throw err; // Re-throw so calling code can handle it
  }
};

module.exports = connectDB;