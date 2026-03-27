
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const routes   = require("./Route/medicineRoute");
const dashboardRoutes = require("./Route/dashboardRoute"); 
const reportRoutes = require("./Routes/reportRoutes"); 
const dns = require("dns");

require("dotenv").config();

// Override default DNS for MongoDB +srv connections (Bypasses local ISP blocks)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();


// ── Middleware ────────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"], // your React app
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

// routes
const authRoutes = require("./Routes/authRoutes");
const userRoutes = require("./Routes/userRoutes");
const pharmacyRoutes = require("./Routes/pharmacyRoutes");
const inquiryRoutes = require("./Routes/inquiryRoutes");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pharmacies", pharmacyRoutes);
app.use("/api/inquiries", inquiryRoutes);

// ── Routes ────────────────────────────────────────────────────────
app.use("/medicines",        routes);           
app.use("/api/dashboard",    dashboardRoutes);  
app.use("/api/reports",      reportRoutes);     

// SIMPLE TEST ROUTE - This MUST work
app.get("/test", (req, res) => {
    console.log("TEST ROUTE HIT!");
    res.json({ message: "Test route is working!" });
});

// Root route
app.get("/", (req, res) => {
    console.log("ROOT ROUTE HIT!");
    res.send("MediReach API is running");
});

// ── Connect & Start ───────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(" Connected to MongoDB"))
  .then(() => {
    app.listen(5000, () => {
      console.log(" Server is running on port 5000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
