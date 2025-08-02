import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import "../styles/messages.css";

const Messages = ({ currentUser, groupId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [members, setMembers] = useState([]);

  const scrollRef = useRef(null);

  // fetchMessages function
  const fetchMessages = async () => {
    if (!groupId) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  // fetchMembers function
  const fetchMembers = async () => {
    if (!groupId) return;
    const { data, error } = await supabase
      .from("group_members")
      .select("user_id, profiles(name, avatar_url)")
      .eq("group_id", groupId);
    if (data) setMembers(data);
  };

  // UseEffect to load messages & members + realtime subscription
  useEffect(() => {
    if (!currentUser?.id || !groupId) return;

    fetchMessages();
    fetchMembers();

    const channel = supabase
      .channel("realtime:messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === payload.new.id ? payload.new : msg))
            );
          } else if (payload.eventType === "DELETE") {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, groupId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing status subscription
  useEffect(() => {
    if (!groupId) return;

    const typingChannel = supabase
      .channel("typing")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "typing" },
        async () => {
          const { data } = await supabase
            .from("typing")
            .select("*")
            .eq("typing", true)
            .eq("group_id", groupId);
          setTypingUsers(data ? data.map((u) => u.user_id) : []);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(typingChannel);
  }, [groupId]);

  // Handle send, edit, delete, reaction, pin functions here (same as before)
  const handleSend = async () => {
    if (!input.trim()) return;

    if (editingId) {
      await supabase.from("messages").update({ content: input }).eq("id", editingId);
      setEditingId(null);
    } else {
      await supabase.from("messages").insert([
        {
          user_id: currentUser.id,
          group_id: groupId,
          content: input,
          reactions: {},
          pinned: false,
        },
      ]);
    }
    setInput("");
  };

  const handleDelete = async (id) => {
    await supabase.from("messages").delete().eq("id", id);
  };

  const handleEdit = (msg) => {
    setInput(msg.content);
    setEditingId(msg.id);
  };

  const handleReaction = async (msgId, emoji) => {
    const msg = messages.find((m) => m.id === msgId);
    const reactions = msg?.reactions || {};
    reactions[emoji] = reactions[emoji] ? reactions[emoji] + 1 : 1;
    await supabase.from("messages").update({ reactions }).eq("id", msgId);
  };

  const togglePin = async (msgId, pinned) => {
    await supabase.from("messages").update({ pinned: !pinned }).eq("id", msgId);
  };

  const handleTyping = () => {
    supabase.from("typing").upsert({
      user_id: currentUser.id,
      group_id: groupId,
      typing: true,
    });

    setTimeout(() => {
      supabase.from("typing").upsert({
        user_id: currentUser.id,
        group_id: groupId,
        typing: false,
      });
    }, 2000);
  };

  // Conditional rendering for user and group selection
  if (!currentUser?.id) {
    return <div className="chat-container">🔒 Please log in to use messages.</div>;
  }

  if (!groupId) {
    return <div className="chat-container">ℹ️ Select a group to view messages.</div>;
  }

  const visibleMessages = pinnedOnly ? messages.filter((msg) => msg.pinned) : messages;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 Group Chat</h2>
        <button onClick={() => setPinnedOnly(!pinnedOnly)}>
          {pinnedOnly ? "📃 All Messages" : "📌 Pinned Only"}
        </button>
      </div>

      <div className="chat-body">
        {/* Left: Message List */}
        <div className="message-panel">
          <div className="message-list">
            {visibleMessages.map((msg) => (
              <div className={`message ${msg.pinned ? "pinned" : ""}`} key={msg.id}>
                <div className="msg-header">
                  <span className="msg-user">
                    <img
                      src={`https://api.dicebear.com/6.x/thumbs/svg?seed=${msg.user_id}`}
                      className="avatar"
                      alt="avatar"
                    />
                    {msg.user_id === currentUser.id ? "You" : msg.user_id.slice(0, 6)}
                  </span>
                  <span className="msg-time">{new Date(msg.created_at).toLocaleString()}</span>
                </div>
                <p>{msg.content}</p>
                <div className="msg-actions">
                  {["👍", "❤️", "😄", "😢"].map((emoji) => (
                    <button key={emoji} onClick={() => handleReaction(msg.id, emoji)}>
                      {emoji} {msg.reactions?.[emoji] || 0}
                    </button>
                  ))}

                  <button onClick={() => togglePin(msg.id, msg.pinned)}>
                    {msg.pinned ? "📍Unpin" : "📌 Pin"}
                  </button>

                  {msg.user_id === currentUser.id && (
                    <>
                      <button onClick={() => handleEdit(msg)}>✏️ Edit</button>
                      <button onClick={() => handleDelete(msg.id)}>🗑 Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              {typingUsers.length === 1
                ? `${typingUsers[0].slice(0, 6)} is typing...`
                : "Multiple users are typing..."}
            </div>
          )}

          <div className="input-area">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleTyping}
            />
            <button onClick={handleSend}>{editingId ? "Update" : "Send"}</button>
          </div>
        </div>

        {/* Right: Members Sidebar */}
        <div className="member-panel">
          <h4>👥 Group Members</h4>
          {members.map((m) => (
            <div key={m.user_id} className="member">
              <img
                src={
                  m.profiles?.avatar_url ||
                  `https://api.dicebear.com/6.x/thumbs/svg?seed=${m.user_id}`
                }
                alt="avatar"
                className="avatar-small"
              />
              <span>{m.profiles?.name || m.user_id.slice(0, 6)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Messages;

