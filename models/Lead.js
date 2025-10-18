// models/Lead.js
const mongoose = require("mongoose");

// Query Schema
const querySchema = new mongoose.Schema(
  {
    query_id: { type: String, required: true, unique: true },
    services: { type: [String], required: true },
    expected_delivery_date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Created", "Not Interested", "Call Later", "Quotation", "Booked"],
      default: "Created",
    },
  },
  { timestamps: true }
);

// Lead Schema
const leadSchema = new mongoose.Schema(
  {
    lead_id: { type: String, required: true, unique: true },
    personName: { type: String, required: true },
    email: { type: String, required: true },
    phone_number: { type: String, required: true },
    company_name: { type: String, required: true },
    location: {
      country: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      zip_code: { type: String, required: true },
    },
    lead_source: { type: String, required: true },
    status: { type: String, enum: ["New", "Old"], default: "New" },
    queries: [querySchema],
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);
module.exports = Lead;
