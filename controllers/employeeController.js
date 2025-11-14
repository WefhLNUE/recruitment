const Employee = require('../models/Employee');
const Contract = require('../models/Contract');

// Employee CRUD
exports.getEmployees = async (req, res) => {
  try {
    const { status, department } = req.query;
    const query = {};
    if (status) query.employmentStatus = status;
    if (department) query.department = department;
    const employees = await Employee.find(query).populate('department').populate('manager').populate('onboardingId').sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('department').populate('manager').populate('onboardingId');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    Object.assign(employee, req.body);
    await employee.save();
    res.json({ message: 'Employee updated successfully', employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Contract CRUD
exports.getContracts = async (req, res) => {
  try {
    const { status, candidateId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (candidateId) query.candidateId = candidateId;
    const contracts = await Contract.find(query).populate('candidateId').populate('department').populate('employeeId').sort({ createdAt: -1 });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id).populate('candidateId').populate('department').populate('employeeId');
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.signContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    contract.status = 'SIGNED';
    contract.signedDate = new Date();
    contract.signedBy = req.body.signedBy || req.user._id;
    await contract.save();
    res.json({ message: 'Contract signed successfully', contract });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

