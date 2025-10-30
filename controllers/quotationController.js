// const mongoose = require("mongoose");
// const Quotation = require("../models/Quotation");
// const Installment = require("../models/Installment");
// const Lead = require("../models/Lead");
// const getNextQuotationId = require("../utils/getNextQuotationId");

// /* -------------------------------------------------------------------------- */
// /* 🔹 Create Quotation                                                        */
// /* -------------------------------------------------------------------------- */
// exports.createQuotation = async (req, res) => {
//   try {
//     const {
//       lead_id, // e.g. "LEAD-003"
//       query_id, // e.g. "QUERY-005"
//       quoteTitle,
//       quoteDescription,
//       quotationServices,
//       discountValue,
//       gstApplied,
//       gstValue,
//       totalAmount,
//       marginAmount,
//       installments,
//     } = req.body;

//     if (!lead_id || !query_id) {
//       return res.status(400).json({
//         success: false,
//         message: "lead_id and query_id are required",
//       });
//     }

//     // ✅ 1️⃣ Find lead + query based on string IDs
//     const lead = await Lead.findOne({ lead_id });
//     if (!lead)
//       return res.status(404).json({ success: false, message: "Lead not found" });

//     const queryObj = lead.queries.find((q) => q.query_id === query_id);
//     if (!queryObj)
//       return res.status(404).json({ success: false, message: "Query not found" });

//     // ✅ 2️⃣ Generate next quotationId
//     const quotationId = await getNextQuotationId();

//     // ✅ 3️⃣ Create Installment documents first
//     let installmentIds = [];
//     if (Array.isArray(installments) && installments.length > 0) {
//       const created = await Installment.insertMany(
//         installments.map((inst, i) => ({
//           installmentNumber: inst.installmentNumber || i + 1,
//           percentage: inst.percentage || 0,
//           totalAmount: inst.totalAmount || 0,
//           paidAmount: 0,
//           dueAmount: inst.totalAmount || 0,
//           dueDate: inst.dueDate || new Date(),
//           status: "Pending",
//           paymentHistory: [],
//         }))
//       );
//       installmentIds = created.map((i) => i._id);
//     }

//     // ✅ 4️⃣ Create quotation with both ObjectId + string IDs
//     const quotation = new Quotation({
//       quotationId,
//       lead_Id: lead._id,
//       lead_id: lead.lead_id,
//       query_Id: queryObj._id,
//       query_id: queryObj.query_id,
//       quoteTitle,
//       quoteDescription,
//       quotationServices,
//       discountValue,
//       gstApplied,
//       gstValue,
//       totalAmount,
//       marginAmount,
//       installments: installmentIds,
//     });

//     await quotation.save();

//     res.status(201).json({
//       success: true,
//       message: "Quotation created successfully",
//       quotation,
//     });
//   } catch (error) {
//     console.error("Error creating quotation:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

// /* -------------------------------------------------------------------------- */
// /* 🔹 Update Quotation                                                        */
// /* -------------------------------------------------------------------------- */
// exports.updateQuotation = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     const quotation = await Quotation.findOneAndUpdate(
//       { quotationId: id },
//       { $set: updates },
//       { new: true }
//     ).populate("installments");

//     if (!quotation) {
//       return res.status(404).json({
//         success: false,
//         message: "Quotation not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Quotation updated successfully",
//       quotation,
//     });
//   } catch (error) {
//     console.error("Error updating quotation:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

// /* -------------------------------------------------------------------------- */
// /* 🔹 Get Quotations by Lead + Query (using string IDs)                       */
// /* -------------------------------------------------------------------------- */
// exports.getQuotationsByLeadAndQuery = async (req, res) => {
//   try {
//     const { leadId, queryId } = req.params; // e.g. LEAD-003, QUERY-005

//     const quotations = await Quotation.find({
//       lead_id: leadId,
//       query_id: queryId,
//     })
//       .populate({
//         path: "lead_Id",
//         select:
//           "lead_id company_name lead_source persons location status queries",
//       })
//       .populate("installments")
//       .sort({ createdAt: -1 });

//     if (!quotations || quotations.length === 0) {
//       return res.json({ success: true, quotations: [] });
//     }

//     // ✅ Inject query details from lead
//     const populated = quotations.map((q) => {
//       const lead = q.lead_Id?.toObject?.() || {};
//       const foundQuery =
//         lead.queries?.find?.((qq) => qq.query_id === queryId) || null;

//       return {
//         ...q.toObject(),
//         leadDetails: {
//           persons: lead.persons,
//           company_name: lead.company_name,
//           lead_source: lead.lead_source,
//           location: lead.location,
//           status: lead.status,
//         },
//         queryDetails: foundQuery
//           ? {
//               services: foundQuery.services,
//               expected_delivery_date: foundQuery.expected_delivery_date,
//               status: foundQuery.status,
//             }
//           : null,
//       };
//     });

