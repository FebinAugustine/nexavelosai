const axios = require('axios');

async function testWebhookNotifications() {
  try {
    console.log('Testing webhook notifications...');

    // 1. First, let's check if the backend is running
    const healthCheck = await axios.get('http://localhost:5000');
    console.log('Backend health check:', healthCheck.status);

    // 2. Get test webhook ID from your database
    // Note: You need to replace this with an actual webhook ID from your system
    const testWebhookId = 'your-test-webhook-id';

    // 3. Create a test webhook event
    const testEvent = {
      eventType: 'test.notification',
      payload: {
        message: 'This is a test notification',
        timestamp: new Date().toISOString(),
        test: true,
      },
    };

    console.log('Creating test webhook event...');
    const eventResponse = await axios.post(
      `http://localhost:5000/api/webhooks/${testWebhookId}/events`,
      testEvent,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer your-test-token', // Replace with valid token
        },
      },
    );

    console.log('Test event created:', eventResponse.data);

    // 4. Verify the event was created
    if (eventResponse.data._id) {
      console.log('✓ Webhook event created successfully');
    }

    // 5. Wait a bit and check if email was sent
    console.log('Checking for email notification...');
    console.log(
      'Note: You need to check your email inbox for the notification',
    );

    // 6. Also verify real-time notification
    console.log('Real-time notification should appear in frontend');
  } catch (error) {
    console.error(
      'Error testing webhook notifications:',
      error.response?.data || error.message,
    );
  }
}

testWebhookNotifications();
