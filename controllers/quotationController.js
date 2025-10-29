const mongoose = require("mongoose");
const Quotation = require("../models/Quotation");
const Installment = require("../models/Installment");
const Lead = require("../models/Lead");
const getNextQuotationId = require("../utils/getNextQuotationId");

/* -------------------------------------------------------------------------- */
/* 🔹 Create Quotation                                                        */
/* -------------------------------------------------------------------------- */
exports.createQuotation = async (req, res) => {
  try {
    const {
      lead_id, // e.g. "LEAD-003"
      query_id, // e.g. "QUERY-005"
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

    // ✅ 1️⃣ Find lead + query based on string IDs
    const lead = await Lead.findOne({ lead_id });
    if (!lead)
      return res.status(404).json({ success: false, message: "Lead not found" });

    const queryObj = lead.queries.find((q) => q.query_id === query_id);
    if (!queryObj)
      return res.status(404).json({ success: false, message: "Query not found" });

    // ✅ 2️⃣ Generate next quotationId
    const quotationId = await getNextQuotationId();

    // ✅ 3️⃣ Create Installment documents first
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

    // ✅ 4️⃣ Create quotation with both ObjectId + string IDs
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
/* -------------------------------------------------------------------------- */
exports.updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

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
/* 🔹 Get Quotations by Lead + Query (using string IDs)                       */
/* -------------------------------------------------------------------------- */
exports.getQuotationsByLeadAndQuery = async (req, res) => {
  try {
    const { leadId, queryId } = req.params; // e.g. LEAD-003, QUERY-005

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

    // ✅ Inject query details from lead
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
