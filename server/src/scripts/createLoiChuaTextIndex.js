require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const LoiChua = require('../models/LoiChua');

const run = async () => {
  await connectDB();
  await LoiChua.syncIndexes();

  const indexes = await LoiChua.collection.indexes();
  console.log('LoiChua indexes:');
  indexes.forEach((index) => console.log(`- ${index.name}: ${JSON.stringify(index.key)}`));

  await mongoose.connection.close();
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
