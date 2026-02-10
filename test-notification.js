const axios = require("axios");

async function testNotifications() {
  try {
    // Replace with your actual test data
    const testToken = "your-test-token"; // Get from localStorage after login
    const testWebhookId = "your-test-webhook-id"; // Get from your webhooks list

    console.log("Testing webhook notifications...");

    // Test 1: Check backend health
    const healthCheck = await axios.get("http://localhost:5000");
    console.log("✅ Backend health check:", healthCheck.status);

    // Test 2: Get user profile
    const profileResponse = await axios.get(
      "http://localhost:5000/auth/profile",
      {
        headers: {
          Authorization: `Bearer ${testToken}`,
        },
      },
    );
    console.log("✅ User profile:", profileResponse.data.email);

    // Test 3: Create a test webhook event (using the test endpoint)
    console.log("Testing webhook test endpoint...");
    const testResponse = await axios.post(
      `http://localhost:5000/api/webhooks/${testWebhookId}/test`,
      {},
      {
        headers: {
          Authorization: `Bearer ${testToken}`,
        },
      },
    );

    console.log("✅ Webhook test response:", testResponse.data);

    if (testResponse.data.message === "Webhook test succeeded") {
      console.log("🎉 Webhook test passed!");
      console.log(
        "📨 Email notification should be sent to:",
        profileResponse.data.email,
      );
      console.log("🔔 Real-time notification should appear in frontend");
    } else {
      console.error("❌ Webhook test failed:", testResponse.data);
    }
  } catch (error) {
    console.error(
      "❌ Error testing notifications:",
      error.response?.data || error.message,
    );
    if (error.response?.status === 401) {
      console.error(
        "🔑 JWT token expired. Please login again to get a new token.",
      );
    }
  }
}

// Run the test
testNotifications();
