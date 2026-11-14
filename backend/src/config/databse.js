const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured');
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 10,
  });
  console.log('Connected to MongoDB');
};

module.exports = connectDB;
