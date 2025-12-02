const ApprovalRequest = require('../models/approvalRequestModel');
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
// SUBMIT PROGRAM/EXAM (Subject Leader/Teacher)
// =========================

/**
 * Submit program for approval
 * POST /api/approval-requests/submit/program/:programId
 */
exports.submitProgram = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { programId } = req.params;
    const { note } = req.body;
    const submitterId = req.user._id;

    // Validate
    await validateProgramBeforeSubmit(programId);

    // Check đã có pending request chưa
    const existingRequest = await ApprovalRequest.findOne({
      entityId: programId,
      entityType: 'Program',
      status: 'pending'
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

    // 2. Tạo hoặc update ApprovalRequest
    const rejectedRequest = await ApprovalRequest.findOne({
      entityId: programId,
      entityType: 'Program',
      status: 'rejected'
    }).session(session);

    let approvalRequest;

    if (rejectedRequest) {
      // Resubmit - update request cũ
      approvalRequest = await ApprovalRequest.findByIdAndUpdate(
        rejectedRequest._id,
        {
          status: 'pending',
          submittedAt: new Date(),
          submissionNote: note,
          reviewedBy: null,
          reviewedAt: null,
          reviewNote: null,
          rejectionReason: null,
          $push: {
            history: {
              action: 'resubmitted',
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
      const newRequest = await ApprovalRequest.create([{
        requestType: 'program',
        entityType: 'Program',
        entityId: programId,
        submittedBy: submitterId,
        submittedAt: new Date(),
        submissionNote: note,
        status: 'pending',
        history: [{
          action: 'submitted',
          performedBy: submitterId,
          performedAt: new Date(),
          note: note
        }]
      }], { session });

      approvalRequest = newRequest[0];
    }

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Program submitted for approval successfully',
      data: approvalRequest
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
 * POST /api/approval-requests/submit/exam/:examId
 */
exports.submitExam = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { examId } = req.params;
    const { note } = req.body;
    const submitterId = req.user._id;

    // Validate
    await validateExamBeforeSubmit(examId);

    // Check đã có pending request chưa
    const existingRequest = await ApprovalRequest.findOne({
      entityId: examId,
      entityType: 'Exam',
      status: 'pending'
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

    // 2. Tạo hoặc update ApprovalRequest
    const rejectedRequest = await ApprovalRequest.findOne({
      entityId: examId,
      entityType: 'Exam',
      status: 'rejected'
    }).session(session);

    let approvalRequest;

    if (rejectedRequest) {
      // Resubmit
      approvalRequest = await ApprovalRequest.findByIdAndUpdate(
        rejectedRequest._id,
        {
          status: 'pending',
          submittedAt: new Date(),
          submissionNote: note,
          reviewedBy: null,
          reviewedAt: null,
          reviewNote: null,
          rejectionReason: null,
          $push: {
            history: {
              action: 'resubmitted',
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
      const newRequest = await ApprovalRequest.create([{
        requestType: 'exam',
        entityType: 'Exam',
        entityId: examId,
        submittedBy: submitterId,
        submittedAt: new Date(),
        submissionNote: note,
        status: 'pending',
        history: [{
          action: 'submitted',
          performedBy: submitterId,
          performedAt: new Date(),
          note: note
        }]
      }], { session });

      approvalRequest = newRequest[0];
    }

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Exam submitted for approval successfully',
      data: approvalRequest
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
// GET APPROVAL REQUESTS
// =========================

/**
 * Get all pending approval requests (Center Head)
 * GET /api/approval-requests/pending
 */
exports.getPendingRequests = async (req, res) => {
  try {
    const { type } = req.query; // 'program' hoặc 'exam'

    const query = { status: 'pending' };
    if (type) {
      query.requestType = type;
    }

    const requests = await ApprovalRequest.find(query)
      .populate('submittedBy', 'name email')
      .populate('entityId')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
      count: requests.length
    });

  } catch (error) {
    console.error('Error getting pending requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting pending approval requests'
    });
  }
};

/**
 * Get my submitted requests (Subject Leader)
 * GET /api/approval-requests/my-requests
 */
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, type } = req.query;

    const query = { submittedBy: userId };
    if (status) {
      query.status = status;
    }
    if (type) {
      query.requestType = type;
    }

    const requests = await ApprovalRequest.find(query)
      .populate('reviewedBy', 'name email')
      .populate('entityId')
      .sort({ submittedAt: -1 });

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
 * Get approval request by ID
 * GET /api/approval-requests/:id
 */
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ApprovalRequest.findById(id)
      .populate('submittedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('entityId');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
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
      message: 'Error getting approval request'
    });
  }
};

/**
 * Get approval history (Center Head)
 * GET /api/approval-requests/history
 */
exports.getApprovalHistory = async (req, res) => {
  try {
    const centerHeadId = req.user._id;
    const { limit = 20 } = req.query;

    const requests = await ApprovalRequest.find({
      reviewedBy: centerHeadId,
      status: { $in: ['approved', 'rejected'] }
    })
      .populate('submittedBy', 'name email')
      .populate('entityId')
      .sort({ reviewedAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: requests,
      count: requests.length
    });

  } catch (error) {
    console.error('Error getting approval history:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting approval history'
    });
  }
};

// =========================
// APPROVE/REJECT (Center Head)
// =========================

/**
 * Approve request
 * POST /api/approval-requests/:id/approve
 */
exports.approveRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { note } = req.body;
    const centerHeadId = req.user._id;

    const request = await ApprovalRequest.findById(id).session(session);

    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    if (request.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Request is not pending'
      });
    }

    // 1. Update ApprovalRequest
    await ApprovalRequest.findByIdAndUpdate(id, {
      status: 'approved',
      reviewedBy: centerHeadId,
      reviewedAt: new Date(),
      reviewNote: note,
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
 * POST /api/approval-requests/:id/reject
 */
exports.rejectRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { reason } = req.body;
    const centerHeadId = req.user._id;

    if (!reason || reason.trim() === '') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const request = await ApprovalRequest.findById(id).session(session);

    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    if (request.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Request is not pending'
      });
    }

    // 1. Update ApprovalRequest
    await ApprovalRequest.findByIdAndUpdate(id, {
      status: 'rejected',
      reviewedBy: centerHeadId,
      reviewedAt: new Date(),
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
// CANCEL REQUEST (Subject Leader)
// =========================

/**
 * Cancel pending request
 * DELETE /api/approval-requests/:id/cancel
 */
exports.cancelRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user._id;

    const request = await ApprovalRequest.findById(id).session(session);

    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    // Chỉ người submit mới được cancel
    if (request.submittedBy.toString() !== userId.toString()) {
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
    await ApprovalRequest.findByIdAndDelete(id, { session });

    // 2. Update entity status về draft
    const Model = request.entityType === 'Program' ? Program : Exam;
    await Model.findByIdAndUpdate(
      request.entityId,
      { status: 'draft' },
      { session }
    );

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
 * Get approval statistics (Center Head)
 * GET /api/approval-requests/stats
 */
exports.getStats = async (req, res) => {
  try {
    const stats = await ApprovalRequest.aggregate([
      {
        $group: {
          _id: { type: '$requestType', status: '$status' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Transform data
    const result = {
      program: { pending: 0, approved: 0, rejected: 0 },
      exam: { pending: 0, approved: 0, rejected: 0 }
    };

    stats.forEach(item => {
      const type = item._id.type;
      const status = item._id.status;
      if (result[type] && result[type][status] !== undefined) {
        result[type][status] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting statistics'
    });
  }
};
