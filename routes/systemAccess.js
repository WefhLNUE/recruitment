const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware');
const systemAccessController = require('../controllers/systemAccessController');

router.use(authMiddleware);
router.post('/', authorize('SYSTEM_ADMIN', 'HR_MANAGER'), systemAccessController.createSystemAccess);
router.get('/', systemAccessController.getSystemAccesses);
router.get('/:id', systemAccessController.getSystemAccessById);
router.put('/:id/provision', authorize('SYSTEM_ADMIN'), systemAccessController.provisionAccess);
router.put('/:id/revoke', authorize('SYSTEM_ADMIN', 'HR_MANAGER'), systemAccessController.revokeAccess);
router.delete('/:id', authorize('SYSTEM_ADMIN', 'HR_MANAGER'), systemAccessController.deleteSystemAccess);
module.exports = router;

