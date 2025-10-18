const express = require('express');
const router = express.Router();
const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService
} = require('../controllers/serviceController');

// Routes
router.post('/', createService);            // Create
router.get('/', getAllServices);            // Read all
router.get('/:id', getServiceById);         // Read one
router.put('/:id', updateService);          // Update
router.delete('/:id', deleteService);       // Delete

module.exports = router;
