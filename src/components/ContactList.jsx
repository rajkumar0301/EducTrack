// src/components/ContactList.jsx
import React from "react";
import "../styles/ContactList.css";

const ContactList = ({ users, selectedUser, setSelectedUser }) => {
  return (
    <div className="contact-list">
      <h3>Chats</h3>
      {users.map((user) => (
        <div
          key={user.id}
          className={`contact-item ${selectedUser?.id === user.id ? "active" : ""}`}
          onClick={() => setSelectedUser(user)}
        >
          <img src={user.avatar_url || "/default-avatar.png"} alt={user.name} />
          <span>{user.name}</span>
        </div>
      ))}
    </div>
  );
};

export default ContactList;

