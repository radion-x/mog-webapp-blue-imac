const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const MedicalDocument = require('../models/MedicalDocument');
const User = require('../models/User');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueFileName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFileName);
  }
});

// Filter files by type
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, DOC, and DOCX are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get all documents for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const documents = await MedicalDocument.find({ user: req.user.id })
      .sort({ uploadDate: -1 })
      .populate('assessment', 'timestamp painLevels')
      .populate('appointment', 'appointmentType provider date');
    
    res.json(documents);
  } catch (err) {
    console.error('Error in GET /documents:', err.message);
    res.status(500).send('Server error');
  }
});

// Get a specific document
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await MedicalDocument.findById(req.params.id)
      .populate('assessment', 'timestamp painLevels')
      .populate('appointment', 'appointmentType provider date')
      .populate('user', 'name email');
    
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }
    
    // Check if document belongs to the logged in user
    if (document.user._id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    res.json(document);
  } catch (err) {
    console.error('Error in GET /documents/:id:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Document not found' });
    }
    res.status(500).send('Server error');
  }
});

// Download a document file
router.get('/download/:id', auth, async (req, res) => {
  try {
    const document = await MedicalDocument.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }
    
    // Check if document belongs to the logged in user
    if (document.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    const filePath = path.join(__dirname, '..', document.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ msg: 'File not found on server' });
    }
    
    res.download(filePath, document.originalName);
  } catch (err) {
    console.error('Error in GET /documents/download/:id:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Document not found' });
    }
    res.status(500).send('Server error');
  }
});

// Upload a new document
router.post('/', auth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }
  
  const {
    documentType,
    documentDate,
    description,
    assessment,
    appointment,
    tags
  } = req.body;
  
  try {
    const newDocument = new MedicalDocument({
      user: req.user.id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      documentType: documentType || 'other',
      documentDate: documentDate || new Date(),
      filePath: `uploads/${req.file.filename}`,
      description,
      assessment,
      appointment,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });
    
    const document = await newDocument.save();
    
    // Add the document to the user's documents array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { documents: document._id } }
    );
    
    res.json(document);
  } catch (err) {
    console.error('Error in POST /documents:', err.message);
    res.status(500).send('Server error');
  }
});

// Update document details (not the file itself)
router.put('/:id', auth, async (req, res) => {
  const {
    documentType,
    documentDate,
    description,
    assessment,
    appointment,
    tags
  } = req.body;
  
  // Build document update object
  const documentFields = {};
  if (documentType) documentFields.documentType = documentType;
  if (documentDate) documentFields.documentDate = documentDate;
  if (description) documentFields.description = description;
  if (assessment) documentFields.assessment = assessment;
  if (appointment) documentFields.appointment = appointment;
  if (tags) documentFields.tags = tags.split(',').map(tag => tag.trim());
  
  try {
    let document = await MedicalDocument.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }
    
    // Check if document belongs to the logged in user
    if (document.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    document = await MedicalDocument.findByIdAndUpdate(
      req.params.id,
      { $set: documentFields },
      { new: true }
    );
    
    res.json(document);
  } catch (err) {
    console.error('Error in PUT /documents/:id:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Document not found' });
    }
    res.status(500).send('Server error');
  }
});

// Delete a document
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await MedicalDocument.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }
    
    // Check if document belongs to the logged in user
    if (document.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Delete the file from the server
    const filePath = path.join(__dirname, '..', document.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    await document.remove();
    
    // Remove the document from the user's documents array
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { documents: req.params.id } }
    );
    
    res.json({ msg: 'Document removed' });
  } catch (err) {
    console.error('Error in DELETE /documents/:id:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Document not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 