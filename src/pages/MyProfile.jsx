import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import "../styles/Profile.css";

const MyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [bio, setBio] = useState("");

  const [degree, setDegree] = useState("");
  const [school, setSchool] = useState("");
  const [year, setYear] = useState("");
  const [educationList, setEducationList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(Date.now()); // 🆕 For forcing image reload

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email);
        setAvatarUrl(user.user_metadata?.avatar_url || "");
        setName(user.user_metadata?.name || "");
        setMobile(user.user_metadata?.mobile || "");
        setBio(user.user_metadata?.bio || "");
        fetchEducation(user.id);
      }
      setLoading(false);
    };

    const fetchEducation = async (uid) => {
      const { data, error } = await supabase
        .from("education")
        .select("*")
        .eq("user_id", uid)
        .order("year", { ascending: false });

      if (!error) setEducationList(data);
    };

    fetchUser();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return toast.error("No file selected");

    setUploading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("User not found");
      setUploading(false);
      return;
    }

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      toast.error("Upload failed");
      console.error(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    if (updateError) {
      toast.error("Failed to save avatar URL");
    } else {
      setAvatarUrl(publicUrl);
      setCacheBuster(Date.now()); // 🆕 Trigger image refresh
      toast.success("Profile photo updated!");
    }

    setUploading(false);
  };

  const handleSave = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { name, mobile, bio },
    });

    if (error) toast.error("Error saving data");
    else toast.success("Profile updated successfully");
    window.dispatchEvent(new Event("profileUpdated")); 
  };

  const handleAddEducation = async () => {
    if (!degree || !school || !year) {
      return toast.error("All education fields are required");
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("education").insert({
      user_id: user.id,
      degree,
      school,
      year: parseInt(year),
    });

    if (!error) {
      toast.success("Education added");
      setDegree("");
      setSchool("");
      setYear("");
      fetchEducation(user.id);
    } else {
      toast.error("Failed to add education");
    }
  };

  const fetchEducation = async (uid) => {
    const { data, error } = await supabase
      .from("education")
      .select("*")
      .eq("user_id", uid)
      .order("year", { ascending: false });

    if (!error) setEducationList(data);
  };

  const handleDeleteEducation = async (id) => {
    const { error } = await supabase.from("education").delete().eq("id", id);
    if (!error) {
      toast.success("Education deleted");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      fetchEducation(user.id);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card skeleton">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Toaster position="top-right" />
      <div className="profile-card">
        <h2>👤 My Profile</h2>

        <div className="avatar-section">
          <img
            src={
              avatarUrl
                ? `${avatarUrl}?t=${cacheBuster}` // 🆕 force refresh
                : "https://via.placeholder.com/150?text=Upload+Photo"
            }
            alt=""
            className="avatar-img"
            onClick={() => setShowModal(true)}
            style={{ cursor: "pointer" }}
          />
          <label className="upload-btn">
            {uploading ? "Uploading..." : "Change Photo"}
            <input type="file" accept="image/*" onChange={handleUpload} hidden />
          </label>
        </div>

        <div className="profile-info">
          <p><strong>Email:</strong> {email}</p>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="tel"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />

          <textarea
            rows="3"
            placeholder="Short Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <button className="save-btn" onClick={handleSave}>
            Save Profile
          </button>
        </div>
      </div>

      {/* Education Section */}
      <div className="education-section">
        <h3>🎓 Education</h3>

        <div className="edu-form">
          <input
            type="text"
            placeholder="Degree"
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
          />
          <input
            type="text"
            placeholder="School"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          />
          <input
            type="number"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <button onClick={handleAddEducation}>Add</button>
        </div>

        <div className="edu-list">
          {educationList.length === 0 ? (
            <p>No education records found.</p>
          ) : (
            educationList.map((edu) => (
              <div key={edu.id} className="edu-card">
                <h4>{edu.degree}</h4>
                <p>{edu.school}</p>
                <p>Year: {edu.year}</p>
                <button onClick={() => handleDeleteEducation(edu.id)}>🗑️</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for full-size image */}
      {showModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <img
            src={`${avatarUrl}?t=${cacheBuster}`} // 🆕 refresh in modal too
            alt="Enlarged"
            style={{
              maxWidth: "90vw",
              maxHeight: "80vh",
              borderRadius: "10px",
              boxShadow: "0 4px 20px rgba(255,255,255,0.4)",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MyProfile;
