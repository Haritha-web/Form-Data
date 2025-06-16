import Employer from '../models/Employer.js';
import User from '../models/User.js';
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

const getEmployerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format (optional safety check)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({ message: 'Invalid Employer ID format' });
    }

    const employer = await Employer.findById(id);
    if (!employer) return res.status(404).send({ message: 'Employer not found' });

    res.status(200).send(employer);
  } catch (error) {
    logger.error(`Error fetching employer by ID: ${error.message}`);
    res.status(500).send({ message: 'Server error' });
  }
};

const loginEmployer = async (req, res) => {
  const { email, password } = req.body;

  try {
    const employer = await Employer.findOne({ email });
    if (!employer)
      return res.status(404).send({ message: 'Employer not found with this email' });

    if (!employer.isApproved !== 'Approved')
      return res.status(403).send({ message: `Your account is ${employer.isApproved}` });

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
    const { action } = req.body;

    if (!['Approved', 'Rejected'].includes(action)) {
      return res.status(400).send({ message: 'Invalid action. Must be "Approved" or "Rejected"' });
    }

    const employer = await Employer.findById(id);
    if (!employer) return res.status(404).send({ message: 'Employer not found' });

    employer.isApproved = action;
    await employer.save();

    res.send({ message: `Employer ${action.toLowerCase() } successfully` });
  } catch (err) {
    res.status(500).send({ message: 'Error updating employer status', error: err.message });
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

const usersByCategory = async (req, res) => {
  try{
      const { category } = req.params;

  const allowed = [ 'Nurse', 'Plumber', 'Electrician', 'Office boy', 'House Keeping', 'HVAC Mevhanic' ];
  if (!allowed.includes(category)) {
    return res.status(400).send({ message: 'Invalid category' });
  }

  try {
    const users = await User.find({ category });
    res.json(users);
  } catch (error) {
    res.status(500).send({ message: 'Failed to fetch users' });
  }
  } catch(error){
  res.status(500).send({message: 'Error in getting Ctegories'})
}
} 

export {
    createEmployer,
    getEmployers,
    getEmployerById,
    loginEmployer,
    approveEmployer,
    sendEmployerOtp,
    resetEmployerPasswordWithOtp,
    usersByCategory
};
