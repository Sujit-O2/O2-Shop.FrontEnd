import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Added useParams for flexibility
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaShoppingCart, FaBolt, FaArrowLeft, FaStore, 
  FaCheckCircle, FaTimesCircle, FaChevronLeft, FaChevronRight 
} from "react-icons/fa";
import "./css/pdet.css";

export default function SingleProduct({ productId: propId }) {
  // Handle ID from props OR URL params (makes routing easier)
  const { id } = useParams();
  const productId = propId || id;

  const [product, setProduct] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingAction, setLoadingAction] = useState(null); // "cart" | "buy"
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  // Read Role
  useEffect(() => {
    const roleCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("role="));
    if (roleCookie) setRole(roleCookie.split("=")[1]);
  }, []);

  // Fetch Data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/products/${productId}`, {
          credentials: "include",
        });
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Failed to load product", err);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  // Image Navigation
  const total = product?.img?.length || 0;
  
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % total);
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  const goTo = (index) => setCurrentIndex(index);

  // Actions
  const handleAddToCart = async () => {
    try {
      setLoadingAction("cart");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/Addtocart/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      
      // Visual feedback handled by button state, alert as backup
      setTimeout(() => alert("Item added to cart!"), 100);
    } catch (e) {
      alert("Could not add to cart.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBuyNow = () => {
    setLoadingAction("buy");
    setTimeout(() => navigate(`/checkout/${productId}`), 500);
  };

  // Skeleton Loader
  if (!product) return (
    <div className="pdet-page skeleton-wrapper">
      <div className="skeleton-left"></div>
      <div className="skeleton-right">
        <div className="line l1"></div>
        <div className="line l2"></div>
        <div className="line l3"></div>
      </div>
    </div>
  );

  const isSeller = role === "SELLER";
  const isOutOfStock = product.status !== 1;
  const currentImgSrc = `data:image/jpeg;base64,${product.img[currentIndex]}`;

  return (
    <div className="pdet-page">
      <button className="btn-back" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back to Browse
      </button>

      <div className="product-container">
        
        {/* --- Left Column: Gallery --- */}
        <div className="gallery-section">
          <div className="main-image-frame">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={currentImgSrc}
                alt={product.pname}
                className="main-img"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>
            
            {total > 1 && (
              <>
                <button className="nav-btn prev" onClick={prevSlide}><FaChevronLeft /></button>
                <button className="nav-btn next" onClick={nextSlide}><FaChevronRight /></button>
              </>
            )}
          </div>

          {total > 1 && (
            <div className="thumbnails">
              {product.img.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`thumb-box ${idx === currentIndex ? "active" : ""}`}
                  onClick={() => goTo(idx)}
                >
                  <img src={`data:image/jpeg;base64,${img}`} alt="thumb" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- Right Column: Details --- */}
        <div className="details-section">
          <div className="product-header">
            <span className="seller-badge">
              <FaStore /> Sold by {product.sellername}
            </span>
            <h1 className="product-title">{product.pname}</h1>
          </div>

          <div className="price-block">
            <span className="currency">₹</span>
            <span className="price">{Number(product.price).toLocaleString()}</span>
          </div>

          <div className={`stock-status ${isOutOfStock ? "out" : "in"}`}>
            {isOutOfStock ? (
              <><FaTimesCircle /> Out of Stock</>
            ) : (
              <><FaCheckCircle /> In Stock ({product.stock} units left)</>
            )}
          </div>

          <div className="description-box">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="action-buttons">
            <button
              className="btn-action cart"
              onClick={handleAddToCart}
              disabled={isOutOfStock || loadingAction !== null || isSeller}
            >
              {loadingAction === "cart" ? (
                <span className="spinner"></span>
              ) : (
                <><FaShoppingCart /> Add to Cart</>
              )}
            </button>

            <button
              className="btn-action buy"
              onClick={handleBuyNow}
              disabled={isOutOfStock || loadingAction !== null || isSeller}
            >
              {loadingAction === "buy" ? (
                <span className="spinner"></span>
              ) : (
                <><FaBolt /> Buy Now</>
              )}
            </button>
          </div>

          {isSeller && (
            <div className="seller-warning">
              Logged in as Seller: Purchasing disabled.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}