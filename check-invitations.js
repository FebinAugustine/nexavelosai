const mongoose = require("mongoose");
const dotenv = require("dotenv");
const {
  Invitation,
  InvitationStatus,
} = require("./backend/src/teams/invitations.schema");
const { Team } = require("./backend/src/teams/teams.schema");
const { TeamMember } = require("./backend/src/teams/team-members.schema");
const { User } = require("./backend/src/users/users.schema");

dotenv.config({ path: "./backend/.env" });

async function main() {
  console.log("=== Connecting to database ===");
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost/nexavelosai",
  );
  console.log("Connected to database");

  try {
    // Check pending invitations
    console.log("\n=== Pending Invitations ===");
    const pendingInvitations = await Invitation.find({
      status: InvitationStatus.PENDING,
    })
      .populate("teamId")
      .populate("invitedBy");

    console.log(`Found ${pendingInvitations.length} pending invitations`);

    pendingInvitations.forEach((inv, index) => {
      console.log(`\n${index + 1}. Invitation to: ${inv.email}`);
      console.log(`   Role: ${inv.role}`);
      console.log(`   Team: ${inv.teamId?.name}`);
      console.log(`   Token: ${inv.token}`);
      console.log(`   Expires: ${inv.expiresAt}`);
      console.log(`   Invited By: ${inv.invitedBy?.email}`);
    });

    // Check teams and members
    console.log("\n=== Teams ===");
    const teams = await Team.find().populate("members");
    teams.forEach((team, index) => {
      console.log(`\n${index + 1}. Team: ${team.name}`);
      console.log(`   Owner: ${team.ownerId}`);
      console.log(`   Members: ${team.members.length}`);
    });

    // Check users
    console.log("\n=== Users ===");
    const users = await User.find().select("email _id");
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User: ${user.email}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Teams: ${user.teams?.length || 0}`);
    });
  } catch (error) {
    console.error("\n=== Error ===");
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("\n\nDisconnected from database");
  }
}

main();
