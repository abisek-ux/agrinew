const mongoose = require('mongoose');

let isConnectedToMongo = false;

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('MongoDB URI not configured. Using the in-memory database fallback.');
    return false;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000
    });
    isConnectedToMongo = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB Local Notice: ${error.message}`);
    console.warn(`Fallback Memory Active: Operating with stateful in-memory store (Ready for Atlas MONGODB_URI)`);
    isConnectedToMongo = false;
    return false;
  }
};

const getDBStatus = () => ({
  connected: isConnectedToMongo,
  mode: isConnectedToMongo ? 'MongoDB Connected' : 'Local Memory Fallback'
});

module.exports = { connectDB, getDBStatus, isConnected: () => isConnectedToMongo };
