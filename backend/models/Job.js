const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  candidateName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  resumeUrl: { type: String },
  resumeText: { type: String },
  coverLetter: { type: String },
  aiScore: { type: Number, default: 0 },
  aiAnalysis: { type: String, default: '' },
  status: {
    type: String,
    enum: ['applied', 'screening', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'rejected'],
    default: 'applied'
  },
  interviewDate: { type: Date },
  notes: { type: String },
}, { timestamps: true });

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [String],
  skills: [String],
  experience: { type: String },
  salary: { type: String },
  location: { type: String, default: 'Bangalore' },
  type: { type: String, enum: ['full_time', 'part_time', 'contract', 'internship'], default: 'full_time' },
  status: { type: String, enum: ['open', 'closed', 'on_hold'], default: 'open' },
  openings: { type: Number, default: 1 },
  applications: [applicationSchema],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deadline: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
