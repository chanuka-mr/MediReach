const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pharmacy name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Name must be at least 3 characters']
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    enum: ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Galle', 'Matara', 'Jaffna', 'Kurunegala', 'Badulla']
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { 
      type: [Number], 
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && 
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates'
      }
    }
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    unique: true,
    match: [/^0\d{9}$/, 'Please enter a valid Sri Lankan phone number (10 digits starting with 0)']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  operatingHours: {
    open: {
      type: String,
      required: true,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Use format HH:mm (e.g., 08:00)']
    },
    close: {
      type: String,
      required: true,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Use format HH:mm (e.g., 22:00)']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  pharmacistName: {
    type: String,
    required: [true, 'Pharmacist name is required']
  }
}, {
  timestamps: true
});

// Create geospatial index for location queries
pharmacySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Pharmacy', pharmacySchema);