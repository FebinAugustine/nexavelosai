const jwt = require('jsonwebtoken');
const secret =
  '6437c8cd3f8e2dae772934d61d42eda8b399c71dc363d320a2611456c58e68b5';

// Test signing and verifying
const payload = { email: 'test@example.com', sub: '697706fae81fe17128baac2c' };
const token = jwt.sign(payload, secret, { expiresIn: '1h' });
console.log('Generated token:', token);

try {
  const decoded = jwt.verify(token, secret);
  console.log('Verification successful!');
  console.log('Decoded payload:', decoded);
} catch (error) {
  console.error('Verification failed:', error);
}
