const connectDB = require("./db");
const ExitRequest = require("./models/ExitRequest.js");

(async () => {
  await connectDB();

  const testExit = new ExitRequest({
    employeeId: "EMP001",
    type: "resignation",
    reason: "Career change",
    effectiveDate: new Date("2025-11-30"),
    submittedBy: "HR001",
    status: "pending",
  });

  await testExit.save();
  console.log("✅ Exit Request saved!");
  process.exit();
})();
