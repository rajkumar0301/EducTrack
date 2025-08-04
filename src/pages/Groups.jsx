// src/pages/Groups.jsx
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useUser } from "../contexts/UserContext";
import "../styles/Groups.css";

const Groups = () => {
  const { user } = useUser();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [groupImage, setGroupImage] = useState(null);
  const [myGroups, setMyGroups] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [chatGroup, setChatGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [members, setMembers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [typingStatus, setTypingStatus] = useState("");
  const channelRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!user || !user.id || !groupName) return;

    let imageUrl = null;
    if (groupImage) {
      const fileExt = groupImage.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("group-images")
        .upload(fileName, groupImage);

      if (uploadError) return console.error("Image upload failed");
      imageUrl = supabase.storage.from("group-images").getPublicUrl(fileName).data.publicUrl;
    }

    const {group} = await supabase
      .from("groups")
      .insert([{ name: groupName, description, created_by: user.id, is_public: isPublic, image_url: imageUrl }])
      .select()
      .single();

    if (group) {
      await supabase.from("group_members").insert({ group_id: group.id, user_id: user.id, role: "admin" });
      setGroupName("");
      setDescription("");
      setGroupImage(null);
      fetchGroups();
      setShowCreateForm(false);
    }
  };

  const fetchGroups = async () => {
    if (!user) return;

    const { data: memberIds } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);

    const joinedIds = memberIds.map((g) => g.group_id);

    const { data: joinedGroups } = await supabase
      .from("groups")
      .select("*")
      .in("id", joinedIds);
    setMyGroups(joinedGroups || []);

    const { data: publicGroups } = await supabase
      .from("groups")
      .select("*")
      .eq("is_public", true)
      .not("id", "in", `(${joinedIds.join(",") || 0})`);
    setPublicGroups(publicGroups || []);
  };

  const handleJoin = async (groupId) => {
    if (!user) return;
    await supabase.from("group_members").insert({ group_id: groupId, user_id: user.id, role: "member" });
    fetchGroups();
  };

  const handleLeave = async (groupId) => {
    if (!user) return;
    await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", user.id);
    fetchGroups();
  };

  const handleDelete = async (groupId) => {
    await supabase.from("groups").delete().eq("id", groupId);
    fetchGroups();
  };

  const openChat = async (group) => {
    if (!user) return;
    setChatGroup(group);
    setMessages([]);
    setTypingStatus("");

    const { data } = await supabase
      .from("messages")
      .select("*, sender:profiles(name)")
      .eq("group_id", group.id)
      .order("created_at", { ascending: true });
    setMessages(data || []);

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    channelRef.current = supabase
      .channel(`group-chat-${group.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async (payload) => {
        if (payload.new.group_id === group.id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", payload.new.sender_id)
            .single();
          const messageWithName = { ...payload.new, sender: profile };
          setMessages((prev) => [...prev, messageWithName]);
        }
      })
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.user !== user.id) {
          setTypingStatus("Someone is typing...");
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setTypingStatus(""), 1500);
        }
      })
      .subscribe();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    await supabase.from("messages").insert({ group_id: chatGroup.id, sender_id: user.id, content: newMessage });
    setNewMessage("");
  };

  const handleTyping = () => {
    if (!chatGroup || !user) return;
    supabase.channel(`group-chat-${chatGroup.id}`).send({ type: "broadcast", event: "typing", payload: { user: user.id } });
  };

  const viewMembers = async (groupId) => {
    const { data } = await supabase
      .from("group_members")
      .select("role, profiles(name, email)")
      .eq("group_id", groupId);
    setMembers(data.map((m) => ({ ...m.profiles, role: m.role })));
  };

  useEffect(() => {
    if (user) fetchGroups();
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [user]);

  return (
    <div className="groups-page">
      <h2>Groups</h2>

      {showCreateForm && (
        <form className="create-group-form" onSubmit={handleCreateGroup}>
          <input type="text" placeholder="Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)} required />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <label>
            <input type="checkbox" checked={isPublic} onChange={() => setIsPublic(!isPublic)} /> Public Group
          </label>
          <input type="file" accept="image/*" onChange={(e) => setGroupImage(e.target.files[0])} />
          <button type="submit">Create Group</button>
        </form>
      )}

      <button className="fab" onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? "✖" : "+"}
      </button>

      <div className="group-section">
        <h3>My Groups</h3>
        <div className="group-list">
          {myGroups.map((g) => (
            <div className="group-card" key={g.id}>
              {g.image_url && <img src={g.image_url} alt="group" />}
              <h4>{g.name}</h4>
              <p>{g.description}</p>
              <div className="group-buttons">
                <button onClick={() => openChat(g)}>💬 Chat</button>
                <button onClick={() => viewMembers(g.id)}>👥 Members</button>
                <button onClick={() => handleLeave(g.id)}>Leave</button>
                {g.created_by === user?.id && <button onClick={() => handleDelete(g.id)}>🗑️ Delete</button>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="group-section">
        <h3>Explore Public Groups</h3>
        <input
          className="search-bar"
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="group-list">
          {publicGroups
            .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
            .map((g) => (
              <div className="group-card" key={g.id}>
                {g.image_url && <img src={g.image_url} alt="group" />}
                <h4>{g.name}</h4>
                <p>{g.description}</p>
                <div className="group-buttons">
                  <button onClick={() => handleJoin(g.id)}>Join</button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {chatGroup && (
        <div className="chat-modal">
          <h3>Chat - {chatGroup.name}</h3>
          <div className="chat-messages">
            {messages.map((m) => (
              <div key={m.id} className="chat-msg">
                <b>{m.sender_id === user?.id ? "You" : m.sender?.name || "Unknown"}</b>: {m.content}
              </div>
            ))}
            {typingStatus && <div className="typing-status">{typingStatus}</div>}
          </div>
          <div className="chat-input">
            <input
              value={newMessage}
              onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
            <button onClick={() => setChatGroup(null)}>Close</button>
          </div>
        </div>
      )}

      {members.length > 0 && (
        <div className="chat-modal">
          <h3>Group Members</h3>
          <ul>
            {members.map((m, i) => (
              <li key={i}>{m.name} - {m.email} {m.role === "admin" && <strong style={{ color: 'purple' }}> (Admin)</strong>}</li>
            ))}
          </ul>
          <button onClick={() => setMembers([])}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Groups;







// // src/pages/Groups.jsx
// import React, { useEffect, useState, useRef } from "react";
// import { supabase } from "../supabaseClient";
// import "../styles/Groups.css";

// const Groups = ({ user }) => {
//   const [groupName, setGroupName] = useState("");
//   const [description, setDescription] = useState("");
//   const [isPublic, setIsPublic] = useState(true);
//   const [groupImage, setGroupImage] = useState(null);
//   const [myGroups, setMyGroups] = useState([]);
//   const [publicGroups, setPublicGroups] = useState([]);
//   const [search, setSearch] = useState("");
//   const [chatGroup, setChatGroup] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [members, setMembers] = useState([]);
//   const channelRef = useRef(null);

//   const handleCreateGroup = async (e) => {
//     e.preventDefault();
//     if (!groupName) return;

//     let imageUrl = null;
//     if (groupImage) {
//       const fileExt = groupImage.name.split(".").pop();
//       const fileName = `${Date.now()}.${fileExt}`;
//       const { data, error: uploadError } = await supabase.storage
//         .from("group-images")
//         .upload(fileName, groupImage);

//       if (uploadError) return console.error("Image upload failed");
//       imageUrl = supabase.storage.from("group-images").getPublicUrl(fileName).data.publicUrl;
//     }

//     const { data: group, error } = await supabase
//       .from("groups")
//       .insert([{ name: groupName, description, created_by: user.id, is_public: isPublic, image_url: imageUrl }])
//       .select()
//       .single();

//     if (group) {
//       await supabase.from("group_members").insert({ group_id: group.id, user_id: user.id });
//       setGroupName("");
//       setDescription("");
//       setGroupImage(null);
//       fetchGroups();
//     }
//   };

//   const fetchGroups = async () => {
//     const { data: memberIds } = await supabase
//       .from("group_members")
//       .select("group_id")
//       .eq("user_id", user.id);

//     const joinedIds = memberIds.map((g) => g.group_id);

//     const { data: joinedGroups } = await supabase
//       .from("groups")
//       .select("*")
//       .in("id", joinedIds);
//     setMyGroups(joinedGroups || []);

//     const { data: publicGroups } = await supabase
//       .from("groups")
//       .select("*")
//       .eq("is_public", true)
//       .not("id", "in", `(${joinedIds.join(",") || 0})`);
//     setPublicGroups(publicGroups || []);
//   };

//   const handleJoin = async (groupId) => {
//     await supabase.from("group_members").insert({ group_id: groupId, user_id: user.id });
//     fetchGroups();
//   };

//   const handleLeave = async (groupId) => {
//     await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", user.id);
//     fetchGroups();
//   };

//   const handleDelete = async (groupId) => {
//     await supabase.from("groups").delete().eq("id", groupId);
//     fetchGroups();
//   };

//   const openChat = async (group) => {
//     setChatGroup(group);
//     setMessages([]);

//     const { data } = await supabase
//       .from("messages")
//       .select("*")
//       .eq("group_id", group.id)
//       .order("created_at", { ascending: true });
//     setMessages(data || []);

//     if (channelRef.current) {
//       supabase.removeChannel(channelRef.current);
//     }

//     channelRef.current = supabase
//       .channel(`group-chat-${group.id}`)
//       .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
//         if (payload.new.group_id === group.id) {
//           setMessages((prev) => [...prev, payload.new]);
//         }
//       })
//       .subscribe();
//   };

//   const sendMessage = async () => {
//     if (!newMessage.trim()) return;
//     await supabase.from("messages").insert({ group_id: chatGroup.id, sender_id: user.id, content: newMessage });
//     setNewMessage("");
//   };

//   const viewMembers = async (groupId) => {
//     const { data } = await supabase
//       .from("group_members")
//       .select("profiles(name, email)")
//       .eq("group_id", groupId);
//     setMembers(data.map((m) => m.profiles));
//   };

//   useEffect(() => {
//     if (user) fetchGroups();
//     return () => {
//       if (channelRef.current) supabase.removeChannel(channelRef.current);
//     };
//   }, [user]);

//   return (
//     <div className="groups-page">
//       <h2>Groups</h2>

//       <form className="create-group-form" onSubmit={handleCreateGroup}>
//         <input type="text" placeholder="Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)} required />
//         <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
//         <label>
//           <input type="checkbox" checked={isPublic} onChange={() => setIsPublic(!isPublic)} /> Public Group
//         </label>
//         <input type="file" accept="image/*" onChange={(e) => setGroupImage(e.target.files[0])} />
//         <button type="submit">Create Group</button>
//       </form>

//       <div className="group-section">
//         <h3>My Groups</h3>
//         <div className="group-list">
//           {myGroups.map((g) => (
//             <div className="group-card" key={g.id}>
//               {g.image_url && <img src={g.image_url} alt="group" />}
//               <h4>{g.name}</h4>
//               <p>{g.description}</p>
//               <div className="group-buttons">
//                 <button onClick={() => openChat(g)}>💬 Chat</button>
//                 <button onClick={() => viewMembers(g.id)}>👥 Members</button>
//                 <button onClick={() => handleLeave(g.id)}>Leave</button>
//                 {g.created_by === user.id && <button onClick={() => handleDelete(g.id)}>🗑️ Delete</button>}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="group-section">
//         <h3>Explore Public Groups</h3>
//         <input
//           className="search-bar"
//           placeholder="Search groups..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//         <div className="group-list">
//           {publicGroups
//             .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
//             .map((g) => (
//               <div className="group-card" key={g.id}>
//                 {g.image_url && <img src={g.image_url} alt="group" />}
//                 <h4>{g.name}</h4>
//                 <p>{g.description}</p>
//                 <div className="group-buttons">
//                   <button onClick={() => handleJoin(g.id)}>Join</button>
//                 </div>
//               </div>
//             ))}
//         </div>
//       </div>

//       {/* Chat Modal */}
//       {chatGroup && (
//         <div className="chat-modal">
//           <h3>Chat - {chatGroup.name}</h3>
//           <div className="chat-messages">
//             {messages.map((m) => (
//               <div key={m.id} className="chat-msg">
//                 <b>{m.sender_id === user.id ? "You" : m.sender_id}</b>: {m.content}
//               </div>
//             ))}
//           </div>
//           <div className="chat-input">
//             <input
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               placeholder="Type a message..."
//             />
//             <button onClick={sendMessage}>Send</button>
//             <button onClick={() => setChatGroup(null)}>Close</button>
//           </div>
//         </div>
//       )}

//       {/* Members Modal */}
//       {members.length > 0 && (
//         <div className="chat-modal">
//           <h3>Group Members</h3>
//           <ul>
//             {members.map((m, i) => (
//               <li key={i}>{m.name} - {m.email}</li>
//             ))}
//           </ul>
//           <button onClick={() => setMembers([])}>Close</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Groups;