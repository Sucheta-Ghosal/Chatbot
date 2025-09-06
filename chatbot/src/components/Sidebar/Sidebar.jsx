import React, { useContext, useState, useEffect } from 'react'
import { assets } from '../../assets/assets'
//import { Context } from '../../context/Context'
import './Sidebar.css';

const Sidebar = () => {
  const [extended, setExtended] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState("dark")  // "light" or "dark"

  const toggleTheme = () => {
  setTheme(prev => (prev === "dark" ? "light" : "dark"))
}


  // Inject CSS file dynamically for theme
  /*useEffect(() => {
    const linkId = "sidebar-theme-style"
    let linkTag = document.getElementById(linkId)

    if (!linkTag) {
      linkTag = document.createElement("link")
      linkTag.id = linkId
      linkTag.rel = "stylesheet"
      document.head.appendChild(linkTag)
    }

    linkTag.href = theme === "dark" ? "/Sidebar-dark-bg.css" : "/Sidebar-light-bg.css"
  }, [theme])
  */

  return (
    <div className='sidebar'>
      <div className="top">
        <img
          onClick={() => setExtended(prev => !prev)}
          className='menu'
          src={theme === "dark" ? assets.menu_light : assets.menu_icon}
          alt="menu"
        />

        <div /*onClick={newChat}*/ className="new-chat">
          <img src={assets.plus_icon} alt="new" />
          {extended ? <p>New Chat</p> : null}
        </div>

        <div className="recent">
          <p className="recent-title">Recent</p>
          <div className="recent-entry">
            <img src={assets.message_icon} alt="" />
            <p>What is React..</p>
          </div>
        </div>
      </div>

      <div className="bottom">
        <div className="bottom-item recent-entry">
          <img src={theme === "dark" ? assets.question_light : assets.question_icon} alt="help" />
          {extended && <p>Help</p>}
        </div>

        <div className="bottom-item recent-entry">
          <img src={theme === "dark" ? assets.history_light : assets.history_icon} alt="history" />
          {extended && <p>Activity</p>}
        </div>

        <div
          className="bottom-item recent-entry"
          onClick={() => setShowSettings(prev => !prev)}
        >
          <img src={theme === "dark" ? assets.setting_light : assets.setting_icon} alt="settings" />
          {extended && <p>Settings</p>}
        </div>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <div className="settings-option">
            <label className="theme">Theme:</label>
            <div className="theme-options">
              <span onClick={toggleTheme}>
                {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar


