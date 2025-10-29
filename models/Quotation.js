// const mongoose = require("mongoose");
// const Counter = require("./Counter");

// /* -------------------------------------------------------------------------- */
// /* 🔹 Quotation Schema                                                        */
// /* -------------------------------------------------------------------------- */
// const QuotationSchema = new mongoose.Schema(
//   {
//     quotationId: { type: String, unique: true },

//     // 🔹 References (Mongo ObjectIds)
//     lead_Id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Lead",
//       required: true,
//     },
//     query_Id: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//     },

//     // 🔹 Basic Details
//     quoteTitle: { type: String },
//     quoteDescription: { type: String },
//     quoteNote: { type: String },

//     // 🔹 Services added in quotation
//     quotationServices: [
//       {
//         name: { type: String, required: true },
//         price: { type: Number, required: true },
//         marginPrice: { type: Number, default: 0 },
//         expectedDelivery: { type: Date },
//       },
//     ],

//     // 🔹 Financial Details
//     discountValue: { type: Number, default: 0 },
//     gstApplied: { type: Boolean, default: true },
//     gstValue: { type: Number, default: 0 },
//     totalAmount: { type: Number, default: 0 },
//     marginAmount: { type: Number, default: 0 },

//     // 🔹 Status controls
//     bookingStatus: {
//       type: String,
//       enum: ["NotBooked", "Booked", "Completed"],
//       default: "NotBooked",
//     },
//     finalized: { type: Boolean, default: false },

//     // 🔹 Relations
//     installments: [
//       { type: mongoose.Schema.Types.ObjectId, ref: "Installment" },
//     ],
//     clientInstructions: { type: [String], default: [] },
//   },
//   { timestamps: true }
// );

// /* -------------------------------------------------------------------------- */
// /* 🔹 Auto-generate quotationId (e.g. QUO-001)                                */
// /* -------------------------------------------------------------------------- */
// QuotationSchema.pre("save", async function (next) {
//   if (!this.isNew || this.quotationId) return next();
//   try {
//     const counter = await Counter.findOneAndUpdate(
//       { name: "quotation" },
//       { $inc: { seq: 1 } },
//       { new: true, upsert: true }
//     );
//     this.quotationId = `QUO-${counter.seq.toString().padStart(3, "0")}`;
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// module.exports = mongoose.model("Quotation", QuotationSchema);


const mongoose = require("mongoose");
const Counter = require("./Counter");

/* -------------------------------------------------------------------------- */
/* 🔹 Quotation Schema                                                        */
/* -------------------------------------------------------------------------- */
const QuotationSchema = new mongoose.Schema(
  {
    quotationId: { type: String, unique: true },

    // 🔹 References (Mongo ObjectIds + readable string IDs)
    lead_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    lead_id: {
      type: String, // e.g., "LEAD-003"
      required: true,
    },

    query_Id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    query_id: {
      type: String, // e.g., "QUERY-005"
      required: true,
    },

    // 🔹 Basic Details
    quoteTitle: { type: String },
    quoteDescription: { type: String },
    quoteNote: { type: String },

    // 🔹 Services added in quotation
    quotationServices: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        marginPrice: { type: Number, default: 0 },
        expectedDelivery: { type: Date },
      },
    ],

    // 🔹 Financial Details
    discountValue: { type: Number, default: 0 },
    gstApplied: { type: Boolean, default: true },
    gstValue: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    marginAmount: { type: Number, default: 0 },

    // 🔹 Status controls
    bookingStatus: {
      type: String,
      enum: ["NotBooked", "Booked", "Completed"],
      default: "NotBooked",
    },
    finalized: { type: Boolean, default: false },

    // 🔹 Relations
    installments: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Installment" },
    ],

    clientInstructions: { type: [String], default: [] },
  },
  { timestamps: true }
);

/* -------------------------------------------------------------------------- */
/* 🔹 Auto-generate quotationId (e.g. QUO-001)                                */
/* -------------------------------------------------------------------------- */
QuotationSchema.pre("save", async function (next) {
  if (!this.isNew || this.quotationId) return next();
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "quotation" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.quotationId = `QUO-${counter.seq.toString().padStart(3, "0")}`;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Quotation", QuotationSchema);
