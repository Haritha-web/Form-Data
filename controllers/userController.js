import User from '../models/User.js';
import logger from '../utils/loggers.js';
import ExcelJS from 'exceljs';
import bcrypt from 'bcrypt';
import PDFDocument from 'pdfkit';
import fs from 'fs';

const createUser = async (req, res) => {
  const { firstName, lastName, email, password, mobile, gender, dob, lati, longi, category, experienceRange, keySkills, role, currentDesignation, platform, model, os_version } = req.body;

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).send({ message: 'Email already exists' });

    const mobileExists = await User.findOne({ mobile });
    if (mobileExists) return res.status(400).send({ message: 'Mobile Number already exists' });

    // Get actual filenames from files array
    const imageFile = req.files?.['image']?.[0];
    const resumeFile = req.files?.['resume']?.[0];

    // Construct URL using filename
    const imageUrl = imageFile? `${process.env.BASE_URL}/uploads/${imageFile.filename}`: '';
    const resumeUrl = resumeFile? `${process.env.BASE_URL}/uploads/${resumeFile.filename}`: '';

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
    const users = await User.find({ isDeleted: false });
    res.send(users);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Get User by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ error: 'Invalid User ID' });
    }

    const user = await User.findOne({ _id: id, isDeleted: false });

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    res.status(200).send({ user });
  } catch (error) {
    logger.error('Get User by ID Error: ' + error.message);
    console.error('Full Error:', error); // For debugging during development
    res.status(500).send({ error: 'Failed to fetch user details' });
  }
};

const updateUser = async (req, res) => {
  const userId = req.params.id;
  const {
    firstName,
    lastName,
    mobile,
    gender,
    dob,
    lati,
    longi,
    category,
    experienceRange,
    keySkills,
    role,
    currentDesignation,
    platform,
    model,
    os_version
  } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).send({ message: 'User not found' });

    // Prevent email or password from being updated
    if ('email' in req.body || 'password' in req.body) {
      return res.status(400).send({ message: 'Email or Password cannot be updated' });
    }

    // Handle file uploads (if any)
    const imageFile = req.files?.['image']?.[0];
    const resumeFile = req.files?.['resume']?.[0];

    const imageUrl = imageFile ? `${process.env.BASE_URL}/uploads/${imageFile.filename}` : user.image;
    const resumeUrl = resumeFile ? `${process.env.BASE_URL}/uploads/${resumeFile.filename}` : user.resume;

    // Update allowed fields
    user.firstName = firstName ?? user.firstName;
    user.lastName = lastName ?? user.lastName;
    user.mobile = mobile ?? user.mobile;
    user.gender = gender ?? user.gender;
    user.dob = dob ?? user.dob;
    user.lati = lati ?? user.lati;
    user.longi = longi ?? user.longi;
    user.category = category ?? user.category;
    user.experienceRange = experienceRange ?? user.experienceRange;
    user.keySkills = keySkills ?? user.keySkills;
    user.role = role ?? user.role;
    user.currentDesignation = currentDesignation ?? user.currentDesignation;
    user.platform = platform ?? user.platform;
    user.model = model ?? user.model;
    user.os_version = os_version ?? user.os_version;
    user.image = imageUrl;
    user.resume = resumeUrl;

    await user.save();
    logger.info(`User updated: ${user.email}`);
    res.status(200).send({ message: 'User updated successfully' });
  } catch (err) {
    logger.error(`User update failed: ${err.message}`);
    res.status(500).send({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).send({ message: 'User not found' });

    if (user.isDeleted) {
      return res.status(400).send({ message: 'User already deleted' });
    }

    user.isDeleted = true;
    await user.save();

    logger.info(`User soft deleted: ${user.email}`);
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error(`Soft delete failed: ${error.message}`);
    res.status(500).send({ message: 'Server error' });
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
    updateUser,
    deleteUser,
    downloadExcel,
    downloadPDF,
    downloadUserPDF
};
