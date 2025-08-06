import React, { useState } from "react";
import "../styles/Auth.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const UpdatePassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirm = () => setShowConfirm((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error("Password update failed:", error.message);
      alert("Session expired or invalid link. Please try resetting again.");
    } else {
      alert("Password updated successfully!");

      // logout after update
      await supabase.auth.signOut();

      // redirect to login page
      navigate("/login");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Set New Password</h2>

        <div className="input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span onClick={togglePassword} className="icon">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="input-wrapper">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <span onClick={toggleConfirm} className="icon">
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit">Update Password</button>
      </form>
    </div>
  );
};

export default UpdatePassword;





