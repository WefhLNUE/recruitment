const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  onboardingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Onboarding',
    required: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  resourceType: {
    type: String,
    enum: ['EQUIPMENT', 'DESK', 'ACCESS_CARD', 'PHONE', 'LAPTOP', 'MONITOR', 'KEYBOARD', 'MOUSE', 'HEADPHONES', 'OTHER'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  serialNumber: {
    type: String
  },
  location: {
    type: String
  },
  status: {
    type: String,
    enum: ['RESERVED', 'ASSIGNED', 'PENDING', 'AVAILABLE', 'MAINTENANCE'],
    default: 'RESERVED'
  },
  reservedDate: {
    type: Date,
    default: Date.now
  },
  assignedDate: {
    type: Date
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  returnDate: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
