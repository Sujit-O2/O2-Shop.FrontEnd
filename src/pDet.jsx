import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./css/pdet.css";


export default function SingleProduct({ productId }) {
  const [product, setProduct] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null); // "cart" | "buy" | null
  const [role, setRole] = useState(null);
  const fadeTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // 🔹 Read role from cookies
  useEffect(() => {
    const cookies = document.cookie.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {});
    setRole(cookies.role || null);
  }, []);

  // Fetch product details
  useEffect(() => {
    let isMounted = true;
    fetch(`${import.meta.env.VITE_API_URL}/auth/products/${productId}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) setProduct(data);
      })
      .catch((err) => console.error(err));
    return () => {
      isMounted = false;
      clearTimeout(fadeTimeoutRef.current);
    };
  }, [productId]);

  if (!product) return <p className="loading">Loading product...</p>;

  const total = Array.isArray(product.img) ? product.img.length : 0;

  // Slider functions
  const goTo = (nextIdx) => {
    if (total === 0) return;
    setIsFading(true);
    clearTimeout(fadeTimeoutRef.current);
    fadeTimeoutRef.current = setTimeout(() => {
      setCurrentIndex(nextIdx);
      setIsFading(false);
    }, 150);
  };

  const nextSlide = () => {
    if (total > 0) goTo((currentIndex + 1) % total);
  };

  const prevSlide = () => {
    if (total > 0) goTo(currentIndex === 0 ? total - 1 : currentIndex - 1);
  };

  // Add to cart
  const handleAddToCart = async () => {
    try {
      setLoadingAction("cart");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/Addtocart/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      alert("Added to cart");
    } catch (e) {
      alert(e.message || "Error adding to cart");
    } finally {
      setLoadingAction(null);
    }
  };

  // Buy now → navigate to Checkout page
  const handleBuyNow = () => {
    navigate(`/checkout/${productId}`);
  };

  // 🔹 Lock buttons for sellers
  const isSeller = role === "SELLER";

  return (
    <div className="page-bg">
      <div className="content-wrap">
        <div className="split-card">
          {/* Left: Product Image Slider */}
          <section className="left-pane">
            <div className="slider-box">
              {total > 0 ? (
                <>
                  <img
                    src={`data:image/jpeg;base64,${product.img[currentIndex]}`}
                    alt="product"
                    className={`hero ${isFading ? "fade-out" : "fade-in"}`}
                    loading="lazy"
                  />
                  <button className="nav prev" onClick={prevSlide} disabled={total <= 1}>
                    ❮
                  </button>
                  <button className="nav next" onClick={nextSlide} disabled={total <= 1}>
                    ❯
                  </button>
                </>
              ) : (
                <div className="no-image">No images available</div>
              )}
            </div>

            {total > 1 && (
              <div className="thumb-strip">
                {product.img.map((_, idx) => (
                  <button
                    key={idx}
                    className={`thumb-btn ${idx === currentIndex ? "active" : ""}`}
                    onClick={() => goTo(idx)}
                  >
                    <img
                      src={`data:image/jpeg;base64,${product.img[idx]}`}
                      alt={`thumb-${idx + 1}`}
                      className="thumb"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Right: Product Details */}
          <section className="right-pane">
            <h1 className="pname">{product.pname}</h1>
            <p className="seller">Seller: {product.sellername}</p>

            <div className="meta">
              <p><b>Price:</b> ₹{product.price}</p>
              <p><b>Stock:</b> {product.stock}</p>
              <p><b>Status:</b> {product.status === 1 ? "Available" : "Out of Stock"}</p>
            </div>

            <p className="desc">{product.description}</p>

            <div className="actions row">
              <button
                className="btn add"
                onClick={handleAddToCart}
                disabled={product.status !== 1 || loadingAction !== null || isSeller}
                title={isSeller ? "Sellers cannot add to cart" : ""}
              >
                {loadingAction === "cart" ? "Adding..." : "Add to Cart"}
              </button>
              <button
                className="btn buy"
                onClick={handleBuyNow}
                disabled={product.status !== 1 || loadingAction !== null || isSeller}
                title={isSeller ? "Sellers cannot buy products" : ""}
              >
                {loadingAction === "buy" ? "Processing..." : "Buy Now"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
