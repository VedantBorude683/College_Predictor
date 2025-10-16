import 'dotenv/config';
import express from "express";
import mongoose from "mongoose";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import bcrypt from "bcrypt";
import { GoogleGenAI } from "@google/genai";

// Since __dirname is not available in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import your Mongoose models
import User from "./models/User.js";
import Cutoff from "./models/Cutoff.js";
import sendMail from "./nodemailer.js";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/mhtcet_database")
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// OTP storage
const otpStore = {};

// --- API ROUTES ---

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
        res.status(201).json({ message: "Sign-up successful", user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        res.status(200).json({ message: "Login successful", user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send OTP
app.post("/api/send-otp", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000);
        otpStore[email] = otp;

        await sendMail(email, otp);
        res.json({ message: "OTP sent to your email" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reset Password
app.post("/api/reset-password", async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        if (!otpStore[email] || otpStore[email] != otp)
            return res.status(400).json({ error: "Invalid OTP" });

        const hash = await bcrypt.hash(newPassword, 10);
        await User.updateOne({ email }, { password: hash });
        delete otpStore[email];

        res.json({ message: "Password reset successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch colleges
app.get('/api/colleges', async (req, res) => {
    try {
        const colleges = await Cutoff.find({});
        res.json(colleges);
    } catch (err) {
        console.error('Failed to fetch colleges', err);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// --- AI CHATBOT ROUTE ---
let genAI = new GoogleGenAI( process.env.GEMINI_API_KEY );

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: [
                {
                    type: 'text',
                    text: message
                }
            ],
        });
         

        // Check if output exists safely
       
           const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
            res.status(200).json({ reply: text });
        if(!text)
            res.status(500).json({ error: 'AI response is empty' });
        

    } catch (error) {
        console.error('Error in /api/chat:', error);
        res.status(500).json({ error: error.message || 'Failed to get AI response' });
    }
  
});

// --- PAGE SERVING ROUTES ---
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard", "dashboard.html"));
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
