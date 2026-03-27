const User = require("../Models/userModel");

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      contactNumber: user.contactNumber,
      role: user.role,
      pharmacyName: user.pharmacyName,
      licenseNumber: user.licenseNumber,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      addresses: user.addresses,
      location: user.location,
      isProfileComplete: user.isProfileComplete,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.contactNumber = req.body.contactNumber || user.contactNumber;
    
    // Additional profile fields
    if (req.body.gender !== undefined) user.gender = req.body.gender;
    if (req.body.dateOfBirth !== undefined) user.dateOfBirth = req.body.dateOfBirth;
    if (req.body.addresses !== undefined) user.addresses = req.body.addresses;
    
    if (req.body.location !== undefined) {
      if (!user.location) user.location = { type: 'Point' };
      if (req.body.location.coordinates) {
          user.location.coordinates = req.body.location.coordinates;
      }
    }
    
    // Check profile completeness
    if (user.gender && user.dateOfBirth && user.location && user.location.coordinates && user.location.coordinates.length > 0) {
       user.isProfileComplete = true;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    if (user.role === 'pharmacy') {
        user.pharmacyName = req.body.pharmacyName || user.pharmacyName;
        user.licenseNumber = req.body.licenseNumber || user.licenseNumber;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      contactNumber: updatedUser.contactNumber,
      role: updatedUser.role,
      pharmacyName: updatedUser.pharmacyName,
      licenseNumber: updatedUser.licenseNumber,
      gender: updatedUser.gender,
      dateOfBirth: updatedUser.dateOfBirth,
      addresses: updatedUser.addresses,
      location: updatedUser.location,
      isProfileComplete: updatedUser.isProfileComplete,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// @desc    Delete user profile (self)
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    await user.deleteOne();
    res.json({ message: "User account removed" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// --- ADMIN CONTROLLERS ---

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json(users);
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    res.json({ message: "User removed" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getAllUsers,
  getUserById,
  deleteUser,
};
