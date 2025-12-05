import React, { useState } from "react";
import axios from "axios";
import { Camera, User, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import "./css/UpdateProfile.css";

export default function UpdateProfile() {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Helper: Convert file to Base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic validation for image size (optional, e.g., 2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image size must be less than 2MB" });
        return;
      }
      try {
        const base64 = await toBase64(file);
        setPhoto(base64);
        setMessage({ type: "", text: "" }); // Clear errors
      } catch (err) {
        setMessage({ type: "error", text: "Failed to process image" });
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/update`,
        { name, photo },
        { withCredentials: true }
      );

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Update failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-profile-container">
      <div className="profile-card fade-in">
        
        <div className="card-header">
          <h2>Edit Profile</h2>
          <p>Update your personal details</p>
        </div>

        <form onSubmit={handleUpdate} className="profile-form">
          
          {/* Avatar Section */}
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <img
                src={photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt="Profile Preview"
                className="profile-img"
              />
              <label htmlFor="fileInput" className="camera-btn" title="Change Photo">
                <Camera size={18} />
              </label>
            </div>
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden-input"
            />
          </div>

          {/* Alert Messages */}
          {message.text && (
            <div className={`status-message ${message.type}`}>
              {message.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
              <span>{message.text}</span>
            </div>
          )}

          {/* Inputs */}
          <div className="form-group">
            <label htmlFor="nameInput">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input
                id="nameInput"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your new name"
                className="custom-input"
              />
            </div>
          </div>

          {/* Action Button */}
          <button type="submit" className="update-btn" disabled={loading}>
            {loading ? (
              <> <Loader2 className="spinner" size={18} /> Saving... </>
            ) : (
              <> <Save size={18} /> Save Changes </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}