const PayrollInitiation = require('../models/PayrollInitiation');
const Contract = require('../models/Contract');
const Onboarding = require('../models/Onboarding');

// ONB-018: Initiate payroll
exports.initiatePayroll = async (req, res) => {
  try {
    const { contractId } = req.body;
    const contract = await Contract.findById(contractId).populate('employeeId');
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    if (contract.status !== 'SIGNED') return res.status(400).json({ message: 'Contract must be signed before initiating payroll' });

    const existingPayroll = await PayrollInitiation.findOne({ contractId });
    if (existingPayroll) return res.status(400).json({ message: 'Payroll initiation already exists for this contract' });

    const onboarding = await Onboarding.findOne({ contractId });
    if (!onboarding) return res.status(400).json({ message: 'Onboarding not found for this contract' });

    const payrollInitiation = new PayrollInitiation({ contractId: contract._id, employeeId: contract.employeeId?._id, onboardingId: onboarding._id, salary: contract.salary, signingBonus: contract.signingBonus || 0, payrollEffectiveDate: contract.startDate, payrollStatus: 'PENDING', signingBonusStatus: contract.signingBonus > 0 ? 'PENDING' : null, initiatedBy: req.user._id });
    await payrollInitiation.save();

    const payrollTask = onboarding.tasks.find(t => t.category === 'PAYROLL' && t.status === 'PENDING');
    if (payrollTask) { payrollTask.status = 'IN_PROGRESS'; await onboarding.save(); }

    // ONB-019: Process signing bonus if contract is signed
    if (contract.signingBonus > 0 && contract.status === 'SIGNED') {
      payrollInitiation.signingBonusStatus = 'PROCESSED';
      payrollInitiation.signingBonusProcessedDate = new Date();
      await payrollInitiation.save();
    }

    res.status(201).json({ message: 'Payroll initiation created successfully', payrollInitiation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ONB-019: Process signing bonus
exports.processSigningBonus = async (req, res) => {
  try {
    const payrollInitiation = await PayrollInitiation.findById(req.params.id).populate('contractId');
    if (!payrollInitiation) return res.status(404).json({ message: 'Payroll initiation not found' });
    if (payrollInitiation.signingBonus <= 0) return res.status(400).json({ message: 'No signing bonus to process' });
    if (payrollInitiation.signingBonusStatus === 'PROCESSED') return res.status(400).json({ message: 'Signing bonus already processed' });
    if (payrollInitiation.contractId?.status !== 'SIGNED') return res.status(400).json({ message: 'Contract must be signed before processing signing bonus' });

    payrollInitiation.signingBonusStatus = 'PROCESSED';
    payrollInitiation.signingBonusProcessedDate = new Date();
    await payrollInitiation.save();

    const onboarding = await Onboarding.findById(payrollInitiation.onboardingId);
    if (onboarding) {
      const bonusTask = onboarding.tasks.find(t => t.name.toLowerCase().includes('signing bonus') || t.name.toLowerCase().includes('bonus'));
      if (bonusTask && bonusTask.status !== 'COMPLETED') { bonusTask.status = 'COMPLETED'; bonusTask.completedDate = new Date(); bonusTask.completedBy = req.user._id; await onboarding.save(); }
    }

    res.json({ message: 'Signing bonus processed successfully', payrollInitiation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPayrollInitiations = async (req, res) => {
  try {
    const { contractId, employeeId, status } = req.query;
    const query = {};
    if (contractId) query.contractId = contractId;
    if (employeeId) query.employeeId = employeeId;
    if (status) query.payrollStatus = status;
    if (req.user.role === 'NEW_HIRE' && req.user.employeeId) query.employeeId = req.user.employeeId;
    const payrollInitiations = await PayrollInitiation.find(query).populate('contractId').populate('employeeId').populate('onboardingId').populate('initiatedBy', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(payrollInitiations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPayrollInitiationById = async (req, res) => {
  try {
    const payrollInitiation = await PayrollInitiation.findById(req.params.id).populate('contractId').populate('employeeId').populate('onboardingId').populate('initiatedBy', 'firstName lastName email');
    if (!payrollInitiation) return res.status(404).json({ message: 'Payroll initiation not found' });
    if (req.user.role === 'NEW_HIRE' && payrollInitiation.employeeId?.userId?.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    res.json(payrollInitiation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

