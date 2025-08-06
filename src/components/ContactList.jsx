import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '@supabase/auth-helpers-react';

const ContactList = ({ onSelectUser }) => {
  const { user } = useUser();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');
      const filtered = data?.filter((u) => u.id !== user?.id);
      setUsers(filtered || []);
    };

    fetchUsers();
  }, [user]);

  return (
    <div className="overflow-y-auto p-2">
      {users.map((u) => (
        <div
          key={u.id}
          onClick={() => onSelectUser(u)}
          className="p-2 hover:bg-blue-100 cursor-pointer rounded"
        >
          {u.email}
        </div>
      ))}
    </div>
  );
};

export default ContactList;




// import React, { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";
// import "../styles/ContactList.css";

// const ContactList = ({ onUserSelect }) => {
//   const [users, setUsers] = useState([]);

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     const { data, error } = await supabase.auth.admin.listUsers();

//     if (error) {
//       console.error("Error fetching users:", error);
//     } else {
//       setUsers(data.users);
//     }
//   };

//   return (
//     <div className="contact-list">
//       <h3>Contacts</h3>
//       {users.map((user) => (
//         <div
//           key={user.id}
//           className="contact-item"
//           onClick={() => onUserSelect(user)}
//         >
//           {user.email}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ContactList;






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

