// controllers/leadController.js
const Lead = require("../models/Lead");


/* -------------------------------------------------------------------------- */
/* 1️⃣  Create or Update Lead with Query */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/* 🔹 Helper: Generate Sequential ID */
/* -------------------------------------------------------------------------- */
async function generateSequentialId(model, prefix, field) {
  const last = await model.findOne().sort({ createdAt: -1 });
  if (!last || !last[field]) return `${prefix}-001`;

  const lastId = last[field];
  const lastNum = parseInt(lastId.split("-")[1]) || 0;
  const nextNum = (lastNum + 1).toString().padStart(3, "0");

  return `${prefix}-${nextNum}`;
}

/* -------------------------------------------------------------------------- */
/* 🧾 Create or Update Lead with Query */
/* -------------------------------------------------------------------------- */
exports.createLeadWithQuery = async (req, res) => {
  try {
    const {
      personName,
      email,
      phone_number,
      company_name,
      lead_source,
      location,
      queryData,
    } = req.body;

    if (!personName || !email || !phone_number || !company_name) {
      return res.status(400).json({ message: "Missing required lead fields" });
    }
    if (!queryData?.services?.length) {
      return res.status(400).json({ message: "Query services are required" });
    }

    // 🔹 Find existing lead (by phone or email)
    let existingLead = await Lead.findOne({
      $or: [{ phone_number }, { email }],
    });

    // 🔹 Generate next QUERY ID
    const lastQuery = await Lead.aggregate([
      { $unwind: { path: "$queries", preserveNullAndEmptyArrays: true } },
      { $sort: { "queries.createdAt": -1 } },
      { $limit: 1 },
      { $project: { query_id: "$queries.query_id" } },
    ]);

    let nextQueryNum = 1;
    if (lastQuery.length && lastQuery[0].query_id) {
      const lastNum = parseInt(lastQuery[0].query_id.split("-")[1]) || 0;
      nextQueryNum = lastNum + 1;
    }

    const query_id = `QUERY-${String(nextQueryNum).padStart(3, "0")}`;
    const newQuery = {
      query_id,
      services: queryData.services,
      expected_delivery_date: queryData.expected_delivery_date,
      status: "Created",
    };

    // 🔹 If lead exists → Add new person info + query
    if (existingLead) {
      existingLead.status = "Old";

      // Only update details if changed
      existingLead.company_name = company_name;
      existingLead.lead_source = lead_source;
      existingLead.location = location;
      existingLead.personName = personName;
      existingLead.email = email;

      // Append new query
      existingLead.queries.push(newQuery);
      await existingLead.save();

      return res.status(200).json({
        message: "Existing lead found. Added new query successfully.",
        status: "Old",
        lead: existingLead,
      });
    }

    // 🔹 Otherwise → create new lead
    const lead_id = await generateSequentialId(Lead, "LEAD", "lead_id");
    const newLead = new Lead({
      lead_id,
      personName,
      email,
      phone_number,
      company_name,
      lead_source,
      location,
      status: "New",
      queries: [newQuery],
    });

    await newLead.save();

    return res.status(201).json({
      message: "New lead created successfully.",
      status: "New",
      lead: newLead,
    });
  } catch (error) {
    console.error("❌ Error creating lead/query:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/* 🔍 Search Lead by Email / Phone / Company */
/* -------------------------------------------------------------------------- */
exports.searchLead = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query)
      return res.status(400).json({ message: "Query parameter is required" });

    const lead = await Lead.findOne({
      $or: [
        { email: query },
        { phone_number: query },
        { company_name: { $regex: query, $options: "i" } },
      ],
    });

    if (!lead)
      return res
        .status(404)
        .json({ message: "No lead found for the given query" });

    res.status(200).json({ lead });
  } catch (error) {
    console.error("Error searching lead:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

/* -------------------------------------------------------------------------- */
/* 2️⃣ Fetch All Leads (Pagination + Search by Name/Email/Phone) */
/* -------------------------------------------------------------------------- */
exports.getAllLeads = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    const searchQuery = search
      ? {
          $or: [
            { personName: { $regex: search, $options: "i" } },
            { phone_number: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const leads = await Lead.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Lead.countDocuments(searchQuery);

    res.status(200).json({
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      leads,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

/* -------------------------------------------------------------------------- */
/* 3️⃣ Fetch Leads by Status (New / Old) */
/* -------------------------------------------------------------------------- */
exports.getLeadsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ["New", "Old"];

    if (!validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status value" });

    const leads = await Lead.find({ status }).sort({ createdAt: -1 });

    res.status(200).json({
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error("Error fetching leads by status:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
