const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  period: { type: String, required: true }, // e.g. "Q1 2026"
  year: { type: Number, required: true },
  quarter: { type: Number },
  ratings: {
    technical: { type: Number, min: 1, max: 5, default: 3 },
    communication: { type: Number, min: 1, max: 5, default: 3 },
    teamwork: { type: Number, min: 1, max: 5, default: 3 },
    leadership: { type: Number, min: 1, max: 5, default: 3 },
    punctuality: { type: Number, min: 1, max: 5, default: 3 },
    initiative: { type: Number, min: 1, max: 5, default: 3 },
  },
  overallRating: { type: Number, min: 1, max: 5 },
  goals: [{ title: String, achieved: Boolean, remarks: String }],
  strengths: { type: String, default: '' },
  areasOfImprovement: { type: String, default: '' },
  managerComments: { type: String, default: '' },
  employeeSelfReview: { type: String, default: '' },
  aiInsights: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'submitted', 'reviewed', 'completed'], default: 'draft' },
}, { timestamps: true });

module.exports = mongoose.model('Performance', performanceSchema);
