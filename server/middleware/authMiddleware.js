const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isConnected } = require('../config/db');
const { findMemoryUserById } = require('../controllers/authController');

const secret = process.env.JWT_SECRET || 'agrilink_super_secret_jwt_key_2026';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (token && token !== 'undefined' && token !== 'null') {
        const decoded = jwt.verify(token, secret);

        if (isConnected()) {
          let user = null;
          try {
            user = await User.findById(decoded.id).select('-password');
          } catch (castErr) {
            // Non-ObjectId string (e.g. seeded test user id)
          }
          if (!user) {
            const memUser = findMemoryUserById(decoded.id);
            if (memUser) {
              req.user = {
                ...memUser,
                id: memUser.id || memUser._id,
                _id: memUser._id || memUser.id,
                role: memUser.role
              };
              return next();
            }
            return res.status(401).json({ message: 'Not authorized, user not found' });
          }
          req.user = user;
          req.user.id = String(user._id);
        } else {
          const user = findMemoryUserById(decoded.id);
          if (!user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
          }
          req.user = {
            ...user,
            id: user.id || user._id,
            _id: user._id || user.id,
            role: user.role
          };
        }

        return next();
      }
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token || token === 'undefined' || token === 'null') {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (token && token !== 'undefined' && token !== 'null') {
        const decoded = jwt.verify(token, secret);
        if (isConnected()) {
          let user = null;
          try {
            user = await User.findById(decoded.id).select('-password');
          } catch (castErr) {
            // Non-ObjectId string
          }
          if (!user) {
            user = findMemoryUserById(decoded.id);
          }
          if (user) {
            req.user = user;
            req.user.id = String(user._id || user.id);
          }
        } else {
          const user = findMemoryUserById(decoded.id);
          if (user) {
            req.user = {
              ...user,
              id: user.id || user._id,
              _id: user._id || user.id,
              role: user.role
            };
          }
        }
      }
    } catch (error) {
      // Allow request to proceed for optional authentication
    }
  }
  return next();
};

module.exports = { protect, optionalProtect };

