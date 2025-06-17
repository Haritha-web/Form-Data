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
    approveEmployer,
    usersByCategory
};
