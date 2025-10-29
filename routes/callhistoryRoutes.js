// // routes/leadRoutes.js
// const express = require("express");
// const router = express.Router();
// const {
//   getCallHistory,
//   getAllCallFollowUps,
//   getCallFollowUpsByDate,
//   getLatestCallHistory,
// } = require("../controllers/callhistoryController");

// // Fetch call history for a query
// router.get("/:leadId/:queryId", getCallHistory);

// router.get(
//   "/leads/:leadId/queries/:queryId/latest-call-history",
//   getLatestCallHistory
// );
// // @route   GET /api/leads/call-followups
// router.get("/all-followups", getAllCallFollowUps);

// router.get("/followups-by-date", getCallFollowUpsByDate);

// module.exports = router;

const express = require("express");
const router = express.Router();

const callHistoryController = require("../controllers/callHistoryController");

// 🔹 Get all call history for a lead and query
// GET /api/call-history/all/:leadId/:queryId
router.get("/all/:leadId/:queryId", callHistoryController.getAllCallHistory);

// 🔹 Get latest "Call Later" follow-up for a specific query
// GET /api/call-history/latest/:leadId/:queryId
router.get(
  "/latest/:leadId/:queryId",
  callHistoryController.getLatestCallHistory
);

// 🔹 Get all latest pending call follow-ups (one per query)
// GET /api/call-history/follow-ups
router.get("/follow-ups", callHistoryController.getAllCallFollowUps);

// 🔹 Get call follow-ups by date (latest per query)
// GET /api/call-history/follow-ups-by-date?date=YYYY-MM-DD
router.get("/follow-ups-by-date", callHistoryController.getCallFollowUpsByDate);

module.exports = router;
