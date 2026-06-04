const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Performance = require('../models/Performance');
const Job = require('../models/Job');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    if (req.user.role === 'admin' || req.user.role === 'senior_manager') {
      const [totalEmployees, activeToday, pendingLeaves, openJobs, payrollThisMonth, topPerformers, deptStats] = await Promise.all([
        User.countDocuments({ isActive: true, role: { $ne: 'admin' } }),
        Attendance.countDocuments({ date: today, status: { $in: ['present', 'late'] } }),
        Leave.countDocuments({ status: 'pending' }),
        Job.countDocuments({ status: 'open' }),
        Payroll.aggregate([{ $match: { month, year } }, { $group: { _id: null, total: { $sum: '$netSalary' } } }]),
        Performance.find({ status: { $in: ['reviewed', 'completed'] } })
          .populate('employee', 'name department designation').sort({ overallRating: -1 }).limit(5),
        User.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$department', count: { $sum: 1 } } }
        ])
      ]);
      res.json({
        role: req.user.role,
        stats: {
          totalEmployees,
          activeToday,
          pendingLeaves,
          openJobs,
          monthlyPayroll: payrollThisMonth[0]?.total || 0,
        },
        topPerformers,
        deptStats
      });

    } else if (req.user.role === 'hr_recruiter') {
      const [totalEmployees, pendingLeaves, openJobs, recentApplications] = await Promise.all([
        User.countDocuments({ isActive: true }),
        Leave.countDocuments({ status: 'pending' }),
        Job.countDocuments({ status: 'open' }),
        Job.find({ status: 'open' }).select('title applications').limit(5)
      ]);
      res.json({
        role: req.user.role,
        stats: { totalEmployees, pendingLeaves, openJobs },
        recentApplications: recentApplications.map(j => ({ title: j.title, count: j.applications.length }))
      });

    } else {
      // Employee
      const [myAttendance, myLeaves, myPayroll, myReviews] = await Promise.all([
        Attendance.find({ employee: req.user._id, date: { $gte: new Date(year, month - 1, 1), $lte: new Date(year, month, 0) } }),
        Leave.find({ employee: req.user._id }).sort({ createdAt: -1 }).limit(5),
        Payroll.findOne({ employee: req.user._id, month, year }),
        Performance.find({ employee: req.user._id }).sort({ createdAt: -1 }).limit(3)
      ]);
      const present = myAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
      const totalHours = myAttendance.reduce((sum, a) => sum + (a.workHours || 0), 0);
      res.json({
        role: req.user.role,
        stats: {
          presentDays: present,
          totalWorkHours: parseFloat(totalHours.toFixed(1)),
          netSalary: myPayroll?.netSalary || 0,
          avgRating: myReviews[0]?.overallRating || null
        },
        myLeaves,
        myReviews
      });
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
