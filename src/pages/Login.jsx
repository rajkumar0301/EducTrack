import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import "../styles/Auth.css";
import loginImage from "../assets/auth-illustration.png"; // your uploaded image

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
    <div className="auth-wrapper">
      <Toaster />
      <div className="auth-image">
        <img src={loginImage} alt="Login" />
      </div>
      <div className="auth-content">
        <h2>Welcome Back</h2>
        <p className="auth-tagline">Continue your learning adventure with EduTrack.</p>
        <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <div className="forgot-password">
          <span onClick={() => navigate("/forgot-password")}>Forgot Password?</span>
        </div>

        <button className="auth-btn" onClick={handleLogin}>Login</button>
        <p>Don't have an account? <span onClick={() => navigate("/register")}>Register</span></p>
      </div>
    </div>
  );
};

export default Login;







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
//     const { error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
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
//         <input
//           type="email"
//           placeholder="Email Address"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
        
//         {/* Forgot Password link */}
//         <div className="forgot-password">
//           <span onClick={() => navigate("/forgot-password")}>
//             Forgot Password?
//           </span>
//         </div>

//         <button onClick={handleLogin}>Login</button>
//         <p>
//           Don't have an account?{" "}
//           <span onClick={() => navigate("/register")}>Register</span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;














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
