// scripts/createSuperAdmin.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import SuperAdmin from '../models/SuperAdmin.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const password = await bcrypt.hash('Super@123', 10);

const admin = new SuperAdmin({
  firstName: 'Super',
  lastName: 'Admin',
  email: 'superadmin@example.com',
  password
});

await admin.save();
console.log('Super Admin created');
process.exit();
