const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Verify token and get user
router.get('/verify', auth, async (req, res) => {
  try {
    console.log('Verify request received, user id:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log('User not found in verification');
      return res.status(404).json({ msg: 'User not found' });
    }
    console.log('User verified, returning user data');
    res.json(user);
  } catch (err) {
    console.error('Error in /verify:', err.message);
    res.status(500).send('Server Error');
  }
});

// Register User
router.post('/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    console.log('Registration request received:', JSON.stringify({
      ...req.body,
      password: req.body.password ? '[REDACTED]' : undefined
    }));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', JSON.stringify(errors.array()));
      return res.status(400).json({ 
        msg: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        console.log('User already exists with email:', email);
        return res.status(400).json({ msg: 'User already exists with this email address' });
      }

      user = new User({
        name,
        email,
        password
      });


      // 🔧 Password hashing is handled in the User model pre('save') hook.
      // Commented out to avoid double hashing.

      // const salt = await bcrypt.genSalt(10);
      // user.password = await bcrypt.hash(password, salt);

      await user.save();
      console.log('User created successfully:', user.id);

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '24h' }, // Extended from 1h to 24h
        (err, token) => {
          if (err) {
            console.error('JWT sign error:', err.message);
            throw err;
          }
          console.log('Token generated successfully');
          res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
        }
      );
    } catch (err) {
      console.error('Error in /register:', err.message);
      console.error(err.stack);
      res.status(500).json({ msg: 'Server error', detail: err.message });
    }
  }
);

// Login User
router.post('/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    console.log('Login request received:', req.body.email);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ msg: 'Invalid credentials', errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      console.log('Finding user by email...');
      let user = await User.findOne({ email });

      if (!user) {
        console.log('User not found');
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      // 👇 Debug logs added here
      console.log('User object from DB:', {
        id: user.id,
        email: user.email,
        password: user.password
      });
      console.log('Plaintext password provided:', password);

      console.log('Comparing passwords...');
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match result:', isMatch);

      if (!isMatch) {
        console.log('Password does not match');
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const payload = {
        user: {
          id: user.id
        }
      };

      console.log('Generating token...');
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '24h' },
        (err, token) => {
          if (err) {
            console.error('Token generation error:', err);
            throw err;
          }
          console.log('Login successful, returning token');
          res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
        }
      );
    } catch (err) {
      console.error('Error in /login:', err.message);
      res.status(500).send('Server error');
    }
  }
);


module.exports = router;
