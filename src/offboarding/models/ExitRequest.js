const mongoose = require("mongoose");

const ExitRequestSchema = new mongoose.Schema({
  employeeId: String,
  type: String, // resignation or termination
  reason: String,
  effectiveDate: Date,
  submittedBy: String,
  submittedAt: { type: Date, default: Date.now },
  status: String,
});

module.exports = mongoose.model("ExitRequest", ExitRequestSchema);
