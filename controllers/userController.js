import User from '../models/User.js';
import logger from '../utils/loggers.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const createUser = async (req, res) => {
  const { firstName, lastName, email, mobile, gender, dob, lati, longi, experienceRange, keySkills, role, currentDesignation, platform, model, os_version } = req.body;

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).send({ message: 'Email already exists' });

    const mobileExists = await User.findOne({ mobile });
    if (mobileExists) return res.status(400).send({ message: 'Mobile Number already exists' });

    if (!req.file) return res.status(400).json({ message: 'Image is required' });

    // Create full URL path
    const imageUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;

    const user = new User({ 
        firstName, 
        lastName, 
        email,
        mobile,
        gender, 
        dob, 
        lati, 
        longi, 
        image: imageUrl,
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
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    logger.error(`User creation failed: ${error.message}`)
    res.status(500).json({ message: 'Server error'});
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    if (!user) return res.status(404).json({ message: 'User not found' });

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
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
};

export {
    createUser,
    getUsers,
    downloadExcel,
    downloadPDF,
    downloadUserPDF
};
