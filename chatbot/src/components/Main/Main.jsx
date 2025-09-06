import React, { useContext, useEffect, useState } from 'react'
//import './Main.css'
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context'
import Loader_2 from '../Loader_2/Loader_2'

const Main = () => {

    const { onSent, recentPrompt, showResult, loading, resultData, setInput, input, theme, toggleTheme, messages } = useContext(Context)

    useEffect(() => {
        const linkId = "main-theme-css"
        let linkEl = document.getElementById(linkId)

        if (!linkEl) {
            linkEl = document.createElement("link")
            linkEl.id = linkId
            linkEl.rel = "stylesheet"
            document.head.appendChild(linkEl)
        }

        // Switch between light and dark theme CSS files
        linkEl.href = theme === "dark" ? "/main-dark-bg.css" : "/main-light-bg.css"
    }, [theme])

    return (
        <div className='main'>
            <div className="nav">
                <p>ChatBot</p>
                <img src={assets.user_icon} alt="" />
            </div>
            <div className="main-container">

                {messages.length === 0
                    ? (
                        <>
                            <div className="greet">
                                <p><span>Hello, Dev..</span></p>
                                <p>How can I help you today?</p>
                            </div>
                            <div className="cards">
                                <div className="card">
                                    <p>Tell me about ISRO’s latest missions</p>
                                    <img src={assets.compass_icon} alt="" />
                                </div>
                                <div className="card">
                                    <p>Briefly summarize this concept: urban planning</p>
                                    <img src={assets.bulb_icon} alt="" />
                                </div>
                                <div className="card">
                                    <p>Brainstorm team bonding activities for our work retreat</p>
                                    <img src={assets.message_icon} alt="" />
                                </div>
                                <div className="card">
                                    <p>Improve the readability of the following code</p>
                                    <img src={assets.code_icon} alt="" />
                                </div>
                            </div>

                        </>
                    )
                    :
                    (
                        <div className="chat-history">
                            {messages.map((msg, i) => (
                                <div key={i} className="result">
                                    {msg.sender === "user" ? (
                                        <div className="result-title">
                                            <img src={assets.user_icon} alt="user" />
                                            <p>{msg.text}</p>
                                            
                                        </div>
                                    ) : (
                                        <div className="result-data">
                                            <img src={assets.rocket_icon} alt="bot" />
                                            <div
                                                className="response-text"
                                                dangerouslySetInnerHTML={{ __html: msg.text }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {loading && 
                                <Loader_2 />
                            }

                        </div>
                    )
                }
                </div>




            < div className="main-bottom">
                <div className="search-box">
                    <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='Enter a prompt here..' />
                    <div>
                        <img src={assets.gallery_icon} alt="" />
                        <img src={assets.mic_icon} alt="" />
                        <img onClick={() => onSent(input,"68bc1961157ce76dde428ef4")} src={assets.send_icon} alt="" />
                    </div>
                </div>
                <p className="bottom-info">
                    ChatBot may display inaccurate info, including about people, so double-check it's responses. Your privacy and ChatBot Apps.
                </p>
            </div>
        </div>

    )
}

export default Main
