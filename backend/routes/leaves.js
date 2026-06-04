const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const { auth, authorize } = require('../middleware/auth');

// POST apply leave
router.post('/', auth, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const start = new Date(startDate), end = new Date(endDate);
    const days = Math.ceil((end - start) / 86400000) + 1;
    const leave = await Leave.create({ employee: req.user._id, leaveType, startDate: start, endDate: end, days, reason });
    res.status(201).json(leave);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET my leaves
router.get('/my', auth, async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET all leaves
router.get('/', auth, authorize('admin', 'hr_recruiter', 'senior_manager'), async (req, res) => {
  try {
    const leaves = await Leave.find().populate('employee', 'name employeeId department').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT approve/reject
router.put('/:id/action', auth, authorize('admin', 'hr_recruiter', 'senior_manager'), async (req, res) => {
  try {
    const { action, reason } = req.body;
    const update = { status: action, approvedBy: req.user._id, approvedOn: new Date() };
    if (action === 'rejected') update.rejectionReason = reason;
    const leave = await Leave.findByIdAndUpdate(req.params.id, update, { new: true }).populate('employee', 'name');
    res.json(leave);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
