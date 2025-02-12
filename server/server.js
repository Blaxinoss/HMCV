const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require('dotenv')
const cors = require('cors');
const app = express();
const traineeRoutes = require('./Routes/traineeRoutes.js')
const expensesRoutes = require('./Routes/expensesRoutes.js')
const trainersRoutes = require('./Routes/trainersRoutes.js')
const settingsRoutes = require('./Routes/settingsRoutes.js')

dotenv.config();


app.use(cors())


const PORT = process.env.PORT;
const uri = process.env.DB_URI;
app.use(bodyParser.json());

// MongoDB connection


mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));


app.use('/api/trainees', traineeRoutes)
app.use('/api/expenses', expensesRoutes);
app.use('/api/trainers', trainersRoutes)
app.use('/api/settings', settingsRoutes)

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));