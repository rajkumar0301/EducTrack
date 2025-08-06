import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import "../styles/Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Login successful!");
      navigate("/");
    }
  };

  return (
    <div className="auth-container">
      <Toaster />
      <div className="auth-box">
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        {/* Forgot Password link */}
        <div className="forgot-password">
          <span onClick={() => navigate("/forgot-password")}>
            Forgot Password?
          </span>
        </div>

        <button onClick={handleLogin}>Login</button>
        <p>
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>
    </div>
  );
};

export default Login;














// // src/pages/Login.jsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../supabaseClient";
// import toast, { Toaster } from "react-hot-toast";
// import "../styles/Auth.css";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();
//   const handleLogin = async () => {
//   const { error } = await supabase.auth.signInWithPassword({
//     email,
//     password,
//     });

//     if (error) {
//       toast.error(error.message);
//     } else {
//       toast.success("Login successful!");
//       navigate("/");
//     }
//   };

//   return (
//     <div className="auth-container">
//       <Toaster />
//       <div className="auth-box">
//         <h2>Login</h2>
//         <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
//         <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
//         <button onClick={handleLogin}>Login</button>
//         <p>Don't have an account? <span onClick={() => navigate("/register")}>Register</span></p>
//       </div>
//     </div>
//   );
// };

// export default Login;
