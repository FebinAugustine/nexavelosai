const axios = require('axios');

async function testCreateLead() {
  try {
    console.log('Creating test lead...');

    const response = await axios.post(
      'http://localhost:5000/leads',
      {
        agentId: '69787d4c04710966e1e7b932',
        email: 'test-lead-2@gmail.com',
        name: 'Test Lead 2',
        phone: '1234567890',
        company: 'Test Company 2',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('Lead created successfully:', response.data);

    if (response.data.chatSessions && response.data.chatSessions.length > 0) {
      console.log('✓ Chat session linked to lead');
    } else {
      console.log('✗ No chat session linked to lead');
    }
  } catch (error) {
    console.error(
      'Error creating lead:',
      error.response?.data || error.message,
    );
  }
}

testCreateLead();
