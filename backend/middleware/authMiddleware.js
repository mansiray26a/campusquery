const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const secret = process.env.JWT_SECRET;
      if (!secret || secret.length < 32) {
        return res.status(503).json({ message: 'Authentication is not configured securely' });
      }
      const decoded = jwt.verify(token, secret);

      // Get user from the token and attach to request
      req.user = await User.findById(decoded.id);
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if ((decoded.sessionVersion || 0) !== (req.user.sessionVersion || 0)) {
        return res.status(401).json({ message: 'Session has been revoked' });
      }

      next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
