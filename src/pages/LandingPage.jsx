import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/LandingPage.css";

const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">EduTrack</div>
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
        <div
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <h1>Smart Learning, Simplified</h1>
        <p>
          Manage attendance, tasks, classes, and academic progress – all in one place.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn primary">Get Started</Link>
          <Link to="/login" className="btn secondary">Login</Link>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="why-choose">
        <h2>Why Choose EduTrack?</h2>
        <div className="slider">
          <div className="slider-track">
            <div className="card">📅 Attendance Tracking</div>
            <div className="card">📂 File Upload</div>
            <div className="card">✅ Task Management</div>
            <div className="card">📊 CGPA & Percentage Checker</div>
            <div className="card">💬 Messaging</div>
            <div className="card">⚙️ Easy Settings</div>
            {/* Duplicate for seamless loop */}
            <div className="card">📅 Attendance Tracking</div>
            <div className="card">📂 File Upload</div>
            <div className="card">✅ Task Management</div>
            <div className="card">📊 CGPA & Percentage Checker</div>
            <div className="card">💬 Messaging</div>
            <div className="card">⚙️ Easy Settings</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} EduTrack. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;;


