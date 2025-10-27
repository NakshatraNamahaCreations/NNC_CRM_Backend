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
  getCallHistory,
  getAllCallFollowUps,
  getCallFollowUpsByDate
} = require("../controllers/callhistoryController");

// Fetch call history for a query
router.get("/:leadId/:queryId", getCallHistory);

// @route   GET /api/leads/call-followups
router.get("/all-followups", getAllCallFollowUps);

router.get("/followups-by-date", getCallFollowUpsByDate);

module.exports = router;
