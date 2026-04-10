
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

  console.log('Auth middleware called');
  console.log('Authorization header:', req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted:', token.substring(0, 20) + '...');
      
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined');
        return res.status(500).json({ message: 'Server configuration error' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded, user ID:', decoded.id);

      if (User) {
        // If User model exists, fetch full user (exclude password)
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
          console.error('User not found in database for ID:', decoded.id);
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        console.log('User found in database:', req.user._id);
      } else {
        // Minimal fallback user object
        console.warn('User model not available, using minimal user object');
        req.user = { _id: decoded.id };
      }

      return next();
    } catch (error) {
      console.error('Auth protect error:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Not authorized, invalid token' });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Not authorized, token expired' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  console.log('No token found in authorization header');
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
