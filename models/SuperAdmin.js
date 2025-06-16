// models/SuperAdmin.js
import mongoose from 'mongoose';

const superAdminSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: String,
  role: {
    type: String,
    default: 'superadmin'
  }
}, { timestamps: true });

export default mongoose.model('SuperAdmin', superAdminSchema);
