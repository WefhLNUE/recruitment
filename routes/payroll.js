const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware');
const payrollController = require('../controllers/payrollController');

router.use(authMiddleware);
router.post('/initiate', authorize('HR_MANAGER'), payrollController.initiatePayroll);
router.get('/', payrollController.getPayrollInitiations);
router.get('/:id', payrollController.getPayrollInitiationById);
router.put('/:id/process-bonus', authorize('HR_MANAGER'), payrollController.processSigningBonus);
module.exports = router;

