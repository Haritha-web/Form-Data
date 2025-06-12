import express from 'express';
import User from '../models/User.js';
import { createVendor, getVendors, loginVendor, sendVendorOtp, resetVendorPasswordWithOtp } from '../controllers/vendorController.js';
import vendorLoginValidations from '../validations/vendorLoginValidations.js';
import { vendorValidationRules } from '../validations/vendorSignupValidations.js';
import verifyVendorToken from '../middlewares/authMiddleware.js';

const router = express.Router();

// Create Vendor
router.post('/create', vendorValidationRules, createVendor);

// Fetch All Vendors
router.get('/', getVendors);

// Vendor Login
router.post('/login', vendorLoginValidations, loginVendor);

router.post('/forgot-password', sendVendorOtp);
router.post('/reset-password', resetVendorPasswordWithOtp)

// GET users by category (accessible only by logged-in vendor)
router.get('/users/:category', verifyVendorToken, async (req, res) => {
  const { category } = req.params;

  const allowed = ['designer', 'developer', 'printer', 'other'];
  if (!allowed.includes(category)) {
    return res.status(400).json({ message: 'Invalid category' });
  }

  try {
    const users = await User.find({ category });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

export default router;
