import React, { useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = ({ showSidebar, setShowSidebar, handleLogout, userEmail }) => {
  const sidebarRef = useRef();

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

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const iconStyle = {
    width: "22px",
    height: "22px",
    marginRight: "12px",
    verticalAlign: "middle",
    transition: "transform 0.3s ease",
  };

  return (
    <aside ref={sidebarRef} className={`sidebar ${showSidebar ? "open" : ""}`}>
      <div className="sidebar-top">
        <p className="user-email">{userEmail}</p>
      </div>

      <div className="sidebar-menu">
        <NavLink to="/" onClick={handleLinkClick}>
          <img src="https://img.icons8.com/color/48/home--v1.png" alt="Home" style={iconStyle} />
          Home
        </NavLink>
        <NavLink to="/classes" onClick={handleLinkClick}>
          <img src="https://img.icons8.com/color/48/classroom.png" alt="Classes" style={iconStyle} />
          Classes
        </NavLink>
        <NavLink to="/tasks" onClick={handleLinkClick}>
          <img src="https://img.icons8.com/color/48/todo-list.png" alt="Tasks" style={iconStyle} />
          Tasks
        </NavLink>
        <NavLink to="/groups" onClick={handleLinkClick}>
          <img src="https://img.icons8.com/color/48/conference-call.png" alt="Groups" style={iconStyle} />
          Groups
        </NavLink>
        <NavLink to="/messages" onClick={handleLinkClick}>
          <img src="https://img.icons8.com/color/48/speech-bubble.png" alt="Messages" style={iconStyle} />
          Messages
        </NavLink>
        <NavLink to="/CGPAChecker" onClick={handleLinkClick}>
          <img src="https://img.icons8.com/color/48/report-card.png" alt="CGPA Checker" style={iconStyle} />
          CGPA Checker
        </NavLink>
        <NavLink to="/PercentageChecker" onClick={handleLinkClick}>
          <img src="https://img.icons8.com/color/48/percentage.png" alt="Percentage" style={iconStyle} />
          Percentage Checker
        </NavLink>
        <NavLink to="/upload" onClick={handleLinkClick}>
          <img src="https://img.icons8.com/color/48/upload-to-cloud.png" alt="Documents" style={iconStyle} />
          Documents
        </NavLink>
        <NavLink to="/settings" onClick={handleLinkClick}>
          <img src="https://img.icons8.com/color/48/settings--v1.png" alt="Settings" style={iconStyle} />
          Settings
        </NavLink>
      </div>

      <div className="sidebar-bottom">
        <button onClick={handleLogout}>
          <img src="https://img.icons8.com/color/48/logout-rounded-up.png" alt="Logout" style={iconStyle} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
