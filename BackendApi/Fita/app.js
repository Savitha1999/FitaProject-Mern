

const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const path = require('path');
const UserRouter = require('./UserRouter'); // Adjust the path if necessary

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/FitaAcademy")
    .then(() => {
        console.log("Database connected");
    })
    .catch(() => {
        console.log("Database failed to connect");
    });

// Routes
app.use("/fita", UserRouter);

app.listen(port, () => {
    console.log("Server running on port", port);
});
