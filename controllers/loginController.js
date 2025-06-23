import User from '../models/User.js';
import Employer from '../models/Employer.js';
import SuperAdmin from '../models/SuperAdmin.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger from '../utils/loggers.js';
import nodemailer from 'nodemailer';

const loginApi = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if it's a SuperAdmin
    let person = await SuperAdmin.findOne({ email });
    if (person) {
      const match = await bcrypt.compare(password, person.password);
      if (!match) return res.status(401).json({ message: 'Invalid password' });

      const token = jwt.sign({ id: person._id, role: 'superadmin' }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      return res.status(200).json({ message: 'Login successful', token, role: 'superadmin' });
    }

    // 2. Check if it's an Employer
    person = await Employer.findOne({ email });
    if (person) {
      if (person.isApproved !== 'Approved')
        return res.status(403).json({ message: `Your account is ${person.isApproved}` });

      const match = await bcrypt.compare(password, person.password);
      if (!match) return res.status(401).json({ message: 'Invalid password' });

      const token = jwt.sign({ id: person._id, role: 'employer' }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      return res.status(200).json({ message: 'Login successful', token, role: 'employer' });
    }

    // 3. Check if it's a User
    person = await User.findOne({ email });
    if (person) {
      const match = await bcrypt.compare(password, person.password);
      if (!match) return res.status(401).json({ message: 'Invalid password' });

      const token = jwt.sign({ id: person._id, role: 'user' }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      return res.status(200).json({ message: 'Login successful', token, role: 'user' });
    }

    // If email not found in any model
    res.status(404).json({ message: 'Account not found with this email' });

  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Try User first
    let account = await User.findOne({ email });
    let accountType = 'User';

    if (!account) {
      // Try Employer
      account = await Employer.findOne({ email });
      accountType = 'Employer';
    }

    if (!account) return res.status(404).send({ message: 'Account not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 min

    account.otp = otp;
    account.otpExpire = otpExpire;
    await account.save();

    // Send OTP Email
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
      subject: `${accountType} Password Reset OTP`,
      html,
    });

    res.send({ message: `OTP sent to ${accountType} email successfully` });
  } catch (err) {
    res.status(500).send({ message: 'Error sending OTP', error: err.message });
  }
};

const resetPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Try User
    let account = await User.findOne({ email, otp, otpExpire: { $gt: Date.now() } });
    let accountType = 'User';

    if (!account) {
      // Try Employer
      account = await Employer.findOne({ email, otp, otpExpire: { $gt: Date.now() } });
      accountType = 'Employer';
    }

    if (!account) {
      return res.status(400).send({ message: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    account.password = hashedPassword;
    account.otp = undefined;
    account.otpExpire = undefined;
    await account.save();

    res.send({ message: `${accountType} password reset successfully` });
  } catch (err) {
    res.status(500).send({ message: 'Error resetting password', error: err.message });
  }
};

export {
    loginApi,
    sendOtp,
    resetPasswordWithOtp
} ;
