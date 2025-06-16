import mongoose from 'mongoose';

const employerSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true 
},
  lastName:  { 
    type: String, 
    required: true 
},
  email:     { 
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
  gender:    { 
    type: String, 
    enum: ['Male', 'Female', 'Other'], 
},
  dob:       { 
    type: Date, 
},
companyName: {
  type: String,
  required: true
},
  companyAddress: {
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    }
},
isApproved: {
  type: String,
  enum: [ 'Pending', 'Approved', 'Rejected'],
  default: 'Pending'
},
otp: {
  type: String
},
otpExpire: {
  type: Date
}
}, { timestamps: true });

export default mongoose.model('Employer', employerSchema);
