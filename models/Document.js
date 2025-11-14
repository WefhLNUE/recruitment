const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  onboardingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Onboarding',
    required: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  documentType: {
    type: String,
    enum: ['ID', 'PASSPORT', 'DRIVERS_LICENSE', 'CERTIFICATION', 'DEGREE', 'TAX_FORM', 'BANK_DETAILS', 'CONTRACT', 'OTHER'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  filePath: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  mimeType: {
    type: String
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedDate: {
    type: Date
  },
  reviewNotes: {
    type: String
  },
  expiryDate: {
    type: Date
  },
  isRequired: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
