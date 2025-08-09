// src/pages/LandingPage.jsx
import React, { useState } from "react";
import "../styles/LandingPage.css";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">EduTrack</div>
        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#testimonials">Testimonials</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div className={`hamburger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-text">
          <h1>Track. Learn. Succeed.</h1>
          <p>EduTrack is your smart companion for managing classes, grades, attendance, and more.</p>
          <button className="cta-btn">Get Started</button>
        </div>
        <div className="hero-img">
          <img src="/hero-placeholder.jpg" alt="EduTrack" />
        </div>
      </section>

      {/* About */}
      <section id="about" className="about">
        <h2>About Us</h2>
        <p>
          EduTrack is built for students and educators to streamline academic life. 
          With a clean interface and powerful features, it's your all-in-one education hub.
        </p>
      </section>

      {/* Features */}
      <section id="features" className="features">
        <h2>Features</h2>
        <div className="feature-grid">
          <div className="feature-card">📅 Class Scheduling</div>
          <div className="feature-card">📊 CGPA & Percentage Checker</div>
          <div className="feature-card">📂 File Upload & Notes</div>
          <div className="feature-card">💬 Messaging</div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonial-slider">
          <div className="testimonial">"EduTrack changed my academic life!" – Aditi</div>
          <div className="testimonial">"Simple, fast, and effective." – Rahul</div>
          <div className="testimonial">"Keeps me organized every semester." – Priya</div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="contact">
        <h2>Contact Us</h2>
        <form>
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Message" required></textarea>
          <button type="submit">Send</button>
        </form>
      </section>

      {/* Footer */}
      <footer>
        <p>© 2025 EduTrack. All rights reserved.</p>
        <div className="socials">
          <a href="#">🌐</a>
          <a href="#">🐦</a>
          <a href="#">📘</a>
        </div>
      </footer>
    </div>
  );
}