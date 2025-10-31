const Installment = require("../models/Installment");
const Quotation = require("../models/Quotation");

// ✅ Record a payment and update status
exports.recordPayment = async (req, res) => {
  try {
    const { installmentId } = req.params;
    const { amountPaid, mode, date } = req.body;

    if (!amountPaid || amountPaid <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount.",
      });
    }

    // 🔹 Find the installment
    const installment = await Installment.findById(installmentId);
    if (!installment) {
      return res
        .status(404)
        .json({ success: false, message: "Installment not found." });
    }

    // 🔹 Prevent overpayment
    const remaining = installment.totalAmount - installment.paidAmount;
    if (amountPaid > remaining) {
      return res.status(400).json({
        success: false,
        message: `Payment exceeds remaining balance. Max allowed: ₹${remaining}`,
      });
    }

    // 🔹 Update totals
    installment.paidAmount += Number(amountPaid);
    installment.dueAmount = installment.totalAmount - installment.paidAmount;

    // 🔹 Update status
    if (installment.paidAmount === 0) installment.status = "Pending";
    else if (installment.dueAmount === 0) installment.status = "Completed";
    else installment.status = "Partial Paid";

    // 🔹 Add payment entry
    installment.paymentHistory.push({
      amountPaid,
      mode,
      date: date || new Date(),
    });

    await installment.save();

    // 🔹 Update parent quotation if linked
    const quotation = await Quotation.findOne({ installments: installmentId });
    if (quotation) {
      quotation.updatedAt = new Date();
      if (installment.installmentNumber === 1)
        quotation.bookingStatus = "Booked";
      await quotation.save();
    }

    res.json({
      success: true,
      message: "Payment recorded successfully.",
      installment,
    });
  } catch (err) {
    console.error("Error recording payment:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while recording payment." });
  }
};
