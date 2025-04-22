const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Assessment = require('../models/Assessment');

const adminOnly = async (req, res, next) => {
  console.log('🟢 [Admin Middleware] - Entered adminOnly middleware');

  if (!req.user || !req.user._id) {
    console.log('🔴 [Admin Middleware] - Unauthorized: Missing user data in request');
    return res.status(401).json({ msg: 'Unauthorized' });
  }

  console.log('🟢 [Admin Middleware] - User data:', req.user.email, 'Admin:', req.user.isAdmin);

  if (!req.user.isAdmin) {
    console.log('🔴 [Admin Middleware] - Access denied, user is not admin:', req.user.email);
    return res.status(403).json({ msg: 'Access denied: Admins only' });
  }

  console.log('🟢 [Admin Middleware] - Admin verification passed');
  next();
};

router.get('/users', auth, adminOnly, async (req, res) => {
  console.log('🟢 [Admin Route] - Fetching all users...');
  try {
    const users = await User.find().select('-password');
    console.log('🟢 [Admin Route] - Users fetched successfully:', users.length, 'users found.');
    res.json(users);
  } catch (err) {
    console.error('🔴 [Admin Route] - Error fetching users:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
