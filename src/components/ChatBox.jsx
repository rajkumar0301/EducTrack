import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '@supabase/auth-helpers-react';

const ChatBox = ({ selectedUser }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user || !selectedUser) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      setMessages(data || []);
    };

    fetchMessages();

    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new;
          if (
            (msg.sender_id === user.id && msg.receiver_id === selectedUser.id) ||
            (msg.sender_id === selectedUser.id && msg.receiver_id === user.id)
          ) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;

    await supabase.from('messages').insert([
      {
        sender_id: user.id,
        receiver_id: selectedUser.id,
        content: newMsg,
      },
    ]);

    setNewMsg('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded-lg max-w-xs ${
              msg.sender_id === user.id ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200 mr-auto'
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>
      <div className="p-2 border-t flex gap-2">
        <input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type a message"
          className="flex-1 border rounded p-2"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;






















// import React, { useEffect, useState, useRef } from "react";
// import { supabase } from "../supabaseClient";
// import MessageBubble from "./MessageBubble";
// import toast from "react-hot-toast";

// const ChatWindow = ({ senderId, receiver }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMsg, setNewMsg] = useState("");
//   const bottomRef = useRef();

//   // Fetch past messages
//  useEffect(() => {
//   if (!receiver) return;

//   const channel = supabase
//     .channel("chat-room")
//     .on(
//       "postgres_changes",
//       { event: "INSERT", schema: "public", table: "messages" },
//       (payload) => {
//         const msg = payload.new;
//         if (
//           (msg.sender === senderId && msg.receiver === receiver.id) ||
//           (msg.sender === receiver.id && msg.receiver === senderId)
//         ) {
//           setMessages((prev) => [...prev, msg]);
//         }
//       }
//     )
//     .subscribe();

//   return () => supabase.removeChannel(channel);
// }, [receiver, senderId]);

//   // Real-time subscription
//   useEffect(() => {
//     if (!receiver) return;
//     const channel = supabase
//       .channel("chat-room")
//       .on("postgres_changes", {
//         event: "INSERT",
//         schema: "public",
//         table: "messages",
//       }, (payload) => {
//         const msg = payload.new;
//         if (
//           (msg.sender === senderId && msg.receiver === receiver.id) ||
//           (msg.sender === receiver.id && msg.receiver === senderId)
//         ) {
//           setMessages((prev) => [...prev, msg]);
//         }
//       })
//       .subscribe();
//     return () => supabase.removeChannel(channel);
//   }, [receiver, senderId]);

//   // Scroll to bottom
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = async () => {
//     if (!newMsg.trim() || !receiver) return;
//     const { error } = await supabase.from("messages").insert({
//       sender: senderId,
//       receiver: receiver.id,
//       content: newMsg,
//     });
//     if (error) {
//       toast.error("Failed to send");
//     } else {
//       setNewMsg("");
//     }
//   };

//   return (
//     <div className="chat-window">
//       <div className="chat-header">{receiver ? receiver.name : "Select a contact"}</div>
//       <div className="chat-messages">
//         {messages.map((m) => (
//           <MessageBubble key={m.id} message={m} self={m.sender === senderId} />
//         ))}
//         <div ref={bottomRef}></div>
//       </div>
//       {receiver && (
//         <div className="chat-input">
//           <input
//             type="text"
//             value={newMsg}
//             onChange={(e) => setNewMsg(e.target.value)}
//             placeholder="Type a message..."
//           />
//           <button onClick={sendMessage}>Send</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatWindow;



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


