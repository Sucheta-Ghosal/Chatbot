import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

// Import MongoDB connection
import connectDB from "./config/db.js";

// Import models
import User from "./models/user.js";
import Chat from "./models/chat.js";
import runChat from "./config/chatbot.js";
import { protect } from "./middleware/auth.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// -------------------------
// Routes
// -------------------------

// Test route
app.get("/", (req, res) => {
    res.send("Chatbot server is running");
});

// -------------------------
// User Routes
// -------------------------

// Create a new user
app.post("/api/users", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = new User({ username, email, password, chats: [] });
        await user.save();
        res.status(201).json({ success: true, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// Create a dummy user
app.post("/api/users/dummy", async (req, res) => {
    try {
        const user = new User({
            username: "TestUser3",
            email: "testuser3@example.com",
            password: "password123",
            chats: [],
        });

        await user.save();
        res.status(201).json({ success: true, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// Get all users (for admin/testing)
app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find().populate("chats");
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// -------------------------
// Auth Routes
// -------------------------

// Signup
app.post("/api/auth/signup", async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
        return res.status(400).json({ success: false, message: "All fields required" });

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(409).json({ success: false, message: "User already exists" });

        const user = new User({ username, email, password });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        res.status(201).json({ success: true, user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Login
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ success: false, message: "Email and password required" });

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });

        const isMatch = await user.matchPassword(password);
        if (!isMatch)
            return res.status(401).json({ success: false, message: "Invalid password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        res.json({ success: true, user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// -------------------------
// Chat Routes
// -------------------------

// Get all chats for logged-in user
app.get("/api/chats", protect, async (req, res) => {
    try {
        const chats = await Chat.find({ user: req.userId });
        res.json({ success: true, chats });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// Create a new chat for logged-in user
app.post("/api/chats", protect, async (req, res) => {
    const { messages } = req.body;

    try {
        const chat = new Chat({ user: req.userId, messages: messages || [] });
        await chat.save();
        await User.findByIdAndUpdate(req.userId, { $push: { chats: chat._id } });

        res.status(201).json({ success: true, chat });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// Add messages to a chat
app.put("/api/chats/:chatId/messages", protect, async (req, res) => {
    const { chatId } = req.params;
    const { messages } = req.body;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

        // Ensure logged-in user owns the chat
        if (chat.user.toString() !== req.userId)
            return res.status(403).json({ success: false, message: "Not authorized" });

        chat.messages.push(...messages);
        await chat.save();

        res.json({ success: true, chat });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// Chatbot route (run GenAI)
app.post("/api/chatbot", protect, async (req, res) => {
    const { chatId, prompt } = req.body;

    if (!chatId || !prompt)
        return res.status(400).json({ success: false, error: "chatId and prompt are required" });

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ success: false, error: "Chat not found" });

        if (chat.user.toString() !== req.userId)
            return res.status(403).json({ success: false, error: "Not authorized" });

        const botResponse = await runChat(prompt);

        // Save both user and bot messages
        chat.messages.push({ sender: "user", text: prompt }, { sender: "bot", text: botResponse });
        await chat.save();

        res.json({ success: true, botResponse });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// Get chat by ID
app.get("/api/chats/:chatId", protect, async (req, res) => {
    const { chatId } = req.params;
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

        if (chat.user.toString() !== req.userId)
            return res.status(403).json({ success: false, message: "Not authorized" });

        res.json({ success: true, chat });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// -------------------------
// Start server
// -------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
