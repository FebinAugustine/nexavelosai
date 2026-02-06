const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const UserSchema = new mongoose.Schema(
  {
    email: String,
    password: String,
    isVerified: Boolean,
    plan: String,
    agentLimit: Number,
    domains: [String],
    role: String,
    agents: [mongoose.Schema.Types.ObjectId],
    teams: [mongoose.Schema.Types.ObjectId],
  },
  { timestamps: true },
);

const User = mongoose.model('User', UserSchema);

async function checkUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find().exec();
    console.log('Users count:', users.length);
    for (let user of users) {
      console.log('');
      console.log('  User ID:', user._id);
      console.log('  Email:', user.email);
      console.log('  Password:', user.password);
      console.log('  Role:', user.role);
    }

    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();
