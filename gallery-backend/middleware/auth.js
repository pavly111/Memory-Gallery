// middleware/auth.js
// Verifies the JWT sent by the client and attaches { id, name, email } to req.user.
// Every route that needs req.user (like the gallery controllers) should use this
// as a middleware before the route handler, e.g.:
//   router.get('/events/:eventId/photos', requireAuth, getEventPhotos);

const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization; // expected format: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, name: decoded.name, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = { requireAuth };