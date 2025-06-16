// models/JobApplication.js
import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'Applied',
    enum: ['Applied', 'Under Review', 'Selected', 'Rejected']
  }
});

export default mongoose.model('JobApplication', jobApplicationSchema);
