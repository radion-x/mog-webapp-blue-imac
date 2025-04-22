const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');
const auth = require('../middleware/auth');
const { generateAssessmentSummary } = require('../utils/claudeAI');

// Create initial assessment (public route)
router.post('/', async (req, res) => {
  try {
    const { name, email, painLevels } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Please provide name and email' });
    }

    let assessment = new Assessment({
      userInfo: { name, email },
      painLevels: painLevels || {},
      previousTreatments: [],
      diagnosticTests: []
    });

    await assessment.save();
    res.json(assessment);
  } catch (err) {
    console.error('Error creating assessment:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Update pain assessment
router.post('/pain-assessment', async (req, res) => {
  try {
    const { userId, painLevels, timestamp } = req.body;
    
    console.log('Updating pain assessment for assessment ID:', userId);
    console.log('Pain levels:', painLevels);
    
    // If no userId, return error as we now require user registration
    if (!userId) {
      return res.status(400).json({ message: 'Assessment ID is required' });
    }

    // Find existing assessment to update
    let assessment = await Assessment.findById(userId);
    
    if (!assessment) {
      console.log('Assessment not found with ID:', userId);
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Update the pain levels and timestamp
    assessment.painLevels = painLevels;
    assessment.timestamp = timestamp;
    
    await assessment.save();
    console.log('Assessment updated successfully');
    
    res.json(assessment);
  } catch (err) {
    console.error('Error in pain assessment:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Save treatment history
router.post('/treatment-history', async (req, res) => {
  try {
    const {
      assessmentId,
      treatments,
      diagnosticTests,
      otherTreatment,
      otherTest
    } = req.body;

    let assessment = await Assessment.findById(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    assessment.previousTreatments = treatments;
    assessment.diagnosticTests = diagnosticTests;
    assessment.otherTreatment = otherTreatment;
    assessment.otherTest = otherTest;

    await assessment.save();
    res.json(assessment);
  } catch (err) {
    console.error('Error in treatment history:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Create assessment for authenticated user
router.post('/user', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Please provide name and email' });
    }

    let assessment = new Assessment({
      userInfo: { name, email },
      userId: userId,
      painLevels: {},
      previousTreatments: [],
      diagnosticTests: []
    });

    await assessment.save();
    res.json(assessment);
  } catch (err) {
    console.error('Error creating assessment for user:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get assessments for authenticated user
router.get('/user', async (req, res) => {
  try {
    console.log('Processing /user route for assessments');
    console.log('Request headers:', req.headers);
    
    // Get user ID from multiple possible sources
    const userId = req.user?.id || req.headers['x-user-id'] || req.query.userId;
    
    console.log('User ID from sources:', {
      authMiddleware: req.user?.id || 'missing',
      headers: req.headers['x-user-id'] || 'missing',
      query: req.query.userId || 'missing',
      final: userId || 'missing'
    });
    
    console.log('Full user object:', req.user);
    
    if (!userId) {
      console.log('No user ID found in request - checking for email');
      // Try getting user by email if provided
      const email = req.headers['x-email'] || req.query.email;
      if (email) {
        console.log('Trying to find assessments by email header:', email);
        const emailAssessments = await Assessment.find({ 'userInfo.email': email });
        console.log('Found assessments by email header:', emailAssessments ? emailAssessments.length : 0);
        return res.json(emailAssessments || []);
      }
      
      console.log('No email found either, returning unauthorized');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find all assessments linked to this user 
    // Test multiple approaches to match userId (as string, as ObjectId)
    console.log('Finding assessments with userId:', userId);
    
    // First try as string (direct match)
    let assessments = await Assessment.find({ userId: userId.toString() });
    
    // If nothing found, try with ObjectId conversion
    if (!assessments || assessments.length === 0) {
      try {
        const objectId = new mongoose.Types.ObjectId(userId);
        console.log('Trying with ObjectId:', objectId);
        assessments = await Assessment.find({ userId: objectId });
      } catch (idErr) {
        console.log('Error converting to ObjectId, continuing with other methods');
      }
    }
    
    console.log('Found assessments:', assessments ? assessments.length : 0);
    
    // First return directly whatever we found
    if (assessments && assessments.length > 0) {
      return res.json(assessments);
    }
    
    // If still nothing, try finding by email
    console.log('No assessments found with userId match, trying email match as fallback');
    
    // Try to find by user email as a fallback
    const User = mongoose.model('User');
    const user = await User.findById(userId);
    
    if (user && user.email) {
      console.log('Trying to find assessments by email:', user.email);
      const emailAssessments = await Assessment.find({ 'userInfo.email': user.email });
      console.log('Found assessments by email:', emailAssessments ? emailAssessments.length : 0);
      
      // Link these assessments to the user if found
      if (emailAssessments && emailAssessments.length > 0) {
        console.log('Linking email-matched assessments to user');
        
        // Update all matches to include the user ID
        for (const assessment of emailAssessments) {
          assessment.userId = userId;
          await assessment.save();
          console.log(`Linked assessment ${assessment._id} to user ${userId}`);
        }
        
        return res.json(emailAssessments);
      }
    }
    
    // As last resort, check if there's an assessment with ID matching the current user's session
    const currentAssessmentId = req.headers['x-assessment-id'] || req.query.assessmentId;
    if (currentAssessmentId) {
      try {
        console.log('Checking for specific assessment ID:', currentAssessmentId);
        const specificAssessment = await Assessment.findById(currentAssessmentId);
        if (specificAssessment) {
          console.log('Found specific assessment, linking to user and returning');
          specificAssessment.userId = userId;
          await specificAssessment.save();
          return res.json([specificAssessment]);
        }
      } catch (specificErr) {
        console.log('Error finding specific assessment:', specificErr);
      }
    }
    
    // Nothing found after all efforts
    console.log('No assessments found for this user after all methods tried');
    res.json([]);
  } catch (err) {
    console.error('Error getting user assessments:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get all assessments (for debugging)
router.get('/', async (req, res) => {
  try {
    console.log('Getting all assessments');
    const assessments = await Assessment.find()
      .sort({ createdAt: -1 })
      .limit(20);
    
    console.log(`Found ${assessments.length} assessments`);
    res.json(assessments);
  } catch (err) {
    console.error('Error getting all assessments:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get assessment data
router.get('/:id', async (req, res) => {
  try {
    console.log('Getting assessment with ID:', req.params.id);
    
    // Handle case where id might be 'user' 
    if (req.params.id === 'user') {
      return res.status(400).json({ message: 'Invalid ID: "user"' });
    }
    
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.json(assessment);
  } catch (err) {
    console.error('Error in getting assessment:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Generate AI summary for an assessment
router.get('/:id/summary', async (req, res) => {
  try {
    console.log('Generating summary for assessment ID:', req.params.id);
    
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    
    // Generate summary using Claude AI
    const summary = await generateAssessmentSummary(assessment);
    
    // Return the summary
    res.json({ 
      assessmentId: req.params.id,
      summary: summary,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error generating assessment summary:', err);
    res.status(500).json({ 
      message: 'Failed to generate summary', 
      error: err.message 
    });
  }
});

// Link assessment to user account
router.put('/:id/link-user', auth, async (req, res) => {
  try {
    // Get user ID from the auth middleware or from request body
    const userId = req.user?.id || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({ message: 'Please provide user ID' });
    }

    console.log(`Linking assessment ${req.params.id} to user ${userId}`);
    
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      console.log(`Assessment ${req.params.id} not found`);
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Update the assessment with the user ID
    assessment.userId = userId;
    
    // Set timestamp if not already set
    if (!assessment.timestamp) {
      assessment.timestamp = new Date();
    }
    
    const updatedAssessment = await assessment.save();
    console.log(`Successfully linked assessment ${req.params.id} to user ${userId}`);

    // Verify the update worked
    const verifyAssessment = await Assessment.findById(req.params.id);
    console.log(`Verification: Assessment userId is now: ${verifyAssessment.userId}`);

    res.json({ 
      message: 'Assessment linked to user successfully', 
      assessment: updatedAssessment,
      userId: updatedAssessment.userId
    });
  } catch (err) {
    console.error('Error linking assessment to user:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router; 