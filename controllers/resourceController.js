const Resource = require('../models/Resource');
const Onboarding = require('../models/Onboarding');
const notificationService = require('../services/notificationService');

// ONB-012: Create resource
exports.createResource = async (req, res) => {
  try {
    const { onboardingId, resourceType, name, description, serialNumber, location } = req.body;
    if (!onboardingId || !resourceType || !name) return res.status(400).json({ message: 'onboardingId, resourceType, and name are required' });

    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) return res.status(404).json({ message: 'Onboarding not found' });

    const resource = new Resource({ onboardingId: onboarding._id, employeeId: onboarding.employeeId, resourceType, name, description, serialNumber, location, status: 'RESERVED', reservedBy: req.user._id });
    await resource.save();

    const resourceTask = onboarding.tasks.find(t => t.category === 'RESOURCE_ALLOCATION' && (t.name.toLowerCase().includes('resource') || t.name.toLowerCase().includes('equipment') || t.name.toLowerCase().includes('desk') || t.name.toLowerCase().includes('access card')));
    if (resourceTask && resourceTask.status === 'PENDING') { resourceTask.status = 'IN_PROGRESS'; await onboarding.save(); }

    if (onboarding.employeeId?.userId) await notificationService.createNotification({ userId: onboarding.employeeId.userId, onboardingId: onboarding._id, type: 'GENERAL', title: 'Resource Reserved', message: `${resourceType} "${name}" has been reserved for you`, priority: 'LOW', actionUrl: `/onboarding/${onboarding._id}/resources` });

    res.status(201).json({ message: 'Resource reserved successfully', resource });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getResources = async (req, res) => {
  try {
    const { onboardingId, employeeId, resourceType, status } = req.query;
    const query = {};
    if (onboardingId) query.onboardingId = onboardingId;
    if (employeeId) query.employeeId = employeeId;
    if (resourceType) query.resourceType = resourceType;
    if (status) query.status = status;
    if (req.user.role === 'NEW_HIRE' && req.user.employeeId) query.employeeId = req.user.employeeId;
    const resources = await Resource.find(query).populate('onboardingId').populate('employeeId').populate('reservedBy', 'firstName lastName email').populate('assignedBy', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('onboardingId').populate('employeeId').populate('reservedBy', 'firstName lastName email').populate('assignedBy', 'firstName lastName email');
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (req.user.role === 'NEW_HIRE' && resource.employeeId?.userId?.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    const { name, description, serialNumber, location, status, notes } = req.body;
    if (name) resource.name = name;
    if (description !== undefined) resource.description = description;
    if (serialNumber) resource.serialNumber = serialNumber;
    if (location) resource.location = location;
    if (status) resource.status = status;
    if (notes) resource.notes = notes;
    await resource.save();
    res.json({ message: 'Resource updated successfully', resource });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    resource.status = 'ASSIGNED';
    resource.assignedDate = new Date();
    resource.assignedBy = req.user._id;
    await resource.save();

    const onboarding = await Onboarding.findById(resource.onboardingId);
    if (onboarding) {
      const resourceTask = onboarding.tasks.find(t => t.category === 'RESOURCE_ALLOCATION' && t.status === 'IN_PROGRESS');
      if (resourceTask) { resourceTask.status = 'COMPLETED'; resourceTask.completedDate = new Date(); resourceTask.completedBy = req.user._id; await onboarding.save(); }
    }

    if (resource.employeeId?.userId) await notificationService.createNotification({ userId: resource.employeeId.userId, onboardingId: resource.onboardingId, type: 'GENERAL', title: 'Resource Assigned', message: `${resource.resourceType} "${resource.name}" has been assigned to you`, priority: 'MEDIUM', actionUrl: `/onboarding/${resource.onboardingId}/resources` });

    res.json({ message: 'Resource assigned successfully', resource });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    await resource.deleteOne();
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

