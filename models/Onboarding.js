const mongoose = require('mongoose');

const onboardingTaskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true
  },
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
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'],
    default: 'PENDING'
  },
  dueDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
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

const onboardingSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  checklistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OnboardingChecklist'
  },
  tasks: [onboardingTaskSchema],
  overallStatus: {
    type: String,
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'],
    default: 'NOT_STARTED'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetCompletionDate: {
    type: Date
  },
  actualCompletionDate: {
    type: Date
  },
  assignedHRManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedHREmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate completion percentage
onboardingSchema.virtual('completionPercentage').get(function() {
  if (!this.tasks || this.tasks.length === 0) return 0;
  const completedTasks = this.tasks.filter(task => task.status === 'COMPLETED').length;
  return Math.round((completedTasks / this.tasks.length) * 100);
});

onboardingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Onboarding', onboardingSchema);
