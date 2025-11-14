const express = require('express');
const router = express.Router();
const { authMiddleware, authorize, upload } = require('../middleware');
const documentController = require('../controllers/documentController');

router.use(authMiddleware);
router.post('/upload', upload.single('file'), documentController.uploadDocument);
router.get('/', documentController.getDocuments);
router.get('/:id', documentController.getDocumentById);
router.put('/:id/review', authorize('HR_MANAGER', 'HR_EMPLOYEE'), documentController.reviewDocument);
router.delete('/:id', documentController.deleteDocument);
module.exports = router;

