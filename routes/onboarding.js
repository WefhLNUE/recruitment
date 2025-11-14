const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware');
const onboardingController = require('../controllers/onboardingController');

router.use(authMiddleware);
router.post('/checklists', authorize('HR_MANAGER'), onboardingController.createChecklist);
router.get('/checklists', onboardingController.getChecklists);
router.get('/checklists/:id', onboardingController.getChecklistById);
router.put('/checklists/:id', authorize('HR_MANAGER'), onboardingController.updateChecklist);
router.delete('/checklists/:id', authorize('HR_MANAGER'), onboardingController.deleteChecklist);
router.post('/', authorize('HR_MANAGER', 'HR_EMPLOYEE'), onboardingController.createOnboarding);
router.get('/', onboardingController.getOnboardings);
router.get('/:id', onboardingController.getOnboardingById);
router.get('/:id/tracker', onboardingController.getOnboardingTracker);
router.put('/:id/tasks/:taskId', onboardingController.updateTaskStatus);
router.put('/:id/complete', authorize('HR_MANAGER', 'HR_EMPLOYEE'), onboardingController.completeOnboarding);
module.exports = router;

