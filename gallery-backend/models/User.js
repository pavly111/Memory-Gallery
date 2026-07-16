// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compares a plaintext password against the stored hash — used by the
// login controller. Keeps bcrypt usage in one place instead of scattered
// across auth controllers.
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Never send passwordHash back in any API response, even by accident —
// this strips it whenever a User doc is JSON-serialized (e.g. res.json(user)).
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);