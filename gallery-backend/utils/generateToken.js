// utils/generateToken.js
// Centralizes JWT signing so both auth-controllers.js (register/login) and
// any future controller that needs to issue a token use the exact same
// payload shape that middleware/auth.js expects to decode.

const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;