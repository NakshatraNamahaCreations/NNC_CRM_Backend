// routes/quotationRoutes.js
const express = require("express");
const router = express.Router();
const quotationController = require("../controllers/quotationController");

router.post("/create", quotationController.createQuotation);
router.put("/update/:id", quotationController.updateQuotation);
router.get(
  "/by-lead/:leadId/:queryId",
  quotationController.getQuotationsByLeadAndQuery
);
router.get("/:quoteId", quotationController.getQuotationByQuoteId);

module.exports = router;
