const mongoose = require('mongoose');

/**
 * Middleware-like helper: extracts user from the dummy JWT token in Authorization header.
 * Returns the User document or null if unauthorized.
 */
const getUserByToken = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer dummy-jwt-token-')) return null;
  const userId = authHeader.replace('Bearer dummy-jwt-token-', '');
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;
  const User = require('../models/User');
  return await User.findById(userId).select('-password');
};

module.exports = { getUserByToken };
