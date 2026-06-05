const express = require('express');
const router = express.Router();
const Payroll = require('../models/Payroll');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// POST generate payroll for a month
router.post('/generate', auth, authorize('admin', 'hr_recruiter'), async (req, res) => {
  try {
    const { month, year } = req.body;
    const employees = await User.find({ isActive: true, role: { $in: ['employee', 'hr_recruiter', 'senior_manager'] } });
    const results = [];

    for (const emp of employees) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      const attendance = await Attendance.find({ employee: emp._id, date: { $gte: start, $lte: end } });

      const workingDays = 26;
      const presentDays = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
      const halfDays = attendance.filter(a => a.status === 'half_day').length;
      const leaveDays = attendance.filter(a => a.status === 'on_leave').length;

      // If no attendance records, assume full month worked (for demo)
      const effectiveDays = attendance.length === 0
        ? workingDays
        : Math.min(workingDays, presentDays + leaveDays + (halfDays * 0.5));

      const basic = emp.salary || 50000;
      const hra = Math.round(basic * 0.4);
      const allowances = Math.round(basic * 0.2);
      const pf = Math.round(basic * 0.12);
      const tax = basic > 83333 ? Math.round((basic - 83333) * 0.3) : 0;
      const deductions = pf + tax;

      const grossSalary = (basic + hra + allowances) * (effectiveDays / workingDays);
      const netSalary = Math.max(0, Math.round(grossSalary - deductions));

      const payroll = await Payroll.findOneAndUpdate(
        { employee: emp._id, month: parseInt(month), year: parseInt(year) },
        {
          basicSalary: basic, hra, allowances, pf, tax, deductions,
          netSalary, workingDays,
          presentDays: attendance.length === 0 ? workingDays : presentDays,
          leaveDays,
          status: 'processed'
        },
        { upsert: true, new: true }
      );
      results.push(payroll);
    }
    res.json({ message: `Payroll generated for ${results.length} employees`, results });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET my payroll
router.get('/my', auth, async (req, res) => {
  try {
    const records = await Payroll.find({ employee: req.user._id }).sort({ year: -1, month: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET all payroll
router.get('/', auth, authorize('admin', 'hr_recruiter'), async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    const records = await Payroll.find(filter)
      .populate('employee', 'name employeeId department designation')
      .sort({ year: -1, month: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT mark as paid
router.put('/:id/pay', auth, authorize('admin'), async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paidOn: new Date() },
      { new: true }
    );
    res.json(payroll);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
