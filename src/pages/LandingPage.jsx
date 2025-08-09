import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">EduTrack</div>
        <nav>
          <ul>
            <li onClick={() => navigate("/")}>Home</li>
            <li onClick={() => navigate("/about")}>About</li>
            <li onClick={() => navigate("/contact")}>Contact</li>
            <li>
              <button
                className="login-btn"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>Smart Education Platform for Modern Learning 📚</h1>
          <p>
            Track your classes, assignments, and performance all in one place.
            Join EduTrack today and make learning more organized and fun.
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate("/register")}>Get Started</button>
            <button className="outline" onClick={() => navigate("/about")}>
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://via.placeholder.com/500x350"
            alt="EduTrack illustration"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose EduTrack?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>📅 Attendance Tracking</h3>
            <p>Keep a perfect record of your class attendance with ease.</p>
          </div>
          <div className="feature-card">
            <h3>📁 File Management</h3>
            <p>Upload and organize study materials in one secure location.</p>
          </div>
          <div className="feature-card">
            <h3>✅ Task Management</h3>
            <p>Stay ahead with task deadlines and progress tracking.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} EduTrack. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;


