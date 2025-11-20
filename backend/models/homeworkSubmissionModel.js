const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * HomeworkSubmission Model
 * Quản lý bài nộp homework của học viên cho từng assignment trong ClassSchedule
 */
const homeworkSubmissionSchema = new Schema({
  // Liên kết với ClassSchedule và homework cụ thể
  classSchedule: {
    type: Schema.Types.ObjectId,
    ref: 'ClassSchedule',
    required: true,
    index: true
  },
  
  homeworkId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
    // 'ID của homework trong ClassSchedule.homework array (homework._id)'
  },
  
  // Student information
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Assignment info (duplicate từ ClassSchedule để dễ query)
  assignmentTitle: {
    type: String,
    required: true
  },
  
  assignmentFiles: [{
    type: String,
    comment: 'File đề bài gốc từ teacher (multiple files supported)'
  }],
  
  deadline: {
    type: Date,
    required: true,
    index: true
  },
  
  // Submission info
  submittedAt: {
    type: Date,
    index: true
  },
  
  submittedFiles: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  status: {
    type: String,
    enum: ['not_submitted', 'submitted', 'late'],
    default: 'not_submitted',
    index: true
  },
  
  // Metadata
  attemptNumber: {
    type: Number,
    default: 1,
    comment: 'Số lần nộp lại (nếu cho phép)'
  },
  
  notes: {
    type: String,
    comment: 'Ghi chú từ học viên khi nộp bài'
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes cho query hiệu quả
homeworkSubmissionSchema.index({ classSchedule: 1, homeworkId: 1 });
homeworkSubmissionSchema.index({ student: 1, status: 1 });
homeworkSubmissionSchema.index({ classSchedule: 1, student: 1 });
homeworkSubmissionSchema.index({ homeworkId: 1 });
homeworkSubmissionSchema.index({ deadline: 1, status: 1 });

// Virtual: Check if late
homeworkSubmissionSchema.virtual('isLate').get(function() {
  if (!this.submittedAt || !this.deadline) return false;
  return this.submittedAt > this.deadline;
});

// Virtual: Days overdue
homeworkSubmissionSchema.virtual('daysOverdue').get(function() {
  if (!this.isLate) return 0;
  const diffTime = this.submittedAt - this.deadline;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save hook: Auto set status based on submission time
homeworkSubmissionSchema.pre('save', function(next) {
  // Nếu vừa submit
  if (this.isModified('submittedAt') && this.submittedAt) {
    if (this.status === 'not_submitted') {
      // Check if late
      if (this.submittedAt > this.deadline) {
        this.status = 'late';
      } else {
        this.status = 'submitted';
      }
    }
  }
  
  next();
});

// Static method: Create submissions for all students in a class
homeworkSubmissionSchema.statics.createForClass = async function(classScheduleId, homeworkId, assignmentData, studentIds) {
  const submissions = studentIds.map(studentId => ({
    classSchedule: classScheduleId,
    homeworkId,
    student: studentId,
    assignmentTitle: assignmentData.title,
    assignmentFiles: assignmentData.files || [],
    deadline: assignmentData.deadline,
    status: 'not_submitted'
  }));
  
  return await this.insertMany(submissions);
};

// Static method: Get submission statistics
homeworkSubmissionSchema.statics.getStatistics = async function(classScheduleId, homeworkId) {
  const stats = await this.aggregate([
    {
      $match: {
        classSchedule: mongoose.Types.ObjectId(classScheduleId),
        homeworkId: mongoose.Types.ObjectId(homeworkId)
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        submitted: {
          $sum: {
            $cond: [
              { $in: ['$status', ['submitted', 'late']] },
              1,
              0
            ]
          }
        },
        late: {
          $sum: {
            $cond: [{ $eq: ['$status', 'late'] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    submitted: 0,
    late: 0
  };
};

// Instance method: Submit homework
homeworkSubmissionSchema.methods.submit = function(files, notes) {
  this.submittedAt = new Date();
  this.submittedFiles = files;
  if (notes) this.notes = notes;
  
  // Status will be auto-set by pre-save hook
  return this.save();
};

module.exports = mongoose.model('HomeworkSubmission', homeworkSubmissionSchema);
