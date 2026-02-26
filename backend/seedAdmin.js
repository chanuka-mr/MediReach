const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./Models/userModel");

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    // Admin details
    const adminEmail = "admin@medireach.com";
    const adminPassword = "adminpassword123";

    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log("Admin user already exists. Updating password...");
      adminExists.password = adminPassword;
      await adminExists.save();
      console.log("Admin password updated!");
    } else {
      console.log("Creating Admin user...");
      await User.create({
        name: "Super Admin",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
      });
      console.log("Admin user created successfully!");
    }

    process.exit();
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
