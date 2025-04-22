const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  painPoints: [
    {
      x: Number,
      y: Number,
      severity: Number
    }
  ],
  treatments: {
    medication: Boolean,
    physiotherapy: Boolean,
    injections: Boolean,
    surgery: Boolean,
    additionalInfo: String
  },
  assessments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment'
    }
  ],
  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    }
  ],
  documents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalDocument'
    }
  ],
  profileCompleted: {
    type: Boolean,
    default: false
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      appointments: {
        type: Boolean,
        default: true
      },
      assessmentReminders: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
