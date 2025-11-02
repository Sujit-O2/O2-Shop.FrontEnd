import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Order.css";
import logo from "./assets/O2.png";


export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/user/orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", 
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then((data) => {
        setOrders(data);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        alert("Failed to load orders. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading your orders...</p>;
  if (!orders.length) return <p style={{ textAlign: "center" }}>No orders found.</p>;

  return (
    <div className="orders-page">
      <h2>Your Orders</h2>
      <div className="orders-container">
        {orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-image">
              <img
                src={
                  order.img
                    ? `data:image/jpeg;base64,${order.img}`
                    : logo
                }
                alt={order.pname}
              />
            </div>
            <div
              className="order-details"
              onClick={() => navigate(`/products/${order.pid}`)}
            >
              <h3>{order.pname}</h3>
              <p><strong>Quantity:</strong> {order.quantity}</p>
              <p><strong>Price:</strong> ₹{order.price}</p>
              <p><strong>Mode:</strong> {order.mode}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Delivery Date:</strong> {order.deDate || "Pending"}</p>
              <p>
                <strong>Address:</strong>{" "}
                <span className="order-address">{order.address}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
