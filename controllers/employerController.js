import Employer from '../models/Employer.js';
import logger from '../utils/loggers.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const createEmployer = async (req, res) => {
  const { firstName, lastName, email,password, mobile, gender, dob, companyName, companyAddress } = req.body;

  try {
    const emailExists = await Employer.findOne({ email });
    if (emailExists) return res.status(400).send({ message: 'Email already exists' });

    const mobileExists = await Employer.findOne({ mobile });
    if (mobileExists) return res.status(400).send({ message: 'Mobile Number already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const employer = new Employer({ 
        firstName, 
        lastName, 
        email,
        password: hashedPassword,
        mobile,
        gender, 
        dob, 
        companyName,
        companyAddress: {
          city: companyAddress.city,
          state: companyAddress.state,
          country: companyAddress.country,
          pincode: companyAddress.pincode
        }
    });
    await employer.save();
    logger.info(`Employer Created: ${email}`);
    res.status(201).send({ message: 'Employer created successfully' });
  } catch (error) {
    logger.error(`Employer creation failed: ${error.message}`)
    res.status(500).send({ message: 'Server error'});
  }
};

const getEmployers = async (req, res) => {
  try {
    const Employers = await Employer.find();
    res.send(Employers);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const loginEmployer = async (req, res) => {
  const { email, password } = req.body;

  try {
    const employer = await Employer.findOne({ email });
    if (!employer)
      return res.status(404).send({ message: 'Employer not found with this email' });

    if (!employer.isApproved)
      return res.status(403).send({ message: 'Your account is not approved yet by admin' });

    const isMatch = await bcrypt.compare(password, employer.password);
    if (!isMatch)
      return res.status(400).send({ message: 'Incorrect password' });

    const token = jwt.sign({ id: employer._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).send({
      message: 'Login successful',
      token,
    });
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    res.status(500).send({ message: 'Server error' });
  }
};

const approveEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    const employer = await Employer.findById(id);
    if (!employer) return res.status(404).send({ message: 'Employer not found' });

    employer.isApproved = true;
    await employer.save();

    res.send({ message: 'Employer approved successfully' });
  } catch (err) {
    res.status(500).send({ message: 'Error approving employer', error: err.message });
  }
};

// Send OTP to Employer email
const sendEmployerOtp = async (req, res) => {
  try {
    const { email } = req.body;
    
    const Employer = await Employer.findOne({ email });
    if (!Employer) return res.status(404).send({ message: 'Employer not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save OTP to Employer record
    Employer.otp = otp;
    Employer.otpExpire = otpExpire;
    await Employer.save();

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
      subject: 'Employer Password Reset OTP',
      html,
    });

    res.send({ message: 'OTP sent to Employer email successfully' });

  } catch (err) {
    res.status(500).send({ message: 'Error sending OTP', error: err.message });
  }
};

// Reset Employer password using OTP
const resetEmployerPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const Employer = await Employer.findOne({
      email,
      otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!Employer) {
      return res.status(400).send({ message: 'Invalid or expired OTP' });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    Employer.password = hashedPassword;

    // Clear OTP
    Employer.otp = undefined;
    Employer.otpExpire = undefined;

    await Employer.save();

    res.send({ message: 'Employer Password Reset successfully' });

  } catch (err) {
    res.status(500).send({ message: 'Error resetting password', error: err.message });
  }
};

export {
    createEmployer,
    getEmployers,
    loginEmployer,
    approveEmployer,
    sendEmployerOtp,
    resetEmployerPasswordWithOtp
};
