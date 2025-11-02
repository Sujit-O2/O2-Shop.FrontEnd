import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/SellerOrders.css";
import logo from "./assets/O2.png";


export default function SellerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        alert("Failed to load orders");
        setLoading(false);
      });
  }, [navigate]);

  const updateStatus = (orderId, newStatus) => {
    fetch(`${import.meta.env.VITE_API_URL}/seller/orders/${orderId}/status`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update status");
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o
          )
        );
      })
      .catch((err) => alert("Error updating status: " + err.message));
  };

  const deleteOrder = (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    fetch(`${import.meta.env.VITE_API_URL}/seller/orders/${orderId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete order");
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      })
      .catch((err) => alert("Error deleting order: " + err.message));
  };

  if (loading) return <p className="center">Loading seller orders...</p>;
  if (!orders.length) return <p className="center">No orders found.</p>;

  return (
    <div className="seller-orders-page">
      <h2>Manage Your Orders</h2>
      <div className="seller-orders-container">
        {orders.map((order) => (
          <div className="seller-order-card" key={order.id}>
            <div className="seller-order-image">
              <img
                src={
                  order.img
                    ? `data:image/jpeg;base64,${order.img}`
                    : logo
                }
                alt={order.pname}
              />
            </div>

            <div className="seller-order-details">
              <h3 onClick={() => navigate(`/products/${order.pid}`)}>
                {order.pname}
              </h3>
              <p><strong>Quantity:</strong> {order.quantity}</p>
              <p><strong>Price:</strong> ₹{order.price}</p>
              <p><strong>Mode:</strong> {order.mode}</p>
              <p><strong>Address:</strong> {order.address}</p>
              <p><strong>Delivery Date:</strong> {order.deDate || "Pending"}</p>

              <div className="status-row">
                <label><strong>Status:</strong></label>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                >
                  {order.status === "Paid" ? (
                    <option value="Paid">Paid</option>
                  ) : (
                    <option value="Pending">Pending</option>
                  )}
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="actions">
                <button
                  className="view-btn"
                  onClick={() => navigate(`/products/${order.pid}`)}
                >
                  View Product
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteOrder(order.id)}
                >
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
