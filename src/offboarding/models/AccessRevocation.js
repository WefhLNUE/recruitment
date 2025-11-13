import mongoose from "mongoose";

const SystemSchema = new mongoose.Schema({
  system: String,
  revoked: { type: Boolean, default: false },
  revokedAt: Date
});

const AccessRevocationSchema = new mongoose.Schema({
  exitRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "ExitRequest" },
  systems: [SystemSchema],
  requestedAt: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
  completedAt: Date
});

export default mongoose.model("AccessRevocation", AccessRevocationSchema);
