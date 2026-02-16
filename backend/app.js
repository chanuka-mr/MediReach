const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// middleware
app.use("/", (req, res) => {
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