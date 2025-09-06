import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// Import MongoDB connection
import connectDB from "./config/db.js";

// Import models
import User from "./models/user.js";
import Chat from "./models/chat.js";
import runChat from "./config/chatbot.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// -------------------------
// Routes
// -------------------------

// Test route
app.get("/", (req, res) => {
    res.send("Chatbot server is running");
});

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

// Get all users
app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find().populate("chats");
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// Create a new chat
app.post("/api/chats", async (req, res) => {
    const { userId, messages } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: "userId is required" });
    }

    try {
        const chat = new Chat({ user: userId, messages });
        await chat.save();
        await User.findByIdAndUpdate(userId, { $push: { chats: chat._id } });
        res.status(201).json({ success: true, chat });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});


// Get all chats for a user
app.get("/api/chats/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const chats = await Chat.find({ user: userId });
        res.json({ success: true, chats });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// -------------------------
// Chatbot route (run GenAI)
// -------------------------
app.post("/api/chatbot", async (req, res) => {
    console.log("Raw body:", req.body);
    const { userId, chatId, prompt } = req.body;

    if (!userId || !chatId || !prompt) {
        return res.status(400).json({ success: false, error: "userId, chatId and prompt are required" });
    }

    try {
        const botResponse = await runChat(prompt);

        // Save both user message and bot response to chat
        await Chat.findByIdAndUpdate(chatId, {
            $push: {
                messages: [
                    { sender: "user", text: prompt },
                    { sender: "bot", text: botResponse }
                ]
            }
        });

        res.json({ success: true, botResponse });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// -------------------------
// Start server
// -------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
