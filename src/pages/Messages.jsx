// src/pages/Messages.jsx
import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import ContactList from "../components/ContactList";
import "../styles/Messages.css";
import toast from "react-hot-toast";

const Messages = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [friends, setFriends] = useState([]);
  const [requestsSent, setRequestsSent] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, name, email, avatar_url")
        .neq("id", user.id);
      setUsers(data || []);
    };
    fetchUsers();
  }, [user.id]);

  useEffect(() => {
    if (!selectedUser) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();
  }, [selectedUser, user.id]);

  useEffect(() => {
    if (!selectedUser) return;
    const channel = supabase
      .channel("realtime:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;
          const isRelevant =
            (msg.sender_id === user.id && msg.receiver_id === selectedUser.id) ||
            (msg.sender_id === selectedUser.id && msg.receiver_id === user.id);
          if (isRelevant) setMessages((prev) => [...prev, msg]);
        }
      )
      .on("broadcast", { event: "typing", schema: "public" }, ({ payload }) => {
        if (payload.sender !== user.id && payload.receiver === user.id) {
          setTypingUsers((prev) => ({ ...prev, [payload.sender]: true }));
          setTimeout(() => {
            setTypingUsers((prev) => ({ ...prev, [payload.sender]: false }));
          }, 2000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser, user.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    await supabase.from("messages").insert([
      {
        sender_id: user.id,
        receiver_id: selectedUser.id,
        content: newMsg,
      },
    ]);
    setNewMsg("");
  };

  const handleTyping = async () => {
    await supabase.channel("typing-channel").send({
      type: "broadcast",
      event: "typing",
      payload: { sender: user.id, receiver: selectedUser.id },
    });
  };

  const getAvatar = (avatar_url, name, email) => {
    const displayName = name || email?.split("@")[0] || "User";
    return (
      avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`
    );
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    const fetchFriendData = async () => {
      const sent = await supabase
        .from("friend_requests")
        .select("receiver_id")
        .eq("sender_id", user.id);
      const received = await supabase
        .from("friend_requests")
        .select("id, sender_id")
        .eq("receiver_id", user.id);

      setRequestsSent(sent.data?.map((r) => r.receiver_id) || []);

      const accepted = await supabase
        .from("friends")
        .select("*")
        .or(`user1.eq.${user.id},user2.eq.${user.id}`);

      const friendIds =
        accepted.data?.map((f) =>
          f.user1 === user.id ? f.user2 : f.user1
        ) || [];

      setFriends(friendIds);

      const senderIds = received.data?.map((r) => r.sender_id) || [];
      if (senderIds.length > 0) {
        const { data } = await supabase
          .from("profiles")
          .select("id, name, email, avatar_url")
          .in("id", senderIds);
        setFriendRequests(data || []);
      }
    };

    fetchFriendData();
  }, [user.id]);

  const handleSendRequest = async (receiverId) => {
    const { error } = await supabase.from("friend_requests").insert([
      { sender_id: user.id, receiver_id: receiverId },
    ]);
    if (error) toast.error("Request failed.");
    else {
      toast.success("Friend request sent!");
      setRequestsSent((prev) => [...prev, receiverId]);
    }
  };

  const handleAcceptRequest = async (senderId) => {
    await supabase.from("friends").insert([
      { user1: user.id, user2: senderId },
    ]);
    await supabase
      .from("friend_requests")
      .delete()
      .match({ sender_id: senderId, receiver_id: user.id });

    toast.success("Friend added!");
    setFriendRequests((prev) => prev.filter((r) => r.id !== senderId));
    setFriends((prev) => [...prev, senderId]);
  };

  const handleRejectRequest = async (senderId) => {
    await supabase
      .from("friend_requests")
      .delete()
      .match({ sender_id: senderId, receiver_id: user.id });
    toast.success("Request rejected!");
    setFriendRequests((prev) => prev.filter((r) => r.id !== senderId));
  };

  return (
    <div className={`messages-page ${selectedUser ? "chat-open" : ""}`}>
      <ContactList
        users={users}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        onSendRequest={handleSendRequest}
        onAcceptRequest={handleAcceptRequest}
        onRejectRequest={handleRejectRequest}
        friends={friends}
        requestsSent={requestsSent}
        friendRequests={friendRequests}
      />

      <div className="chat-area">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <img
                src="https://img.icons8.com/ios-filled/30/left.png"
                alt="Back"
                className="icon back-icon"
                onClick={() => setSelectedUser(null)}
              />
              <img
                src={getAvatar(
                  selectedUser.avatar_url,
                  selectedUser.name,
                  selectedUser.email
                )}
                alt="avatar"
                className="user-avatar"
              />
              <h4>{selectedUser.name || selectedUser.email}</h4>
            </div>

            <div className="chat-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${
                    msg.sender_id === user.id ? "sent" : "received"
                  }`}
                >
                  <div className="bubble">{msg.content}</div>
                  <div className="timestamp">{formatTime(msg.created_at)}</div>
                </div>
              ))}
              {typingUsers[selectedUser.id] && (
                <div className="typing-indicator">Typing...</div>
              )}
              <div ref={chatEndRef}></div>
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={newMsg}
                placeholder="Type a message..."
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                  else handleTyping();
                }}
              />
              <button onClick={sendMessage}>
                <img
                  src="https://img.icons8.com/color/30/filled-sent.png"
                  alt="Send"
                />
              </button>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">
            <img
              src="https://img.icons8.com/color/96/chat--v1.png"
              alt="Start Chat"
            />
            <p>Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;






