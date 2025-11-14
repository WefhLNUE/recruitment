const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  contractType: {
    type: String,
    enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'],
    required: true
  },
  position: {
    type: String,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  startDate: {
    type: Date,
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
  contractTerms: {
    type: String
  },
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'SIGNED', 'REJECTED', 'EXPIRED'],
    default: 'PENDING'
  },
  signedDate: {
    type: Date
  },
  signedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate'
  },
  contractDocument: {
    type: String,
    default: null
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contract', contractSchema);
