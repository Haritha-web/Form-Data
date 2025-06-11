import Vendor from '../models/Vendor.js';
import logger from '../utils/loggers.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

export {
    createVendor,
    getVendors,
    loginVendor
};
