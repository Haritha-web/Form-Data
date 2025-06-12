import Vendor from '../models/Vendor.js';
import logger from '../utils/loggers.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const createVendor = async (req, res) => {
  const { firstName, lastName, email,password, mobile, gender, dob } = req.body;

  try {
    const emailExists = await Vendor.findOne({ email });
    if (emailExists) return res.status(400).send({ message: 'Email already exists' });

    const mobileExists = await Vendor.findOne({ mobile });
    if (mobileExists) return res.status(400).send({ message: 'Mobile Number already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const vendor = new Vendor({ 
        firstName, 
        lastName, 
        email,
        password: hashedPassword,
        mobile,
        gender, 
        dob, 
    });
    await vendor.save();
    logger.info(`Vendor Created: ${email}`);
    res.status(201).json({ message: 'Vendor created successfully' });
  } catch (error) {
    logger.error(`Vendor creation failed: ${error.message}`)
    res.status(500).json({ message: 'Server error'});
  }
};

const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginVendor = async (req, res) => {
  const { email, password } = req.body;

  try {
    const vendor = await Vendor.findOne({ email });
    if (!vendor)
      return res.status(404).json({ message: 'Vendor not found with this email' });

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Incorrect password' });

    const token = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send OTP to vendor email
const sendVendorOtp = async (req, res) => {
  try {
    const { email } = req.body;
    
    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save OTP to vendor record
    vendor.otp = otp;
    vendor.otpExpire = otpExpire;
    await vendor.save();

    // Email setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const html = `<p>Your OTP for password reset is <b>${otp}</b>. It is valid for 10 minutes.</p>`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Vendor Password Reset OTP',
      html,
    });

    res.json({ message: 'OTP sent to vendor email successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Error sending OTP', error: err.message });
  }
};

// Reset vendor password using OTP
const resetVendorPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const vendor = await Vendor.findOne({
      email,
      otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!vendor) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    vendor.password = hashedPassword;

    // Clear OTP
    vendor.otp = undefined;
    vendor.otpExpire = undefined;

    await vendor.save();

    res.json({ message: 'Vendor password reset successful' });

  } catch (err) {
    res.status(500).json({ message: 'Error resetting password', error: err.message });
  }
};

export {
    createVendor,
    getVendors,
    loginVendor,
    sendVendorOtp,
    resetVendorPasswordWithOtp
};
