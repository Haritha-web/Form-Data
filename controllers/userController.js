import User from '../models/User.js';
import logger from '../utils/loggers.js';
import ExcelJS from 'exceljs';
import bcrypt from 'bcrypt';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import nodemailer from'nodemailer';

const createUser = async (req, res) => {
  const { firstName, lastName, email, password, mobile, gender, dob, lati, longi, category, experienceRange, keySkills, role, currentDesignation, platform, model, os_version } = req.body;

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).send({ message: 'Email already exists' });

    const mobileExists = await User.findOne({ mobile });
    if (mobileExists) return res.status(400).send({ message: 'Mobile Number already exists' });

    if (!req.files || !req.files['resume'] || req.files['resume'].length === 0) {
      return res.status(400).send({ message: 'Resume is required' });
    }

    // Get actual filenames from files array
    const imageFile = req.files?.['image']?.[0];
    const resumeFile = req.files["resume"][0];

    // Construct URL using filename
    const imageUrl = imageFile? `${process.env.BASE_URL}/uploads/${imageFile.filename}`: '';
    const resumeUrl = `${process.env.BASE_URL}/uploads/${resumeFile.filename}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ 
        firstName, 
        lastName, 
        email,
        password: hashedPassword,
        mobile,
        gender, 
        dob, 
        lati, 
        longi, 
        image: imageUrl,
        resume: resumeUrl,
        category,
        experienceRange,
        keySkills,
        role,
        currentDesignation,
        platform,
        model,
        os_version
    });
    await user.save();
    logger.info(`User Created: ${email}`);
    res.status(201).send({ message: 'User created successfully' });
  } catch (error) {
    logger.error(`User creation failed: ${error.message}`)
    res.status(500).send({ message: 'Server error'});
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format (optional but safe)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).send({ message: 'User not found' });

    res.status(200).send(user);
  } catch (error) {
    logger.error(`Error fetching user by ID: ${error.message}`);
    res.status(500).send({ message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).send({ message: 'User not found with this email' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).send({ message: 'Incorrect password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
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

const sendUserOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 min expiry

    // Update user with OTP and expiry
    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    // Send OTP via email (direct in controller)
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
      subject: 'Password Reset OTP',
      html,
    });

    res.send({ message: 'OTP sent to email successfully' });

  } catch (err) {
    res.status(500).send({ message: 'Error sending OTP', error: err.message });
  }
};

// Reset password using email + OTP + new password
const resetUserPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      otp,
      otpExpire: { $gt: Date.now() }, // valid only if not expired
    });

    if (!user) {
      return res.status(400).send({ message: 'Invalid or expired OTP' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Clear OTP
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.send({ message: 'Password Reset Successfully' });
  } catch (err) {
    res.status(500).send({ message: 'Error resetting password', error: err.message });
  }
};

const downloadExcel = async (req, res) => {
  try {
    const users = await User.find();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Users');

  sheet.columns = [
    { header: 'First Name', key: 'firstName' },
    { header: 'Last Name', key: 'lastName' },
    { header: 'Email', key: 'email' },
    { header: 'Mobile Number', key: 'mobile'},
    { header: 'Gender', key: 'gender' },
    { header: 'DOB', key: 'dob' },
    { header: 'Latitude', key: 'lati' },
    { header: 'Longitude', key: 'longi' },
    { header: 'Image Path', key: 'image' },
    { header: 'Category', key: 'category'},
    { header: 'Experience Range', key: 'experienceRange' },
    { header: 'Key Skills', key: 'keySkills' },
    { header: 'Role', key: 'role' },
    { header: 'Current Designation', key: 'currentDesignation'}
  ];

  users.forEach(user => sheet.addRow(user.toObject()));

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
  await workbook.xlsx.write(res);
  res.end();
} catch(err) {
    logger.error(err);
    res.status(500).send('Failed to download Excel');
}
  }

 const downloadPDF = async (req, res) => {
  const users = await User.find();
  const doc = new PDFDocument();

  const filePath = './uploads/users.pdf';
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).text('User List', { align: 'center' });
  users.forEach(user => {
    doc.moveDown();

    // Example: Bold label, regular value
    doc.font('Helvetica-Bold').fontSize(20).text('Name: ', { continued: true });
    doc.font('Helvetica').text(`${user.firstName} ${user.lastName}`);

    doc.moveDown().fontSize(24).text(`
      Name: ${user.firstName} ${user.lastName}
      Email: ${user.email}
      Mobile Number: ${user.mobile}
      Gender: ${user.gender}
      DOB: ${user.dob.toISOString().split('T')[0]}
      Location: (${user.lati}, ${user.longi})
      Category: ${user.category}
      Experience Range: ${user.experienceRange}
      Key Skills: ${user.keySkills}
      Role: ${user.role}
      Current Designation: ${user.currentDesignation}
    `);
  });

  doc.end();

  doc.pipe(res);
};

const downloadUserPDF = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send({ message: 'User not found' });

    const doc = new PDFDocument();
    const fileName = `${user.firstName}_${user.lastName}_profile.pdf`;

    // Set headers first
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    doc.pipe(res); // Stream directly to browser

    doc.fontSize(20).text('User Profile', { align: 'center' });
    doc.moveDown();

    /* 
      // Insert image
    if (user.image) {
      const imageName = path.basename(user.image); // Get file name from URL
      const imagePath = path.join('uploads', imageName);
      if (fs.existsSync(imagePath)) {
        doc.image(imagePath, {
          fit: [70, 70],
          align: 'center',
          valign: 'center',
        });
        doc.moveDown();
      }
    }
    */

    // Add user data
    doc.fontSize(12).text(`Name: ${user.firstName} ${user.lastName}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Mobile: ${user.mobile}`);
    doc.text(`Gender: ${user.gender}`);
    doc.text(`DOB: ${user.dob.toISOString().split('T')[0]}`);
    doc.text(`Latitude: ${user.lati}`);
    doc.text(`Longitude: ${user.longi}`);
    doc.text(`Experience Range: ${user.experienceRange}`);
    doc.text(`Key Skills: ${user.keySkills.join(', ')}`);
    doc.text(`Role: ${user.role}`);
    doc.text(`Current Designation: ${user.currentDesignation}`);
    
    doc.end();

    logger.info(`PDF downloaded for user: ${user.email}`);
  } catch (error) {
    logger.error(`Error generating PDF: ${error.message}`);
    res.status(500).send({ message: 'Failed to generate PDF' });
  }
};

export {
    createUser,
    getUsers,
    getUserById,
    loginUser,
    sendUserOtp,
    resetUserPasswordWithOtp,
    downloadExcel,
    downloadPDF,
    downloadUserPDF
};
