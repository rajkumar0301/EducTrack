// src/components/ContactList.jsx
import React, { useState } from "react";
import "../styles/ContactList.css";

const ContactList = ({
  users = [],
  friendRequests = [],
  selectedUser,
  setSelectedUser,
  onSendRequest,
  onAcceptRequest,
  onRejectRequest,
  friends = [],
  requestsSent = [],
}) => {
  const [activeTab, setActiveTab] = useState("chats");

  const isFriend = (id) => friends.includes(id);
  const isRequested = (id) => requestsSent.includes(id);

  const getAvatar = (avatar_url, name, email) => {
    const displayName = name || email?.split("@")[0] || "User";
    return (
      avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`
    );
  };

  return (
    <div className="contact-list">
      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "chats" ? "active" : ""}
          onClick={() => setActiveTab("chats")}
        >
          <img src="https://img.icons8.com/color/24/speech-bubble.png" alt="Chats" />
          Chats
        </button>
        <button
          className={activeTab === "requests" ? "active" : ""}
          onClick={() => setActiveTab("requests")}
        >
          <img src="https://img.icons8.com/color/24/add-user-group-man-man.png" alt="Requests" />
          Requests
        </button>
      </div>

      {/* Chats Tab */}
      {activeTab === "chats" ? (
        <>
          {users.map((user) => (
            <div
              key={user.id}
              className={`contact-item ${selectedUser?.id === user.id ? "active" : ""}`}
            >
              <img
                src={getAvatar(user.avatar_url, user.name, user.email)}
                alt={user.name || user.email}
              />
              <span>{user.name || user.email}</span>

              {/* Chat / Add / Requested Button */}
              {isFriend(user.id) ? (
                <button onClick={() => setSelectedUser(user)} title="Start chat">
                  <img src="https://img.icons8.com/color/24/chat.png" alt="Chat" />
                  Chat
                </button>
              ) : isRequested(user.id) ? (
                <button disabled className="requested-btn">Requested</button>

              ) : (
                <button onClick={() => onSendRequest(user.id)}>Add</button>

              )}
            </div>
          ))}
        </>
      ) : (
        // Requests Tab
        <>
          {friendRequests.length === 0 ? (
            <p className="empty-requests">No incoming requests.</p>
          ) : (
            friendRequests.map((req) => (
              <div key={req.id} className="contact-item">
                <img
                  src={getAvatar(req.avatar_url, req.name, req.email)}
                  alt={req.name || req.email}
                />
                <span>{req.name || req.email}</span>
                <div className="request-actions">
                  <button onClick={() => onAcceptRequest(req.id)} title="Accept Request">
                    <img src="https://img.icons8.com/color/24/ok--v1.png" alt="Accept" />
                    Accept
                  </button>
                  <button onClick={() => onRejectRequest(req.id)} title="Reject Request">
                    <img src="https://img.icons8.com/color/24/delete-sign.png" alt="Reject" />
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default ContactList;










// // src/components/ContactList.jsx
// import React from "react";
// import "../styles/ContactList.css";

// const ContactList = ({ users, selectedUser, setSelectedUser }) => {
//   return (
//     <div className="contact-list">
//       <h3>Chats</h3>
//       {users.map((user) => (
//         <div
//           key={user.id}
//           className={`contact-item ${selectedUser?.id === user.id ? "active" : ""}`}
//           onClick={() => setSelectedUser(user)}
//         >
//           <img src={user.avatar_url || "/default-avatar.png"} alt={user.name} />
//           <span>{user.name}</span>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ContactList;

