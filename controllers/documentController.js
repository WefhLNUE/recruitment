const Document = require('../models/Document');
const Onboarding = require('../models/Onboarding');
const notificationService = require('../services/notificationService');
const fs = require('fs');

// ONB-007: Upload document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { onboardingId, documentType, description } = req.body;
    if (!onboardingId || !documentType) return res.status(400).json({ message: 'onboardingId and documentType are required' });

    const onboarding = await Onboarding.findById(onboardingId).populate('employeeId');
    if (!onboarding) { fs.unlinkSync(req.file.path); return res.status(404).json({ message: 'Onboarding not found' }); }
    if (req.user.role === 'NEW_HIRE' && onboarding.employeeId?.userId?.toString() !== req.user._id.toString()) { fs.unlinkSync(req.file.path); return res.status(403).json({ message: 'Access denied' }); }

    const document = new Document({ onboardingId: onboarding._id, employeeId: onboarding.employeeId?._id, documentType, name: req.file.originalname, description, filePath: req.file.path, fileName: req.file.filename, fileSize: req.file.size, mimeType: req.file.mimetype, uploadedBy: req.user._id });
    await document.save();

    const documentTask = onboarding.tasks.find(t => t.category === 'DOCUMENTATION' && (t.name.toLowerCase().includes(documentType.toLowerCase()) || t.name.toLowerCase().includes('document')));
    if (documentTask && documentTask.status === 'PENDING') { documentTask.status = 'IN_PROGRESS'; await onboarding.save(); }

    if (onboarding.assignedHRManager) await notificationService.createNotification({ userId: onboarding.assignedHRManager, onboardingId: onboarding._id, type: 'DOCUMENT_UPLOADED', title: 'New Document Uploaded', message: `Document "${req.file.originalname}" has been uploaded and requires review`, priority: 'MEDIUM', actionUrl: `/onboarding/${onboarding._id}/documents` });
    if (onboarding.employeeId?.userId) await notificationService.sendDocumentUploadedNotification(onboarding.employeeId.userId, onboarding._id, req.file.originalname);

    res.status(201).json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    if (req.file && req.file.path) { try { fs.unlinkSync(req.file.path); } catch (unlinkError) { console.error('Error deleting file:', unlinkError); } }
    res.status(500).json({ message: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { onboardingId, employeeId, documentType, status } = req.query;
    const query = {};
    if (onboardingId) query.onboardingId = onboardingId;
    if (employeeId) query.employeeId = employeeId;
    if (documentType) query.documentType = documentType;
    if (status) query.status = status;
    if (req.user.role === 'NEW_HIRE' && req.user.employeeId) query.employeeId = req.user.employeeId;
    const documents = await Document.find(query).populate('onboardingId').populate('employeeId').populate('uploadedBy', 'firstName lastName email').populate('reviewedBy', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('onboardingId').populate('employeeId').populate('uploadedBy', 'firstName lastName email').populate('reviewedBy', 'firstName lastName email');
    if (!document) return res.status(404).json({ message: 'Document not found' });
    if (req.user.role === 'NEW_HIRE' && document.employeeId?.userId?.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reviewDocument = async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    const document = await Document.findById(req.params.id).populate('onboardingId');
    if (!document) return res.status(404).json({ message: 'Document not found' });
    document.status = status;
    document.reviewedBy = req.user._id;
    document.reviewedDate = new Date();
    if (reviewNotes) document.reviewNotes = reviewNotes;
    await document.save();

    if (status === 'APPROVED' && document.onboardingId) {
      const onboarding = await Onboarding.findById(document.onboardingId);
      if (onboarding) {
        const documentTask = onboarding.tasks.find(t => t.category === 'DOCUMENTATION' && t.status === 'IN_PROGRESS');
        if (documentTask) { documentTask.status = 'COMPLETED'; documentTask.completedDate = new Date(); documentTask.completedBy = req.user._id; await onboarding.save(); }
      }
    }

    if (document.onboardingId?.employeeId?.userId) await notificationService.createNotification({ userId: document.onboardingId.employeeId.userId, onboardingId: document.onboardingId._id, type: 'DOCUMENT_REQUIRED', title: `Document ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`, message: `Your document "${document.name}" has been ${status.toLowerCase()}. ${reviewNotes || ''}`, priority: status === 'APPROVED' ? 'LOW' : 'MEDIUM', actionUrl: `/onboarding/${document.onboardingId._id}/documents` });
    res.json({ message: 'Document reviewed successfully', document });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    if (req.user.role === 'NEW_HIRE' && document.uploadedBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    if (fs.existsSync(document.filePath)) fs.unlinkSync(document.filePath);
    await document.deleteOne();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

