const express = require("express");
const router = express.Router();
const { recordPayment } = require("../controllers/installmentController");

// ✅ Record payment for a specific installment
router.post("/:installmentId/pay", recordPayment);

module.exports = router;
