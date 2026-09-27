const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

let isConnectedToMongo = false;

const DEFAULT_MONGODB_URI = 'mongodb+srv://mgowres_db_user:ABISEK%402008@cluster0.r31p3y1.mongodb.net/agrinexus?retryWrites=true&w=majority';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'agrinexus',
      serverSelectionTimeoutMS: 10000
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
