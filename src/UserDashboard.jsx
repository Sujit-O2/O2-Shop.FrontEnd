import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaShoppingCart, FaFilter, FaStar } from "react-icons/fa";
import "./css/userdash.css";

// Assets
import logo from "./assets/O2.png";
import b1 from "./assets/del.png";
import b2 from "./assets/fest.png";
import b3 from "./assets/daa.png";

export default function UserDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI States
  const [bannerIndex, setBannerIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default"); // default, low-high, high-low

  const navigate = useNavigate();

  const banners = [
    { id: 1, img: b2, title: "🎉 Big Festive Sale!", subtitle: "Up to 60% off on electronics" },
    { id: 2, img: b3, title: "🛍️ Connect Your World", subtitle: "Flat 40% off on top brands" },
    { id: 3, img: b1, title: "🚚 Free Delivery", subtitle: "On Orders Above ₹499" },
  ];

  // Fetch Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/products`, {
          withCredentials: true,
        });
        setProducts(response.data || []);
      } catch (error) {
        console.error(error);
        setError("Unable to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Banner Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [banners.length]);

  // Dynamic Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) =>
      p.pname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === "low-high") {
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === "high-low") {
      result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }
    return result;
  }, [products, searchTerm, sortBy]);

  // Loading Skeleton Component
  const SkeletonCard = () => (
    <div className="card skeleton-card">
      <div className="skeleton-img"></div>
      <div className="skeleton-text line-1"></div>
      <div className="skeleton-text line-2"></div>
    </div>
  );

  if (error) return <div className="error-container">⚠️ {error}</div>;

  return (
    <div className="user-page">
      {/* --- Navbar Area --- */}
      <nav className="dashboard-nav">
        <div className="nav-logo">
          <img src={logo} alt="Logo" />
          <span>O2-Shop</span>
        </div>
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search for products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
      </nav>

      {/* --- Hero Banner Section --- */}
      <div className="banner-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={bannerIndex}
            className="banner-slide"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            style={{ backgroundImage: `url(${banners[bannerIndex].img})` }}
          >
            <div className="banner-overlay">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.2 }}
              >
                {banners[bannerIndex].title}
              </motion.h2>
              <motion.p
                 initial={{ y: 20, opacity: 0 }} 
                 animate={{ y: 0, opacity: 1 }} 
                 transition={{ delay: 0.3 }}
              >
                {banners[bannerIndex].subtitle}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Banner Dots */}
        <div className="banner-dots">
          {banners.map((_, idx) => (
            <span 
              key={idx} 
              className={`dot ${idx === bannerIndex ? "active" : ""}`}
              onClick={() => setBannerIndex(idx)}
            />
          ))}
        </div>
      </div>

      {/* --- Controls Section --- */}
      <div className="controls-header">
        <h2>Recommended For You</h2>
        <div className="sort-wrapper">
          <FaFilter className="filter-icon" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">Sort by: Relevance</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* --- Product Grid --- */}
      <div className="product-grid">
        {loading ? (
          // Show 8 skeletons while loading
          [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
        ) : filteredProducts.length === 0 ? (
          <div className="no-results">
            <h3>No products found for "{searchTerm}"</h3>
            <p>Try checking your spelling or use different keywords.</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const imgSrc = product.img?.trim()
              ? `data:image/jpeg;base64,${product.img}`
              : logo;

            return (
              <motion.div 
                key={product.pid} 
                className="card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.15)" }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className="card-clickable" 
                  onClick={() => navigate(`/products/${product.pid}`)}
                >
                  <div className="thumb">
                    <img src={imgSrc} alt={product.pname} loading="lazy" />
                    <span className="badge">Sale</span>
                  </div>
                  
                  <div className="card-body">
                    <h3 className="card-title">{product.pname}</h3>
                    <div className="card-rating">
                       <FaStar className="star" /> 4.5
                    </div>
                    
                    <div className="card-footer">
                      <div className="price-block">
                        <span className="currency">₹</span>
                        <span className="price">{Number(product.price).toFixed(0)}</span>
                      </div>
                      <button className="btn-add">View</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}