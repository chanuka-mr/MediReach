const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user (Patient or Pharmacy)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role, pharmacyName, licenseNumber, contactNumber } = req.body;

  try {
    // Basic validation
    if (!name || !email || !password || !role || !contactNumber) {
      return res.status(400).json({ message: "Please enter all required fields" });
    }

    // Role validation
    if (!["user", "pharmacy"].includes(role)) {
       return res.status(400).json({ message: "Invalid role specified" });
    }

    // Pharmacy specific validation
    if (role === "pharmacy") {
      if (!pharmacyName || !licenseNumber) {
        return res.status(400).json({ message: "Pharmacy details are required" });
      }
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      contactNumber,
      pharmacyName: role === "pharmacy" ? pharmacyName : undefined,
      licenseNumber: role === "pharmacy" ? licenseNumber : undefined,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
