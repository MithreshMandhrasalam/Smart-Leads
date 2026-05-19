import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_leads';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 2000 });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.log('Failed to connect to local MongoDB. Initializing in-memory MongoDB fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('In-memory MongoDB connected successfully! (Data will not persist)');
    } catch (innerError) {
      console.error('MongoDB connection error:', innerError);
      process.exit(1);
    }
  }
};
