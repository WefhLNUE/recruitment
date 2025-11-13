import { connectDB } from "./src/db.js";
import ExitRequest from "./src/models/ExitRequest.js";

await connectDB();

// create a dummy exit request
const testExit = new ExitRequest({
  employeeId: "EMP001",
  type: "resignation",
  reason: "Career change",
  effectiveDate: new Date("2025-11-30"),
  submittedBy: "HR001"
});

await testExit.save();
console.log("✅ Exit Request saved!");
process.exit();
