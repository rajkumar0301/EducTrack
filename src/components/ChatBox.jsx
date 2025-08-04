// ✅ ChatBox.jsx — Mobile toggle + layout
import React, { useState, useEffect } from "react";
import Messages from "../pages/Messages";
import ContactList from "../components/ContactList";
import "../styles/ChatBox.css";

const ChatBox = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const [showMessages, setShowMessages] = useState(false);

  const handleResize = () => {
    const mobile = window.innerWidth <= 768;
    setIsMobileView(mobile);
    if (!mobile) setShowMessages(false);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (isMobileView) {
      setShowMessages(true);
    }
  };

  const handleBack = () => {
    setShowMessages(false);
    setSelectedUser(null);
  };

  return (
    <div className="chatbox-container">
      {(!isMobileView || !showMessages) && (
        <div className="contact-list-wrapper">
          <ContactList onSelectUser={handleSelectUser} selectedUser={selectedUser} />
        </div>
      )}

      {(!isMobileView || showMessages) && selectedUser && (
        <div className="message-box-wrapper">
          {isMobileView && (
            <button className="back-button" onClick={handleBack}>
              ← Back
            </button>
          )}
          <Messages selectedUser={selectedUser} />
        </div>
      )}
    </div>
  );
};

export default ChatBox;


