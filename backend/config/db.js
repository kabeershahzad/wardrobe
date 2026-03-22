const mongoose = require('mongoose');

let gfs;
let gridFSBucket;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Initialize GridFS
    gridFSBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
      bucketName: 'uploads'
    });

    console.log('📁 GridFS initialized');
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

const getGridFSBucket = () => gridFSBucket;

module.exports = connectDB;
module.exports.getGridFSBucket = getGridFSBucket;
