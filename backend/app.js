const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const router = require('./routes');
require('./models');
require('dotenv').config();
const path = require('path');
const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.DB_NAME,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/courses', require('./routes/courseRoute'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/v1', router); // Use the centralized router
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/class-schedules', require('./routes/classScheduleRoutes'));
app.use('/api/student-schedules', require('./routes/studentScheduleRoutes'));

// Center Head Routes
app.use('/api/center-head', require('./routes/centerHeadRoutes'));
app.use('/api/programs', require('./routes/programRoutes'));
app.use('/api/courseshome', require('./routes/courseHomeRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/cam-sessions', require('./routes/camSessionRoutes'));

// Academic Staff Routes
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Class Routes
app.use('/api/classes', require('./routes/classRoutes'));

// Schedule Routes
app.use('/api/schedules', require('./routes/scheduleRoute'));

// Homework Routes
app.use('/api/homework', require('./routes/homeworkRoutes'));

// Change Request Routes
app.use('/api/change-requests', require('./routes/changeRequestRoutes'));

// Approval Request Routes
app.use('/api/approval-requests', require('./routes/approvalRequestRoutes'));

// Academic Staff Routes
app.use('/api/academic-staff', require('./routes/academicStaffRoutes'));

// Tip Routes
app.use('/api/tips', require('./routes/tipRoutes'));

// Online Learning Routes
app.use('/api/online-learning', require('./routes/onlineLearningRoutes'));

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
