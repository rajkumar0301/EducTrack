// src/App.jsx
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Dashboard from "./pages/Dashboard";
import FileUpload from "./pages/FileUpload";
import Tasks from "./pages/Tasks";
import Classes from "./pages/Classes";
import CGPAChecker from "./pages/CGPAChecker";
import PercentageChecker from "./pages/PercentageChecker";
import Messages from "./pages/Messages";
import Attendance from "./pages/Attendance";
import MyProfile from "./pages/MyProfile";
import Settings from "./pages/Settings";
import { supabase } from "./supabaseClient";
import { UserProvider } from "./contexts/UserContext";
import LandingPage from "./pages/LandingPage";

const AppLayout = ({ toggleSidebar, showSidebar, setShowSidebar, handleLogout, currentUser }) => {
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme) document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return (
    <>
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        handleLogout={handleLogout}
        userEmail={currentUser.email}
      />

      {showSidebar && window.innerWidth < 768 && (
        <div className="overlay" onClick={() => setShowSidebar(false)}></div>
      )}

      <main className="main-content">
        <Routes>
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/dashboard" element={<Dashboard userEmail={currentUser.email} />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/CGPAChecker" element={<CGPAChecker />} />
          <Route path="/Attendance" element={<Attendance />} />
          <Route path="/PercentageChecker" element={<PercentageChecker />} />
          <Route path="/Messages" element={<Messages user={currentUser} />} />
        </Routes>
      </main>
    </>
  );
};

