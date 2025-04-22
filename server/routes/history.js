const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');

// Get treatment history
router.get('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Treatment history not found' });
    }

    res.json(assessment);
  } catch (err) {
    console.error('Error fetching treatment history:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Save or update treatment history
router.post('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Update specific fields from the request body
    const {
      medicalConditions,
      neurologicalSymptoms,
      painDuration,
      treatments,
      surgicalHistory,
      imagingStudies
    } = req.body;

    // Only update fields that are present in the request
    if (medicalConditions) assessment.medicalConditions = medicalConditions;
    if (neurologicalSymptoms) assessment.neurologicalSymptoms = neurologicalSymptoms;
    if (painDuration) assessment.painDuration = painDuration;
    if (treatments) assessment.treatments = treatments;
    if (surgicalHistory) assessment.surgicalHistory = surgicalHistory;
    if (imagingStudies) assessment.imagingStudies = imagingStudies;

    await assessment.save();
    res.json(assessment);
  } catch (err) {
    console.error('Error saving treatment history:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router; 