const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware');
const employeeController = require('../controllers/employeeController');

router.use(authMiddleware);
router.get('/', employeeController.getEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.put('/:id', authorize('HR_MANAGER', 'HR_EMPLOYEE'), employeeController.updateEmployee);
router.get('/contracts/all', employeeController.getContracts);
router.get('/contracts/:id', employeeController.getContractById);
router.put('/contracts/:id/sign', employeeController.signContract);
module.exports = router;

