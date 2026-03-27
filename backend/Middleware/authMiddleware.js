
const jwt = require('jsonwebtoken');

// Try to require the User model; if it doesn't exist we'll fall back to a minimal user object
let User = null;
try {
  User = require('../Models/userModel');
} catch (e) {
  User = null;
}

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (User) {
        // If User model exists, fetch full user (exclude password)
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
      } else {
        // Minimal fallback user object
        req.user = { _id: decoded.id };
      }

      return next();
    } catch (error) {
      console.error('auth protect error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token' });
};

// Middleware to authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    // If no roles were specified, allow access
    if (!roles || roles.length === 0) return next();

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // If user has a role property, enforce role checking
    if (req.user.role && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
    }

    // If req.user.role is not present, allow through (legacy tokens may not include role)
    return next();
  };
};

module.exports = { protect, authorize };
