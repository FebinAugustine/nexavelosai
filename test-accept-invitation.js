const axios = require("axios");

// Test data
const token =
  "50e08f869fbdd2a29f416552d3c0a8d8e770de2b27ba6a77cf3a74551a98191d"; // From user's example
const userToken = "YOUR_JWT_TOKEN_HERE"; // Replace with actual JWT token from localStorage

async function testAcceptInvitation() {
  try {
    console.log("Testing accept invitation endpoint...");

    const response = await axios.post(
      `http://localhost:5000/api/teams/invite/${token}/accept`,
      {},
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Success! Response:", response.data);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

// Uncomment to test reject invitation
/*
async function testRejectInvitation() {
  try {
    console.log('Testing reject invitation endpoint...');
    
    const response = await axios.post(
      `http://localhost:5000/api/teams/invite/${token}/reject`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Success! Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}
*/

// Run test
testAcceptInvitation();
