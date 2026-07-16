// auth-controllers.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const SALT_ROUNDS = 10;

// POST /api/auth/register
// Body: { name, email, password }
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are all required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, passwordHash });

    const token = generateToken(user);
    return res.status(201).json({ token, user });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ message: 'Failed to register.' });
  }
};

// POST /api/auth/login
// Body: { email, password }
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Deliberately vague — don't reveal whether the email exists.
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    return res.status(200).json({ token, user });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Failed to log in.' });
  }
};

module.exports = { register, login };