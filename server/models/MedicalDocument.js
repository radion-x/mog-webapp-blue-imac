const mongoose = require('mongoose');

const medicalDocumentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  documentType: {
    type: String,
    enum: ['imaging', 'lab_results', 'doctor_notes', 'prescription', 'surgery_report', 'other'],
    required: true
  },
  documentDate: {
    type: Date,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  filePath: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment'
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  tags: [String]
});

module.exports = mongoose.model('MedicalDocument', medicalDocumentSchema); 