import React, { useState, useRef } from "react";
import axios from "axios";
import { FaCloudUploadAlt, FaTrash, FaCheckCircle, FaTimes } from "react-icons/fa";
import "./css/AddProductPhotos.css";

export default function AddProductPhotos({ productId, onSuccess }) {
  const [photos, setPhotos] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  // Handle file selection (from input or drop)
  const handleFiles = (files) => {
    if (files && files.length > 0) {
        const fileArray = Array.from(files);
        // Filter for images only
        const validImages = fileArray.filter(file => file.type.startsWith("image/"));
        
        if (validImages.length !== fileArray.length) {
            setError("Some files were skipped (images only).");
        } else {
            setError("");
        }

        setPhotos((prev) => [...prev, ...validImages]);
        
        const newPreviews = validImages.map((file) => URL.createObjectURL(file));
        setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleChange = (e) => {
    handleFiles(e.target.files);
  };

  // Drag and Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Remove a specific photo from the list
  const removePhoto = (index) => {
    const newPhotos = [...photos];
    const newPreviews = [...previewUrls];
    
    newPhotos.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setPhotos(newPhotos);
    setPreviewUrls(newPreviews);
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

      // Cleanup
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
        <div className="card-header">
            <h3>Upload Product Images</h3>
            <p>Drag & drop or select images to upload</p>
        </div>

        {error && <div className="error-banner"><FaTimes /> {error}</div>}

        <form onSubmit={handleUpload} onDragEnter={handleDrag}>
          {/* Drag and Drop Zone */}
          <div 
            className={`drop-zone ${isDragActive ? "active" : ""}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleChange}
              className="hidden-input"
            />
            <FaCloudUploadAlt className="upload-icon" />
            <p className="drop-text">
                Drag & Drop files here or <span>Browse</span>
            </p>
            <p className="file-hint">Supported formats: JPG, PNG, JPEG</p>
          </div>

          {/* Preview Grid */}
          {previewUrls.length > 0 && (
            <div className="preview-section">
                <h4>Selected Images ({previewUrls.length})</h4>
                <div className="preview-grid">
                {previewUrls.map((url, index) => (
                    <div key={index} className="preview-item fade-in">
                    <img src={url} alt={`preview-${index}`} />
                    <button 
                        type="button" 
                        className="remove-btn"
                        onClick={() => removePhoto(index)}
                    >
                        <FaTrash />
                    </button>
                    </div>
                ))}
                </div>
            </div>
          )}

          {/* Action Button */}
          <button 
            type="submit" 
            className={`upload-btn ${uploading ? "disabled" : ""}`} 
            disabled={uploading || photos.length === 0}
          >
            {uploading ? (
                <>
                    <span className="spinner"></span> Uploading...
                </>
            ) : (
                <>
                    <FaCheckCircle /> Upload Photos
                </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}