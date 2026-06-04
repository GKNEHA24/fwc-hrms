const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'senior_manager', 'hr_recruiter', 'employee'],
    default: 'employee'
  },
  employeeId: { type: String, unique: true, sparse: true },
  department: { type: String, default: '' },
  designation: { type: String, default: '' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  joiningDate: { type: Date, default: Date.now },
  salary: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skills: [String],
  address: { type: String, default: '' },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
