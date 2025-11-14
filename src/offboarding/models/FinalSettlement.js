import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  type: String,
  amount: Number
});

const DeductionSchema = new mongoose.Schema({
  type: String,
  amount: Number
});

const FinalSettlementSchema = new mongoose.Schema({
  exitRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "ExitRequest" },
  leaveBalanceDays: Number,
  dailyRate: Number,
  leaveEncashmentAmount: Number,
  otherPayments: [PaymentSchema],
  deductions: [DeductionSchema],
  grossSettlement: Number,
  totalDeductions: Number,
  netAmount: Number,
  status: { type: String, enum: ["draft", "approved", "paid"], default: "draft" },
  preparedBy: String,
  preparedAt: Date
});

export default mongoose.model("FinalSettlement", FinalSettlementSchema);
