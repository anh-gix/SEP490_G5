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

    // Check đã có pending request chưa
    const existingRequest = await WorkRequest.findOne({
      entityId: programId,
      entityType: 'Program',
      status: 'pending',
      direction: 'bottom_up'
    });

    if (existingRequest) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Program already has a pending approval request'
      });
    }

    // 1. Update Program status
    await Program.findByIdAndUpdate(
      programId,
      { status: 'pending_approval' },
      { session }
    );

    // 2. Tạo hoặc update WorkRequest
    const rejectedRequest = await WorkRequest.findOne({
      entityId: programId,
      entityType: 'Program',
      status: 'rejected',
      direction: 'bottom_up'
    }).session(session);

    let workRequest;

    if (rejectedRequest) {
      // Resubmit - update request cũ
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
      // Submit lần đầu - tạo mới
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
    const { userId, status } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required in query parameters'
      });
    }

    const query = {
      assignedTo: userId,
      direction: 'top_down'
    };
    if (status) query.status = status;

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
    console.error('❌ Error getting assigned requests:', error);
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

    if (request.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Request is not pending'
      });
    }

    if (request.direction !== 'bottom_up') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Only bottom-up requests can be approved'
      });
    }

    // 1. Update WorkRequest
    await WorkRequest.findByIdAndUpdate(id, {
      status: 'approved',
      processedBy: centerHeadId,
      processedAt: new Date(),
      responseNote: note,
      $push: {
        history: {
          action: 'approved',
          performedBy: centerHeadId,
          performedAt: new Date(),
          note: note,
          previousStatus: 'pending'
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

    if (request.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Request is not pending'
      });
    }

    if (request.direction !== 'bottom_up') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Only bottom-up requests can be rejected'
      });
    }

    // 1. Update WorkRequest
    await WorkRequest.findByIdAndUpdate(id, {
      status: 'rejected',
      processedBy: centerHeadId,
      processedAt: new Date(),
      rejectionReason: reason,
      $push: {
        history: {
          action: 'rejected',
          performedBy: centerHeadId,
          performedAt: new Date(),
          note: reason,
          previousStatus: 'pending'
        }
      }
    }, { session });

    // 2. Update entity status → needs_revision
    const Model = request.entityType === 'Program' ? Program : Exam;
    await Model.findByIdAndUpdate(
      request.entityId,
      { status: 'needs_revision' },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `${request.requestType} rejected successfully`
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
 * Cancel pending request
 * DELETE /api/work-requests/:id/cancel
 * Body: { userId }
 */
exports.cancelRequest = async (req, res) => {
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

    // Chỉ người request mới được cancel
    if (request.requestedBy.toString() !== userId.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own requests'
      });
    }

    // Chỉ cancel được pending request
    if (request.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Can only cancel pending requests'
      });
    }

    // 1. Xóa request
    await WorkRequest.findByIdAndDelete(id, { session });

    // 2. Update entity status về draft (chỉ cho bottom-up)
    if (request.direction === 'bottom_up' && request.entityId) {
      const Model = request.entityType === 'Program' ? Program : Exam;
      await Model.findByIdAndUpdate(
        request.entityId,
        { status: 'draft' },
        { session }
      );
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error cancelling request:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling request'
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

    // Update status
    await WorkRequest.findByIdAndUpdate(id, {
      status: 'in_progress',
      $push: {
        history: {
          action: 'in_progress',
          performedBy: userId,
          performedAt: new Date(),
          previousStatus: 'pending'
        }
      }
    }, { session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Started processing request'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error starting processing:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting processing'
    });
  } finally {
    session.endSession();
  }
};

/**
 * Upload output file
 * POST /api/work-requests/:id/upload-output
 * Body: { userId } + file upload
 */
exports.uploadOutputFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required in request body'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
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

    if (request.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot upload file: request must be in_progress (current: ${request.status})`
      });
    }

    // Update outputFile
    const outputFile = {
      fileName: req.file.originalname,
      fileUrl: `/uploads/work-requests/${req.file.filename}`,
      uploadedAt: new Date(),
      uploadedBy: userId
    };

    await WorkRequest.findByIdAndUpdate(id, { outputFile });

    res.status(200).json({
      success: true,
      message: 'Output file uploaded successfully',
      file: outputFile
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

    // Validate: phải có outputFile (cho assign_students)
    if (request.requestType === 'assign_students' && !request.outputFile) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Must upload output file before completing'
      });
    }

    // Update to completed
    await WorkRequest.findByIdAndUpdate(id, {
      status: 'completed',
      processedBy: userId,
      processedAt: new Date(),
      responseNote: note,
      $push: {
        history: {
          action: 'completed',
          performedBy: userId,
          performedAt: new Date(),
          note: note,
          previousStatus: 'in_progress'
        }
      }
    }, { session });

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