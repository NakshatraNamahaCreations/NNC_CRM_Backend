// // controllers/leadController.js
// const Lead = require("../models/Lead");

// /* -------------------------------------------------------------------------- */
// /* 🔹 Helper: Generate Sequential ID */
// /* -------------------------------------------------------------------------- */
// async function generateSequentialId(model, prefix, field) {
//   const last = await model.findOne().sort({ createdAt: -1 });
//   if (!last || !last[field]) return `${prefix}-001`;

//   const lastId = last[field];
//   const lastNum = parseInt(lastId.split("-")[1]) || 0;
//   const nextNum = (lastNum + 1).toString().padStart(3, "0");

//   return `${prefix}-${nextNum}`;
// }

// /* -------------------------------------------------------------------------- */
// /* 🧾 Create or Update Lead with Query */
// /* -------------------------------------------------------------------------- */
// exports.createLeadWithQuery = async (req, res) => {
//   try {
//     const {
//       personName,
//       email,
//       phone_number,
//       company_name,
//       lead_source,
//       location,
//       queryData,
//     } = req.body;

//     if (!personName || !email || !phone_number || !company_name) {
//       return res.status(400).json({ message: "Missing required lead fields" });
//     }
//     if (!queryData?.services?.length) {
//       return res.status(400).json({ message: "Query services are required" });
//     }

//     // 🔹 Find existing lead (by phone or email)
//     let existingLead = await Lead.findOne({
//       $or: [{ phone_number }, { email }],
//     });

//     // 🔹 Generate next QUERY ID
//     const lastQuery = await Lead.aggregate([
//       { $unwind: { path: "$queries", preserveNullAndEmptyArrays: true } },
//       { $sort: { "queries.createdAt": -1 } },
//       { $limit: 1 },
//       { $project: { query_id: "$queries.query_id" } },
//     ]);

//     let nextQueryNum = 1;
//     if (lastQuery.length && lastQuery[0].query_id) {
//       const lastNum = parseInt(lastQuery[0].query_id.split("-")[1]) || 0;
//       nextQueryNum = lastNum + 1;
//     }

//     const query_id = `QUERY-${String(nextQueryNum).padStart(3, "0")}`;
//     const newQuery = {
//       query_id,
//       services: queryData.services,
//       expected_delivery_date: queryData.expected_delivery_date,
//       status: "Created",
//     };

//     // 🔹 If lead exists → Add new person info + query
//     if (existingLead) {
//       existingLead.status = "Old";

//       // Only update details if changed
//       existingLead.company_name = company_name;
//       existingLead.lead_source = lead_source;
//       existingLead.location = location;
//       existingLead.personName = personName;
//       existingLead.email = email;

//       // Append new query
//       existingLead.queries.push(newQuery);
//       await existingLead.save();

//       return res.status(200).json({
//         message: "Existing lead found. Added new query successfully.",
//         status: "Old",
//         lead: existingLead,
//       });
//     }

//     // 🔹 Otherwise → create new lead
//     const lead_id = await generateSequentialId(Lead, "LEAD", "lead_id");
//     const newLead = new Lead({
//       lead_id,
//       personName,
//       email,
//       phone_number,
//       company_name,
//       lead_source,
//       location,
//       status: "New",
//       queries: [newQuery],
//     });

//     await newLead.save();

//     return res.status(201).json({
//       message: "New lead created successfully.",
//       status: "New",
//       lead: newLead,
//     });
//   } catch (error) {
//     console.error("❌ Error creating lead/query:", error);
//     res.status(500).json({
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

// /* -------------------------------------------------------------------------- */
// /* 🔍 Search Lead by Email / Phone / Company */
// /* -------------------------------------------------------------------------- */
// exports.searchLead = async (req, res) => {
//   try {
//     const { query } = req.query;

//     if (!query)
//       return res.status(400).json({ message: "Query parameter is required" });

//     const lead = await Lead.findOne({
//       $or: [
//         { email: query },
//         { phone_number: query },
//         { company_name: { $regex: query, $options: "i" } },
//       ],
//     });

//     if (!lead)
//       return res
//         .status(404)
//         .json({ message: "No lead found for the given query" });

//     res.status(200).json({ lead });
//   } catch (error) {
//     console.error("Error searching lead:", error);
//     res.status(500).json({ message: "Internal Server Error", error });
//   }
// };

// /* -------------------------------------------------------------------------- */
// /* 2️⃣ Fetch All Leads (Pagination + Search by Name/Email/Phone) */
// /* -------------------------------------------------------------------------- */
// exports.getAllLeads = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, search = "" } = req.query;
//     const skip = (page - 1) * limit;

//     const searchQuery = search
//       ? {
//           $or: [
//             { personName: { $regex: search, $options: "i" } },
//             { phone_number: { $regex: search, $options: "i" } },
//             { email: { $regex: search, $options: "i" } },
//           ],
//         }
//       : {};

