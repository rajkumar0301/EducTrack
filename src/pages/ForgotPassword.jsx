import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/forget.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/update-password",
    });

    if (error) {
      setMessage("Error sending reset link. Try again.");
    } else {
      setMessage("Reset link sent! Check your email.");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleReset} className="auth-card">
        <h2>Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
        {message && <p className="auth-message">{message}</p>}
      </form>
    </div>
  );
};

export default ForgotPassword;




