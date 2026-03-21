const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const routes   = require("./Route/medicineRoute");
const dashboardRoutes = require("./Route/dashboardRoute"); // new
require("dotenv").config();

const app = express();

// ── Middleware ────────────────────────────────────────────────────
app.use(cors({
  origin: "http://localhost:3000", // your React app
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────
app.use("/medicines",        routes);           // existing
app.use("/api/dashboard",    dashboardRoutes);  // new

// ── Connect & Start ───────────────────────────────────────────────
mongoose.connect("mongodb+srv://admin:jEvCBzBxRrHyAYJr@medireach.it1h5bs.mongodb.net/")
  .then(() => console.log("✅ Connected to MongoDB"))
  .then(() => {
    app.listen(5000, () => {
      console.log("🚀 Server is running on port 5000");
    });
  })
  .catch((err) => {
    console.log(err);
  });