// // src/pages/Messages.jsx
// import { useEffect, useState, useRef } from "react";
// import { supabase } from "../supabaseClient";
// import "../styles/Messages.css";

// const Messages = ({ user }) => {
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMsg, setNewMsg] = useState("");
//   const chatEndRef = useRef(null);

//   // Fetch user list
//   useEffect(() => {
//     const fetchUsers = async () => {
//       const { data } = await supabase
//         .from("profiles")
//         .select("id, name, email, avatar_url")
//         .neq("id", user.id);
//       setUsers(data || []);
//     };
//     fetchUsers();
//   }, [user.id]);

//   // Fetch messages when a user is selected
//   useEffect(() => {
//     if (!selectedUser) return;
//     const fetchMessages = async () => {
//       const { data } = await supabase
//         .from("messages")
//         .select("*")
//         .or(
//           `and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`
//         )
//         .order("created_at", { ascending: true });
//       setMessages(data || []);
//     };
//     fetchMessages();
//   }, [selectedUser, user.id]);

//   // Real-time updates
//   useEffect(() => {
//     if (!selectedUser) return;
//     const channel = supabase
//       .channel("realtime:messages")
//       .on(
//         "postgres_changes",
//         { event: "INSERT", schema: "public", table: "messages" },
//         (payload) => {
//           const msg = payload.new;
//           const isForThisChat =
//             (msg.sender_id === user.id && msg.receiver_id === selectedUser.id) ||
//             (msg.sender_id === selectedUser.id && msg.receiver_id === user.id);
//           if (isForThisChat) {
//             setMessages((prev) => [...prev, msg]);
//           }
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [selectedUser, user.id]);

