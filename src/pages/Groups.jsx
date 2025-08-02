import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/groups.css";

const Groups = ({ currentUser, onSelectGroup }) => {
  const [groups, setGroups] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  useEffect(() => {
    if (currentUser?.id) {
      fetchGroups();
      fetchMemberships();
    }
  }, [currentUser]);

  const fetchGroups = async () => {
    const { data } = await supabase.from("groups").select("*");
    if (data) setGroups(data);
  };

  const fetchMemberships = async () => {
    const { data } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", currentUser.id);
    if (data) setMemberships(data.map((m) => m.group_id));
  };

  const isMember = (groupId) => memberships.includes(groupId);

  const handleJoin = async (groupId) => {
    await supabase.from("group_members").insert([
      { user_id: currentUser.id, group_id: groupId },
    ]);
    await updateLastSelected(groupId);
    fetchMemberships();
  };

  const handleLeave = async (groupId) => {
    await supabase
      .from("group_members")
      .delete()
      .eq("user_id", currentUser.id)
      .eq("group_id", groupId);
    fetchMemberships();
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    const { data, error } = await supabase
      .from("groups")
      .insert([{ name: newGroupName, creator_id: currentUser.id }])
      .select()
      .single();
    if (!error && data) {
      await handleJoin(data.id);
      fetchGroups();
      setNewGroupName("");
      setShowModal(false);
    }
  };

  const handleSelect = async (groupId) => {
    await updateLastSelected(groupId);
    onSelectGroup(groupId);
  };

  const updateLastSelected = async (groupId) => {
    await supabase
      .from("profiles")
      .update({ last_selected_group_id: groupId })
      .eq("id", currentUser.id);
  };

  const handleDeleteGroup = async (groupId) => {
    const confirmed = window.confirm("Are you sure you want to delete this group?");
    if (!confirmed) return;
    await supabase.from("groups").delete().eq("id", groupId);
    await supabase.from("group_members").delete().eq("group_id", groupId);
    fetchGroups();
    fetchMemberships();
  };

  if (!currentUser?.id) {
    return <div className="groups-container">🔒 Please log in to manage groups.</div>;
  }

  return (
    <div className="groups-container">
      <h2>👥 Groups</h2>
      <button className="create-btn" onClick={() => setShowModal(true)}>
        ➕ Create Group
      </button>

      <div className="group-list">
        {groups.map((group) => (
          <div className="group-card" key={group.id}>
            <h3>{group.name}</h3>
            <div className="group-actions">
              {isMember(group.id) ? (
                <>
                  <button onClick={() => handleSelect(group.id)}>➡️ Enter</button>
                  <button className="leave" onClick={() => handleLeave(group.id)}>
                    Leave
                  </button>
                </>
              ) : (
                <button onClick={() => handleJoin(group.id)}>Join</button>
              )}

              {/* Only show delete if current user is creator */}
              {group.creator_id === currentUser.id && (
                <button className="delete" onClick={() => handleDeleteGroup(group.id)}>
                  🗑 Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Create New Group</h3>
            <input
              type="text"
              placeholder="Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handleCreateGroup}>Create</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
