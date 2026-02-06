const bcrypt = require('bcrypt');

// Stored password hash from the database
const hashedPassword =
  '$2b$10$r5hkOnG3n7M6GHs5jTuYFOjrkg4VFCeVKpqPnB/cGVTOlzWr4V/zS';

// List of possible passwords to test
const possiblePasswords = [
  'Febin@123',
  'febin@123',
  'F!b!n@123',
  'F!b!n@12345',
  'febinaugustine7',
  '123456',
];

async function checkPasswords() {
  console.log('Checking possible passwords...');
  console.log('===============================');

  for (let password of possiblePasswords) {
    const match = await bcrypt.compare(password, hashedPassword);
    console.log(
      `Password "${password}": ${match ? '✅ Match!' : '❌ No match'}`,
    );
  }

  console.log('===============================');
}

checkPasswords();
