import jwt from 'jsonwebtoken';
import Vendor from '../models/Vendor.js';

const verifyVendorToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Unauthorized: Token missing' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const vendor = await Vendor.findById(decoded.id);
    if (!vendor) return res.status(401).json({ message: 'Invalid vendor token' });

    req.vendor = vendor; // attach vendor info to request
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default verifyVendorToken;
