require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const uploadDirs = [uploadDir, path.join(uploadDir, 'documents'), path.join(uploadDir, 'contracts')];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use('/uploads', express.static(path.join(__dirname, uploadDir)));

// MongoDB Atlas Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  console.error('Please create a .env file with your MongoDB Atlas connection string');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  console.error('Please check your MONGODB_URI in .env file');
  process.exit(1);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/onboarding', require('./routes/onboarding'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/system-access', require('./routes/systemAccess'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HR Onboarding Platform is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HR Onboarding Platform - Phase 2 API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      onboarding: '/api/onboarding',
      employees: '/api/employees',
      contracts: '/api/contracts',
      resources: '/api/resources',
      documents: '/api/documents',
      systemAccess: '/api/system-access',
      payroll: '/api/payroll',
      notifications: '/api/notifications',
      health: '/health'
    },
    documentation: 'See README.md and API_DOCUMENTATION.md for details'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API base URL: http://localhost:${PORT}/api`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Start scheduled jobs
try {
  require('./services/scheduler').start();
  console.log('✅ Scheduled jobs started');
} catch (error) {
  console.error('⚠️  Error starting scheduler:', error.message);
  console.log('Scheduled jobs will not run, but the server is operational');
}
