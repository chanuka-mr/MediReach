const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

// Override default DNS for MongoDB +srv connections (Bypasses local ISP blocks)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
const authRoutes = require("./Routes/authRoutes");
const userRoutes = require("./Routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
    res.send("Success");
})

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("Connected to MongoDB"))
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log("Server is running on port", process.env.PORT);
    })
})
.catch((err) => {
    console.log(err);
})