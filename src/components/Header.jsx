import React, { useEffect, useState } from "react";
import "../styles/Header.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Header = ({ toggleSidebar }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [initials, setInitials] = useState("");
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
  const fetchUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user || error) return;

    const avatar = user.user_metadata?.avatar_url;
    const email = user.email;
    const fullName = user.user_metadata?.name || "";

    setAvatarUrl(avatar || null);

    const nameParts = (fullName || email || "U")
      .split(/[@\s.]/)
      .filter(Boolean);

    const initials = nameParts[0]?.charAt(0).toUpperCase() +
      (nameParts[1]?.charAt(0).toUpperCase() || "");
    setInitials(initials);
    setCacheBuster(Date.now());
  };

  fetchUser();

  // 🔁 Listen for update events
  const handleProfileUpdate = () => {
    fetchUser();
  };

  window.addEventListener("profileUpdated", handleProfileUpdate);
  return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
}, []);


  return (
    <header className="header">
      <div className="menu-icon" onClick={toggleSidebar}>☰</div>
      <div className="app-name">EducTrack</div>

      <div className="profile" onClick={() => navigate("/profile")}>
        {avatarUrl ? (
          <img
            src={`${avatarUrl}?t=${cacheBuster}`}
            alt="profile"
            className="profile-img"
          />
        ) : (
          <div className="profile-initials">{initials}</div>
        )}
      </div>
    </header>
  );
};

export default Header;





// import React from "react";
// import "../styles/Header.css";
// import { useNavigate } from "react-router-dom";

// const Header = ({ toggleSidebar }) => {
//   const navigate = useNavigate();

//   return (
//     <header className="header">
//       <div className="menu-icon" onClick={toggleSidebar}>☰</div>
//       <div className="app-name">EducTrack</div>
//       <div className="profile" onClick={() => navigate("/profile")}>
//         <img src="/images/profile.png" alt="Profile" />
//       </div>
//     </header>
//   );
// };

// export default Header;
