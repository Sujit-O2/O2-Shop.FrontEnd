import React, { useState } from "react";
import axios from "axios";
import "./css/AddProductPhotos.css";

export default function AddProductPhotos({ productId, onSuccess }) {
  const [photos, setPhotos] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (photos.length === 0) {
      setError("Please select at least one photo.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      for (let file of photos) {
        const base64Photo = await toBase64(file);
        await axios.post(
          `${import.meta.env.VITE_API_URL}/seller/products/${productId}/addPhoto`,
          { photo: base64Photo },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
      }

      setPhotos([]);
      setPreviewUrls([]);
      if (onSuccess) onSuccess();
      alert("Photos uploaded successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to upload photos. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="photo-upload-container">
      <div className="photo-upload-card">
        <h2>Add Product Photos</h2>
        <p className="subtext">Upload and preview your product images</p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleUpload}>
          <div className="file-input-area">
            <label className="file-label" htmlFor="photo-input">
              Choose Photos
            </label>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
          </div>

          {previewUrls.length > 0 && (
            <div className="preview-gallery">
              {previewUrls.map((url, index) => (
                <div key={index} className="preview-item">
                  <img src={url} alt={`preview-${index}`} />
                </div>
              ))}
            </div>
          )}

          <button type="submit" className="upload-btn" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Photos"}
          </button>
        </form>
      </div>
    </div>
  );
}
