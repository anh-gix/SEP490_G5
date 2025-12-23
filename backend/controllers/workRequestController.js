const WorkRequest = require('../models/workRequestModel');
const Program = require('../models/programModel');
const Exam = require('../models/examModel');
const Course = require('../models/courseModel');
const mongoose = require('mongoose');

// =========================
// HELPER FUNCTIONS
// =========================

/**
 * Validate if program can be submitted
 */
const validateProgramBeforeSubmit = async (programId) => {
  const program = await Program.findById(programId);

  if (!program) {
    throw new Error('Program not found');
  }

  if (!['draft', 'needs_revision'].includes(program.status)) {
    throw new Error('Program is not in submittable state');
  }

  // Check có ít nhất 1 course
  const courseCount = await Course.countDocuments({ program: programId });
  if (courseCount === 0) {
    throw new Error('Program must have at least one course');
  }

  // Check TẤT CẢ courses phải completed
  const completedCount = await Course.countDocuments({
    program: programId,
    status: 'completed'
  });

  if (courseCount !== completedCount) {
    const draftCourses = await Course.find({
      program: programId,
      status: 'draft'
    }).select('courseCode name');

    throw new Error(
      `${courseCount - completedCount} courses are still in draft: ${draftCourses.map(c => c.courseCode).join(', ')}`
    );
  }

  return true;
};

/**
 * Validate if exam can be submitted
 */
const validateExamBeforeSubmit = async (examId) => {
  const exam = await Exam.findById(examId);

  if (!exam) {
    throw new Error('Exam not found');
  }

  if (!['draft', 'needs_revision'].includes(exam.status)) {
    throw new Error('Exam is not in submittable state');
  }

  // Check exam có sections không
  if (!exam.sections || exam.sections.length === 0) {
    throw new Error('Exam must have at least one section');
  }

  return true;
};

// =========================
// SUBMIT PROGRAM/EXAM (Subject Leader/Teacher) - BOTTOM-UP
// =========================

/**
 * Submit program for approval
 * POST /api/work-requests/submit/program/:programId
 * Body: { userId, note }
 */
exports.submitProgram = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { programId } = req.params;
    const { userId, note } = req.body;

    if (!userId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'userId is required in request body'
      });
    }

    const submitterId = userId;

    // Validate
    await validateProgramBeforeSubmit(programId);

    // CRITICAL: Check if program is linked to a top-down in_progress request
    const topDownRequest = await WorkRequest.findOne({
      entityId: programId,
      entityType: 'Program',
      status: 'in_progress',
      direction: 'top_down'
    }).session(session);

    let workRequest;

    if (topDownRequest) {
      // ========================================
      // SCENARIO 1: Top-Down Workflow
      // Program was assigned by Center Head to Subject Leader
      // Update the existing top-down request to pending_approval
      // ========================================
      console.log('✅ Found top-down in_progress request - updating to pending_approval');

      // Update Program status
      await Program.findByIdAndUpdate(
        programId,
        { status: 'pending_approval' },
        { session }
      );

      // Update existing top-down request to pending_approval
      workRequest = await WorkRequest.findByIdAndUpdate(
        topDownRequest._id,
        {
          status: 'pending_approval',
          processedBy: submitterId,
          processedAt: new Date(),
          responseNote: note,
          $push: {
            history: {
              action: 'completed_and_submitted',
              performedBy: submitterId,
              performedAt: new Date(),
              note: note,
              previousStatus: 'in_progress'
            }
          }
        },
        { session, new: true }
      );

      console.log('✅ Updated top-down request to pending_approval:', workRequest._id);
    } else {
      // ========================================
      // SCENARIO 2: Bottom-Up Workflow
      // Subject Leader created program independently and submits for approval
      // Create new bottom-up request OR update rejected request
      // ========================================

      // Check đã có pending bottom-up request chưa
      const existingPendingRequest = await WorkRequest.findOne({
        entityId: programId,
        entityType: 'Program',
        status: 'pending',
        direction: 'bottom_up'
      }).session(session);

      if (existingPendingRequest) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Program already has a pending approval request'
        });
      }

      // Update Program status
      await Program.findByIdAndUpdate(
        programId,
        { status: 'pending_approval' },
        { session }
      );

      // Check if there's a rejected bottom-up request to update
      const rejectedRequest = await WorkRequest.findOne({
        entityId: programId,
        entityType: 'Program',
        status: 'rejected',
        direction: 'bottom_up'
      }).session(session);

      if (rejectedRequest) {
        // Resubmit - update rejected request
        console.log('✅ Found rejected bottom-up request - updating to pending');
        workRequest = await WorkRequest.findByIdAndUpdate(
          rejectedRequest._id,
          {
            status: 'pending',
            requestedAt: new Date(),
            requestNote: note,
            processedBy: null,
            processedAt: null,
            responseNote: null,
            rejectionReason: null,
            $push: {
              history: {
                action: 'submitted',
                performedBy: submitterId,
                performedAt: new Date(),
                note: note,
                previousStatus: 'rejected'
              }
            }
          },
          { session, new: true }
        );
      } else {
        // Submit lần đầu - tạo mới bottom-up request
        console.log('✅ Creating new bottom-up request');
        const newRequest = await WorkRequest.create([{
          direction: 'bottom_up',
          requestType: 'program',
          entityType: 'Program',
          entityId: programId,
          requestedBy: submitterId,
          requestedAt: new Date(),
          requestNote: note,
          status: 'pending',
          history: [{
            action: 'submitted',
            performedBy: submitterId,
            performedAt: new Date(),
            note: note
          }]
        }], { session });

        workRequest = newRequest[0];
      }
    }

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Program submitted for approval successfully',
      data: workRequest
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error submitting program:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting program for approval'
    });
  } finally {
    session.endSession();
  }
};

