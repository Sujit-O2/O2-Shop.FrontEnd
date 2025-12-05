import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFilter, FaBoxOpen, FaTrash, FaExternalLinkAlt, FaShippingFast } from "react-icons/fa";
import "./css/SellerOrders.css";
import logo from "./assets/O2.png";

export default function SellerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    fetch(`${import.meta.env.VITE_API_URL}/seller/myOrders`, { credentials: "include" })
      .then((res) => {
        if (res.status === 403) {
          navigate("/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then((data) => {
        if (data) setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const updateStatus = (orderId, newStatus) => {
    // Optimistic UI update (update immediately for better UX)
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    fetch(`${import.meta.env.VITE_API_URL}/seller/orders/${orderId}/status`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    }).catch((err) => {
      alert("Error updating status");
      fetchOrders(); // Revert on error
    });
  };

  const deleteOrder = (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    fetch(`${import.meta.env.VITE_API_URL}/seller/orders/${orderId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete");
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      })
      .catch((err) => alert(err.message));
  };

  // --- Helpers for Styling ---
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "status-green";
      case "Shipped": return "status-blue";
      case "Confirmed": return "status-indigo";
      case "Rejected": return "status-red";
      case "Paid": return "status-teal";
      default: return "status-yellow"; // Pending
    }
  };

  // --- Filtering Logic ---
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.pname.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.id.toString().includes(searchTerm);
    const matchesFilter = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>Loading orders...</p>
    </div>
  );

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <h2>Manage Orders</h2>
          <p>Track and update customer orders</p>
        </div>
        
        <div className="orders-stats">
          <div className="stat-pill">
            <span>Total Orders:</span> <strong>{orders.length}</strong>
          </div>
        </div>
      </div>

      {/* --- Controls Bar --- */}
      <div className="controls-container">
        <div className="search-box">
          <FaSearch className="icon" />
          <input 
            type="text" 
            placeholder="Search by product name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <FaFilter className="icon" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* --- Orders Grid --- */}
      <div className="orders-grid">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <FaBoxOpen size={50} />
            <p>No orders found matching your criteria.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div className="order-card fade-in" key={order.id}>
              <div className="order-header">
                <span className="order-id">ID: #{order.id}</span>
                <span className="order-date">{order.deDate || "Date Pending"}</span>
              </div>

              <div className="order-body">
                <div className="img-wrapper">
                  <img
                    src={order.img ? `data:image/jpeg;base64,${order.img}` : logo}
                    alt={order.pname}
                    loading="lazy"
                  />
                </div>
                
                <div className="info-wrapper">
                  <h3 onClick={() => navigate(`/products/${order.pid}`)}>{order.pname}</h3>
                  <div className="info-row">
                    <span>Qty: <strong>{order.quantity}</strong></span>
                    <span>Price: <strong>₹{order.price}</strong></span>
                  </div>
                  <p className="address-text">📍 {order.address}</p>
                </div>
              </div>

              <div className="order-footer">
                <div className="status-control">
                  <label>Status:</label>
                  <select
                    className={`status-select ${getStatusColor(order.status)}`}
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                  >
                     {/* Logic based on your original code */}
                    {order.status === "Paid" ? <option value="Paid">Paid</option> : <option value="Pending">Pending</option>}
                    <option value="Confirmed">Confirmed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="action-buttons">
                  <button 
                    className="btn-icon view" 
                    title="View Product"
                    onClick={() => navigate(`/products/${order.pid}`)}
                  >
                    <FaExternalLinkAlt />
                  </button>
                  <button 
                    className="btn-icon delete" 
                    title="Delete Order"
                    onClick={() => deleteOrder(order.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}