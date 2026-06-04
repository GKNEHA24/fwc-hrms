const express = require('express');
const router = express.Router();
const Performance = require('../models/Performance');
const { auth, authorize } = require('../middleware/auth');

// POST create review
router.post('/', auth, authorize('admin', 'senior_manager', 'hr_recruiter'), async (req, res) => {
  try {
    const { employee, period, year, quarter, ratings, goals, strengths, areasOfImprovement, managerComments } = req.body;
    const values = Object.values(ratings);
    const overallRating = parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));
    const review = await Performance.create({
      employee, reviewer: req.user._id, period, year, quarter,
      ratings, goals, strengths, areasOfImprovement, managerComments, overallRating, status: 'submitted'
    });
    res.status(201).json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET my reviews
router.get('/my', auth, async (req, res) => {
  try {
    const reviews = await Performance.find({ employee: req.user._id })
      .populate('reviewer', 'name designation').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET all reviews
router.get('/', auth, authorize('admin', 'senior_manager', 'hr_recruiter'), async (req, res) => {
  try {
    const reviews = await Performance.find()
      .populate('employee', 'name employeeId department designation')
      .populate('reviewer', 'name').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update with self-review
router.put('/:id/self-review', auth, async (req, res) => {
  try {
    const review = await Performance.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.employee.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your review' });
    review.employeeSelfReview = req.body.selfReview;
    review.status = 'reviewed';
    await review.save();
    res.json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET top performers
router.get('/stats/top', auth, authorize('admin', 'senior_manager'), async (req, res) => {
  try {
    const top = await Performance.find({ status: { $in: ['reviewed', 'completed'] } })
      .populate('employee', 'name department designation')
      .sort({ overallRating: -1 }).limit(10);
    res.json(top);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
