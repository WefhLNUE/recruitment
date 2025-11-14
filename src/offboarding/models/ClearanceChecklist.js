import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  department: String,
  itemName: String,
  returned: { type: Boolean, default: false },
  returnedAt: Date,
  notes: String
});

const ClearanceChecklistSchema = new mongoose.Schema({
  exitRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "ExitRequest" },
  items: [ItemSchema],
  completed: { type: Boolean, default: false },
  completedAt: Date
});

export default mongoose.model("ClearanceChecklist", ClearanceChecklistSchema);
