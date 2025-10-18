const Service = require('../models/Service');

// 👉 Create a new service
const createService = async (req, res) => {
  try {
    const { serviceName, price, marginPrice } = req.body;

    const service = new Service({ serviceName, price, marginPrice });
    await service.save();

    res.status(201).json({ message: 'Service created successfully', service });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 👉 Get all services
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👉 Get a single service by ID
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👉 Update a service by ID
const updateService = async (req, res) => {
  try {
    const { serviceName, price, marginPrice } = req.body;

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { serviceName, price, marginPrice },
      { new: true, runValidators: true }
    );

    if (!updatedService) return res.status(404).json({ error: 'Service not found' });

    res.status(200).json({ message: 'Service updated', service: updatedService });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 👉 Delete a service by ID
const deleteService = async (req, res) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Service not found' });

    res.status(200).json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService
};
