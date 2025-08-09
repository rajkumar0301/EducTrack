import React, { useState } from "react";
import "../styles/LandingPage.css";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">EduTrack</div>
        <ul className={menuOpen ? "nav-links open" : "nav-links"}>
          <li><a href="#home" onClick={() => setMenuOpen(false)}>Home</a></li>
          <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
          <li><a href="#features" onClick={() => setMenuOpen(false)}>Features</a></li>
          <li><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></li>
        </ul>
        <div
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span><span></span><span></span>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h1>Track. Learn. Succeed.</h1>
          <p>Your smart education companion — manage tasks, classes, and performance in one place.</p>
          <a href="/register" className="btn-primary">Get Started</a>
        </div>
        <div className="hero-img">
          <img src="/hero-image.png" alt="EduTrack" />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <h2>About Us</h2>
        <p>
          EduTrack is designed for students and educators to streamline learning and teaching experiences.
          From attendance to assignments, we bring everything to your fingertips.
        </p>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <h2>Features</h2>
        <div className="feature-cards">
          <div className="card">
            <h3>Task Management</h3>
            <p>Stay on top of deadlines with smart reminders.</p>
          </div>
          <div className="card">
            <h3>Attendance Tracking</h3>
            <p>Monitor your attendance easily and efficiently.</p>
          </div>
          <div className="card">
            <h3>Grade Analytics</h3>
            <p>Check CGPA and percentage instantly with visual reports.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <h2>Contact Us</h2>
        <form>
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" required></textarea>
          <button type="submit">Send Message</button>
        </form>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} EduTrack. All rights reserved.</p>
      </footer>
    </div>
  );
}