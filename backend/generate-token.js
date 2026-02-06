const jwt = require('jsonwebtoken');
const secret =
  '6437c8cd3f8e2dae772934d61d42eda8b399c71dc363d320a2611456c58e68b5';

// Payload for the actual user
const payload = {
  email: 'febinaugustine7@gmail.com',
  sub: '69770b3659feda7a1e39ddc3',
};

const token = jwt.sign(payload, secret, { expiresIn: '1h' });
console.log('Generated token for febinaugustine7@gmail.com:');
console.log(token);
