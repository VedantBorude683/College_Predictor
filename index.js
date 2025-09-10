require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const bcrypt = require("bcrypt");
const User = require(path.join(__dirname, "models/User"));
const sendMail = require("./nodemailer"); // your nodemailer file exporting sendOTP

const app = express();
const PORT = 3000;

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/mhtcet_database")
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error(err));

// Serve home page
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "home.html")));

// Signup
app.post("/api/signup", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ error: "User already exists" });

        const hash = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hash });
        await user.save();
        res.json({ message: "Sign-up successful" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Login
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(400).json({ error: "Invalid credentials" });
        res.json({ message: "Login successful" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// OTP storage (in-memory for now)
const otpStore = {};

// Send OTP
app.post("/api/send-otp", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit
        otpStore[email] = otp;

        sendMail(email, otp); // nodemailer sends OTP
        res.json({ message: "OTP sent to your email" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Reset Password
app.post("/api/reset-password", async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        if (!otpStore[email] || otpStore[email] != otp)
            return res.status(400).json({ error: "Invalid OTP" });

        const hash = await bcrypt.hash(newPassword, 10);
        await User.updateOne({ email }, { password: hash });
        delete otpStore[email]; // remove OTP after use
        res.json({ message: "Password reset successful" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Dashboard
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard", "dashboard.html"));
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
