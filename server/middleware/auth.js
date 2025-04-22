const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  console.log('🟢 [Auth Middleware] - Start');
  
  // Check for token in multiple places (header Authorization, x-auth-token, or in req.body)
  const authHeader = req.header('Authorization')?.replace('Bearer ', '');
  const xAuthToken = req.header('x-auth-token');
  const token = authHeader || xAuthToken || req.body?.token;
  
  console.log('🟢 [Auth Middleware] - Token extraction sources:', {
    authHeader: authHeader ? 'present' : 'missing',
    xAuthToken: xAuthToken ? 'present' : 'missing',
    bodyToken: req.body?.token ? 'present' : 'missing'
  });
  
  // Check for direct user ID in headers or params (for assessment endpoints)
  const userId = req.header('x-user-id') || req.params.userId || req.body?.userId;
  if (userId && !token) {
    console.log('🟡 [Auth Middleware] - No token but userId provided:', userId);
    try {
      const user = await User.findById(userId).select('-password');
      if (user) {
        console.log('🟢 [Auth Middleware] - User found via ID:', user.email);
        req.user = user;
        return next();
      }
    } catch (err) {
      console.log('🟡 [Auth Middleware] - Error finding user by ID, continuing token flow');
    }
  }

  if (!token) {
    console.log('🔴 [Auth Middleware] - No token provided');
    return res.status(401).json({ msg: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🟢 [Auth Middleware] - Token decoded:', decoded);

    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) {
      console.log('🔴 [Auth Middleware] - User not found:', decoded.user.id);
      return res.status(404).json({ msg: 'User not found' });
    }

    console.log('🟢 [Auth Middleware] - User found:', user.email, 'Admin:', user.isAdmin);
    req.user = user;
    next();
  } catch (err) {
    console.error('🔴 [Auth Middleware] - Error verifying token:', err.message);
    res.status(401).json({ msg: 'Token invalid' });
  }
};
