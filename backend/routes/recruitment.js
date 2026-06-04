const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Job = require('../models/Job');
const { auth, authorize } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' }).select('-applications').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create job
router.post('/', auth, authorize('admin', 'hr_recruiter'), async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update job
router.put('/:id', auth, authorize('admin', 'hr_recruiter'), async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE job
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST apply to job (with resume)
router.post('/:id/apply', upload.single('resume'), async (req, res) => {
  try {
    const { candidateName, email, phone, coverLetter } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const resumeUrl = req.file ? `/uploads/${req.file.filename}` : '';
    job.applications.push({ candidateName, email, phone, coverLetter, resumeUrl });
    await job.save();
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET applications for a job
router.get('/:id/applications', auth, authorize('admin', 'hr_recruiter'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ job: { title: job.title, department: job.department }, applications: job.applications });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update application status
router.put('/:jobId/applications/:appId', auth, authorize('admin', 'hr_recruiter'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    const app = job.applications.id(req.params.appId);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    Object.assign(app, req.body);
    await job.save();
    res.json(app);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
