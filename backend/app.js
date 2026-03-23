const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Basic middleware
const cors = require('cors');
app.use(cors());
app.use(express.json());

// Import routes
const pharmacyRoutes = require("./Routes/pharmacyRoutes");

// Mount routes
app.use("/api/pharmacies", pharmacyRoutes);

// SIMPLE TEST ROUTE - This MUST work
app.get("/test", (req, res) => {
    console.log("✅ TEST ROUTE HIT!");
    res.json({ message: "Test route is working!" });
});

// Root route
app.get("/", (req, res) => {
    console.log("✅ ROOT ROUTE HIT!");
    res.send("MediReach API is running");
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(process.env.PORT, () => {
        console.log("🚀 Server running on port", process.env.PORT);
        console.log("\n📝 Try these URLs:");
        console.log("   http://localhost:5000/");
        console.log("   http://localhost:5000/test");
    });
})
.catch(err => console.log("❌ MongoDB error:", err));