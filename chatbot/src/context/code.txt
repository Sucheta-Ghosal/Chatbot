import { createContext, useState, useEffect } from "react";
import runChat from "../config/chatbot";


export const Context = createContext();

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");

    const [messages, setMessages] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null); // currently active chat
    const [chats, setChats] = useState([]); // all chats

    const [theme, setTheme] = useState("light"); // default light
   
    const userId = "68bc1961157ce76dde428ef4";

    const toggleTheme = () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
    };

    useEffect(() => {
        const initChats = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/chats/${userId}`);
                const data = await res.json();

                if (data.success) {
                    setChats(data.chats);

                    if (data.chats.length > 0) {
                        // ✅ pick the latest chat
                        const lastChat = data.chats[data.chats.length - 1];
                        setActiveChatId(lastChat._id);
                        setMessages(lastChat.messages || []);
                    } else {
                        // ✅ no chats → create a new one immediately
                        const newChatRes = await fetch("http://localhost:5000/api/chats", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ userId, messages: [] }),
                        });

                        const newChatData = await newChatRes.json();
                        if (newChatData.success) {
                            setChats([newChatData.chat]);
                            setActiveChatId(newChatData.chat._id);
                            setMessages([]);
                        }
                    }
                }
            } catch (err) {
                console.error("Error initializing chats:", err);
            }
        };

        initChats();
    }, [userId]);


    // Fetch user's chats
    const fetchChats = async (userId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/chats/${userId}`);
            const data = await res.json();
            if (data.success) setChats(data.chats);
        } catch (err) {
            console.error("Error fetching chats:", err);
        }
    };

    // Set active chat
    const setActiveChat = (chatId) => {
        setActiveChatId(chatId);
        const chat = chats.find(c => c._id === chatId);
        if (chat) setMessages(chat.messages || []);
    };

    // Create new chat
    const createNewChat = async (userId) => {
        try {
            const res = await fetch("http://localhost:5000/api/chats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, messages: [] })
            });
            const data = await res.json();
            if (data.success) {
                setActiveChatId(data.chat._id);
                setMessages([]);
                setChats(prev => [...prev, data.chat]); // add to local list
                console.log("New chat created:", data.chat._id);
            }
        } catch (err) {
            console.error("Error creating new chat:", err);
        }
    };

    // Send message
    const onSent = async (prompt, userId) => {
        if (!prompt) return;

        // 1️⃣ Add user message locally
        const newUserMsg = { sender: "user", text: prompt };
        setMessages(prev => [...prev, newUserMsg]);

        setLoading(true);
        setShowResult(true);

        // 2️⃣ Get bot response from Gemini
        const response = await runChat(prompt);

        let formattedResponse = response
            .replace(/^\d+\.\s+(.*)$/gm, "<li>$1</li>")
            .replace(/(<li>.*<\/li>)/gs, "<ol>$1</ol>")
            .replace(/^[\-\*]\s+(.*)$/gm, "<li>$1</li>")
            .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
            .replace(/\*/g, "<br/>")
            .replace(/```([\s\S]*?)```/g, (match, code) => {
                const escapedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                return `<div class="code-block">
                        <div class="code-header">💻 Code Snippet</div>
                        <pre><code>${escapedCode}</code></pre>
                    </div>`;
            });

        const newBotMsg = { sender: "bot", text: formattedResponse };

        const updatedMessages = [...messages, newUserMsg, newBotMsg];
        setMessages(updatedMessages);

        try {
            if (activeChatId) {
                // ✅ Append to existing chat
                await fetch(`http://localhost:5000/api/chats/${activeChatId}/messages`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messages: [newUserMsg, newBotMsg] })
                });
            } else {
                // ✅ Create new chat if none exists
                const res = await fetch("http://localhost:5000/api/chats", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId,
                        messages: [newUserMsg, newBotMsg]
                    })
                });
                const data = await res.json();
                if (data.success) {
                    setActiveChatId(data.chat._id);
                    setChats(prev => [...prev, data.chat]);
                }
            }
        } catch (err) {
            console.error("Error saving chat:", err);
        }

        // Typing effect
        const chars = formattedResponse.split("");
        chars.forEach((ch, i) => {
            setTimeout(() => {
                setResultData(prev => prev + ch);
            }, 20 * i);
        });

        setLoading(false);
        setInput("");
    };

    const contextValue = {
        prevPrompts,
        setPrevPrompts,
        onSent,
        recentPrompt,
        setRecentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        theme,
        toggleTheme,
        messages,
        setMessages,
        activeChatId,
        setActiveChatId,
        createNewChat,
        chats,
        setActiveChat,
        fetchChats
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;
