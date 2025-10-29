// const mongoose = require("mongoose");

// const callHistorySchema = new mongoose.Schema(
//   {
//     lead_id: { type: String, required: true },
//     query_id: { type: String, required: true },
//     person_name: { type: String, required: true },
//     remarks: { type: String, required: true },
//     reschedule_date: { type: Date, required: true },

//     // ✅ Add status
//     status: {
//       type: String,
//       enum: ["Call Later","Completed"],
//       default: "Call Later",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("CallHistory", callHistorySchema);

const mongoose = require("mongoose");

const callHistorySchema = new mongoose.Schema(
  {
    lead_id: { type: String, required: true },
    query_id: { type: String, required: true },

    // 🔹 Person who was contacted
    person_name: { type: String, required: true },

    // 🔹 Call details
    call_date: { type: Date, required: true },
    remarks: { type: String, required: true },
    reschedule_date: { type: Date, required: true },

    // 🔹 Status of this follow-up
    status: {
      type: String,
      enum: ["Call Later", "Completed"],
      default: "Call Later",
    },
  },
  { timestamps: true }
);

// ✅ Index for faster filtering
callHistorySchema.index({ lead_id: 1, query_id: 1, status: 1 });

// ✅ Export the model
module.exports = mongoose.model("CallHistory", callHistorySchema);
