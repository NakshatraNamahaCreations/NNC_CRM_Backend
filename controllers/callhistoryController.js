const CallHistory = require("../models/CallHistory");

/* -------------------------------------------------------------------------- */
/* 🔹 Get Call History                                                        */
/* -------------------------------------------------------------------------- */
exports.getCallHistory = async (req, res) => {
  try {
    const { leadId, queryId } = req.params;
    const history = await CallHistory.find({
      lead_id: leadId,
      query_id: queryId,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, history });
  } catch (error) {
    console.error("Error fetching call history:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getAllCallFollowUps = async (req, res) => {
  try {
    const history = await CallHistory.find().sort({ reschedule_date: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (err) {
    console.error("❌ Error fetching call history:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching call follow-ups",
    });
  }
};

exports.getCallFollowUpsByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date query parameter is required (format: YYYY-MM-DD)",
      });
    }

    // Start and end of that date (for full-day match)
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const history = await CallHistory.find({
      reschedule_date: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ reschedule_date: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (err) {
    console.error("❌ Error fetching call history by date:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching call follow-ups by date",
    });
  }
};
