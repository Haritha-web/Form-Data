import express from 'express';
import mongoose from 'mongoose';
import dotEnv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import cors from 'cors';
import employerRoutes from './routes/employerRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
//import superAdminRoutes from './routes/superAdminRoutes.js';
import loginRoutes from './routes/loginRoutes.js';
import { verifySuperAdmin } from './middlewares/authMiddleware.js';
import logger from './utils/loggers.js';
import path from 'path';

dotEnv.config()
const app = express();

// ✅ Enable CORS
app.use(cors({
    origin: '*', // Or specify allowed domains: ['https://yourdomain.com']
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());  // For JSON body
app.use(express.urlencoded({extended: true}));  // For form-urlencoded or form-data

// DB Connection
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    logger.info("MongoDB Connected and running Successfully")
})
.catch((err)=>{
    logger.error(err)
});

// Public Login Route 
app.use('/api', loginRoutes);

// Super Admin Protected Routes (full access)
app.use('/admin/user', verifySuperAdmin, userRoutes);
app.use('/admin/employer', verifySuperAdmin, employerRoutes);
app.use('/admin/job', verifySuperAdmin, jobRoutes);

// User Routes
app.use('/user', userRoutes);

// Employer Routes
app.use('/employer', employerRoutes);

// Job Routes
app.use('/job', jobRoutes);

//Server Uploads images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const PORT = process.env.PORT || 6000;
app.listen(PORT,()=>{
    logger.info(`Server started and running at ${PORT}`);
});
