// const express = require("express");
// const router = express.Router();
// const leadController = require("../controllers/leadController");

// // Create or update lead
// router.post("/", leadController.createOrUpdateLead);

// // Update query status
// router.patch(
//   "/:leadId/queries/:queryId/status",
//   leadController.updateQueryStatus
// );

// // Search leads
// router.get("/search", leadController.searchLeads);

// // Edit lead
// router.put("/:leadId", leadController.editLead);

// // Delete lead
// router.delete("/:leadId", leadController.deleteLead);

// module.exports = router;

// routes/leadRoutes.js
const express = require("express");
const router = express.Router();
const {
  createLeadWithQuery,
  getAllLeads,
  getLeadsByStatus,
  searchLead,
} = require("../controllers/leadController");

// Create or update a lead
router.post("/create", createLeadWithQuery);

// Fetch all leads (with pagination + search)
router.get("/all", getAllLeads);

// Fetch leads by status (New / Old)
router.get("/status/:status", getLeadsByStatus);

// Search by email / phone / company
router.get("/search", searchLead);

module.exports = router;
