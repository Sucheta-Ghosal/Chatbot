import { useContext } from "react";
import { Context } from "../../context/Context";  // ✅ fixed path
import './Settings.css'

const Settings = () => {
  const { theme, toggleTheme } = useContext(Context);

  return (
    <div>
      <button onClick={toggleTheme}>
        {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </button>
    </div>
  );
};

export default Settings;