//   // Auto scroll to bottom on new messages
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = async () => {
//     if (!newMsg.trim()) return;

//     await supabase.from("messages").insert([
//       {
//         sender_id: user.id,
//         receiver_id: selectedUser.id,
//         content: newMsg,
//       },
//     ]);
//     setNewMsg("");
//   };

//   const deleteMessage = async (id) => {
//     await supabase.from("messages").delete().eq("id", id);
//     setMessages((prev) => prev.filter((msg) => msg.id !== id));
//   };

//   const getAvatar = (avatar_url, name, email) => {
//     const displayName = name || email?.split("@")[0] || "User";
//     return (
//       avatar_url ||
//       `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`
//     );
//   };

//   const formatTime = (timestamp) => {
//     if (!timestamp) return "";
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString(undefined, {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   return (
//     <div className="messages-page">
//       {/* Sidebar */}
//       <div className={`user-list ${selectedUser ? "mobile-hide" : ""}`}>
//         <h3>Contacts</h3>
//         {users.map((u) => (
//           <div
//             key={u.id}
//             className={`user-item ${selectedUser?.id === u.id ? "active" : ""}`}
//             onClick={() => setSelectedUser(u)}
//           >
//             <img
//               src={getAvatar(u.avatar_url, u.name, u.email)}
//               alt={u.name || u.email}
//               className="user-avatar"
//             />
//             <span>{u.name || u.email}</span>
//           </div>
//         ))}
//       </div>

//       {/* Chat */}
//       <div className="chat-area">
//         {selectedUser ? (
//           <>
//             <div className="chat-header">
//               <img
//                 src="https://img.icons8.com/ios-filled/24/back.png"
//                 alt="Back"
//                 className="icon back-icon"
//                 onClick={() => setSelectedUser(null)}
//               />
//               <img
//                 src={getAvatar(
//                   selectedUser.avatar_url,
//                   selectedUser.name,
//                   selectedUser.email
//                 )}
//                 alt="avatar"
//                 className="user-avatar"
//               />
//               <h4>{selectedUser.name || selectedUser.email}</h4>
//             </div>

//             <div className="chat-messages">
//               {messages.map((msg) => (
//                 <div
//                   key={msg.id}
//                   className={`message ${msg.sender_id === user.id ? "sent" : "received"}`}
//                   onContextMenu={(e) => {
//                     e.preventDefault();
//                     if (msg.sender_id === user.id && window.confirm("Delete this message?")) {
//                       deleteMessage(msg.id);
//                     }
//                   }}
//                 >
//                   <div className="bubble">{msg.content}</div>
//                   <div
//                     className="timestamp"
//                     title={new Date(msg.created_at).toLocaleString()}
//                   >
//                     {formatTime(msg.created_at)}
//                   </div>
//                 </div>
//               ))}
//               <div ref={chatEndRef}></div>
//             </div>

//             <div className="chat-input">
//               <input
//                 type="text"
//                 value={newMsg}
//                 placeholder="Type a message..."
//                 onChange={(e) => setNewMsg(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//               />
//               <button className="send-btn" onClick={sendMessage}>
//                 <img
//                   src="https://img.icons8.com/ios-filled/24/FFFFFF/sent.png"
//                   alt="Send"
//                   className="icon send-icon"
//                 />
//                 <span>Send</span>
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="chat-placeholder">Select a user to start chatting</div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Messages;





// // src/pages/Messages.jsx
// import { useEffect, useState, useRef } from "react";
// import { supabase } from "../supabaseClient";
// import "../styles/Messages.css";

// const Messages = ({ user }) => {
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMsg, setNewMsg] = useState("");
//   const chatEndRef = useRef(null);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       const { data } = await supabase
//         .from("profiles")
//         .select("id, name, email, avatar_url")
//         .neq("id", user.id);
//       setUsers(data || []);
//     };
//     fetchUsers();
//   }, [user.id]);

//   useEffect(() => {
//     if (!selectedUser) return;
//     const fetchMessages = async () => {
//       const { data } = await supabase
//         .from("messages")
//         .select("*")
//         .or(
//           `and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`
//         )
//         .order("created_at", { ascending: true });
//       setMessages(data || []);
//     };
//     fetchMessages();
//   }, [selectedUser, user.id]);

//   useEffect(() => {
//     if (!selectedUser) return;
//     const channel = supabase
//       .channel("realtime:messages")
//       .on(
//         "postgres_changes",
//         { event: "INSERT", schema: "public", table: "messages" },
//         (payload) => {
//           const msg = payload.new;
//           const isForThisChat =
//             (msg.sender_id === user.id && msg.receiver_id === selectedUser.id) ||
//             (msg.sender_id === selectedUser.id && msg.receiver_id === user.id);
//           if (isForThisChat) {
//             setMessages((prev) => [...prev, msg]);
//           }
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [selectedUser, user.id]);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = async () => {
//     if (!newMsg.trim()) return;
//     await supabase.from("messages").insert([
//       {
//         sender_id: user.id,
//         receiver_id: selectedUser.id,
//         content: newMsg,
//       },
//     ]);
//     setNewMsg("");
//   };

//   const deleteMessage = async (id) => {
//     await supabase.from("messages").delete().eq("id", id);
//     setMessages((prev) => prev.filter((msg) => msg.id !== id));
//   };

//   const getAvatar = (avatar_url, name, email) => {
//     const displayName = name || email?.split("@")[0] || "User";
//     return (
//       avatar_url ||
//       `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`
//     );
//   };

//   const formatTime = (timestamp) => {
//     if (!timestamp) return "";
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString(undefined, {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   return (
//     <div className="messages-page">
//       {/* Sidebar */}
//       <div className={`user-list ${selectedUser ? "mobile-hide" : ""}`}>
//         <h3>Contacts</h3>
//         {users.map((u) => (
//           <div
//             key={u.id}
//             className={`user-item ${selectedUser?.id === u.id ? "active" : ""}`}
//             onClick={() => setSelectedUser(u)}
//           >
//             <img
//               src={getAvatar(u.avatar_url, u.name, u.email)}
//               alt={u.name || u.email}
//               className="user-avatar"
//             />
//             <span>{u.name || u.email}</span>
//           </div>
//         ))}
//       </div>

//       {/* Chat */}
//       <div className="chat-area">
//         {selectedUser ? (
//           <>
//             <div className="chat-header">
//               <img
//                 src="https://img.icons8.com/ios-filled/24/back.png"
//                 alt="Back"
//                 className="icon back-icon"
//                 onClick={() => setSelectedUser(null)}
//               />
//               <img
//                 src={getAvatar(
//                   selectedUser.avatar_url,
//                   selectedUser.name,
//                   selectedUser.email
//                 )}
//                 alt="avatar"
//                 className="user-avatar"
//               />
//               <h4>{selectedUser.name || selectedUser.email}</h4>
//             </div>

//             <div className="chat-messages">
//               {messages.map((msg) => (
//                 <div
//                   key={msg.id}
//                   className={`message ${msg.sender_id === user.id ? "sent" : "received"}`}
//                   onContextMenu={(e) => {
//                     e.preventDefault();
//                     if (msg.sender_id === user.id && window.confirm("Delete this message?")) {
//                       deleteMessage(msg.id);
//                     }
//                   }}
//                 >
//                   <div className="bubble">{msg.content}</div>
//                   <div
//                     className="timestamp"
//                     title={new Date(msg.created_at).toLocaleString()}
//                   >
//                     {formatTime(msg.created_at)} {msg.sender_id === user.id ? "✅" : ""}
//                   </div>
//                 </div>
//               ))}
//               <div ref={chatEndRef}></div>
//             </div>

//             <div className="chat-input">
//               <input
//                 type="text"
//                 value={newMsg}
//                 placeholder="Type a message..."
//                 onChange={(e) => setNewMsg(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//               />
//               <button className="send-btn" onClick={sendMessage}>
//                 <img
//                   src="https://img.icons8.com/ios-filled/24/FFFFFF/sent.png"
//                   alt="Send"
//                   className="icon send-icon"
//                 />{" "}
//                 Send
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="chat-placeholder">Select a user to start chatting</div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Messages;

















// import { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";
// import "../styles/Messages.css";

// const Messages = ({ user }) => {
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMsg, setNewMsg] = useState("");

//   useEffect(() => {
//     const fetchUsers = async () => {
//       const { data, error } = await supabase
//         .from("profiles")
//         .select("id, name, email, avatar_url")
//         .neq("id", user.id);

//       if (!error) setUsers(data);
//     };

//     fetchUsers();
//   }, [user.id]);

//   useEffect(() => {
//     if (!selectedUser) return;

//     const fetchMessages = async () => {
//       const { data, error } = await supabase
//         .from("messages")
//         .select("*")
//         .or(
//           `and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`
//         )
//         .order("created_at", { ascending: true });

//       if (!error) setMessages(data);
//     };

//     fetchMessages();
//   }, [selectedUser, user.id]);

//   useEffect(() => {
//     if (!selectedUser) return;

//     const channel = supabase
//       .channel("realtime:messages")
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "messages",
//         },
//         (payload) => {
//           const msg = payload.new;
//           const isRelevant =
//             (msg.sender_id === user.id && msg.receiver_id === selectedUser.id) ||
//             (msg.sender_id === selectedUser.id && msg.receiver_id === user.id);

//           if (isRelevant) {
//             setMessages((prev) => [...prev, msg]);
//           }
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [selectedUser, user.id]);

//   const sendMessage = async () => {
//     if (!newMsg.trim()) return;

//     const { error } = await supabase.from("messages").insert([
//       {
//         sender_id: user.id,
//         receiver_id: selectedUser.id,
//         content: newMsg,
//       },
//     ]);

//     if (!error) setNewMsg("");
//   };

//   const getAvatar = (avatar_url, name, email) => {
//     const displayName = name || email?.split("@")[0] || "User";
//     return (
//       avatar_url ||
//       `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`
//     );
//   };

//   return (
//     <div className="messages-page">
//       {/* User List */}
//       {!selectedUser ? (
//         <div className="user-list">
//           <h3>Chats</h3>
//           {users.map((u) => (
//             <div
//               key={u.id}
//               className="user-item"
//               onClick={() => setSelectedUser(u)}
//             >
//               <img
//                 src={getAvatar(u.avatar_url, u.name, u.email)}
//                 alt={u.name || u.email}
//                 className="user-avatar"
//               />
//               <span>{u.name || u.email}</span>
//             </div>
//           ))}
//         </div>
//       ) : (
//         // Chat Area
//         <div className="chat-area">
//           <div className="chat-header">
//             <button className="back-button" onClick={() => setSelectedUser(null)}>
//               ⬅ Back
//             </button>
//             <h4>{selectedUser.name || selectedUser.email}</h4>
//           </div>

//           <div className="chat-messages">
//             {messages.map((msg) => (
//               <div
//                 key={msg.id}
//                 className={`message ${msg.sender_id === user.id ? "sent" : "received"}`}
//               >
//                 {msg.content}
//               </div>
//             ))}
//           </div>

//           <div className="chat-input">
//             <input
//               type="text"
//               value={newMsg}
//               placeholder="Type a message..."
//               onChange={(e) => setNewMsg(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//             />
//             <button onClick={sendMessage}>Send</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Messages;
