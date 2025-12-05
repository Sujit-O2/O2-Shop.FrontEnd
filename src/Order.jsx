import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBox, FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaShippingFast, FaRupeeSign } from "react-icons/fa";
import "./css/Order.css";
import logo from "./assets/O2.png";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/user/orders`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        const rawData = Array.isArray(data) ? data : [];
        
        // --- FIX STARTS HERE ---
        const cleanData = rawData.map((item, index) => {
          // 1. Force Status to be a String. If null/undefined, make it "Pending"
          let safeStatus = "Pending";
          if (item.status !== null && item.status !== undefined) {
             safeStatus = String(item.status); // Converts numbers (0,1) to strings ("0","1")
          }
          
          return {
            ...item,
            status: safeStatus,
            // 2. Stable Key logic
            uniqueKey: item.id || item.oid || `${item.pid}-${index}-${Date.now()}`
          };
        });
        // --- FIX ENDS HERE ---

        setOrders(cleanData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Safe string comparison
      const s = (order.status || "").toLowerCase();
      const f = filterStatus.toLowerCase();
      
      const matchesStatus = filterStatus === "All" || s === f || s.includes(f);
      const matchesSearch = (order.pname || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [orders, filterStatus, searchTerm]);

  // Status Badge Logic
  const getStatusColor = (status) => {
    // Safety check: Ensure we are checking a string
    const s = String(status || "").toLowerCase();
    
    if (s.includes("deliver")) return "badge-success"; // Green
    if (s.includes("cancel")) return "badge-danger";   // Red
    if (s.includes("ship")) return "badge-info";       // Blue
    return "badge-warning";                            // Yellow (Pending)
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "Pending") return "Estimated: Soon";
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return "Invalid Date";
    }
  };

  if (loading) return (
    <div className="orders-page">
      <div className="page-header"><h2>Your Orders</h2></div>
      <div className="orders-grid">
        {[1, 2, 3].map((n) => <div key={n} className="skeleton-card"></div>)}
      </div>
    </div>
  );

  return (
    <div className="orders-page">
      <div className="page-header">
        <h2>Order History</h2>
        
        <div className="controls">
          <div className="search-box">
            <FaSearch className="icon" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-tabs">
            {["All", "Pending", "Shipped", "Delivered"].map((status) => (
              <button
                key={status}
                className={`filter-btn ${filterStatus === status ? "active" : ""}`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="orders-grid">
        <AnimatePresence mode="popLayout">
          {filteredOrders.length === 0 ? (
            <motion.div 
              key="no-orders"
              className="no-orders"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <FaBox size={50} color="#cbd5e1" />
              <p>No orders found matching your criteria.</p>
              <button onClick={() => setFilterStatus("All")} className="btn-reset">Reset Filters</button>
            </motion.div>
          ) : (
            filteredOrders.map((order) => {
              const imgSrc = order.img ? `data:image/jpeg;base64,${order.img}` : logo;
              
              return (
                <motion.div
                  key={order.uniqueKey} 
                  layout
                  className="order-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="card-image" onClick={() => navigate(`/products/${order.pid}`)}>
                    <img src={imgSrc} alt={order.pname} loading="lazy" />
                  </div>

                  <div className="card-info">
                    <div className="info-header">
                      <h3 onClick={() => navigate(`/products/${order.pid}`)}>{order.pname}</h3>
                      <span className={`status-badge ${getStatusColor(order.status)}`}>
                        {order.status || "Pending"}
                      </span>
                    </div>

                    <div className="meta-grid">
                      <div className="meta-item">
                        <FaRupeeSign className="meta-icon" />
                        <span>{order.price} <small>({order.mode || 'Prepaid'})</small></span>
                      </div>
                      <div className="meta-item">
                        <FaBox className="meta-icon" />
                        <span>Qty: {order.quantity}</span>
                      </div>
                      <div className="meta-item">
                        <FaCalendarAlt className="meta-icon" />
                        <span>{formatDate(order.deDate)}</span>
                      </div>
                    </div>

                    <div className="address-box">
                      <FaMapMarkerAlt className="map-icon" />
                      <p>{order.address}</p>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button className="btn-track">
                      <FaShippingFast /> Track
                    </button>
                    <button 
                      className="btn-view"
                      onClick={() => navigate(`/products/${order.pid}`)}
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}