// routes/superAdminRoutes.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import SuperAdmin from '../models/SuperAdmin.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await SuperAdmin.findOne({ email });
  if (!admin) return res.status(400).json({ message: 'Admin not found' });

  const match = await bcrypt.compare(password, admin.password);
  if (!match) return res.status(401).json({ message: 'Invalid password' });

  const token = jwt.sign(
    { id: admin._id, role: 'superadmin' },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  res.json({ token, role: admin.role });
});

export default router;
