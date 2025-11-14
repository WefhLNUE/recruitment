const mongoose = require('mongoose');

const systemAccessSchema = new mongoose.Schema({
  onboardingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Onboarding',
    required: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  systemName: {
    type: String,
    required: true,
    enum: ['EMAIL', 'PAYROLL', 'HRIS', 'IT_SYSTEM', 'VPN', 'SHAREPOINT', 'SLACK', 'OTHER']
  },
  accessLevel: {
    type: String,
    enum: ['READ', 'WRITE', 'ADMIN', 'CUSTOM'],
    default: 'READ'
  },
  username: {
    type: String
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROVISIONED', 'ACTIVE', 'SUSPENDED', 'REVOKED'],
    default: 'PENDING'
  },
  provisionedDate: {
    type: Date
  },
  provisionedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  activationDate: {
    type: Date,
    comment: 'Date when access should be activated (typically start date)'
  },
  revocationDate: {
    type: Date,
    comment: 'Date when access should be revoked (typically exit date)'
  },
  revokedDate: {
    type: Date
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SystemAccess', systemAccessSchema);
