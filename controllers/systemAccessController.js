const SystemAccess = require('../models/SystemAccess');
const Onboarding = require('../models/Onboarding');
const notificationService = require('../services/notificationService');

// ONB-009 & ONB-013: Create system access
exports.createSystemAccess = async (req, res) => {
  try {
    const { onboardingId, systemName, accessLevel, activationDate, revocationDate } = req.body;
    if (!onboardingId || !systemName) return res.status(400).json({ message: 'onboardingId and systemName are required' });

    const onboarding = await Onboarding.findById(onboardingId).populate('employeeId').populate('contractId');
    if (!onboarding) return res.status(404).json({ message: 'Onboarding not found' });

    const effectiveActivationDate = activationDate || onboarding.contractId?.startDate || new Date();
    const systemAccess = new SystemAccess({ onboardingId: onboarding._id, employeeId: onboarding.employeeId?._id, systemName, accessLevel: accessLevel || 'READ', activationDate: effectiveActivationDate, revocationDate: revocationDate || null, status: 'PENDING' });
    await systemAccess.save();

    const accessTask = onboarding.tasks.find(t => t.category === 'SYSTEM_ACCESS' && (t.name.toLowerCase().includes('system') || t.name.toLowerCase().includes('access') || t.name.toLowerCase().includes(systemName.toLowerCase())));
    if (accessTask && accessTask.status === 'PENDING') { accessTask.status = 'IN_PROGRESS'; await onboarding.save(); }

    res.status(201).json({ message: 'System access request created successfully', systemAccess });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSystemAccesses = async (req, res) => {
  try {
    const { onboardingId, employeeId, systemName, status } = req.query;
    const query = {};
    if (onboardingId) query.onboardingId = onboardingId;
    if (employeeId) query.employeeId = employeeId;
    if (systemName) query.systemName = systemName;
    if (status) query.status = status;
    if (req.user.role === 'NEW_HIRE' && req.user.employeeId) query.employeeId = req.user.employeeId;
    const systemAccesses = await SystemAccess.find(query).populate('onboardingId').populate('employeeId').populate('provisionedBy', 'firstName lastName email').populate('revokedBy', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(systemAccesses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSystemAccessById = async (req, res) => {
  try {
    const systemAccess = await SystemAccess.findById(req.params.id).populate('onboardingId').populate('employeeId').populate('provisionedBy', 'firstName lastName email').populate('revokedBy', 'firstName lastName email');
    if (!systemAccess) return res.status(404).json({ message: 'System access not found' });
    if (req.user.role === 'NEW_HIRE' && systemAccess.employeeId?.userId?.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    res.json(systemAccess);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.provisionAccess = async (req, res) => {
  try {
    const systemAccess = await SystemAccess.findById(req.params.id).populate('onboardingId').populate('employeeId');
    if (!systemAccess) return res.status(404).json({ message: 'System access not found' });

    if (!systemAccess.username && systemAccess.employeeId) {
      const email = systemAccess.employeeId.email;
      systemAccess.username = email.split('@')[0];
    }

    systemAccess.status = 'PROVISIONED';
    systemAccess.provisionedDate = new Date();
    systemAccess.provisionedBy = req.user._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activationDate = new Date(systemAccess.activationDate);
    activationDate.setHours(0, 0, 0, 0);
    if (activationDate <= today) systemAccess.status = 'ACTIVE';

    await systemAccess.save();

    const onboarding = await Onboarding.findById(systemAccess.onboardingId);
    if (onboarding) {
      const accessTask = onboarding.tasks.find(t => t.category === 'SYSTEM_ACCESS' && t.status === 'IN_PROGRESS');
      if (accessTask) { accessTask.status = 'COMPLETED'; accessTask.completedDate = new Date(); accessTask.completedBy = req.user._id; await onboarding.save(); }
    }

    if (systemAccess.employeeId?.userId) await notificationService.createNotification({ userId: systemAccess.employeeId.userId, onboardingId: systemAccess.onboardingId, type: 'SYSTEM_ALERT', title: 'System Access Provisioned', message: `Access to ${systemAccess.systemName} has been provisioned${systemAccess.username ? ` (Username: ${systemAccess.username})` : ''}`, priority: 'MEDIUM', actionUrl: `/onboarding/${systemAccess.onboardingId}/system-access` });

    res.json({ message: 'System access provisioned successfully', systemAccess });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.revokeAccess = async (req, res) => {
  try {
    const systemAccess = await SystemAccess.findById(req.params.id);
    if (!systemAccess) return res.status(404).json({ message: 'System access not found' });
    systemAccess.status = 'REVOKED';
    systemAccess.revokedDate = new Date();
    systemAccess.revokedBy = req.user._id;
    await systemAccess.save();

    if (systemAccess.employeeId?.userId) await notificationService.createNotification({ userId: systemAccess.employeeId.userId, onboardingId: systemAccess.onboardingId, type: 'SYSTEM_ALERT', title: 'System Access Revoked', message: `Access to ${systemAccess.systemName} has been revoked`, priority: 'HIGH', actionUrl: `/onboarding/${systemAccess.onboardingId}/system-access` });

    res.json({ message: 'System access revoked successfully', systemAccess });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSystemAccess = async (req, res) => {
  try {
    const systemAccess = await SystemAccess.findById(req.params.id);
    if (!systemAccess) return res.status(404).json({ message: 'System access not found' });
    await systemAccess.deleteOne();
    res.json({ message: 'System access deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

