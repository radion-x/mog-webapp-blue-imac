const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Get all appointments for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id })
      .sort({ date: 1 })
      .populate('assessment', 'timestamp painLevels');
    
    res.json(appointments);
  } catch (err) {
    console.error('Error in GET /appointments:', err.message);
    res.status(500).send('Server error');
  }
});

// Get a specific appointment
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('assessment', 'timestamp painLevels')
      .populate('user', 'name email');
    
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }
    
    // Check if appointment belongs to the logged in user
    if (appointment.user._id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    res.json(appointment);
  } catch (err) {
    console.error('Error in GET /appointments/:id:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Appointment not found' });
    }
    res.status(500).send('Server error');
  }
});

// Create a new appointment
router.post(
  '/',
  [
    auth,
    [
      check('appointmentType', 'Appointment type is required').not().isEmpty(),
      check('provider', 'Provider is required').not().isEmpty(),
      check('date', 'Date is required').not().isEmpty(),
      check('time', 'Time is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      appointmentType,
      provider,
      date,
      time,
      notes,
      assessment
    } = req.body;
    
    try {
      const newAppointment = new Appointment({
        user: req.user.id,
        appointmentType,
        provider,
        date,
        time,
        notes,
        assessment
      });
      
      const appointment = await newAppointment.save();
      
      // Add the appointment to the user's appointments array
      await User.findByIdAndUpdate(
        req.user.id,
        { $push: { appointments: appointment._id } }
      );
      
      res.json(appointment);
    } catch (err) {
      console.error('Error in POST /appointments:', err.message);
      res.status(500).send('Server error');
    }
  }
);

// Update an appointment
router.put('/:id', auth, async (req, res) => {
  const {
    appointmentType,
    provider,
    date,
    time,
    status,
    notes
  } = req.body;
  
  // Build appointment object
  const appointmentFields = {};
  if (appointmentType) appointmentFields.appointmentType = appointmentType;
  if (provider) appointmentFields.provider = provider;
  if (date) appointmentFields.date = date;
  if (time) appointmentFields.time = time;
  if (status) appointmentFields.status = status;
  if (notes) appointmentFields.notes = notes;
  
  try {
    let appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }
    
    // Check if appointment belongs to the logged in user
    if (appointment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: appointmentFields },
      { new: true }
    );
    
    res.json(appointment);
  } catch (err) {
    console.error('Error in PUT /appointments/:id:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Appointment not found' });
    }
    res.status(500).send('Server error');
  }
});

// Delete an appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }
    
    // Check if appointment belongs to the logged in user
    if (appointment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await appointment.remove();
    
    // Remove the appointment from the user's appointments array
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { appointments: req.params.id } }
    );
    
    res.json({ msg: 'Appointment removed' });
  } catch (err) {
    console.error('Error in DELETE /appointments/:id:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Appointment not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 