import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
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
    required: true 
},
  dob:       { 
    type: Date, 
    required: true 
},
}, { timestamps: true });

export default mongoose.model('Vendor', vendorSchema);
