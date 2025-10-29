const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    amountPaid: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    mode: { type: String, enum: ["Cash", "UPI", "Credit", "Bank"], default: "Cash" },
  },
  { _id: false }
);

const InstallmentSchema = new mongoose.Schema(
  {
    installmentNumber: { type: Number, required: true },
    percentage: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, required: true },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["Pending", "Partial Paid", "Completed"],
      default: "Pending",
    },
    paymentHistory: { type: [PaymentSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Installment", InstallmentSchema);
