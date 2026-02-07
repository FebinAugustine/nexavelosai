const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './.env' });

// TeamMember model
const TeamMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'editor', 'viewer'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    invitedBy: mongoose.Schema.Types.ObjectId,
    invitedAt: Date,
    joinedAt: Date,
  },
  { timestamps: true },
);

const TeamMember = mongoose.model('TeamMember', TeamMemberSchema);

// Test function
async function fixInconsistentData() {
  try {
    console.log('Connecting to MongoDB at:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all team members with string userIds
    const membersWithStringIds = await TeamMember.find({
      userId: { $type: 'string' },
    });

    console.log(
      `Found ${membersWithStringIds.length} members with string userIds`,
    );

    // Fix each member
    for (const member of membersWithStringIds) {
      console.log(`Fixing member: ${member._id} - userId: ${member.userId}`);

      // Convert to ObjectId
      if (mongoose.Types.ObjectId.isValid(member.userId)) {
        member.userId = new mongoose.Types.ObjectId(member.userId);
        await member.save();
        console.log('Successfully fixed');
      } else {
        console.error('Invalid ObjectId:', member.userId);
      }
    }

    // Verify all members now have ObjectIds
    const allMembers = await TeamMember.find().select('userId');
    const invalidMembers = allMembers.filter(
      (member) => typeof member.userId === 'string',
    );

    console.log(
      `\nValidation complete. ${invalidMembers.length} invalid members remain`,
    );
    if (invalidMembers.length > 0) {
      console.log('Invalid members:', invalidMembers);
    }
  } catch (error) {
    console.error('Fix error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixInconsistentData();
