// utils/getNextQuotationId.js
const Counter = require("../models/Counter");

const getNextQuotationId = async () => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "quotation" },          // unique counter name
      { $inc: { value: 1 } },         // increment value
      { new: true, upsert: true }     // create if missing
    );

    const padded = String(counter.value).padStart(3, "0");
    return `QUO-${padded}`;           // e.g. QUO-001, QUO-002
  } catch (err) {
    console.error("Error generating quotation ID:", err);
    throw err;
  }
};

module.exports = getNextQuotationId;
