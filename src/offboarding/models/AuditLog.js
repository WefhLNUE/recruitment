import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  entity: String,
  entityId: String,
  action: String,
  userId: String,
  timestamp: { type: Date, default: Date.now },
  details: String
});

export default mongoose.model("AuditLog", AuditLogSchema);
