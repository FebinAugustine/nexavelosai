const jwt = require('jsonwebtoken');
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJzdWIiOiI2OTc3MDZmYWU4MWZlMTcxMjhiYWFjMmMiLCJpYXQiOjE3Njk0MTg0MDMsImV4cCI6MTc2OTQyMjAwM30.92A669AdoMrsaPmWsltxx5zNG1ay5Fz99Kz2lQnT4Xc';
const secret =
  '6437c8cd3f8e2dae772934d61d42eda8b399c71dc363d320a2611456c58e68b5';

console.log('Token:', token);
console.log('Secret:', secret);

try {
  const decoded = jwt.verify(token, secret);
  console.log('Token is valid!');
  console.log('Decoded payload:', decoded);
} catch (error) {
  console.error('Token verification failed:', error);
  try {
    const decoded = jwt.decode(token);
    console.log('Token can be decoded (without verification):', decoded);
  } catch (decodeError) {
    console.error('Token decode failed:', decodeError);
  }
}
