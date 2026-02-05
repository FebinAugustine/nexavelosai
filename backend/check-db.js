const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/nexavelosai',
    );
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log(
      'Collections:',
      collections.map((c) => c.name),
    );

    const leadsCollection = db.collection('leads');
    const leadsCount = await leadsCollection.countDocuments();
    console.log('Leads count:', leadsCount);

    if (leadsCount > 0) {
      const firstLead = await leadsCollection.findOne();
      console.log('First lead:', JSON.stringify(firstLead, null, 2));
    }

    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkDatabase();
