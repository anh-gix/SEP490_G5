const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const router = require('./routes');
require('./models');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/v1', router);
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/class-schedules', require('./routes/classScheduleRoutes'));
app.use('/api/student-schedules', require('./routes/studentScheduleRoutes'));

// Center Head Routes
app.use('/api/center-head', require('./routes/centerHeadRoutes'));
app.use('/api/programs', require('./routes/programRoutes'));
app.use('/api/courses', require('./routes/courseRoute'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
