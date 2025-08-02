import React from "react";
import "../styles/Header.css";
import { useNavigate } from "react-router-dom";

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="menu-icon" onClick={toggleSidebar}>☰</div>
      <div className="app-name">EducTrack</div>
      <div className="profile" onClick={() => navigate("/profile")}>
        <img src="/images/profile.png" alt="Profile" />
      </div>
    </header>
  );
};

export default Header;