//     res.json({
//       success: true,
//       count: populated.length,
//       quotations: populated,
//     });
//   } catch (error) {
//     console.error("Error fetching quotations:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching quotations",
//       error: error.message,
//     });
//   }
// };

// /* -------------------------------------------------------------------------- */
// /* 🔹 Get Quotation by Quotation ID                                           */
// /* -------------------------------------------------------------------------- */
// exports.getQuotationByQuoteId = async (req, res) => {
//   try {
//     const { quoteId } = req.params;
//     const quotation = await Quotation.findOne({
//       quotationId: quoteId,
//     }).populate("installments");

//     if (!quotation)
//       return res
//         .status(404)
//         .json({ success: false, message: "Quotation not found" });

//     res.json({ success: true, quotation });
//   } catch (error) {
//     console.error("Error fetching quotation:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };


const mongoose = require("mongoose");
const Quotation = require("../models/Quotation");
const Installment = require("../models/Installment");
const Lead = require("../models/Lead");
const getNextQuotationId = require("../utils/getNextQuotationId");

/* -------------------------------------------------------------------------- */
/* 🔹 Create Quotation                                                        */
/* (your existing createQuotation unchanged)                                  */
/* -------------------------------------------------------------------------- */
exports.createQuotation = async (req, res) => {
  try {
    const {
      lead_id,
      query_id,
      quoteTitle,
      quoteDescription,
      quotationServices,
      discountValue,
      gstApplied,
      gstValue,
      totalAmount,
      marginAmount,
      installments,
    } = req.body;

    if (!lead_id || !query_id) {
      return res.status(400).json({
        success: false,
        message: "lead_id and query_id are required",
      });
    }

    const lead = await Lead.findOne({ lead_id });
    if (!lead)
      return res.status(404).json({ success: false, message: "Lead not found" });

    const queryObj = lead.queries.find((q) => q.query_id === query_id);
    if (!queryObj)
      return res.status(404).json({ success: false, message: "Query not found" });

    const quotationId = await getNextQuotationId();

    let installmentIds = [];
    if (Array.isArray(installments) && installments.length > 0) {
      const created = await Installment.insertMany(
        installments.map((inst, i) => ({
          installmentNumber: inst.installmentNumber || i + 1,
          percentage: inst.percentage || 0,
          totalAmount: inst.totalAmount || 0,
          paidAmount: 0,
          dueAmount: inst.totalAmount || 0,
          dueDate: inst.dueDate || new Date(),
          status: "Pending",
          paymentHistory: [],
        }))
      );
      installmentIds = created.map((i) => i._id);
    }

    const quotation = new Quotation({
      quotationId,
      lead_Id: lead._id,
      lead_id: lead.lead_id,
      query_Id: queryObj._id,
      query_id: queryObj.query_id,
      quoteTitle,
      quoteDescription,
      quotationServices,
      discountValue,
      gstApplied,
      gstValue,
      totalAmount,
      marginAmount,
      installments: installmentIds,
    });

    await quotation.save();

    res.status(201).json({
      success: true,
      message: "Quotation created successfully",
      quotation,
    });
  } catch (error) {
    console.error("Error creating quotation:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/* 🔹 Update Quotation                                                        */
/* - If `updates.installments` is an array of plain objects, replace old     */
/*   installment docs with new ones and set their ObjectIds on the quotation. */
/* -------------------------------------------------------------------------- */
exports.updateQuotation = async (req, res) => {
  try {
    const { id } = req.params; // id = quotationId (QUO-001)
    const updates = { ...req.body };

    // If installments are provided as plain objects, create new Installment docs
    if (Array.isArray(updates.installments)) {
      // Find existing quotation to clean up old installments
      const existing = await Quotation.findOne({ quotationId: id }).lean();
      if (existing && Array.isArray(existing.installments) && existing.installments.length > 0) {
        try {
          await Installment.deleteMany({ _id: { $in: existing.installments } });
        } catch (delErr) {
          console.warn("Failed deleting old installments:", delErr);
        }
      }

      // Prepare insert array: map incoming installment objects to Installment fields
      const instCreateArr = updates.installments.map((inst, idx) => ({
        installmentNumber: inst.installmentNumber || idx + 1,
        percentage: inst.percentage || 0,
        totalAmount: inst.totalAmount || inst.dueAmount || 0,
        paidAmount: inst.paidAmount || 0,
        dueAmount: inst.dueAmount || inst.totalAmount || 0,
        dueDate: inst.dueDate ? new Date(inst.dueDate) : new Date(),
        status: inst.status || "Pending",
        paymentHistory: Array.isArray(inst.paymentHistory) ? inst.paymentHistory : [],
      }));

      if (instCreateArr.length > 0) {
        const created = await Installment.insertMany(instCreateArr);
        updates.installments = created.map((c) => c._id);
      } else {
        updates.installments = [];
      }
    }

    // Now update the quotation document
    const quotation = await Quotation.findOneAndUpdate(
      { quotationId: id },
      { $set: updates },
      { new: true }
    ).populate("installments");

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    res.json({
      success: true,
      message: "Quotation updated successfully",
      quotation,
    });
  } catch (error) {
    console.error("Error updating quotation:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/* 🔹 Get Quotations by Lead + Query (unchanged)                              */
/* -------------------------------------------------------------------------- */
exports.getQuotationsByLeadAndQuery = async (req, res) => {
  try {
    const { leadId, queryId } = req.params;

    const quotations = await Quotation.find({
      lead_id: leadId,
      query_id: queryId,
    })
      .populate({
        path: "lead_Id",
        select:
          "lead_id company_name lead_source persons location status queries",
      })
      .populate("installments")
      .sort({ createdAt: -1 });

    if (!quotations || quotations.length === 0) {
      return res.json({ success: true, quotations: [] });
    }

    const populated = quotations.map((q) => {
      const lead = q.lead_Id?.toObject?.() || {};
      const foundQuery =
        lead.queries?.find?.((qq) => qq.query_id === queryId) || null;

      return {
        ...q.toObject(),
        leadDetails: {
          persons: lead.persons,
          company_name: lead.company_name,
          lead_source: lead.lead_source,
          location: lead.location,
          status: lead.status,
        },
        queryDetails: foundQuery
          ? {
              services: foundQuery.services,
              expected_delivery_date: foundQuery.expected_delivery_date,
              status: foundQuery.status,
            }
          : null,
      };
    });

    res.json({
      success: true,
      count: populated.length,
      quotations: populated,
    });
  } catch (error) {
    console.error("Error fetching quotations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching quotations",
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/* 🔹 Get Quotation by Quotation ID                                           */
/* -------------------------------------------------------------------------- */
exports.getQuotationByQuoteId = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const quotation = await Quotation.findOne({
      quotationId: quoteId,
    }).populate("installments");

    if (!quotation)
      return res
        .status(404)
        .json({ success: false, message: "Quotation not found" });

    res.json({ success: true, quotation });
  } catch (error) {
    console.error("Error fetching quotation:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/* 🔹 Delete Quotation                                                         */
/* -------------------------------------------------------------------------- */
exports.deleteQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params; // e.g. QUO-001

    const quotation = await Quotation.findOne({ quotationId });
    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    // Remove associated installments (cleanup)
    if (Array.isArray(quotation.installments) && quotation.installments.length > 0) {
      try {
        await Installment.deleteMany({ _id: { $in: quotation.installments } });
      } catch (err) {
        console.warn("Failed to delete associated installments:", err);
      }
    }

    await Quotation.deleteOne({ quotationId });

    res.json({ success: true, message: "Quotation deleted" });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/* 🔹 Toggle Finalized Status                                                  */
/* PATCH /quotations/finalize/:quotationId                                     */
/* body: { finalized: true|false }                                             */
/* -------------------------------------------------------------------------- */
exports.finalizeQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const { finalized } = req.body;

    if (typeof finalized !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Request must include { finalized: true|false } in body",
      });
    }

    // Find the target quotation first
    const target = await Quotation.findOne({ quotationId }).lean();
    if (!target) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    // If the client requests to finalize this quotation, ensure all other
    // quotations for the same lead_id + query_id are un-finalized first.
    if (finalized === true) {
      // Clear any previously finalized for same lead_id & query_id (exclude target)
      await Quotation.updateMany(
        {
          lead_id: target.lead_id,
          query_id: target.query_id,
          quotationId: { $ne: quotationId },
          finalized: true,
        },
        { $set: { finalized: false } }
      );

      // Now mark the target as finalized
      const updated = await Quotation.findOneAndUpdate(
        { quotationId },
        { $set: { finalized: true } },
        { new: true }
      ).populate("installments");

      return res.json({
        success: true,
        message: "Quotation finalized successfully",
        quotation: updated,
      });
    }

    // If request is to unfinalize, just unset finalized on the target
    const updated = await Quotation.findOneAndUpdate(
      { quotationId },
      { $set: { finalized: false } },
      { new: true }
    ).populate("installments");

    return res.json({
      success: true,
      message: "Quotation unfinalized successfully",
      quotation: updated,
    });
  } catch (error) {
    console.error("Error toggling finalized:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};