/**
 * Submit exam for approval
 * POST /api/work-requests/submit/exam/:examId
 * Body: { userId, note }
 */
exports.submitExam = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { examId } = req.params;
    const { userId, note } = req.body;

    if (!userId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'userId is required in request body'
      });
    }

    const submitterId = userId;

    // Validate
    await validateExamBeforeSubmit(examId);

    // Check đã có pending request chưa
    const existingRequest = await WorkRequest.findOne({
      entityId: examId,
      entityType: 'Exam',
      status: 'pending',
      direction: 'bottom_up'
    });

    if (existingRequest) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Exam already has a pending approval request'
      });
    }

    // 1. Update Exam status
    await Exam.findByIdAndUpdate(
      examId,
      { status: 'pending_approval' },
      { session }
    );

    // 2. Tạo hoặc update WorkRequest
    const rejectedRequest = await WorkRequest.findOne({
      entityId: examId,
      entityType: 'Exam',
      status: 'rejected',
      direction: 'bottom_up'
    }).session(session);

    let workRequest;

    if (rejectedRequest) {
      // Resubmit
      workRequest = await WorkRequest.findByIdAndUpdate(
        rejectedRequest._id,
        {
          status: 'pending',
          requestedAt: new Date(),
          requestNote: note,
          processedBy: null,
          processedAt: null,
          responseNote: null,
          rejectionReason: null,
          $push: {
            history: {
              action: 'submitted',
              performedBy: submitterId,
              performedAt: new Date(),
              note: note,
              previousStatus: 'rejected'
            }
          }
        },
        { session, new: true }
      );
    } else {
      // Submit mới
      const newRequest = await WorkRequest.create([{
        direction: 'bottom_up',
        requestType: 'exam',
        entityType: 'Exam',
        entityId: examId,
        requestedBy: submitterId,
        requestedAt: new Date(),
        requestNote: note,
        status: 'pending',
        history: [{
          action: 'submitted',
          performedBy: submitterId,
          performedAt: new Date(),
          note: note
        }]
      }], { session });

      workRequest = newRequest[0];
    }

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Exam submitted for approval successfully',
      data: workRequest
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error submitting exam:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting exam for approval'
    });
  } finally {
    session.endSession();
  }
};

// =========================
// GET WORK REQUESTS
// =========================

/**
 * Get all work requests with filters (Center Head/Staff)
 * GET /api/work-requests
 * Query params: direction, requestType, status, fromDate, toDate, page, limit
 */
exports.getAllRequests = async (req, res) => {
  try {
    const {
      direction,
      requestType,
      status,
      fromDate,
      toDate,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = {};

    if (direction) query.direction = direction;
    if (requestType) query.requestType = requestType;
    if (status) query.status = status;

    // Filter by date range
    if (fromDate || toDate) {
      query.requestedAt = {};
      if (fromDate) {
        query.requestedAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setDate(endDate.getDate() + 1);
        query.requestedAt.$lt = endDate;
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query
    const [requests, total] = await Promise.all([
      WorkRequest.find(query)
        .populate('requestedBy', 'name email username')
        .populate('assignedTo', 'name email username')
        .populate('processedBy', 'name email username')
        .populate('history.performedBy', 'name email username')
        .populate('entityId')
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      WorkRequest.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: limitNum,
        totalPages,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error getting work requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting work requests'
    });
  }
};

/**
 * Get my submitted requests (Subject Leader)
 * GET /api/work-requests/my-requests?userId=xxx&status=xxx&requestType=xxx
 */
exports.getMyRequests = async (req, res) => {
  try {
    const { userId, status, requestType } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required in query parameters'
      });
    }

    const query = { requestedBy: userId };
    if (status) query.status = status;
    if (requestType) query.requestType = requestType;

    const requests = await WorkRequest.find(query)
      .populate('processedBy', 'name email username')
      .populate('assignedTo', 'name email username')
      .populate('entityId')
      .sort({ requestedAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
      count: requests.length
    });

  } catch (error) {
    console.error('Error getting my requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting your requests'
    });
  }
};

/**
 * Get requests assigned to me (Staff)
 * GET /api/work-requests/assigned-to-me?userId=xxx&status=xxx
 */
