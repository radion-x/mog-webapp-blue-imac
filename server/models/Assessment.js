const mongoose = require('mongoose');

const surgerySchema = new mongoose.Schema({
  date: String,
  surgery: String,
  surgeonName: String,
  hospital: String
});

const imagingStudySchema = new mongoose.Schema({
  type: String,
  hasHad: Boolean,
  radiologyClinic: String,
  date: String
});

const assessmentSchema = new mongoose.Schema({
  userInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  painLevels: {
    type: Map,
    of: {
      type: Number,
      min: 0,
      max: 10
    },
    default: {}
  },
  painDescription: {
    type: String,
    default: ''
  },
  medicalConditions: {
    herniatedDisc: { type: Boolean, default: false },
    spinalStenosis: { type: Boolean, default: false },
    spondylolisthesis: { type: Boolean, default: false },
    scoliosis: { type: Boolean, default: false }
  },
  neurologicalSymptoms: {
    hasSymptoms: { type: Boolean, default: false },
    description: String
  },
  painDuration: String,
  treatments: {
    overTheCounter: { type: Boolean, default: false },
    prescriptionAntiInflammatory: {
      used: { type: Boolean, default: false },
      details: String
    },
    prescriptionPainMedication: {
      used: { type: Boolean, default: false },
      details: String
    },
    spinalInjections: {
      used: { type: Boolean, default: false },
      details: String
    },
    physiotherapy: { type: Boolean, default: false },
    chiropractic: { type: Boolean, default: false },
    osteopathyMyotherapy: { type: Boolean, default: false }
  },
  surgicalHistory: {
    hasPreviousSurgery: { type: Boolean, default: false },
    surgeries: [surgerySchema]
  },
  imagingStudies: [imagingStudySchema],
  timestamp: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
assessmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Assessment', assessmentSchema);
