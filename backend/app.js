const express = require("express");
const mongoose = require("mongoose");
const routes = require("./Route/medicineRoute");
require("dotenv").config();

const app = express();

// middleware
app.use(express.json());
app.use("/medicines", routes);

mongoose.connect("mongodb+srv://admin:jEvCBzBxRrHyAYJr@medireach.it1h5bs.mongodb.net/")
.then(() => console.log("Connected to MongoDB"))
.then(() => {
    app.listen(5000, () => {
        console.log("Server is running on port 5000");
    })
})
.catch((err) => {
    console.log(err);
})