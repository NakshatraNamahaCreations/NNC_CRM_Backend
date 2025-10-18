// models/Reference.js
const mongoose = require("mongoose");

const referenceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Reference name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
   
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reference", referenceSchema);
