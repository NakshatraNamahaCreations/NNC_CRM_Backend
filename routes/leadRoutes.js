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
  getLeadDetails,
  updateLeadAndQuery,
  updateQueryStatus,
  getCallHistory
} = require("../controllers/leadController");

// Create or update a lead
router.post("/create", createLeadWithQuery);
router.put("/update/:leadId/:queryId", updateLeadAndQuery);

// Update query status (includes Call Later)
router.patch("/update-status/:leadId/:queryId", updateQueryStatus);

// Fetch call history for a query
router.get("/call-history/:leadId/:queryId", getCallHistory);

// Fetch all leads (with pagination + search)
router.get("/all", getAllLeads);

// Fetch leads by status (New / Old)
router.get("/status/:status", getLeadsByStatus);

router.get("/details/:leadId", getLeadDetails);

// Search by email / phone / company
router.get("/search", searchLead);

module.exports = router;
