const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Team schemas
const TeamSchema = new mongoose.Schema(
  {
    ownerId: mongoose.Schema.Types.ObjectId,
    name: String,
    description: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sharedAgents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }],
  },
  { timestamps: true },
);

const TeamMemberSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    teamId: mongoose.Schema.Types.ObjectId,
    role: { type: String, enum: ['owner', 'admin', 'editor', 'viewer'] },
    isActive: Boolean,
    invitedBy: mongoose.Schema.Types.ObjectId,
    invitedAt: Date,
    joinedAt: Date,
  },
  { timestamps: true },
);

const UserSchema = new mongoose.Schema(
  {
    email: String,
    password: String,
    isVerified: Boolean,
    plan: String,
    agentLimit: Number,
    role: String,
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  },
  { timestamps: true },
);

const Team = mongoose.model('Team', TeamSchema);
const TeamMember = mongoose.model('TeamMember', TeamMemberSchema);
const User = mongoose.model('User', UserSchema);

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      'Collections:',
      collections.map((c) => c.name),
    );

    // Check teams
    const teamsCount = await Team.countDocuments().exec();
    console.log('Teams count:', teamsCount);

    const teams = await Team.find().sort({ createdAt: -1 }).limit(3).exec();
    console.log('Latest 3 teams:');
    for (let team of teams) {
      console.log('');
      console.log('  Team ID:', team._id);
      console.log('  Owner ID:', team.ownerId);
      console.log('  Name:', team.name);
      console.log('  Members count:', team.members.length);
    }

    // Check team members
    const teamMembersCount = await TeamMember.countDocuments().exec();
    console.log('Team members count:', teamMembersCount);

    const teamMembers = await TeamMember.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();
    console.log('Latest 5 team members:');
    for (let member of teamMembers) {
      console.log('');
      console.log('  Team ID:', member.teamId);
      console.log('  User ID:', member.userId);
      console.log('  Role:', member.role);
      console.log('  Active:', member.isActive);
    }

    // Check users
    const usersCount = await User.countDocuments().exec();
    console.log('Users count:', usersCount);

    const users = await User.find().sort({ createdAt: -1 }).limit(5).exec();
    console.log('Latest 5 users:');
    for (let user of users) {
      console.log('');
      console.log('  User ID:', user._id);
      console.log('  Email:', user.email);
      console.log('  Role:', user.role);
      console.log('  Plan:', user.plan);
      console.log('  Teams:', user.teams);
    }

    // Check specific team from error
    const testTeamId = '6985990327c25f6c254bf9ac';
    console.log('\nChecking team:', testTeamId);
    const testTeam = await Team.findById(testTeamId).populate('members');
    if (testTeam) {
      console.log('  Team exists');
      console.log('  Name:', testTeam.name);
      console.log('  Owner ID:', testTeam.ownerId.toString());

      const teamMembers = await TeamMember.find({
        teamId: testTeamId,
      }).populate('userId');
      console.log('  Team members:', teamMembers.length);
      for (let member of teamMembers) {
        console.log('    User ID:', member.userId._id.toString());
        console.log('    Email:', member.userId.email);
        console.log('    Role:', member.role);
        console.log('    Active:', member.isActive);
      }
    } else {
      console.log('  Team not found');
    }

    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDatabase();
