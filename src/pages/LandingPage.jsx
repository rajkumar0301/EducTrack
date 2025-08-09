// src/pages/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaTasks, FaChalkboardTeacher, FaCloudUploadAlt } from "react-icons/fa";
import "../styles/LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landing-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-content">
          <h1 className="logo">EduTrack</h1>
          <nav>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-btn">Get Started</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h2>Smart Education Platform</h2>
        <p>
          Track your attendance, manage tasks, and check your progress — all in one place.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn-primary">Get Started</Link>
          <Link to="/login" className="btn-outline">Login</Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature-card">
          <FaChalkboardTeacher className="feature-icon" />
          <h3>Attendance Tracking</h3>
          <p>Keep a close eye on your attendance and never miss a class.</p>
        </div>
        <div className="feature-card">
          <FaCloudUploadAlt className="feature-icon" />
          <h3>File Upload</h3>
          <p>Easily upload and access your study materials anytime.</p>
        </div>
        <div className="feature-card">
          <FaTasks className="feature-icon" />
          <h3>Task Management</h3>
          <p>Organize and track your assignments efficiently.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        © {new Date().getFullYear()} EduTrack — Smart Education Platform
      </footer>
    </div>
  );
}