const App = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    window.location.href = "/";
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, avatar_url, last_selected_group_id")
          .eq("id", user.id)
          .single();

        setCurrentUser({ ...user, ...profile });
      }
      setLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    getUser();

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={currentUser ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={currentUser ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              currentUser ? (
                <AppLayout
                  toggleSidebar={toggleSidebar}
                  showSidebar={showSidebar}
                  setShowSidebar={setShowSidebar}
                  handleLogout={handleLogout}
                  currentUser={currentUser}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;




// // src/App.jsx
// import { useEffect, useState } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Header from "./components/Header";
// import Sidebar from "./components/Sidebar";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import ForgotPassword from "./pages/ForgotPassword"; // ✅ Add this
// import UpdatePassword from "./pages/UpdatePassword"; // ✅ Add this
// import Dashboard from "./pages/Dashboard";
// import FileUpload from "./pages/FileUpload";
// import Tasks from "./pages/Tasks";
// import Classes from "./pages/Classes";
// import CGPAChecker from "./pages/CGPAChecker";
// import PercentageChecker from "./pages/PercentageChecker";
// import Messages from "./pages/Messages";
// import Attendance from "./pages/Attendance";
// import MyProfile from "./pages/MyProfile";
// import Settings from "./pages/Settings";
// import { supabase } from "./supabaseClient";
// import { UserProvider } from "./contexts/UserContext";
// import LandingPage from "./pages/LandingPage";
// const AppLayout = ({ toggleSidebar, showSidebar, setShowSidebar, handleLogout, currentUser }) => {
//   // const [setSelectedGroupId] = useState(null);

//   useEffect(() => {
//     const theme = localStorage.getItem("theme");
//     if (theme) document.documentElement.setAttribute("data-theme", theme);
//   }, []);

//   return (
//     <>
//       <Header toggleSidebar={toggleSidebar} />
//       <Sidebar
//         showSidebar={showSidebar}
//         setShowSidebar={setShowSidebar}
//         handleLogout={handleLogout}
//         userEmail={currentUser.email}
//       />

//       {showSidebar && window.innerWidth < 768 && (
//         <div className="overlay" onClick={() => setShowSidebar(false)}></div>
//       )}

//       <main className="main-content">
//         <Routes>
//           <Route path="/profile" element={<MyProfile />} />
//           <Route path="/" element={<Dashboard userEmail={currentUser.email} />} />
//           <Route path="/upload" element={<FileUpload />} />
//           <Route path="/settings" element={<Settings />} />
//           <Route path="/tasks" element={<Tasks />} />
//           <Route path="/classes" element={<Classes />} />
//           <Route path="/CGPAChecker" element={<CGPAChecker />} />
//           <Route path="/Attendance" element={<Attendance />} />
//           <Route path="/PercentageChecker" element={<PercentageChecker />} />
//           <Route path="/Messages" element={<Messages user={currentUser} />} />
//           <Route path="/" element={<LandingPage />} />

//         </Routes>
//       </main>
//     </>
//   );
// };

// const App = () => {
//   const [showSidebar, setShowSidebar] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const toggleSidebar = () => setShowSidebar(!showSidebar);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     setCurrentUser(null);
//     window.location.href = "/login";
//   };

//   useEffect(() => {
//     const getUser = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) {
//         const { data: profile } = await supabase
//           .from("profiles")
//           .select("name, avatar_url, last_selected_group_id")
//           .eq("id", user.id)
//           .single();

//         setCurrentUser({ ...user, ...profile });
//       }
//       setLoading(false);
//     };

//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setCurrentUser(session?.user || null);
//     });

//     getUser();

//     return () => {
//       listener?.subscription?.unsubscribe();
//     };
//   }, []);

//   if (loading) return <div>Loading...</div>;

//   return (
//     <UserProvider>
//       <Router>
//         <Routes>
//           <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
//           <Route path="/register" element={currentUser ? <Navigate to="/" /> : <Register />} />
          
//           {/* ✅ Add these 2 routes for forgot/update password */}
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/update-password" element={<UpdatePassword />} />

//           <Route
//             path="/*"
//             element={
//               currentUser ? (
//                 <AppLayout
//                   toggleSidebar={toggleSidebar}
//                   showSidebar={showSidebar}
//                   setShowSidebar={setShowSidebar}
//                   handleLogout={handleLogout}
//                   currentUser={currentUser}
//                 />
//               ) : (
//                 <Navigate to="/register" replace />
//               )
//             }
//           />
//         </Routes>
//       </Router>
//     </UserProvider>
//   );
// };

// export default App;


























// // src/App.jsx
// import { useEffect, useState } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Header from "./components/Header";
// import Sidebar from "./components/Sidebar";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import FileUpload from "./pages/FileUpload";
// import Tasks from "./pages/Tasks";
// import Classes from "./pages/Classes";
// import CGPAChecker from "./pages/CGPAChecker";
// import PercentageChecker from "./pages/PercentageChecker";
// import Messages from "./pages/Messages";
// import Attendance from "./pages/Attendance";
// // import Groups from "./pages/Groups";
// import MyProfile from "./pages/MyProfile";
// import Settings from "./pages/Settings"; 
// import { supabase } from "./supabaseClient";
// import { UserProvider } from "./contexts/UserContext";

// const AppLayout = ({ toggleSidebar, showSidebar, setShowSidebar, handleLogout, currentUser }) => {
//   const [setSelectedGroupId] = useState(null);

//   useEffect(() => {
//     const theme = localStorage.getItem("theme");
//     if (theme) document.documentElement.setAttribute("data-theme", theme);
//   }, []);

//   return (
//     <>
//       <Header toggleSidebar={toggleSidebar} />
//       <Sidebar
//         showSidebar={showSidebar}
//         setShowSidebar={setShowSidebar}
//         handleLogout={handleLogout}
//         userEmail={currentUser.email}
//       />

//       {showSidebar && window.innerWidth < 768 && (
//         <div className="overlay" onClick={() => setShowSidebar(false)}></div>
//       )}

//       <main className="main-content">
//         <Routes>
//           <Route path="/profile" element={<MyProfile />} />
//           <Route path="/" element={<Dashboard userEmail={currentUser.email} />} />
//           <Route path="/upload" element={<FileUpload />} />
//           <Route path="/settings" element={<Settings />} />
//           <Route path="/tasks" element={<Tasks />} />
//           <Route path="/classes" element={<Classes />} />
//           <Route path="/CGPAChecker" element={<CGPAChecker />} />
//           <Route path="/Attendance" element={<Attendance />} />
//           <Route path="/PercentageChecker" element={<PercentageChecker />} />
//           <Route path="/Messages" element={<Messages user={currentUser} />} />
//           {/* <Route path="/Groups" element={<Groups />} /> */}
//         </Routes>
//       </main>
//     </>
//   );
// };

// const App = () => {
//   const [showSidebar, setShowSidebar] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const toggleSidebar = () => setShowSidebar(!showSidebar);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     setCurrentUser(null);
//     window.location.href = "/login";
//   };

//   useEffect(() => {
//     const getUser = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) {
//         const { data: profile } = await supabase
//           .from("profiles")
//           .select("name, avatar_url, last_selected_group_id")
//           .eq("id", user.id)
//           .single();

//         setCurrentUser({ ...user, ...profile });
//       }
//       setLoading(false);
//     };

//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setCurrentUser(session?.user || null);
//     });

//     getUser();

//     return () => {
//       listener?.subscription?.unsubscribe();
//     };
//   }, []);

//   if (loading) return <div>Loading...</div>;

//   return (
//     <UserProvider>
//       <Router>
//         <Routes>
//           <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
//           <Route path="/register" element={currentUser ? <Navigate to="/" /> : <Register />} />

//           <Route
//             path="/*"
//             element={
//               currentUser ? (
//                 <AppLayout
//                   toggleSidebar={toggleSidebar}
//                   showSidebar={showSidebar}
//                   setShowSidebar={setShowSidebar}
//                   handleLogout={handleLogout}
//                   currentUser={currentUser}
//                 />
//               ) : (
//                 <Navigate to="/register" replace />
//               )
//             }
//           />
//         </Routes>
//       </Router>
//     </UserProvider>
//   );
// };

// export default App;





// import { useEffect, useState } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Header from "./components/Header";
// import Sidebar from "./components/Sidebar";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import FileUpload from "./pages/FileUpload";
// import Tasks from "./pages/Tasks";
// import Classes from "./pages/Classes";
// import CGPAChecker from "./pages/CGPAChecker";
// import PercentageChecker from "./pages/PercentageChecker";
// import Messages from "./pages/Messages";
// import Groups from "./pages/Groups";
// import MyProfile from "./pages/MyProfile";
// import Settings from "./pages/Settings"; 
// import { supabase } from "./supabaseClient";

// const AppLayout = ({
//   toggleSidebar,
//   showSidebar,
//   setShowSidebar,
//   handleLogout,
//   currentUser,
// }) => {
//   const [setSelectedGroupId] = useState(null);

//   useEffect(() => {
//     const theme = localStorage.getItem("theme");
//     if (theme) document.documentElement.setAttribute("data-theme", theme);
//   }, []);

//   return (
//     <>
//       <Header toggleSidebar={toggleSidebar} />
//       <Sidebar
//         showSidebar={showSidebar}
//         setShowSidebar={setShowSidebar}
//         handleLogout={handleLogout}
//         userEmail={currentUser.email}
//       />

//       {showSidebar && window.innerWidth < 768 && (
//         <div className="overlay" onClick={() => setShowSidebar(false)}></div>
//       )}

//       <main className="main-content">
//         <Routes>
//           <Route path="/profile" element={<MyProfile />} />
//           <Route path="/" element={<Dashboard userEmail={currentUser.email} />} />
//           <Route path="/upload" element={<FileUpload />} />
//           <Route path="/settings" element={<Settings />} />
//           <Route path="/tasks" element={<Tasks />} />
//           <Route path="/classes" element={<Classes />} />
//           <Route path="/CGPAChecker" element={<CGPAChecker />} />
//           <Route path="/PercentageChecker" element={<PercentageChecker />} />

//           {/* ✅ Pass correct user */}
//           <Route path="/Messages" element={<Messages user={currentUser} />} />

//           <Route
//             path="/Groups"
//             element={<Groups currentUser={currentUser} onSelectGroup={setSelectedGroupId} />}
//           />
//         </Routes>
//       </main>
//     </>
//   );
// };

// const App = () => {
//   const [showSidebar, setShowSidebar] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const toggleSidebar = () => setShowSidebar(!showSidebar);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     setCurrentUser(null);
//     window.location.href = "/login";
//   };

//   useEffect(() => {
//     const getUser = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) {
//         const { data: profile } = await supabase
//           .from("profiles")
//           .select("name, avatar_url, last_selected_group_id")
//           .eq("id", user.id)
//           .single();

//         setCurrentUser({ ...user, ...profile });
//       }
//       setLoading(false);
//     };

//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setCurrentUser(session?.user || null);
//     });

//     getUser();

//     return () => {
//       listener?.subscription?.unsubscribe();
//     };
//   }, []);

//   if (loading) return <div>Loading...</div>;

//   return (
//     <Router>
//       <Routes>
//         <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
//         <Route path="/register" element={currentUser ? <Navigate to="/" /> : <Register />} />

//         <Route
//           path="/*"
//           element={
//             currentUser ? (
//               <AppLayout
//                 toggleSidebar={toggleSidebar}
//                 showSidebar={showSidebar}
//                 setShowSidebar={setShowSidebar}
//                 handleLogout={handleLogout}
//                 currentUser={currentUser}
//               />
//             ) : (
//               <Navigate to="/register" replace />
//             )
//           }
//         />
//       </Routes>
//     </Router>
//   );
// };

// export default App;