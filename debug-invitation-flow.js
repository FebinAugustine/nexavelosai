// Debug script to test the invitation flow
const axios = require("axios");

const BASE_URL = "http://localhost:5000";

async function testInvitationFlow() {
  console.log("=== Testing Invitation Flow ===");

  try {
    // 1. First, let's try to log in as a test user
    console.log("\n1. Logging in as test user...");
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: "testuser@example.com",
      password: "password123",
    });

    console.log("Login successful");
    const token = loginRes.data.access_token;
    const authHeader = `Bearer ${token}`;

    // 2. Get user profile
    console.log("\n2. Fetching user profile...");
    const profileRes = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: authHeader },
    });
    console.log("User profile:", profileRes.data);

    // 3. Try to get teams
    console.log("\n3. Fetching user teams...");
    const teamsRes = await axios.get(`${BASE_URL}/api/teams`, {
      headers: { Authorization: authHeader },
    });
    console.log("User teams:", teamsRes.data);

    // 4. Create a test team
    console.log("\n4. Creating a test team...");
    const teamRes = await axios.post(
      `${BASE_URL}/api/teams`,
      {
        name: "Debug Test Team",
        description: "Team for debugging invitation flow",
      },
      {
        headers: { Authorization: authHeader },
      },
    );
    console.log("Team created:", teamRes.data);
    const teamId = teamRes.data._id;

    // 5. Invite a test member
    console.log("\n5. Inviting test member...");
    const inviteRes = await axios.post(
      `${BASE_URL}/api/teams/${teamId}/invite`,
      {
        email: "invitee@example.com",
        role: "viewer",
      },
      {
        headers: { Authorization: authHeader },
      },
    );
    console.log("Invitation sent:", inviteRes.data);
  } catch (error) {
    console.error("\n=== Error ===");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testInvitationFlow();
