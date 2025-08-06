import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/Messages.css";

const ContactList = ({ user, onSelectUser }) => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id);
      if (data) setContacts(data);
    };
    fetchContacts();
  }, [user]);

  return (
    <div className="contact-list-wrapper">
      <h2>Contacts</h2>
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="contact-item"
          onClick={() => onSelectUser(contact)}
        >
          <img src={contact.avatar_url || "/default-avatar.png"} alt="Avatar" />
          <div>
            <p>{contact.full_name || contact.email}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactList;






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

