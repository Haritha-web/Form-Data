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
  lati:      { 
    type: Number, 
    required: true 
},
  longi:     { 
    type: Number, 
    required: true 
},
image: {
    type: String,
},
experienceRange: {
    type: String,
    enum: ['0-1', '1-2', '2-3', '3-4', '4-5', '5+'],
    required: true
},
keySkills: [{
    type: String,
    required: true
}],
role: {
    type: String,
    required: true
},
currentDesignation: {
    type: String,
    required: true
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
}, { timestamps: true });

export default mongoose.model('User', userSchema);
