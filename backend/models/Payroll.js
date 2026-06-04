const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  basicSalary: { type: Number, required: true },
  hra: { type: Number, default: 0 },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  pf: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  workingDays: { type: Number, default: 26 },
  presentDays: { type: Number, default: 0 },
  leaveDays: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'processed', 'paid'], default: 'pending' },
  paidOn: { type: Date },
  remarks: { type: String, default: '' },
}, { timestamps: true });

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
