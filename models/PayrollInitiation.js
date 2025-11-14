const mongoose = require('mongoose');

const payrollInitiationSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  onboardingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Onboarding',
    required: true
  },
  salary: {
    type: Number,
    required: true
  },
  signingBonus: {
    type: Number,
    default: 0
  },
  signingBonusStatus: {
    type: String,
    enum: ['PENDING', 'PROCESSED', 'PAID', 'CANCELLED'],
    default: 'PENDING'
  },
  signingBonusProcessedDate: {
    type: Date
  },
  payrollStatus: {
    type: String,
    enum: ['PENDING', 'INITIATED', 'ACTIVE', 'ERROR'],
    default: 'PENDING'
  },
  payrollInitiatedDate: {
    type: Date
  },
  payrollEffectiveDate: {
    type: Date,
    required: true,
    comment: 'Date when payroll should start (typically start date)'
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PayrollInitiation', payrollInitiationSchema);
