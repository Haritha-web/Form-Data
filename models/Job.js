import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    jobTitle: { 
        type: String, 
        required: true 
    },
    companyName: { 
        type: String, 
        required: true 
    },
    location: { 
        type: String, 
        required: true 
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
      required: true,
    },
    jobDescription: { 
        type: String, 
        required: true 
    },
    skills: { 
        type: [String], 
        required: true 
    },
    experienceRequired: { 
        type: String, 
        required: true 
    },
    education: { 
        type: String, 
        required: true 
    },
    salaryRange: { 
        type: String 
    }, // optional
    applicationDeadline: { 
        type: Date 
    }, // optional
    numberOfOpenings: { 
        type: Number, 
        required: true 
    },
    applyMode: {
      type: String,
      enum: ['Portal', 'Email', 'ExternalLink'],
      required: true,
    },
    workMode: {
      type: String,
      enum: ['On-site', 'Remote', 'Hybrid'],
      required: true,
    },
    benefits: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Job = mongoose.model('Job', jobSchema);
export default Job;
