// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import "../styles/Auth.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          mobile,
        },
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Registered successfully!");
      navigate("/login");
    }
  };

  return (
    <div className="auth-container">
      <Toaster />
      <div className="auth-box">
        <h2>Register</h2>
        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} />
        <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleRegister}>Sign Up</button>
        <p>Already have an account? <span onClick={() => navigate("/login")}>Login</span></p>
      </div>
    </div>
  );
};

export default Register;
