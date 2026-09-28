const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

let isConnectedToMongo = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(`ℹ️ No MONGODB_URI found in environment variables.`);
    console.warn(`Fallback Memory Active: Operating with stateful in-memory store.`);
    isConnectedToMongo = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || 'agrinexus',
      serverSelectionTimeoutMS: 10000
    });
    isConnectedToMongo = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.warn(`Fallback Memory Active: Operating with stateful in-memory store.`);
    isConnectedToMongo = false;
    return false;
  }
};

const getDBStatus = () => ({
  connected: isConnectedToMongo,
  mode: isConnectedToMongo ? 'MongoDB Connected' : 'Local Memory Fallback'
});

module.exports = { connectDB, getDBStatus, isConnected: () => isConnectedToMongo };
