import React, { useEffect, useState } from "react";
import "../styles/Header.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Header = ({ toggleSidebar }) => {
  const [avatarUrl, setAvatarUrl] = useState("/images/profile.png");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvatar = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) return;

      const userAvatar = user.user_metadata?.avatar_url;
      if (userAvatar) {
        setAvatarUrl(userAvatar);
      }
    };

    fetchAvatar();
  }, []);

  return (
    <header className="header">
      <div className="menu-icon" onClick={toggleSidebar}>☰</div>
      <div className="app-name">EducTrack</div>
      <div className="profile" onClick={() => navigate("/profile")}>
        <img
          src={avatarUrl || "/images/profile.png"}
          alt="Profile"
          className="profile-img"
        />
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
