// controllers/referenceController.js
const Reference = require("../models/Reference");

// 🟢 Create Reference
exports.createReference = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name ) {
      return res.status(400).json({ error: "Reference is required" });
    }

    // Check duplicate (case insensitive)
    const existing = await Reference.findOne({ name: { $regex: new RegExp("^" + name + "$", "i") } });
    if (existing) {
      return res.status(400).json({ error: "Reference with this name already exists" });
    }

    const reference = new Reference({ name, description });
    await reference.save();

    res.status(201).json({
      message: "Reference created successfully",
      reference,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🟡 Get All References
exports.getAllReferences = async (req, res) => {
  try {
    const references = await Reference.find().sort({ createdAt: -1 });
    res.status(200).json(references);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔵 Get Reference by ID
exports.getReferenceById = async (req, res) => {
  try {
    const ref = await Reference.findById(req.params.id);
    if (!ref) return res.status(404).json({ error: "Reference not found" });
    res.status(200).json(ref);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🟣 Update Reference
exports.updateReference = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: "Reference name is required" });
    }

    const updated = await Reference.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Reference not found" });

    res.status(200).json({
      message: "✅ Reference updated successfully",
      reference: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔴 Delete Reference
exports.deleteReference = async (req, res) => {
  try {
    const deleted = await Reference.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Reference not found" });

    res.status(200).json({ message: "Reference deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
