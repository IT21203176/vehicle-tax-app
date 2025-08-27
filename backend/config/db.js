const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MONGO_URI available:', process.env.MONGO_URI ? 'Yes' : 'No');
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    // Remove deprecated options
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('MongoDB connected successfully');
    console.log('Database name:', mongoose.connection.name);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('Full error:', err);
    // Don't exit in production/Vercel environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;