const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    contactNumber: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["admin", "pharmacy", "user"],
      default: "user",
    },

    pharmacyName: {
      type: String,
      required: function() { return this.role === 'pharmacy'; }
    },

    licenseNumber: {
      type: String,
      required: function() { return this.role === 'pharmacy'; }
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      required: false,
    },

    dateOfBirth: {
      type: Date,
      required: false,
    },

    addresses: [
      {
        street: String,
        city: String,
        postalCode: String,
        isDefault: { type: Boolean, default: false }
      }
    ],

    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: false
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: false
      }
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    resetPasswordOtp: String,
    resetPasswordOtpExpire: Date,
  },
  { timestamps: true }
);

// Create 2dsphere index on location for spatial queries (finding nearby pharmacies)
userSchema.index({ location: "2dsphere" });

// Encrypt password using bcrypt
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordOtp = function () {
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP and set to resetPasswordOtp
  this.resetPasswordOtp = crypto.createHash("sha256").update(otp).digest("hex");

  // Set expire to 2 minutes
  this.resetPasswordOtpExpire = Date.now() + 2 * 60 * 1000;

  return otp;
};

module.exports = mongoose.model("User", userSchema);