exports.getAssignedToMe = async (req, res) => {
  try {
    const { userId, status, requestType, direction } = req.query;


    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required in query parameters'
      });
    }

    const query = {
      assignedTo: userId,
      direction: direction || 'top_down' // Allow override, default to top_down
    };

    // Filter by status if provided
    if (status) query.status = status;

    // Filter by requestType if provided (e.g., 'create_exam', 'create_program')
    if (requestType) query.requestType = requestType;

    const requests = await WorkRequest.find(query)
      .populate('requestedBy', 'name email username')
      .populate('assignedTo', 'name email username')
      .populate('processedBy', 'name email username')
      .populate('entityId')
      .sort({ requestedAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
      count: requests.length
    });

  } catch (error) {
    console.error('Error getting assigned requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting assigned requests'
    });
  }
};

/**
 * Get work request by ID
 * GET /api/work-requests/:id
 */
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await WorkRequest.findById(id)
      .populate('requestedBy', 'name email username')
      .populate('assignedTo', 'name email username')
      .populate('processedBy', 'name email username')
      .populate('history.performedBy', 'name email username')
      .populate('entityId');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Work request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('Error getting request:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting work request'
    });
  }
};

// =========================
// APPROVE/REJECT (Center Head) - FOR BOTTOM-UP
// =========================

/**
 * Approve request
 * POST /api/work-requests/:id/approve
 * Body: { userId, note }
 */
exports.approveRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { userId, note } = req.body;

    if (!userId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'userId is required in request body'
      });
    }

    const centerHeadId = userId;

    const request = await WorkRequest.findById(id).session(session);

    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Work request not found'
      });
    }

    // Accept both 'pending' (bottom-up) and 'pending_approval' (top-down completed)
    if (!['pending', 'pending_approval'].includes(request.status)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot approve request with status: ${request.status}. Must be 'pending' or 'pending_approval'.`
      });
    }

    // Determine final status based on workflow direction
    // - Bottom-up (pending): status → approved
    // - Top-down (pending_approval): status → completed
    const finalStatus = request.direction === 'top_down' ? 'completed' : 'approved';
    const previousStatus = request.status;

    // 1. Update WorkRequest
    await WorkRequest.findByIdAndUpdate(id, {
      status: finalStatus,
      processedBy: centerHeadId,
      processedAt: new Date(),
      responseNote: note,
      $push: {
        history: {
          action: 'approved',
          performedBy: centerHeadId,
          performedAt: new Date(),
          note: note,
          previousStatus: previousStatus
        }
      }
    }, { session });

    // 2. Update entity status
    const Model = request.entityType === 'Program' ? Program : Exam;
    await Model.findByIdAndUpdate(
      request.entityId,
      { status: 'approved' },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `${request.requestType} approved successfully`
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error approving request:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving request'
    });
  } finally {
    session.endSession();
  }
};

/**
 * Reject request
 * POST /api/work-requests/:id/reject
 * Body: { userId, reason }
 */
exports.rejectRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { userId, rejectionReason, responseNote } = req.body;

    if (!userId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'userId is required in request body'
      });
    }

    const centerHeadId = userId;
    
    if (!rejectionReason || rejectionReason.trim() === '') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const request = await WorkRequest.findById(id).session(session);

    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Work request not found'
      });
    }

    // Accept both 'pending' (bottom-up) and 'pending_approval' (top-down completed)
    if (!['pending', 'pending_approval'].includes(request.status)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot reject request with status: ${request.status}. Must be 'pending' or 'pending_approval'.`
      });
    }

    const previousStatus = request.status;

    // 1. Update WorkRequest
    await WorkRequest.findByIdAndUpdate(id, {
      status: 'need_revision',
      processedBy: centerHeadId,
      processedAt: new Date(),
      rejectionReason: rejectionReason,
      $push: {
        history: {
          action: 'rejected',
          performedBy: centerHeadId,
          performedAt: new Date(),
          note: rejectionReason,
          previousStatus: previousStatus
        }
      }
    }, { session });

    // 2. Update entity status → needs_revision and add rejectionReason
    const Model = request.entityType === 'Program' ? Program : Exam;
    await Model.findByIdAndUpdate(
      request.entityId,
      {
        status: 'needs_revision',
        rejectionReason: rejectionReason,
        rejectedBy: centerHeadId,
        rejectedAt: new Date()
      },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `${request.requestType} marked as need_revision successfully`
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error rejecting request:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting request'
    });
  } finally {
    session.endSession();
  }
};

// =========================
// NEED REVISION (Center Head) - YÊU CẦU CHỈNH SỬA
// =========================

/**
 * Mark request as need_revision (Center Head requests changes)
 * POST /api/work-requests/:id/need-revision
 * Body: { userId, revisionReason, responseNote }
 */
