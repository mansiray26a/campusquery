const jwt = require('jsonwebtoken');

const generateToken = (id, sessionVersion = 0) => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET must be configured with at least 32 characters');

  return jwt.sign({ id, sessionVersion }, secret, {
    expiresIn: '30d'
  });
};

module.exports = generateToken;
