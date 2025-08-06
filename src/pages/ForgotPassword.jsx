import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/Auth.css";
import { FaLock } from "react-icons/fa";

const UpdatePassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Password updated. Please log in again.");
      await supabase.auth.signOut(); // clear session
      navigate("/login"); // redirect to login page
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleUpdate}>
        <h2>Set New Password</h2>

        <div className="input-wrapper">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="icon">
            <FaLock />
          </span>
        </div>

        <div className="input-wrapper">
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <span className="icon">
            <FaLock />
          </span>
        </div>

        <button type="submit">Update Password</button>
      </form>
    </div>
  );
};

export default UpdatePassword;




