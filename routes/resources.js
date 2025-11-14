const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware');
const resourceController = require('../controllers/resourceController');

router.use(authMiddleware);
router.post('/', authorize('HR_MANAGER', 'HR_EMPLOYEE'), resourceController.createResource);
router.get('/', resourceController.getResources);
router.get('/:id', resourceController.getResourceById);
router.put('/:id', authorize('HR_MANAGER', 'HR_EMPLOYEE'), resourceController.updateResource);
router.put('/:id/assign', authorize('HR_MANAGER', 'HR_EMPLOYEE'), resourceController.assignResource);
router.delete('/:id', authorize('HR_MANAGER', 'HR_EMPLOYEE'), resourceController.deleteResource);
module.exports = router;

