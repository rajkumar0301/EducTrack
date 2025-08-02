import React, { useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = ({ showSidebar, setShowSidebar, handleLogout, userEmail }) => {
  const sidebarRef = useRef();

  // Click outside to close (already added)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showSidebar &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        window.innerWidth < 768
      ) {
        setShowSidebar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSidebar, setShowSidebar]);

  // ✅ Helper to auto-close sidebar on link click (on mobile)
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  return (
    <aside ref={sidebarRef} className={`sidebar ${showSidebar ? "open" : ""}`}>
      <div className="sidebar-top">
        <p className="user-email">{userEmail}</p>
      </div>

      <div className="sidebar-menu">
        <NavLink to="/" onClick={handleLinkClick}>🏠 Home</NavLink>
        {/* <NavLink to="/documents" onClick={handleLinkClick}>📁 Documents</NavLink> */}
        <NavLink to="/classes" onClick={handleLinkClick}>🏫 Classes</NavLink>
        <NavLink to="/tasks" onClick={handleLinkClick}>📝 Tasks</NavLink>
        <NavLink to="/groups" onClick={handleLinkClick}>👥 Groups</NavLink>
        <NavLink to="/messages" onClick={handleLinkClick}>💬 Messages</NavLink>
        <NavLink to="/CGPAChecker" onClick={handleLinkClick}>🎓 CGPA Checker</NavLink>
        <NavLink to="/percentage" onClick={handleLinkClick}>📐 Percentage Checker</NavLink>
        <NavLink to="/upload" onClick={handleLinkClick}>📁 Documents</NavLink>
        <NavLink to="/settings" onClick={handleLinkClick}>⚙️ Settings</NavLink>
      </div>

      <div className="sidebar-bottom">
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;
