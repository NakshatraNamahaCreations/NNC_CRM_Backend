const mongoose = require("mongoose");

const callHistorySchema = new mongoose.Schema(
  {
    lead_id: { type: String, required: true },
    query_id: { type: String, required: true },
    person_name: { type: String, required: true },
    remarks: { type: String, required: true },
    reschedule_date: { type: Date, required: true },

  },
  { timestamps: true }
);

module.exports = mongoose.model("CallHistory", callHistorySchema);
