const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['DOCUMENTATION', 'RESOURCE_ALLOCATION', 'SYSTEM_ACCESS', 'PAYROLL', 'COMPLIANCE', 'ORIENTATION'],
    required: true
  },
  assignedTo: {
    type: String,
    enum: ['HR_MANAGER', 'HR_EMPLOYEE', 'SYSTEM_ADMIN', 'NEW_HIRE'],
    required: true
  },
  dueDaysOffset: {
    type: Number,
    default: 0,
    comment: 'Days from start date when this task is due'
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: true });

const onboardingChecklistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  position: {
    type: String
  },
  contractType: {
    type: String,
    enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'ALL']
  },
  items: [checklistItemSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('OnboardingChecklist', onboardingChecklistSchema);
