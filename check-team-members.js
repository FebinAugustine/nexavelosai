const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const dotenv = require("dotenv");
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

// Test function
async function debugMemberLookup() {
  try {
    // Connect to database
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

    console.log("Looking for member with userId:", memberId);
    console.log("Looking for teamId:", teamId);

    // Try to find the team member
    const foundMember = await TeamMember.findOne({
      userId: new mongoose.Types.ObjectId(memberId),
      teamId: new mongoose.Types.ObjectId(teamId),
    }).populate("userId");

    console.log("Found member:", foundMember);

    // Get all members in the team for comparison
    const allMembersInTeam = await TeamMember.find({
      teamId: new mongoose.Types.ObjectId(teamId),
    }).populate("userId");

    console.log("\nAll members in team:", allMembersInTeam);
  } catch (error) {
    console.error("Debug error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

debugMemberLookup();
