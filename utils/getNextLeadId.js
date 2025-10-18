// utils/getNextLeadId.js
const Counter = require("../models/Counter");

const getNextLeadId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "lead" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  const padded = String(counter.value).padStart(3, "0"); // LEAD-001, LEAD-002
  return `LEAD-${padded}`;
};

module.exports = getNextLeadId;
