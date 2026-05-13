const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

let replSet;

const connectTestDb = async () => {
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });

  await mongoose.connect(replSet.getUri(), {
    dbName: 'mautam-test',
  });
};

const clearTestDb = async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
};

const closeTestDb = async () => {
  await mongoose.disconnect();
  if (replSet) await replSet.stop();
};

module.exports = {
  connectTestDb,
  clearTestDb,
  closeTestDb,
};
