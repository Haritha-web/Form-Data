import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true 
},
  lastName:  { 
    type: String, 
    required: true 
},
  email: { 
    type: String, 
    required: true, 
    unique: true 
},
  password: {
  type: String,
  required: true
},
  mobile: {
    type: Number,
    required: true,
    unique: true
},
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other'], 
    required: true 
},
  dob: { 
    type: Date, 
},
  lati: { 
    type: Number, 
},
  longi: { 
    type: Number, 
},
  image: {
    type: String,
},
  resume: {
    type: String,
},
location: {
    type: String,
  },
  languagesKnown: [{
    type: String
  }],
  expectedSalary: {
    type: Number,
  },
  currentSalary: {
    type: Number,
  },
  education: [
    {
      courseName: String,
      specialization: String,
      collegeName: String,
      startYear: Number,
      endYear: Number
    }
  ],
category: {
  type: String,
  required: true,
  enum: [ 'Nurse', 'Plumber', 'Electrician', 'Office boy', 'House Keeping', 'HVAC Mevhanic' ] // example categories
},
experienceRange: {
    type: String,
    enum: ['0-1', '1-2', '2-3', '3-4', '4-5', '5+'],
},
keySkills: [{
    type: String,
}],
role: {
    type: String,
},
currentDesignation: {
    type: String,
},
platform: {
    type: String           // e.g., "Android", "iOS", "Web"
},
model: {
    type: String          // e.g., "Redmi Note 12"
},
os_version: {
    type: String         // e.g., "Android 13"      
},
otp: {
  type: String
},
otpExpire: {
  type: Date
},
isDeleted: {
  type: Boolean,
  default: false
},
bookmarkedJobs: [{ 
  type: mongoose.Schema.Types.ObjectId, 
  ref: 'Job'
}],
}, { timestamps: true });

export default mongoose.model('User', userSchema);
