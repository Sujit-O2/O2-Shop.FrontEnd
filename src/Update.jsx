import React, { useState } from "react";
import axios from "axios";

export default function UpdateProfile() {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);

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
      const base64 = await toBase64(file);
      setPhoto(base64);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/update`,
        {
          name,
          photo
          
        },
        {withCredentials:true}
      );

      alert("Profile Updated Successfully!");
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert("Update failed. Please try again.");
    }
  };

  return (
    <div style={{
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",       // full viewport height
  background: "linear-gradient(135deg, #74ebd5, #ACB6E5)", // nice gradient
  fontFamily: "Arial, sans-serif"
}}>
  <div style={{
    maxWidth: "400px",
    width: "100%",
    padding: "30px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)"
  }}>
    <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
      Update Profile
    </h2>

    <form onSubmit={handleUpdate}>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>
          Update Name:
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter new name"
          style={{
            borderRadius: "8px",
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            outline: "none",
            transition: "0.3s"
          }}
          onFocus={(e) => (e.target.style.border = "1px solid #28a745")}
          onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>
          Update Photo:
        </label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <button
        type="submit"
        style={{
          width: "100%",
          padding: "12px",
          background: "linear-gradient(135deg, #28a745, #218838)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "0.3s"
        }}
        onMouseOver={(e) => (e.target.style.opacity = "0.9")}
        onMouseOut={(e) => (e.target.style.opacity = "1")}
      >
        Update Profile
      </button>
    </form>
  </div>
</div>

  );
}