exports.needRevisionRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { userId, revisionReason, responseNote } = req.body;

    if (!userId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'userId is required in request body'
      });
    }

    if (!revisionReason || revisionReason.trim() === '') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'revisionReason is required and cannot be empty'
      });
    }

    const centerHeadId = userId;

    const request = await WorkRequest.findById(id).session(session);

    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Work request not found'
      });
    }

    // Validate status: only pending_approval can be marked as need_revision
    if (request.status !== 'pending_approval') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot mark as need_revision: request must be pending_approval (current: ${request.status})`
      });
    }

    // Validate request type: only assign_students supports need_revision for now
    if (request.requestType !== 'assign_students') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `need_revision not supported for requestType: ${request.requestType}`
      });
    }

    const previousStatus = request.status;

    // Update WorkRequest to need_revision
    await WorkRequest.findByIdAndUpdate(id, {
      status: 'need_revision',
      processedBy: centerHeadId,
      processedAt: new Date(),
      responseNote: responseNote,
      rejectionReason: revisionReason, // Use rejectionReason field for revision reason
      $push: {
        history: {
          action: 'need_revision',
          performedBy: centerHeadId,
          performedAt: new Date(),
          note: revisionReason,
          previousStatus: previousStatus
        }
      }
    }, { session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `${request.requestType} marked as need_revision successfully`
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error marking request as need_revision:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking request as need_revision'
    });
  } finally {
    session.endSession();
  }
};

// =========================
// APPROVE ASSIGN STUDENTS REQUEST (Center Head)
// =========================

/**
 * Approve assign_students request (Center Head)
 * POST /api/work-requests/:id/approve-assign-students
 * Body: { userId, note }
 */
exports.approveAssignStudentsRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { userId, note } = req.body;

    if (!userId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'userId is required in request body'
      });
    }

    const centerHeadId = userId;

    const request = await WorkRequest.findById(id).session(session);

    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Work request not found'
      });
    }

    // Validate request type and status
    if (request.requestType !== 'assign_students') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'This approval method is only for assign_students requests'
      });
    }

    if (request.status !== 'pending_approval') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot approve: request must be pending_approval (current: ${request.status})`
      });
    }

    const previousStatus = request.status;

    // Update WorkRequest to completed
    await WorkRequest.findByIdAndUpdate(id, {
      status: 'completed',
      processedBy: centerHeadId,
      processedAt: new Date(),
      responseNote: note,
      $push: {
        history: {
          action: 'approved',
          performedBy: centerHeadId,
          performedAt: new Date(),
          note: note,
          previousStatus: previousStatus
        }
      }
    }, { session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'assign_students request approved and completed successfully'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error approving assign_students request:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving assign_students request'
    });
  } finally {
    session.endSession();
  }
};

// =========================
// RESUBMIT ASSIGN STUDENTS REQUEST (Academic Staff)
// =========================

/**
 * Resubmit assign_students request after need_revision (Academic Staff)
 * POST /api/work-requests/:id/resubmit-assign-students
 * Body: { userId, note }
 * Files: outputFiles[] (multipart/form-data, multiple files allowed)
 */
exports.resubmitAssignStudentsRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { userId, note } = req.body;

    if (!userId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'userId is required in request body'
      });
    }

    const academicStaffId = userId;

    const request = await WorkRequest.findById(id).session(session);

    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Work request not found'
      });
    }

    // Validate request type and status
    if (request.requestType !== 'assign_students') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'This resubmit method is only for assign_students requests'
      });
    }

    if (request.status !== 'need_revision') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot resubmit: request must be need_revision (current: ${request.status})`
      });
    }

    // Validate: assignedTo phải là người resubmit
    if (request.assignedTo.toString() !== academicStaffId) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'Only the assigned staff can resubmit this request'
      });
    }

    const previousStatus = request.status;

    // Prepare update data
    const updateData = {
      status: 'pending_approval',
      processedBy: null, // Reset processedBy
      processedAt: null, // Reset processedAt
      responseNote: note,
      rejectionReason: null, // Clear revision reason
      outputFiles: [], // Clear old files
      $push: {
        history: {
          action: 'submitted',
          performedBy: academicStaffId,
          performedAt: new Date(),
          note: note,
          previousStatus: previousStatus
        }
      }
    };

    // Handle file upload if provided (support multiple files)
    if (req.files && req.files.length > 0) {
      updateData.outputFiles = req.files.map(file => ({
        fileName: file.originalname,
        fileUrl: `/uploads/work-requests/${file.filename}`,
        uploadedAt: new Date(),
        uploadedBy: academicStaffId
      }));
    } else {
      // If no new files uploaded, keep old files (shouldn't happen in resubmit case)
      delete updateData.outputFiles;
    }

    // Update WorkRequest
    await WorkRequest.findByIdAndUpdate(id, updateData, { session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'assign_students request resubmitted successfully'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error resubmitting assign_students request:', error);
    res.status(500).json({
      success: false,
      message: 'Error resubmitting assign_students request'
    });
  } finally {
    session.endSession();
  }
};

// =========================
// REVOKE APPROVAL (Center Head) - THU HỒI PHÊ DUYỆT
// =========================

/**
 * Revoke (thu hồi) approval decision
 * POST /api/work-requests/:id/revoke
 * Body: { userId, reason }
 */
exports.revokeApproval = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { userId, reason } = req.body;

    if (!userId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'userId is required in request body'
      });
    }

    const centerHeadId = userId;

    if (!reason || reason.trim() === '') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Revocation reason is required'
      });
    }

    const request = await WorkRequest.findById(id).session(session);

    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Work request not found'
      });
    }

    // Chỉ có thể revoke request đã approved
    if (request.status !== 'approved') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Can only revoke approved requests'
      });
    }

    if (request.direction !== 'bottom_up') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Only bottom-up requests can be revoked'
      });
    }

    // Kiểm tra entity status - chỉ revoke được nếu entity chưa active/published
    const Model = request.entityType === 'Program' ? Program : Exam;
    const entity = await Model.findById(request.entityId).session(session);

    if (!entity) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: `${request.entityType} not found`
      });
    }

    // Không cho phép revoke nếu entity đã active hoặc published
    if (entity.status === 'active' || entity.status === 'published') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot revoke approval: ${request.entityType} is already ${entity.status}`
      });
    }

    // 1. Update WorkRequest - chuyển về pending
    await WorkRequest.findByIdAndUpdate(id, {
      status: 'pending',
      revocation: {
        revokedBy: centerHeadId,
        revokedAt: new Date(),
        revocationReason: reason
      },
      $push: {
        history: {
          action: 'revoked',
          performedBy: centerHeadId,
          performedAt: new Date(),
          note: reason,
          previousStatus: 'approved'
        }
      }
    }, { session });

    // 2. Update entity status về pending_approval
    await Model.findByIdAndUpdate(
      request.entityId,
      { status: 'pending_approval' },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `Approval revoked successfully. ${request.requestType} is now pending review again.`
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error revoking approval:', error);
    res.status(500).json({
      success: false,
      message: 'Error revoking approval'
    });
  } finally {
    session.endSession();
  }
};

