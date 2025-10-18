const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    marginPrice: {
      type: Number,
      required: true,
      min: 0
    },
    
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Service', serviceSchema);