//     const leads = await Lead.find(searchQuery)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Lead.countDocuments(searchQuery);

//     res.status(200).json({
//       total,
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(total / limit),
//       leads,
//     });
//   } catch (error) {
//     console.error("Error fetching leads:", error);
//     res.status(500).json({ message: "Internal Server Error", error });
//   }
// };

// /* -------------------------------------------------------------------------- */
// /* 3️⃣ Fetch Leads by Status (New / Old) */
// /* -------------------------------------------------------------------------- */
// exports.getLeadsByStatus = async (req, res) => {
//   try {
//     const { status } = req.params;
//     const validStatuses = ["New", "Old"];

//     if (!validStatuses.includes(status))
//       return res.status(400).json({ message: "Invalid status value" });

//     const leads = await Lead.find({ status }).sort({ createdAt: -1 });

//     res.status(200).json({
//       count: leads.length,
//       leads,
//     });
//   } catch (error) {
//     console.error("Error fetching leads by status:", error);
//     res.status(500).json({ message: "Internal Server Error", error });
//   }
// };

// /* -------------------------------------------------------------------------- */
// /* 🔍 Fetch Lead Details (Optionally Filter by Query ID) */
// /* -------------------------------------------------------------------------- */
// exports.getLeadDetails = async (req, res) => {
//   try {
//     const { leadId } = req.params;
//     const { queryId } = req.query; // optional

//     if (!leadId) {
//       return res.status(400).json({ message: "Lead ID is required" });
//     }

//     // ✅ Fetch only one lead and its queries
//     const lead = await Lead.findOne({ lead_id: leadId }).lean();

//     if (!lead) {
//       return res.status(404).json({ message: "Lead not found" });
//     }

//     // ✅ If queryId is passed, extract that specific query only
//     let selectedQuery = null;
//     if (queryId) {
//       selectedQuery = lead.queries.find((q) => q.query_id === queryId);

//       if (!selectedQuery) {
//         return res
//           .status(404)
//           .json({ message: `Query ${queryId} not found for this lead` });
//       }
//     }

//     // ✅ Respond with or without filtered query
//     return res.status(200).json({
//       success: true,
//       lead: {
//         ...lead,
//         queries: queryId ? [selectedQuery] : lead.queries,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching lead details:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