// =========================
// CANCEL REQUEST (Subject Leader)
// =========================

/**
 * Cancel request
 * DELETE /api/work-requests/:id/cancel
 * Body: { userId, deleteLinkedEntity: boolean }
 *
 * Rules:
 * - Bottom-up: Only requester can cancel, only pending status
 * - Top-down: Only Center Head (requestedBy) can cancel, can cancel pending/in_progress
 */
exports.cancelRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { userId, deleteLinkedEntity = false } = req.body;

    if (!userId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'userId is required in request body'
      });
    }

    const request = await WorkRequest.findById(id).session(session);

    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Work request not found'
      });
    }

    // Validation: Chỉ người tạo request mới được cancel
    if (request.requestedBy.toString() !== userId.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'Only the request creator can cancel this request'
      });
    }

    // Validation based on direction
    if (request.direction === 'bottom_up') {
      // Bottom-up: Chỉ cancel được pending request
      if (request.status !== 'pending') {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Can only cancel pending requests for bottom-up workflow'
        });
      }
    } else if (request.direction === 'top_down') {
      // Top-down: Center Head có thể cancel pending hoặc in_progress
      if (!['pending', 'in_progress'].includes(request.status)) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Cannot cancel request with status: ${request.status}. Only pending or in_progress requests can be cancelled.`
        });
      }
    }

    // Handle linked entity (Program/Exam)
    let deletedEntity = false;
    if (request.entityId) {
      if (deleteLinkedEntity === true) {
        // Xóa entity liên kết (Program/Exam)
        const Model = request.entityType === 'Program' ? Program : Exam;
        const entity = await Model.findById(request.entityId).session(session);

        if (entity) {
          // Chỉ xóa nếu entity ở trạng thái draft hoặc needs_revision
          if (['draft', 'needs_revision'].includes(entity.status)) {
            await Model.findByIdAndDelete(request.entityId, { session });
            deletedEntity = true;
            console.log(`✅ Deleted linked ${request.entityType}:`, request.entityId);
          } else {
            // Entity không thể xóa vì status không phù hợp
            console.warn(`⚠️ Cannot delete ${request.entityType} with status: ${entity.status}`);
          }
        }
      } else {
        // Không xóa entity, chỉ update status về draft (cho bottom-up)
        if (request.direction === 'bottom_up') {
          const Model = request.entityType === 'Program' ? Program : Exam;
          await Model.findByIdAndUpdate(
            request.entityId,
            { status: 'draft' },
            { session }
          );
        }
      }
    }

    // Xóa work request
    await WorkRequest.findByIdAndDelete(id, { session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
      deletedEntity: deletedEntity,
      entityType: request.entityType,
      entityId: request.entityId
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error cancelling request:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling request',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// =========================
// STATISTICS
// =========================

/**
 * Get work request statistics
 * GET /api/work-requests/stats?direction=xxx
 */
exports.getStats = async (req, res) => {
  try {
    const { direction } = req.query;

    const matchStage = direction ? { direction } : {};

    const stats = await WorkRequest.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Transform data
    const result = {
      pending: 0,
      in_progress: 0,
      pending_approval: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      need_revision: 0,
      total: 0
    };

    stats.forEach(item => {
      const status = item._id;
      if (result[status] !== undefined) {
        result[status] = item.count;
        result.total += item.count;
      }
    });

    // Breakdown by type and direction
    const detailedStats = await WorkRequest.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            direction: '$direction',
            requestType: '$requestType',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Breakdown by direction
    const byDirectionStats = await WorkRequest.aggregate([
      {
        $group: {
          _id: {
            direction: '$direction',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Transform byDirection data
    const byDirection = {
      bottom_up: {
        pending: 0,
        approved: 0,
        rejected: 0,
        need_revision: 0,
        total: 0
      },
      top_down: {
        pending: 0,
        in_progress: 0,
        pending_approval: 0,
        approved: 0,
        rejected: 0,
        completed: 0,
        need_revision: 0,
        total: 0
      }
    };

    byDirectionStats.forEach(item => {
      const { direction, status } = item._id;
      if (byDirection[direction] && byDirection[direction][status] !== undefined) {
        byDirection[direction][status] = item.count;
        byDirection[direction].total += item.count;
      }
    });

    res.status(200).json({
      success: true,
      data: result,
      byDirection: byDirection,
      detailed: detailedStats
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting statistics'
    });
  }
};

// =========================
// CREATE TOP-DOWN WORK REQUEST (Center Head)
// =========================

/**
 * Create top-down work request (task assignment from Center Head)
 * POST /api/work-requests/create
 * Body: {
 *   requestType: 'create_program' | 'edit_course' | 'create_exam' | 'assign_students',
 *   assignedTo: userId,
 *   requestNote: string,
 *   entityType?: 'Course',
 *   entityId?: courseId (for edit_course),
 *   changeDetails?: object (for edit_course),
 *   requestedBy: centerHeadUserId
 * }
 * Files: attachmentFile, inputFile (multipart/form-data)
 */
exports.createTopDownRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      requestType,
      assignedTo,
      requestNote,
      entityType,
      entityId,
      changeDetails,
      requestedBy
    } = req.body;

    // Debug logging
    console.log('📝 Create Work Request - Received data:', {
      requestType,
      assignedTo,
      requestedBy,
      hasFiles: !!req.files,
      files: req.files ? Object.keys(req.files) : []
    });

    // Validation
    if (!requestType || !assignedTo || !requestedBy) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'requestType, assignedTo, and requestedBy are required',
        received: { requestType, assignedTo, requestedBy }
      });
    }

    const validTopDownTypes = ['create_program', 'edit_course', 'create_exam', 'assign_students'];
    if (!validTopDownTypes.includes(requestType)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid requestType for top-down workflow'
      });
    }

    // Prepare work request data
    const workRequestData = {
      direction: 'top_down',
      requestType,
      requestedBy,
      assignedTo,
      requestedAt: new Date(),
      status: 'pending',
      history: [{
        action: 'assigned',
        performedBy: requestedBy,
        performedAt: new Date(),
        note: requestNote || '',
        previousStatus: null
      }]
    };

    // Add optional fields
    if (requestNote) {
      workRequestData.requestNote = requestNote;
    }

    // For edit_course, add entity reference
    if (requestType === 'edit_course') {
      if (!entityType || !entityId) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'entityType and entityId are required for edit_course'
        });
      }
      workRequestData.entityType = entityType;
      workRequestData.entityId = entityId;

      if (changeDetails) {
        try {
          workRequestData.changeDetails = typeof changeDetails === 'string'
            ? JSON.parse(changeDetails)
            : changeDetails;
        } catch (e) {
          workRequestData.changeDetails = { description: changeDetails };
        }
      }
    }

    // Handle file uploads (if using multer)
    if (req.files) {
      if (req.files.attachmentFile) {
        const file = req.files.attachmentFile[0];
        workRequestData.attachmentFile = {
          fileName: file.originalname,
          fileUrl: `/uploads/work-requests/${file.filename}`,
          fileSize: file.size,
          uploadedAt: new Date(),
          uploadedBy: requestedBy
        };
      }

      if (req.files.inputFile && requestType === 'assign_students') {
        const file = req.files.inputFile[0];
        workRequestData.inputFile = {
          fileName: file.originalname,
          fileUrl: `/uploads/work-requests/${file.filename}`,
          uploadedAt: new Date(),
          uploadedBy: requestedBy
        };
      }
    }

    // Create work request
    const workRequest = await WorkRequest.create([workRequestData], { session });

    await session.commitTransaction();

    // Populate before returning
    const populatedRequest = await WorkRequest.findById(workRequest[0]._id)
      .populate('requestedBy', 'username email name')
      .populate('assignedTo', 'username email name');

    res.status(201).json({
      success: true,
      message: 'Work request created successfully',
      data: populatedRequest
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating top-down request:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating work request',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

exports.startProcessing = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'userId is required in request body'
      });
    }

    const request = await WorkRequest.findById(id).session(session);

    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Work request not found'
      });
    }

    // Validate: chỉ top_down requests mới có thể start processing
    if (request.direction !== 'top_down') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Only top-down requests can be processed'
      });
    }

    // Validate: chỉ assignee mới được xử lý
    if (request.assignedTo.toString() !== userId.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this request'
      });
    }

    // Validate: request phải ở trạng thái pending
    if (request.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot start processing: request is ${request.status}`
      });
    }

    let entityId = null;
    let entityType = null;

    // Tự động tạo entity draft based on request type
    if (request.requestType === 'create_program') {
      // Tạo program draft từ thông tin trong request
      const programData = {
        code: req.body.programCode || 'TEMP-' + Date.now(),
        program_name: req.body.programName || 'Draft Program',
        description: request.requestNote || '',
        type: req.body.programType || 'ielts',
        level: 'B1',
        band: '4.0-5.0',
        status: 'draft',
        createdBy: userId,
        plos: []
      };

      const program = await Program.create([programData], { session });
      entityId = program[0]._id;
      entityType = 'Program';

      console.log('✅ Created draft program:', entityId, 'for request:', id);
    } else if (request.requestType === 'create_exam') {
      // Tạo exam draft từ thông tin trong request
      const examData = {
        title: req.body.examTitle || 'Draft Exam',
        description: request.requestNote || '',
        examType: req.body.examType || 'cambridge',
        level: req.body.level || 'Academic',
        totalDuration: parseInt(req.body.totalDuration) || 170,
        sections: [],
        status: 'draft',
        isPublished: false,
        createdBy: userId,
        lastCompletedStep: 0
      };

      const exam = await Exam.create([examData], { session });
      entityId = exam[0]._id;
      entityType = 'Exam';

      console.log('✅ Created draft exam:', entityId, 'for request:', id);
    }

    // Update work request status
    const updateData = {
      status: 'in_progress',
      processedBy: userId,
      processedAt: new Date(),
      $push: {
        history: {
          action: 'in_progress',
          performedBy: userId,
          performedAt: new Date(),
          previousStatus: 'pending'
        }
      }
    };

    // Nếu tạo entity draft thành công, link vào request
    if (entityId) {
      updateData.entityType = entityType;
      updateData.entityId = entityId;
    }

    await WorkRequest.findByIdAndUpdate(id, updateData, { session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Started processing request',
      programId: entityType === 'Program' ? entityId : null, // For backward compatibility
      examId: entityType === 'Exam' ? entityId : null,
      entityId: entityId,
      entityType: entityType
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error starting processing:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting processing',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * Recreate entity for work request (when original entity was deleted)
 * POST /api/work-requests/:id/recreate-entity
 * Body: { userId, programCode, programName, programType }
 *
 * Use case: Subject Teacher accidentally deleted program, wants to recreate
 */
exports.recreateEntity = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { userId, programCode, programName, programType } = req.body;

    if (!userId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    // Find work request
    const request = await WorkRequest.findById(id)
      .populate('assignedTo', 'username email')
      .session(session);

    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Work request not found'
      });
    }

    // Validation: Only assignedTo can recreate
    if (request.assignedTo._id.toString() !== userId.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'Only the assigned person can recreate entity'
      });
    }

    // Validation: Request must be in_progress
    if (request.status !== 'in_progress') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot recreate entity: request status is ${request.status}, must be in_progress`
      });
    }

    // Validation: entityId should not exist OR entity was deleted
    if (request.entityId) {
      // Check if entity still exists
      const Model = request.entityType === 'Program' ? Program : Exam;
      const existingEntity = await Model.findById(request.entityId).session(session);

      if (existingEntity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Entity already exists and is not deleted. Cannot recreate.',
          entityId: request.entityId
        });
      }
      // If entity doesn't exist, we can proceed to recreate
    }

    let newEntityId = null;

    // Recreate entity based on request type
    if (request.requestType === 'create_program') {
      const programData = {
        code: programCode || 'TEMP-' + Date.now(),
        program_name: programName || 'Draft Program (Recreated)',
        description: request.requestNote || 'Program recreated after deletion',
        type: programType || 'ielts',
        level: 'B1',
        band: '4.0-5.0',
        status: 'draft',
        createdBy: userId,
        plos: []
      };

      const program = await Program.create([programData], { session });
      newEntityId = program[0]._id;

      console.log('✅ Recreated program:', newEntityId, 'for request:', id);
    } else if (request.requestType === 'create_exam') {
      // Similar logic for exam if needed
      const examData = {
        name: programName || 'Draft Exam (Recreated)',
        description: request.requestNote || 'Exam recreated after deletion',
        status: 'draft',
        createdBy: userId,
        questions: []
      };

      const exam = await Exam.create([examData], { session });
      newEntityId = exam[0]._id;

      console.log('✅ Recreated exam:', newEntityId, 'for request:', id);
    } else {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot recreate entity for request type: ${request.requestType}`
      });
    }

    // Update work request with new entityId
    await WorkRequest.findByIdAndUpdate(
      id,
      {
        entityType: request.requestType === 'create_program' ? 'Program' : 'Exam',
        entityId: newEntityId,
        $push: {
          history: {
            action: 'entity_recreated',
            performedBy: userId,
            performedAt: new Date(),
            note: 'Entity recreated after deletion'
          }
        }
      },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Entity recreated successfully',
      entityId: newEntityId,
      entityType: request.requestType === 'create_program' ? 'Program' : 'Exam'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error recreating entity:', error);
    res.status(500).json({
      success: false,
      message: 'Error recreating entity',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * Upload output files (supports multiple files)
 * POST /api/work-requests/:id/upload-output
 * Body: { userId } + files upload
 */
exports.uploadOutputFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    console.log('Upload debug:', {
      userId,
      reqFiles: req.files,
      reqFilesType: typeof req.files,
      reqFilesLength: req.files ? req.files.length : 'undefined',
      reqBody: req.body,
      contentType: req.headers['content-type']
    });

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required in request body'
      });
    }

    // Check for files from multer array()
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const request = await WorkRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Work request not found'
      });
    }

    // Validate
    if (request.direction !== 'top_down') {
      return res.status(400).json({
        success: false,
        message: 'Only top-down requests can upload output file'
      });
    }

    if (request.assignedTo.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this request'
      });
    }

    if (!['in_progress', 'need_revision'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot upload file: request must be in_progress or need_revision (current: ${request.status})`
      });
    }

    // Update outputFiles (support multiple files)
    const outputFiles = req.files.map(file => ({
      fileName: file.originalname,
      fileUrl: `/uploads/work-requests/${file.filename}`,
      uploadedAt: new Date(),
      uploadedBy: userId
    }));

    await WorkRequest.findByIdAndUpdate(id, {
      $push: { outputFiles: { $each: outputFiles } }
    });

    res.status(200).json({
      success: true,
      message: `${outputFiles.length} output file(s) uploaded successfully`,
      files: outputFiles
    });

  } catch (error) {
    console.error('Error uploading output file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading output file'
    });
  }
};

exports.completeRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { userId, note } = req.body;

    if (!userId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'userId is required in request body'
      });
    }

    const request = await WorkRequest.findById(id).session(session);

    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Work request not found'
      });
    }

    // Validate
    if (request.direction !== 'top_down') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Only top-down requests can be completed'
      });
    }

    if (request.assignedTo.toString() !== userId.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this request'
      });
    }

    if (request.status !== 'in_progress') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot complete: request must be in_progress (current: ${request.status})`
      });
    }

    // Validate: phải có outputFiles (cho assign_students)
    if (request.requestType === 'assign_students' && (!request.outputFiles || request.outputFiles.length === 0)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Must upload at least one output file before completing'
      });
    }

    // Update work request to pending_approval (waiting for Center Head review)
    await WorkRequest.findByIdAndUpdate(id, {
      status: 'pending_approval',
      processedBy: userId,
      processedAt: new Date(),
      responseNote: note,
      $push: {
        history: {
          action: 'completed_and_submitted',
          performedBy: userId,
          performedAt: new Date(),
          note: note,
          previousStatus: 'in_progress'
        }
      }
    }, { session });

    // Sync entity (Program/Exam) status based on request type
    if (request.entityId && request.requestType === 'create_program') {
      // Khi complete việc tạo program, program nên chuyển sang pending_approval
      // để Center Head review và duyệt
      const Program = require('../models/Program');
      await Program.findByIdAndUpdate(
        request.entityId,
        { status: 'pending_approval' },
        { session }
      );
      console.log('✅ Updated program status to pending_approval after completion');
    } else if (request.entityId && request.requestType === 'create_exam') {
      const Exam = require('../models/Exam');
      await Exam.findByIdAndUpdate(
        request.entityId,
        { status: 'pending_approval' },
        { session }
      );
      console.log('✅ Updated exam status to pending_approval after completion');
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Request completed successfully'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error completing request:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing request'
    });
  } finally {
    session.endSession();
  }
};

exports.getWorkRequestStats = async (req, res) => {
  try {
    const { userId, status } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const query = {
      assignedTo: userId,
      direction: 'top_down'
    };

    // Add status filter if provided and not 'all'
    if (status && status !== 'all') {
      query.status = status;
    }

    const stats = {
      assign_students: await WorkRequest.countDocuments({ ...query, requestType: 'assign_students' }),
      create_program: await WorkRequest.countDocuments({ ...query, requestType: 'create_program' }),
      edit_course: await WorkRequest.countDocuments({ ...query, requestType: 'edit_course' }),
      create_exam: await WorkRequest.countDocuments({ ...query, requestType: 'create_exam' }),
      total: await WorkRequest.countDocuments(query)
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Error getting WorkRequest stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting stats'
    });
  }
};

