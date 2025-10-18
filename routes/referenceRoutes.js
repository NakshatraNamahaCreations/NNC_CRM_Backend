// routes/referenceRoutes.js
const express = require("express");
const router = express.Router();
const {
  createReference,
  getAllReferences,
  getReferenceById,
  updateReference,
  deleteReference,
} = require("../controllers/referenceController");

// CRUD routes
router.post("/", createReference); // Create
router.get("/", getAllReferences); // Read all
router.get("/:id", getReferenceById); // Read one
router.put("/:id", updateReference); // Update
router.delete("/:id", deleteReference); // Delete

module.exports = router;
