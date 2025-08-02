import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FileUpload from "./pages/FileUpload";
import Tasks from "./pages/Tasks";
import Classes from "./pages/Classes";
import CGPAChecker from "./pages/CGPAChecker";
import Messages from "./pages/Messages";
import Groups from "./pages/Groups";
import MyProfile from "./pages/MyProfile"; // make sure this is imported

import { supabase } from "./supabaseClient";

const AppLayout = ({
  toggleSidebar,
  showSidebar,
  setShowSidebar,
  handleLogout,
  currentUser,  // using full user object now
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState(null);

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
          <Route path="/" element={<Dashboard userEmail={currentUser.email} />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/CGPAChecker" element={<CGPAChecker />} />
          <Route path="/messages" element={<Messages currentUser={currentUser}  groupId={currentUser?.last_selected_group_id}  />} />
          <Route path="/Groups" element={<Groups currentUser={currentUser} onSelectGroup={setSelectedGroupId} />} />
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
    window.location.href = "/login";
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

      setCurrentUser({ ...user, ...profile }); // set full currentUser object
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
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={currentUser ? <Navigate to="/" /> : <Register />} />

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
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;













// import { useEffect, useState } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Header from "./components/Header";
// import Sidebar from "./components/Sidebar";
// import MyProfile from "./pages/MyProfile";
// // import Home from "./pages/Home";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import { supabase } from "./supabaseClient";
// import FileUpload from "./pages/FileUpload";
// import Tasks from "./pages/Tasks";
// import Classes from "./pages/Classes";
// import CGPAChecker from "./pages/CGPAChecker";
// import Messages from "./pages/Messages";
// import Groups from "./pages/Groups";


// const AppLayout = ({
//   toggleSidebar,
//   showSidebar,
//   setShowSidebar,
//   handleLogout,
//   userEmail,
// }) => {
//   return (
//     <>
//       <Header toggleSidebar={toggleSidebar} />
//       <Sidebar
//         showSidebar={showSidebar}
//         setShowSidebar={setShowSidebar}
//         handleLogout={handleLogout}
//         userEmail={userEmail}
//       />

//       {showSidebar && window.innerWidth < 768 && (
//         <div className="overlay" onClick={() => setShowSidebar(false)}></div>
//       )}

//       <main className="main-content">
//         <Routes>
//           {/* <Route path="/" element={<Home />} /> */}
//           <Route path="/profile" element={<MyProfile />} />
//           <Route path="/" element={<Dashboard userEmail={userEmail} />} />
//           <Route path="/upload" element={<FileUpload />} />
//           <Route path="/tasks" element={<Tasks />} />
//           <Route path="/classes" element={<Classes />} />
//           <Route path="/CGPAChecker" element={<CGPAChecker />} />
//           <Route path="/Messages" element={<Messages />} />
//           <Route path="/Groups" element={<Groups />} />
          

//         </Routes>
//       </main>
//     </>
//   );
// };

// const App = () => {
//   const [showSidebar, setShowSidebar] = useState(false);
//   const [userEmail, setUserEmail] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const toggleSidebar = () => setShowSidebar(!showSidebar);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     setUserEmail(null);
//     window.location.href = "/login";
//   };

//   useEffect(() => {
//     const getUser = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) {
//         setUserEmail(user.email);
//       } else {
//         setUserEmail(null);
//       }
//       setLoading(false);
//     };
//      // Supabase auth state change listener
//      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
//     if (session?.user?.email) {
//       setUserEmail(session.user.email);
//     } else {
//       setUserEmail(null);
//     }
//   });
//     getUser();
//     return () => {
//     listener?.subscription?.unsubscribe();
//     };
//   }, []);

//   if (loading) return <div>Loading...</div>;

//   return (
//     <Router>
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/login" element={userEmail ? <Navigate to="/" /> : <Login />} />
//         <Route path="/register" element={userEmail ? <Navigate to="/" /> : <Register />} />

//         {/* Protected Routes */}
//         <Route
//           path="/*"
//           element={
//             userEmail ? (
//               <AppLayout
//                 toggleSidebar={toggleSidebar}
//                 showSidebar={showSidebar}
//                 setShowSidebar={setShowSidebar}
//                 handleLogout={handleLogout}
//                 userEmail={userEmail}
//               />
//             ) : (
//               <Navigate to="/login" replace />
//             )
//           }
//         />
//       </Routes>
//     </Router>
//   );
// };

// export default App;
