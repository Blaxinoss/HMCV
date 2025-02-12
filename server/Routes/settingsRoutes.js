const express = require('express');
const User = require('../models/User'); // Ensure this is correct
const router = express.Router();
const bcrypt = require("bcrypt");


// GET /api/settings
router.get('/', async (req, res) => {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST /api/settings
router.post('/', async (req, res) => {
    try {
        const { username, password } = req.body;
        hasedpassword = await bcrypt.hash(password, 10)

        const user = new User({ username, password: hasedpassword }); // Create new user
        await user.save();
        res.status(201).json({ message: 'you have registered  a user successfully', user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.findByIdAndUpdate(
            id,
            { username, password: hashedPassword },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
module.exports = router;
