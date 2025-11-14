const Onboarding = require('../models/Onboarding');
const OnboardingChecklist = require('../models/OnboardingChecklist');
const Contract = require('../models/Contract');
const Employee = require('../models/Employee');
const notificationService = require('../services/notificationService');
const { v4: uuidv4 } = require('uuid');

// ONB-001: Create checklist
exports.createChecklist = async (req, res) => {
  try {
    const { name, description, department, position, contractType, items } = req.body;
    const checklist = new OnboardingChecklist({ name, description, department, position, contractType: contractType || 'ALL', items: items || [], createdBy: req.user._id });
    await checklist.save();
    res.status(201).json({ message: 'Onboarding checklist created successfully', checklist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChecklists = async (req, res) => {
  try {
    const { department, position, contractType, isActive } = req.query;
    const query = {};
    if (department) query.department = department;
    if (position) query.position = position;
    if (contractType) query.contractType = contractType;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    const checklists = await OnboardingChecklist.find(query).populate('department').populate('createdBy', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(checklists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChecklistById = async (req, res) => {
  try {
    const checklist = await OnboardingChecklist.findById(req.params.id).populate('department').populate('createdBy', 'firstName lastName email');
    if (!checklist) return res.status(404).json({ message: 'Checklist not found' });
    res.json(checklist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateChecklist = async (req, res) => {
  try {
    const checklist = await OnboardingChecklist.findById(req.params.id);
    if (!checklist) return res.status(404).json({ message: 'Checklist not found' });
    Object.assign(checklist, req.body);
    await checklist.save();
    res.json({ message: 'Checklist updated successfully', checklist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteChecklist = async (req, res) => {
  try {
    const checklist = await OnboardingChecklist.findById(req.params.id);
    if (!checklist) return res.status(404).json({ message: 'Checklist not found' });
    await checklist.deleteOne();
    res.json({ message: 'Checklist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ONB-002: Create onboarding from signed contract
exports.createOnboarding = async (req, res) => {
  try {
    const { contractId, checklistId } = req.body;
    const contract = await Contract.findById(contractId).populate('candidateId').populate('department');
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    if (contract.status !== 'SIGNED') return res.status(400).json({ message: 'Contract must be signed before creating onboarding' });
    
    let employee = await Employee.findOne({ email: contract.candidateId.email });
    if (!employee) {
      const employeeCount = await Employee.countDocuments();
      const employeeId = `EMP${String(employeeCount + 1).padStart(6, '0')}`;
      employee = new Employee({ employeeId, firstName: contract.candidateId.firstName, lastName: contract.candidateId.lastName, email: contract.candidateId.email, phone: contract.candidateId.phone, position: contract.position, department: contract.department, startDate: contract.startDate, salary: contract.salary, employmentStatus: 'ONBOARDING' });
      await employee.save();
    }

    let checklist = checklistId ? await OnboardingChecklist.findById(checklistId) : await OnboardingChecklist.findOne({ $or: [{ department: contract.department, position: contract.position }, { position: contract.position, contractType: contract.contractType }, { contractType: 'ALL', isActive: true }], isActive: true });

    const tasks = [];
    if (checklist && checklist.items) {
      checklist.items.forEach((item, index) => {
        const dueDate = new Date(contract.startDate);
        dueDate.setDate(dueDate.getDate() + (item.dueDaysOffset || 0));
        tasks.push({ taskId: uuidv4(), name: item.name, description: item.description, category: item.category, assignedTo: item.assignedTo, status: 'PENDING', dueDate, isRequired: item.isRequired, order: item.order || index });
      });
    }

    const onboarding = new Onboarding({ contractId: contract._id, employeeId: employee._id, candidateId: contract.candidateId._id, checklistId: checklist?._id, tasks, overallStatus: 'NOT_STARTED', targetCompletionDate: contract.startDate, assignedHRManager: req.user._id, assignedHREmployee: req.user.role === 'HR_EMPLOYEE' ? req.user._id : null });
    await onboarding.save();

    contract.employeeId = employee._id;
    await contract.save();
    employee.onboardingId = onboarding._id;
    await employee.save();

    if (employee.userId) await notificationService.sendTaskAssignedNotification(employee.userId, onboarding._id, 'Onboarding Started');
    res.status(201).json({ message: 'Onboarding created successfully', onboarding });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOnboardings = async (req, res) => {
  try {
    const { status, employeeId, assignedTo } = req.query;
    const query = {};
    if (status) query.overallStatus = status;
    if (employeeId) query.employeeId = employeeId;
    if (req.user.role === 'HR_MANAGER' || req.user.role === 'HR_EMPLOYEE') {
      if (assignedTo === 'me') query.$or = [{ assignedHRManager: req.user._id }, { assignedHREmployee: req.user._id }];
    }
    if (req.user.role === 'NEW_HIRE' && req.user.employeeId) query.employeeId = req.user.employeeId;
    const onboardings = await Onboarding.find(query).populate('contractId').populate('employeeId').populate('candidateId').populate('assignedHRManager', 'firstName lastName email').populate('assignedHREmployee', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(onboardings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOnboardingById = async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id).populate('contractId').populate('employeeId').populate('candidateId').populate('assignedHRManager', 'firstName lastName email').populate('assignedHREmployee', 'firstName lastName email');
    if (!onboarding) return res.status(404).json({ message: 'Onboarding not found' });
    if (req.user.role === 'NEW_HIRE' && onboarding.employeeId?.userId?.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    res.json(onboarding);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ONB-004: Get onboarding tracker
exports.getOnboardingTracker = async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id).populate('employeeId').populate('contractId');
    if (!onboarding) return res.status(404).json({ message: 'Onboarding not found' });
    if (req.user.role === 'NEW_HIRE' && onboarding.employeeId?.userId?.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    
    const totalTasks = onboarding.tasks.length;
    const completedTasks = onboarding.tasks.filter(t => t.status === 'COMPLETED').length;
    const pendingTasks = onboarding.tasks.filter(t => t.status === 'PENDING').length;
    const inProgressTasks = onboarding.tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const sortedTasks = [...onboarding.tasks].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      const statusOrder = { 'COMPLETED': 3, 'IN_PROGRESS': 2, 'PENDING': 1, 'BLOCKED': 0 };
      return statusOrder[b.status] - statusOrder[a.status];
    });

    res.json({
      onboarding: { id: onboarding._id, overallStatus: onboarding.overallStatus, startDate: onboarding.startDate, targetCompletionDate: onboarding.targetCompletionDate, actualCompletionDate: onboarding.actualCompletionDate, completionPercentage: onboarding.completionPercentage, employee: onboarding.employeeId, startDate: onboarding.contractId?.startDate },
      statistics: { totalTasks, completedTasks, pendingTasks, inProgressTasks, completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0 },
      tasks: sortedTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { status, notes } = req.body;
    const onboarding = await Onboarding.findById(id);
    if (!onboarding) return res.status(404).json({ message: 'Onboarding not found' });
    const task = onboarding.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.assignedTo === 'NEW_HIRE' && req.user.role !== 'NEW_HIRE') return res.status(403).json({ message: 'Only the assigned user can update this task' });
    
    task.status = status;
    if (status === 'COMPLETED') { task.completedDate = new Date(); task.completedBy = req.user._id; }
    if (notes) task.notes = notes;
    await onboarding.save();

    const allCompleted = onboarding.tasks.every(t => t.status === 'COMPLETED');
    if (allCompleted && onboarding.tasks.length > 0) {
      onboarding.overallStatus = 'COMPLETED';
      onboarding.actualCompletionDate = new Date();
      await onboarding.save();
      if (onboarding.employeeId?.userId) await notificationService.sendOnboardingCompleteNotification(onboarding.employeeId.userId, onboarding._id);
    } else if (onboarding.overallStatus === 'NOT_STARTED') {
      onboarding.overallStatus = 'IN_PROGRESS';
      await onboarding.save();
    }

    res.json({ message: 'Task status updated successfully', task, onboarding });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.completeOnboarding = async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id);
    if (!onboarding) return res.status(404).json({ message: 'Onboarding not found' });
    onboarding.overallStatus = 'COMPLETED';
    onboarding.actualCompletionDate = new Date();
    if (onboarding.employeeId) {
      const employee = await Employee.findById(onboarding.employeeId);
      if (employee) { employee.employmentStatus = 'ACTIVE'; await employee.save(); }
    }
    await onboarding.save();
    res.json({ message: 'Onboarding completed successfully', onboarding });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

