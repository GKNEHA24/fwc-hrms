const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fwc_secret_2026', { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, designation, phone, salary } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const count = await User.countDocuments();
    const employeeId = `FWC${String(count + 1).padStart(4, '0')}`;

    const user = await User.create({ name, email, password, role, department, designation, phone, salary, employeeId });
    res.status(201).json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address, skills } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, skills },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/seed - seed demo users
router.post('/seed', async (req, res) => {
  try {
    await User.deleteMany({});
    const users = [
      { name: 'Admin User', email: 'admin@fwc.co.in', password: 'Admin@123', role: 'admin', department: 'Management', designation: 'System Admin', salary: 150000, employeeId: 'FWC0001' },
      { name: 'Priya Sharma', email: 'manager@fwc.co.in', password: 'Manager@123', role: 'senior_manager', department: 'Engineering', designation: 'Senior Manager', salary: 120000, employeeId: 'FWC0002' },
      { name: 'Ravi Kumar', email: 'hr@fwc.co.in', password: 'Hr@123456', role: 'hr_recruiter', department: 'HR', designation: 'HR Recruiter', salary: 80000, employeeId: 'FWC0003' },
      { name: 'Ananya Singh', email: 'employee@fwc.co.in', password: 'Emp@12345', role: 'employee', department: 'Engineering', designation: 'Software Engineer', salary: 60000, employeeId: 'FWC0004' },
      { name: 'Kiran Reddy', email: 'kiran@fwc.co.in', password: 'Emp@12345', role: 'employee', department: 'Design', designation: 'UI Designer', salary: 55000, employeeId: 'FWC0005' },
      { name: 'Meera Nair', email: 'meera@fwc.co.in', password: 'Emp@12345', role: 'employee', department: 'Marketing', designation: 'Marketing Executive', salary: 50000, employeeId: 'FWC0006' },
    ];

    // Hash passwords manually since we're using insertMany
    const bcrypt = require('bcryptjs');
    const hashed = await Promise.all(users.map(async u => ({
      ...u,
      password: await bcrypt.hash(u.password, 12)
    })));
    await User.insertMany(hashed);
    res.json({ message: 'Demo users seeded', credentials: users.map(u => ({ email: u.email, password: u.password, role: u.role })) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
