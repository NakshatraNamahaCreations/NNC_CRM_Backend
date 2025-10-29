// controllers/callHistoryController.js
const Lead = require("../models/Lead");
const CallHistory = require("../models/CallHistory");

/* -------------------------------------------------------------------------- */
/* 🔹 Get All Call History for a Lead & Query                                 */
/* -------------------------------------------------------------------------- */
exports.getAllCallHistory = async (req, res) => {
  try {
    const { leadId, queryId } = req.params;

    if (!leadId || !queryId) {
      return res.status(400).json({
        success: false,
        message: "leadId and queryId are required",
      });
    }

    const history = await CallHistory.find({
      lead_id: leadId,
      query_id: queryId,
    })
      .sort({ createdAt: -1 }) // Latest first
      .lean();

    if (!history.length) {
      return res.status(404).json({
        success: false,
        message: "No call history found for this lead and query",
      });
    }

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching call history",
      error: err.message,
    });
  }
};


/* -------------------------------------------------------------------------- */
/* 🔹 Get Latest "Call Later" Call History for a Query                        */
/* -------------------------------------------------------------------------- */
exports.getLatestCallHistory = async (req, res) => {
  try {
    const { leadId, queryId } = req.params;

    const latest = await CallHistory.findOne({
      lead_id: leadId,
      query_id: queryId,
      status: "Call Later",
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!latest) {
      return res.status(404).json({
        success: false,
        message: "No pending follow-up found for this query",
      });
    }

    res.status(200).json({
      success: true,
      data: latest,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching latest call follow-up",
      error: err.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/* 🔹 Get All Latest Pending Call Follow-Ups (One Per Query)                  */
/* -------------------------------------------------------------------------- */
exports.getAllCallFollowUps = async (req, res) => {
  try {
    const followUps = await CallHistory.aggregate([
      { $match: { status: "Call Later" } },
      { $sort: { reschedule_date: -1, createdAt: -1 } },
      {
        $group: {
          _id: { lead_id: "$lead_id", query_id: "$query_id" },
          latest: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$latest" } },
      { $sort: { reschedule_date: 1 } },
    ]);

    res.status(200).json({
      success: true,
      count: followUps.length,
      followUps,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching call follow-ups",
      error: err.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/* 🔹 Get Call Follow-Ups by Date (Latest per Query)                          */
/* -------------------------------------------------------------------------- */
exports.getCallFollowUpsByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date query parameter is required (YYYY-MM-DD)",
      });
    }

    // 🔹 Build precise date range for the given day
    const start = new Date(date);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    // 🔹 Aggregation pipeline
    const followUps = await CallHistory.aggregate([
      {
        $match: {
          status: "Call Later",
          reschedule_date: { $gte: start, $lte: end },
        },
      },
      {
        // Sort so that the most recent entry per (lead_id, query_id) comes first
        $sort: { createdAt: -1 },
      },
      {
        // Group by unique lead + query and take the latest record
        $group: {
          _id: { lead_id: "$lead_id", query_id: "$query_id" },
          latest: { $first: "$$ROOT" },
        },
      },
      {
        // Flatten the structure for cleaner output
        $replaceRoot: { newRoot: "$latest" },
      },
      {
        // Optional: keep results ordered by reschedule date
        $sort: { reschedule_date: 1 },
      },
      {
        // Optional optimization: exclude internal fields if not needed
        $project: {
          __v: 0,
          updatedAt: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: followUps.length,
      followUps,
    });
  } catch (err) {
    console.error("Error fetching follow-ups by date:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching follow-ups by date",
      error: err.message,
    });
  }
};
