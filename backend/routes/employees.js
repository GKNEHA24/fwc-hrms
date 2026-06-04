const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// GET all employees
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'employee') filter._id = req.user._id;
    const employees = await User.find(filter).populate('managerId', 'name email');
    res.json(employees);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET single employee
router.get('/:id', auth, async (req, res) => {
  try {
    if (req.user.role === 'employee' && req.user._id.toString() !== req.params.id)
      return res.status(403).json({ message: 'Access denied' });
    const emp = await User.findById(req.params.id).populate('managerId', 'name email designation');
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    res.json(emp);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create employee
router.post('/', auth, authorize('admin', 'hr_recruiter'), async (req, res) => {
  try {
    const { name, email, password = 'FWC@12345', role, department, designation, phone, salary, managerId, joiningDate, skills, address } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });
    const count = await User.countDocuments();
    const employeeId = `FWC${String(count + 1).padStart(4, '0')}`;
    const emp = await User.create({ name, email, password, role, department, designation, phone, salary, managerId, joiningDate, skills, address, employeeId });
    res.status(201).json(emp);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update employee
router.put('/:id', auth, authorize('admin', 'hr_recruiter', 'senior_manager'), async (req, res) => {
  try {
    const { password, ...updates } = req.body;
    const emp = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    res.json(emp);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE employee
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Employee deactivated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET departments summary
router.get('/stats/departments', auth, async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 }, avgSalary: { $avg: '$salary' } } },
      { $sort: { count: -1 } }
    ]);
    res.json(stats);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
