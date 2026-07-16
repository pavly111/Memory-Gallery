// routes/auth.js
// Routes for registering and logging in. These are the only routes that
// should NEVER have requireAuth in front of them — a user isn't logged in
// yet when hitting either of these, that's the whole point.

const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/auth-controllers');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

module.exports = router;