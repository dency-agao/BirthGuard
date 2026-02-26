require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const symptomsRoutes = require('./routes/symptoms');
const riskRoutes = require('./routes/risk');
const motherRoutes = require('./routes/mother');
const chvRoutes = require('./routes/chv');
const referralsRoutes = require('./routes/referrals');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Attach database connection to request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'BirthGuard API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/symptoms', symptomsRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/mother', motherRoutes);
app.use('/api/chv', chvRoutes);
app.use('/api/referrals', referralsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 BirthGuard API running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
