const axios = require("axios");

// Replace with your test data
const token = "YOUR_TOKEN_HERE";
const userId = "YOUR_USER_ID_HERE";

async function test() {
  try {
    // Test 1: Get user's agents (should include both own and shared)
    const agentsResponse = await axios.get("http://localhost:5000/agents", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("=== User Agents (including shared) ===");
    console.log(agentsResponse.data);
    console.log(`Total agents: ${agentsResponse.data.length}`);

    // Test 2: Get user's leads (should include leads from shared agents)
    const leadsResponse = await axios.get("http://localhost:5000/leads", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("\n=== User Leads (including shared) ===");
    console.log(leadsResponse.data);
    console.log(`Total leads: ${leadsResponse.data.count}`);

    // Test 3: Get leads stats
    const statsResponse = await axios.get("http://localhost:5000/leads/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("\n=== Leads Stats ===");
    console.log(statsResponse.data);

    // Test 4: Export leads
    // Note: This will download a file
    // const exportResponse = await axios.post('http://localhost:5000/leads/export', { format: 'csv' }, {
    //   headers: { Authorization: `Bearer ${token}` },
    //   responseType: 'blob'
    // });
    // console.log('\n=== Export Leads ===');
    // console.log(exportResponse.data);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

test();
