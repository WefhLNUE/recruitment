const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  dateOfBirth: { type: Date },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  resume: { type: String },
  status: {
    type: String,
    enum: ['APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFERED', 'ACCEPTED', 'REJECTED'],
    default: 'APPLIED'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Candidate', candidateSchema);
