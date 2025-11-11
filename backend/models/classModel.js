const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  students: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Class", classSchema);
