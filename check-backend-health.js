// Simple script to check backend API endpoints
const axios = require("axios");

const BASE_URL = "http://localhost:5000";

async function checkHealth() {
  console.log("=== Checking backend API endpoints ===");

  const endpoints = [
    { name: "Root", url: "/" },
    { name: "Auth Profile", url: "/auth/profile" },
    { name: "Teams", url: "/api/teams" },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\nChecking ${endpoint.name} (${endpoint.url})...`);

      let config = {};

      // Try with and without authentication for endpoints that require it
      if (endpoint.url.includes("/auth") || endpoint.url.includes("/api/")) {
        console.log(" - Trying without authentication...");
        try {
          const res = await axios.get(`${BASE_URL}${endpoint.url}`);
          console.log(
            ` - Success (no auth): ${res.status} - ${res.data?.message || res.statusText}`,
          );
        } catch (error) {
          console.log(
            ` - No auth failed: ${error.response?.status || error.message}`,
          );
        }

        console.log(" - Trying with dummy token...");
        config = {
          headers: {
            Authorization: "Bearer dummy_token",
          },
        };
      }

      // Try with config
      const res = await axios.get(`${BASE_URL}${endpoint.url}`, config);
      console.log(
        ` - Success: ${res.status} - ${res.data?.message || res.statusText}`,
      );
      if (res.data && typeof res.data === "object") {
        console.log(` - Data keys: ${Object.keys(res.data).join(", ")}`);
      }
    } catch (error) {
      console.error(`\n❌ Failed to check ${endpoint.name}`);
      if (error.response) {
        console.error(` - Status: ${error.response.status}`);
        console.error(` - Data: ${JSON.stringify(error.response.data)}`);
        console.error(` - Headers: ${JSON.stringify(error.response.headers)}`);
      } else if (error.request) {
        console.error(` - No response received`);
      } else {
        console.error(` - Error: ${error.message}`);
      }
    }
  }
}

checkHealth().catch((error) => {
  console.error("\n❌ Script error:", error);
  process.exit(1);
});
