const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');

// Save pain points (Page 2)
router.put('/pain', authenticateToken, async (req, res) => {
  try {
    const { points } = req.body;
    if (!points) {
      return res.status(400).json({ message: 'No pain points provided' });
    }
    await User.findByIdAndUpdate(req.user.userId, { painPoints: points });
    res.json({ message: 'Pain points saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error saving pain points' });
  }
});

// Save treatments info (Page 3)
router.put('/treatments', authenticateToken, async (req, res) => {
  try {
    const { treatments, additionalInfo } = req.body;
    if (!treatments) {
      return res.status(400).json({ message: 'No treatment data provided' });
    }
    await User.findByIdAndUpdate(req.user.userId, { treatments: { ...treatments, additionalInfo } });
    res.json({ message: 'Treatments info saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error saving treatments info' });
  }
});

module.exports = router;
