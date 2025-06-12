import express from 'express';
import mongoose from 'mongoose';
import dotEnv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import logger from './utils/loggers.js';
import path from 'path';

dotEnv.config()
const app = express();

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

// User Routes
app.use('/user', userRoutes);

// Vendor Routes
app.use('/vendor', vendorRoutes);

//Server Uploads images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const PORT = process.env.PORT || 6000;
app.listen(PORT,()=>{
    logger.info(`Server started and running at ${PORT}`);
});