// controllers/leadController.js
const Lead = require("../models/Lead");
const CallHistory = require("../models/CallHistory");
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
      persons, // array of contacts
      company_name,
      lead_source,
      location,
      queryData,
    } = req.body;

    // ✅ Validation
    if (!persons?.length) {
      return res
        .status(400)
        .json({ message: "At least one person is required" });
    }
    const mainPerson = persons[0];
    if (!mainPerson.email || !mainPerson.phone || !company_name) {
      return res.status(400).json({ message: "Missing required lead fields" });
    }
    if (!queryData?.services?.length) {
      return res.status(400).json({ message: "Query services are required" });
    }

    // 🔹 Check for existing lead (by any person's email/phone)
    const personEmails = persons.map((p) => p.email);
    const personPhones = persons.map((p) => p.phone);

    let existingLead = await Lead.findOne({
      $or: [
        { "persons.email": { $in: personEmails } },
        { "persons.phone": { $in: personPhones } },
        { company_name },
      ],
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

    /* -------------------------------------------------------------------------- */
    /* 🔁 If lead exists → update persons (merge) + add new query */
    /* -------------------------------------------------------------------------- */
    if (existingLead) {
      existingLead.status = "Old";
      existingLead.company_name = company_name;
      existingLead.lead_source = lead_source;
      existingLead.location = location;

      // ✅ Merge new persons (avoid duplicates)
      persons.forEach((newPerson) => {
        const alreadyExists = existingLead.persons.some(
          (p) => p.email === newPerson.email || p.phone === newPerson.phone
        );
        if (!alreadyExists) {
          existingLead.persons.push(newPerson);
        }
      });

      // ✅ Add new query
      existingLead.queries.push(newQuery);
      await existingLead.save();

      return res.status(200).json({
        message:
          "Existing lead found. Added new person(s) and query successfully.",
        status: "Old",
        lead: existingLead,
      });
    }

    /* -------------------------------------------------------------------------- */
    /* 🆕 Otherwise → Create a new lead */
    /* -------------------------------------------------------------------------- */
    const lead_id = await generateSequentialId(Lead, "LEAD", "lead_id");
    const newLead = new Lead({
      lead_id,
      persons,
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
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const lead = await Lead.findOne({
      $or: [
        { "persons.email": query },
        { "persons.phone": query },
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
/* 🔢 Fetch All Leads (Pagination + Search by Person Name/Email/Phone) */
/* -------------------------------------------------------------------------- */
exports.getAllLeads = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    const searchQuery = search
      ? {
          $or: [
            { "persons.name": { $regex: search, $options: "i" } },
            { "persons.phone": { $regex: search, $options: "i" } },
            { "persons.email": { $regex: search, $options: "i" } },
            { company_name: { $regex: search, $options: "i" } },
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
/* 🧩 Fetch Leads by Status (New / Old) */
/* -------------------------------------------------------------------------- */
exports.getLeadsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ["New", "Old"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status value" });

    const leads = await Lead.find({ status }).sort({ createdAt: -1 });
    res.status(200).json({ count: leads.length, leads });
  } catch (error) {
    console.error("Error fetching leads by status:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

/* -------------------------------------------------------------------------- */
/* 🔍 Fetch Lead Details (Optionally Filter by Query ID) */
/* -------------------------------------------------------------------------- */
exports.getLeadDetails = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { queryId } = req.query; // optional

    if (!leadId) {
      return res.status(400).json({ message: "Lead ID is required" });
    }

    const lead = await Lead.findOne({ lead_id: leadId }).lean();
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    let selectedQuery = null;
    if (queryId) {
      selectedQuery = lead.queries.find((q) => q.query_id === queryId);
      if (!selectedQuery) {
        return res
          .status(404)
          .json({ message: `Query ${queryId} not found for this lead` });
      }
    }

    res.status(200).json({
      success: true,
      lead: {
        ...lead,
        queries: queryId ? [selectedQuery] : lead.queries,
      },
    });
  } catch (error) {
    console.error("Error fetching lead details:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.updateLeadAndQuery = async (req, res) => {
  try {
    const { leadId, queryId } = req.params;
    const { persons, company_name, lead_source, location, queryData } =
      req.body;

    const lead = await Lead.findOne({ lead_id: leadId });
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // ✅ Update lead details
    lead.company_name = company_name || lead.company_name;
    lead.lead_source = lead_source || lead.lead_source;
    lead.location = location || lead.location;
    lead.persons = persons || lead.persons;

    // ✅ Update query details inside queries[]
    const queryIndex = lead.queries.findIndex((q) => q.query_id === queryId);
    if (queryIndex === -1)
      return res.status(404).json({ message: "Query not found for this lead" });

    lead.queries[queryIndex].services =
      queryData.services || lead.queries[queryIndex].services;
    lead.queries[queryIndex].expected_delivery_date =
      queryData.expected_delivery_date ||
      lead.queries[queryIndex].expected_delivery_date;
    lead.queries[queryIndex].updatedAt = new Date();

    await lead.save();

    res.status(200).json({
      success: true,
      message: "Lead and query updated successfully",
      lead,
    });
  } catch (error) {
    console.error("Error updating lead & query:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

/* -------------------------------------------------------------------------- */
/* 🔹 Update Query Status & Manage Call Later (Safe Transaction Style)         */
/* -------------------------------------------------------------------------- */
exports.updateQueryStatus = async (req, res) => {
  try {
    const { leadId, queryId } = req.params;
    const { status, remarks, reschedule_date, person_name, created_by } =
      req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const lead = await Lead.findOne({ lead_id: leadId });
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const query = lead.queries.find((q) => q.query_id === queryId);
    if (!query) return res.status(404).json({ message: "Query not found" });

    // ✅ For normal statuses — directly update
    if (
      status !== "Call Later" &&
      ["Created", "Not Interested", "Quotation", "Booked"].includes(status)
    ) {
      // Lead becomes old once a query changes from Created
      if (lead.status === "New" && status !== "Created") {
        lead.status = "Old";
      }

      query.status = status;
      query.updatedAt = new Date();
      await lead.save();

      return res.status(200).json({
        success: true,
        message: `Query status updated to ${status}`,
      });
    }

    // ✅ Handle "Call Later" with validation
    if (status === "Call Later") {
      if (!remarks || !reschedule_date || !person_name) {
        return res.status(400).json({
          success: false,
          message:
            "Remarks, reschedule_date, and person_name are required for Call Later",
        });
      }

      // Try saving the call history entry first
      const history = await CallHistory.create({
        lead_id: leadId,
        query_id: queryId,
        person_name,
        remarks,
        reschedule_date,
        created_by,
      });

      if (!history) {
        return res.status(500).json({
          success: false,
          message: "Failed to save call history. Status unchanged.",
        });
      }

      // ✅ Only if call history is saved successfully → update query + lead
      if (lead.status === "New") lead.status = "Old";
      query.status = "Call Later";
      query.updatedAt = new Date();
      await lead.save();

      return res.status(200).json({
        success: true,
        message: "Call Later saved successfully and status updated",
      });
    }

    // Fallback
    res.status(400).json({ success: false, message: "Invalid status type" });
  } catch (error) {
    console.error("Error updating query status:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

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
