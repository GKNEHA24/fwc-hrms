const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { auth, authorize } = require('../middleware/auth');

// POST check-in
router.post('/checkin', auth, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    let record = await Attendance.findOne({ employee: req.user._id, date: today });
    if (record && record.checkIn) return res.status(400).json({ message: 'Already checked in today' });
    if (!record) record = new Attendance({ employee: req.user._id, date: today });
    record.checkIn = new Date();
    record.status = 'present';
    await record.save();
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST check-out
router.post('/checkout', auth, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const record = await Attendance.findOne({ employee: req.user._id, date: today });
    if (!record || !record.checkIn) return res.status(400).json({ message: 'No check-in found for today' });
    if (record.checkOut) return res.status(400).json({ message: 'Already checked out' });
    record.checkOut = new Date();
    const ms = record.checkOut - record.checkIn;
    record.workHours = parseFloat((ms / 3600000).toFixed(2));
    if (record.workHours < 4) record.status = 'half_day';
    await record.save();
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET my attendance
router.get('/my', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { employee: req.user._id };
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }
    const records = await Attendance.find(filter).sort({ date: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET all attendance (admin/hr)
router.get('/', auth, authorize('admin', 'hr_recruiter', 'senior_manager'), async (req, res) => {
  try {
    const { date, employeeId } = req.query;
    const filter = {};
    if (date) { const d = new Date(date); d.setHours(0,0,0,0); filter.date = d; }
    if (employeeId) filter.employee = employeeId;
    const records = await Attendance.find(filter).populate('employee', 'name employeeId department').sort({ date: -1 }).limit(200);
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST manual attendance (admin)
router.post('/manual', auth, authorize('admin', 'hr_recruiter'), async (req, res) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, workHours } = req.body;
    const d = new Date(date); d.setHours(0,0,0,0);
    const record = await Attendance.findOneAndUpdate(
      { employee: employeeId, date: d },
      { status, checkIn, checkOut, workHours },
      { upsert: true, new: true }
    );
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET today's summary
router.get('/today/summary', auth, authorize('admin', 'hr_recruiter', 'senior_manager'), async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const summary = await Attendance.aggregate([
      { $match: { date: today } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json(summary);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
