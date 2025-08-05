// src/components/FriendRequests.jsx
import React from "react";
import "../styles/FriendRequests.css";

const FriendRequests = ({ requests = [], onAccept, onReject }) => {
  return (
    <div className="friend-requests">
      <h3>
        <img
          src="https://img.icons8.com/color/32/add-user-group-man-man.png"
          alt="Friend Requests"
        />{" "}
        Friend Requests
      </h3>

      {requests.length === 0 ? (
        <p className="empty">No pending friend requests.</p>
      ) : (
        requests.map((req) => (
          <div key={req.id} className="request-card">
            <img
              className="avatar"
              src={
                req.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  req.name || req.email
                )}&background=random`
              }
              alt={req.name || req.email}
            />
            <div className="info">
              <h4>{req.name || req.email}</h4>
            </div>
            <div className="actions">
              <button className="accept" onClick={() => onAccept(req.id)}>
                <img
                  src="https://img.icons8.com/color/24/ok--v1.png"
                  alt="Accept"
                />{" "}
                Accept
              </button>
              <button className="reject" onClick={() => onReject(req.id)}>
                <img
                  src="https://img.icons8.com/color/24/delete-sign.png"
                  alt="Reject"
                />{" "}
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FriendRequests;
