import path from 'path';
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import mongoose from 'mongoose';
import Employer from '../models/Employer.js';
import User from '../models/User.js';
import logger from '../utils/loggers.js';
import bcrypt from 'bcrypt';

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
    const employers = await Employer.find({ isDeleted: false });
    res.send(employers);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Get Employer by ID
const getEmployerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ error: 'Invalid User ID' });
    }

    const employer = await Employer.findOne({ _id: id, isDeleted: false });

    if (!employer) {
      return res.status(404).send({ error: 'Employer not found' });
    }

    res.status(200).send({ employer });
  } catch (error) {
    logger.error('Get User by ID Error: ' + error.message);
    console.error('Full Error:', error); // For debugging during development
    res.status(500).send({ error: 'Failed to fetch employer details' });
  }
};

const updateEmployer = async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    mobile,
    gender,
    dob,
    companyName,
    companyAddress
  } = req.body;

  try {
    const employer = await Employer.findById(id);
    if (!employer) return res.status(404).send({ message: 'Employer not found' });

    // Prevent email or password update
    if ('email' in req.body || 'password' in req.body) {
      return res.status(400).send({ message: 'Email or Password cannot be updated' });
    }

    // Update allowed fields
    employer.firstName = firstName ?? employer.firstName;
    employer.lastName = lastName ?? employer.lastName;
    employer.mobile = mobile ?? employer.mobile;
    employer.gender = gender ?? employer.gender;
    employer.dob = dob ?? employer.dob;
    employer.companyName = companyName ?? employer.companyName;

    if (companyAddress) {
      employer.companyAddress.city = companyAddress.city ?? employer.companyAddress.city;
      employer.companyAddress.state = companyAddress.state ?? employer.companyAddress.state;
      employer.companyAddress.country = companyAddress.country ?? employer.companyAddress.country;
      employer.companyAddress.pincode = companyAddress.pincode ?? employer.companyAddress.pincode;
    }

    await employer.save();
    logger.info(`Employer updated: ${employer.email}`);
    res.status(200).send({ message: 'Employer updated successfully' });
  } catch (error) {
    logger.error(`Employer update failed: ${error.message}`);
    res.status(500).send({ message: 'Server error' });
  }
};

const deleteEmployer = async (req, res) => {
  try {
    const { id } = req.params;

    const employer = await Employer.findById(id);
    if (!employer) return res.status(404).send({ message: 'Employer not found' });

    if (employer.isDeleted) {
      return res.status(400).send({ message: 'Employer already deleted' });
    }

    employer.isDeleted = true;
    await employer.save();

    logger.info(`Employer soft deleted: ${employer.email}`);
    res.status(200).send({ message: 'Employer deleted successfully' });
  } catch (error) {
    logger.error(`Soft delete failed: ${error.message}`);
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

    // Render email template
    const templatePath = path.join(process.cwd(), 'templates', 'employerApprovalTemplate.ejs');
    const html = await ejs.renderFile(templatePath, {
      firstName: employer.firstName,
      status: action
    });

    // Setup Transporter
    const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: employer.email,
      subject: `Your Employer Account is ${action}`,
      html
    });

    res.send({ message: `Employer ${action.toLowerCase()} successfully` });
  } catch (err) {
    res.status(500).send({ message: 'Error updating employer status', error: err.message });
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
    updateEmployer,
    deleteEmployer,
    approveEmployer,
    usersByCategory
};
