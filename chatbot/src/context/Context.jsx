import { createContext, useState } from "react";
import runChat from "../config/chatbot";

export const Context = createContext();

const ContextProvider = (props) => {

    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");

    const [theme, setTheme] = useState("light"); // default light

    const toggleTheme = () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
    };

    const onSent = async (prompt) => {

        setResultData("")
        setLoading(true)
        setShowResult(true)

        const response = await runChat(input)

        //Formatting Response
        let formattedResponse = response
            // Ordered lists (1., 2., etc.)
            .replace(/^\d+\.\s+(.*)$/gm, "<li>$1</li>")
            .replace(/(<li>.*<\/li>)/gs, "<ol>$1</ol>")

            // Unordered lists (- or *)
            .replace(/^[\-\*]\s+(.*)$/gm, "<li>$1</li>")
            .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // bold
            .replace(/\*/g, "<br/>") // line breaks
            .replace(/```([\s\S]*?)```/g, (match, code) => {
                // Escape HTML so <h1> shows as text, not HTML
                const escapedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                return `<div class="code-block">
              <div class="code-header">💻 Code Snippet</div>
              <pre><code>${escapedCode}</code></pre>
            </div>`;
            });
        //setResultData(formattedResponse);

        // Split the response into characters (or words) for typing effect
        const chars = formattedResponse.split("");

        // Typing effect
        chars.forEach((ch, i) => {
            setTimeout(() => {
                setResultData(prev => prev + ch);
            }, 20 * i); // 20ms per char → adjust for speed
        });

        setLoading(false)
        setInput("")
    }

    //onSent("what is react js")

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
        toggleTheme
    }

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    )
}

export default ContextProvider