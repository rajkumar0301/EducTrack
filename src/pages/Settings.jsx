import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import "../styles/Settings.css";

const Settings = ({ handleLogout }) => {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [file, setFile] = useState(null);
  const [theme, setTheme] = useState("light");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    getProfile();
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    document.documentElement.setAttribute("data-theme", storedTheme);
  }, []);

  const getProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setAvatarUrl(data.avatar_url);
    }
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const previewUrl = URL.createObjectURL(uploadedFile);
      setAvatarUrl(previewUrl);
    }
  };

  const uploadAvatar = async () => {
    if (!file) {
      toast.error("Please select an image first.");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed");
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrlData.publicUrl })
      .eq("id", user.id);

    if (updateError) {
      toast.error("Update failed");
    } else {
      toast.success("Profile picture updated!");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    toast.success(`Switched to ${newTheme} mode`);
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      toast.error("Enter a new password");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error("Failed to update password");
    } else {
      toast.success("Password updated successfully!");
      setNewPassword("");
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm("Are you sure you want to delete your account?");
    if (!confirm) return;

    const { error } = await supabase.rpc("delete_user");

    if (error) {
      toast.error("❌ Failed to delete account");
    } else {
      toast.success("✅ Account deleted");
      handleLogout?.(); // call logout if defined
    }
  };

  return (
    <div className="settings-wrapper">
      <h2 className="settings-title">⚙️ Settings</h2>

      {/* Profile Picture Section */}
      <div className="settings-card">
        <h3>
          <img className="icon" src="https://img.icons8.com/color/24/user.png" alt="Profile" />
          Update Profile Picture
        </h3>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {avatarUrl && <img src={avatarUrl} alt="Avatar" className="avatar-preview" />}
        <button onClick={uploadAvatar}>Upload</button>
      </div>

      {/* Change Password Section */}
      <div className="settings-card">
        <h3>
          <img className="icon" src="https://img.icons8.com/fluency/24/password1.png" alt="Password" />
          Change Password
        </h3>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button onClick={handleChangePassword}>Update Password</button>
      </div>

      {/* Theme Toggle */}
      <div className="settings-card">
        <h3>
          <img className="icon" src="https://img.icons8.com/color/24/settings--v1.png" alt="Theme" />
          Theme
        </h3>
        <div className="toggle-row">
          <span>Current: {theme}</span>
          <button onClick={toggleTheme}>Toggle Theme</button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-card danger-zone">
        <h3>
          <img className="icon" src="https://img.icons8.com/color/24/delete-forever.png" alt="Danger" />
          Danger Zone
        </h3>
        <button className="delete-btn" onClick={handleDeleteAccount}>Delete Account</button>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Settings;



