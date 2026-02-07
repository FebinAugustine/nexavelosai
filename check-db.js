const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: "./backend/.env" });

// TeamMember model (simplified version for debugging)
const TeamMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "editor", "viewer"],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    invitedBy: mongoose.Schema.Types.ObjectId,
    invitedAt: Date,
    joinedAt: Date,
  },
  { timestamps: true },
);

const TeamMember = mongoose.model("TeamMember", TeamMemberSchema);

// Team model (simplified)
const TeamSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    description: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    sharedAgents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Agent" }],
  },
  { timestamps: true },
);

const Team = mongoose.model("Team", TeamSchema);

// Test function
async function debugDatabase() {
  try {
    console.log("Connecting to MongoDB at:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Test parameters from the error
    const teamId = "6985990327c25f6c254bf9ac";
    const memberId = "697706fae81fe17128baac2c";

    // Check if team and member IDs are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      console.error("Invalid teamId:", teamId);
      return;
    }
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      console.error("Invalid memberId:", memberId);
      return;
    }

    // Find the team
    const team = await Team.findById(teamId);
    console.log("\nTeam found:", team);

    // Find the specific member
    const specificMember = await TeamMember.findOne({
      userId: new mongoose.Types.ObjectId(memberId),
      teamId: new mongoose.Types.ObjectId(teamId),
    }).populate("userId");
    console.log("\nSpecific member found:", specificMember);

    // Find all members in the team
    const allMembers = await TeamMember.find({
      teamId: new mongoose.Types.ObjectId(teamId),
    }).populate("userId");
    console.log("\nAll members in team:");
    allMembers.forEach((member) => {
      console.log(
        `- ID: ${member.userId?._id} | Email: ${member.userId?.email} | Role: ${member.role}`,
      );
    });
  } catch (error) {
    console.error("Debug error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

debugDatabase();
