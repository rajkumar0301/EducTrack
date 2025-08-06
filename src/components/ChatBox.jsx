import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import MessageBubble from "./MessageBubble";
import toast from "react-hot-toast";

const ChatWindow = ({ senderId, receiver }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef();

  // Fetch past messages
 useEffect(() => {
  if (!receiver) return;

  const channel = supabase
    .channel("chat-room")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        const msg = payload.new;
        if (
          (msg.sender === senderId && msg.receiver === receiver.id) ||
          (msg.sender === receiver.id && msg.receiver === senderId)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [receiver, senderId]);

  // Real-time subscription
  useEffect(() => {
    if (!receiver) return;
    const channel = supabase
      .channel("chat-room")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
      }, (payload) => {
        const msg = payload.new;
        if (
          (msg.sender === senderId && msg.receiver === receiver.id) ||
          (msg.sender === receiver.id && msg.receiver === senderId)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [receiver, senderId]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !receiver) return;
    const { error } = await supabase.from("messages").insert({
      sender: senderId,
      receiver: receiver.id,
      content: newMsg,
    });
    if (error) {
      toast.error("Failed to send");
    } else {
      setNewMsg("");
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">{receiver ? receiver.name : "Select a contact"}</div>
      <div className="chat-messages">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} self={m.sender === senderId} />
        ))}
        <div ref={bottomRef}></div>
      </div>
      {receiver && (
        <div className="chat-input">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;



// // ✅ ChatBox.jsx — Mobile toggle + layout
// import React, { useState, useEffect } from "react";
// import Messages from "../pages/Messages";
// import ContactList from "./ContactList";
// import "../styles/ChatBox.css";

// const ChatBox = () => {
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
//   const [showMessages, setShowMessages] = useState(false);

//   const handleResize = () => {
//     const mobile = window.innerWidth <= 768;
//     setIsMobileView(mobile);
//     if (!mobile) setShowMessages(false);
//   };

//   useEffect(() => {
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const handleSelectUser = (user) => {
//     setSelectedUser(user);
//     if (isMobileView) {
//       setShowMessages(true);
//     }
//   };

//   const handleBack = () => {
//     setShowMessages(false);
//     setSelectedUser(null);
//   };

//   return (
//     <div className="chatbox-container">
//       {(!isMobileView || !showMessages) && (
//         <div className="contact-list-wrapper">
//           <ContactList onSelectUser={handleSelectUser} selectedUser={selectedUser} />
//         </div>
//       )}

//       {(!isMobileView || showMessages) && selectedUser && (
//         <div className="message-box-wrapper">
//           {isMobileView && (
//             <button className="back-button" onClick={handleBack}>
//               ← Back
//             </button>
//           )}
//           <Messages selectedUser={selectedUser} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatBox;


