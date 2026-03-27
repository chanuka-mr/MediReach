
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const routes   = require("./Route/medicineRoute");
const dashboardRoutes = require("./Route/dashboardRoute"); 
const reportRoutes = require("./routes/reportRoutes"); 
const dns = require("dns");

require("dotenv").config();

// Override default DNS for MongoDB +srv connections (Bypasses local ISP blocks)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();


// ── Middleware ────────────────────────────────────────────────────
app.use(cors({
  origin: "http://localhost:3000", // your React app
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

// routes
const authRoutes = require("./Routes/authRoutes");
const userRoutes = require("./Routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// ── Routes ────────────────────────────────────────────────────────
app.use("/medicines",        routes);           
app.use("/api/dashboard",    dashboardRoutes);  
app.use("/api/reports",      reportRoutes);     

// ── Connect & Start ───────────────────────────────────────────────
mongoose.connect("mongodb+srv://admin:jEvCBzBxRrHyAYJr@medireach.it1h5bs.mongodb.net/")
  .then(() => console.log(" Connected to MongoDB"))
  .then(() => {
    app.listen(5000, () => {
      console.log(" Server is running on port 5000");
    });
  })
  .catch((err) => {
    console.log(err);
  });