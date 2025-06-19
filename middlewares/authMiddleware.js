import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Employer from '../models/Employer.js';

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'Access Denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id || !decoded?.role) {
      return res.status(403).json({ message: 'Invalid token payload' });
    }

    if (decoded.role === 'user') {
      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      req.user = { id: user._id, role: user.role };
    } else if (decoded.role === 'employer' || decoded.role === 'superadmin') {
      const employer = await Employer.findById(decoded.id);
      if (!employer) return res.status(404).json({ message: 'Employer not found' });
      req.employer = { id: employer._id, role: employer.role };
    } else {
      return res.status(403).json({ message: 'Unauthorized role' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const verifyUserToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send({ message: 'Access Denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'user' && decoded.role !== 'superadmin') {
      return res.status(403).send({ message: 'Only users or superadmins can access this route' });
    }

    const user = await User.findById(decoded.id);
    if (!user && decoded.role !== 'superadmin') {
      return res.status(404).send({ message: 'User not found' });
    }

    if (decoded.role === 'superadmin') {
      req.user = { id: decoded.id, role: decoded.role };
    } else {
      req.user = { id: user._id, role: user.role };
    }

    next();
  } catch (err) {
    return res.status(401).send({ message: 'Invalid or expired token' });
  }
};

const verifyEmployerToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send({ message: 'Access Denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id || !decoded?.role) {
      return res.status(403).json({ message: 'Invalid token payload' });
    }

    if (decoded.role === 'superadmin') {
      req.employer = { id: decoded.id, role: decoded.role };
      return next();
    }

    if (decoded.role !== 'employer') {
      return res.status(403).json({ message: 'Only Employers or Super Admins can create a job' });
    }

    const employer = await Employer.findById(decoded.id);
    if (!employer) return res.status(404).send({ message: 'Employer not found' });

    req.employer = { id: employer._id, role: employer.role };
    next();
  } catch (err) {
    return res.status(401).send({ message: 'Invalid or expired token' });
  }
};

const verifySuperAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || decoded.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    req.user = decoded;
    next();
  });
};

export {
  verifyToken,
  verifyUserToken,
  verifyEmployerToken,
  verifySuperAdmin
};
