const jwt = require('jsonwebtoken');

function generateToken(user) {
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
  };
  const options = {
    expiresIn: '1h',
  };
  return jwt.sign(payload, 'ddd', options);
}

module.exports = generateToken;
