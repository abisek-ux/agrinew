const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'agrilink_super_secret_jwt_key_2026';

  return jwt.sign(
    { id, role },
    secret,
    { expiresIn: '30d' }
  );
};

module.exports = generateToken;
