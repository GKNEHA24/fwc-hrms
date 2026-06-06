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
    const employees = await User.find({ isActive: true, role: { $in: ['employee', 'hr_recruiter', 'senior_manager', 'admin'] } });
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

// POST repair payroll - delete orphaned records (no valid employee) then regenerate
router.post('/repair', auth, authorize('admin'), async (req, res) => {
  try {
    const { month, year } = req.body;
    const filter = {};
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);

    // Find all payroll records for the period
    const allRecords = await Payroll.find(filter).populate('employee', 'name');

    // Delete records where employee didn't populate (broken reference)
    const orphanIds = allRecords.filter(r => !r.employee).map(r => r._id);
    if (orphanIds.length > 0) {
      await Payroll.deleteMany({ _id: { $in: orphanIds } });
    }

    // Now regenerate for all active users
    const employees = await User.find({ isActive: true });
    const results = [];

    for (const emp of employees) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      const attendance = await Attendance.find({ employee: emp._id, date: { $gte: start, $lte: end } });

      const workingDays = 26;
      const presentDays = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
      const halfDays = attendance.filter(a => a.status === 'half_day').length;
      const leaveDays = attendance.filter(a => a.status === 'on_leave').length;

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
          employee: emp._id,
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

    res.json({ message: `Repaired: removed ${orphanIds.length} broken records. Regenerated for ${results.length} employees.`, results });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
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

    let records = await Payroll.find(filter)
      .populate('employee', 'name employeeId department designation')
      .sort({ year: -1, month: -1 });

    // Heal broken records: if employee is null after populate,
    // the reference is a stale ObjectId — find and re-link the user
    const brokenRecords = records.filter(r => !r.employee);
    if (brokenRecords.length > 0) {
      const allUsers = await User.find({}, 'name employeeId department designation');
      const userMap = {};
      allUsers.forEach(u => { userMap[u._id.toString()] = u; });

      for (const record of brokenRecords) {
        // Try to re-link using the raw ObjectId stored in the record
        const rawId = record.toObject().employee;
        if (rawId) {
          const user = userMap[rawId.toString()];
          if (user) {
            // Update the record in DB and fix in-memory
            await Payroll.findByIdAndUpdate(record._id, { employee: user._id });
            record.employee = user;
          }
        }
      }
    }

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
