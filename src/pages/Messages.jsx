import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import "../styles/Messages.css";

const Messages = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const chatEndRef = useRef(null);

  // Fetch user list
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

  // Fetch messages when a user is selected
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

  // Real-time updates
  useEffect(() => {
    if (!selectedUser) return;
    const channel = supabase
      .channel("realtime:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;
          const isForThisChat =
            (msg.sender_id === user.id && msg.receiver_id === selectedUser.id) ||
            (msg.sender_id === selectedUser.id && msg.receiver_id === user.id);
          if (isForThisChat) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser, user.id]);

  // Auto scroll to bottom on new messages
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

  const deleteMessage = async (id) => {
    await supabase.from("messages").delete().eq("id", id);
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
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
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="messages-page">
      {/* Sidebar */}
      <div className={`user-list ${selectedUser ? "mobile-hide" : ""}`}>
        <h3>Contacts</h3>
        {users.map((u) => (
          <div
            key={u.id}
            className={`user-item ${selectedUser?.id === u.id ? "active" : ""}`}
            onClick={() => setSelectedUser(u)}
          >
            <img
              src={getAvatar(u.avatar_url, u.name, u.email)}
              alt={u.name || u.email}
              className="user-avatar"
            />
            <span>{u.name || u.email}</span>
          </div>
        ))}
      </div>

      {/* Chat */}
      <div className="chat-area">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <img
                src="https://img.icons8.com/ios-filled/24/back.png"
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
                  className={`message ${msg.sender_id === user.id ? "sent" : "received"}`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (msg.sender_id === user.id && window.confirm("Delete this message?")) {
                      deleteMessage(msg.id);
                    }
                  }}
                >
                  <div className="bubble">{msg.content}</div>
                  <div
                    className="timestamp"
                    title={new Date(msg.created_at).toLocaleString()}
                  >
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={newMsg}
                placeholder="Type a message..."
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button className="send-btn" onClick={sendMessage}>
                <img
                  src="https://img.icons8.com/ios-filled/24/FFFFFF/sent.png"
                  alt="Send"
                  className="icon send-icon"
                />
                <span>Send</span>
              </button>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">Select a user to start chatting</div>
        )}
      </div>
    </div>
  );
};

export default Messages;
