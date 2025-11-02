// UserDashboard.jsx
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/userdash.css";
import logo from "./assets/O2.png";
import b1 from "./assets/del.png";
import b2 from "./assets/fest.png";
import b3 from "./assets/daa.png";


export default function UserDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  const navigate = useNavigate();

  const banners = [
    {
      id: 1,
      img:b2,
      title: "🎉 Big Festive Sale!",
      subtitle: "Up to 60% off on all electronics",
    },
    {
      id: 2,
      img: b3,
      title: "🛍️ Connect Your World",
      subtitle: "Flat 40% off on top brands",
    },
    {
      id: 3,
      img: b1,
      title: "🚚 Free Delivery on Orders Above ₹499",
      subtitle: "Limited-time offer for all categories!",
    },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/products`, {
          withCredentials: true,
        });
        setProducts(response.data || []);
      } catch (error) {
        console.error(error);
        setError(error.response?.data || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Auto-slide banners every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="status">Loading products...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="user-page">
      {/*  Banner Section */}
      <div className="banner-container">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`banner-slide ${index === bannerIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${banner.img})` }}
          >
            <div className="banner-overlay">
              <h2>{banner.title}</h2>
              <p>{banner.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="user-header">
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <h2 style={{ margin: 0 }}>All Products</h2>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="status">No products available</p>
      ) : (
        <ul className="product-grid" role="list">
          {products.map((product) => {
            const imgSrc = product.img?.trim()
              ? `data:image/jpeg;base64,${product.img}`
              : logo;

            return (
              <li key={product.pid} className="card" role="listitem">
                <button
                  className="card-action"
                  onClick={() => navigate(`/products/${product.pid}`)}
                  aria-label={`View details for ${product.pname}`}
                >
                  <div className="thumb">
                    <img
                      src={imgSrc}
                      alt={product.pname || "Product image"}
                      loading="lazy"
                      width="640"
                      height="480"
                    />
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{product.pname}</h3>
                    <div className="card-meta">
                      <span className="price">
                        ₹{Number(product.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
