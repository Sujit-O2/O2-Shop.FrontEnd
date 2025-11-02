import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Cart.css";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart from backend (cookie-based auth)
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/user/cart`, {
          method: "GET",
          credentials: "include", // ✅ Send cookies automatically
        });

        if (res.status === 401) {
          // Not logged in — redirect
          navigate("/login");
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch cart items");
        const data = await res.json();

        if (!Array.isArray(data)) throw new Error("Invalid cart payload");
        setCartItems(data);
      } catch (err) {
        console.error("Error loading cart:", err);
        alert("Could not load cart items");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  // Remove from cart
  const handleRemove = async (productPid) => {
    if (!window.confirm("Remove this item from your cart?")) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/user/cart/remove/${productPid}`,
        {
          method: "DELETE",
          credentials: "include", // ✅ Cookie auth
        }
      );

      if (!res.ok) throw new Error("Failed to remove item");
      setCartItems((prev) =>
        prev.filter((ci) => ci.product.pid !== productPid)
      );
    } catch (err) {
      alert(err.message || "Error removing item");
    }
  };

  // Update quantity
  const handleQuantityChange = async (productPid, newQty) => {
    if (newQty < 1) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/user/cart/update/${productPid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // ✅ Cookie auth
          body: JSON.stringify({ quantity: newQty }),
        }
      );

      if (!res.ok) throw new Error("Failed to update quantity");
      setCartItems((prev) =>
        prev.map((ci) =>
          ci.product.pid === productPid ? { ...ci, quantity: newQty } : ci
        )
      );
    } catch (err) {
      alert(err.message || "Error updating quantity");
    }
  };

  // Checkout a single product
  const handleCheckout = (productPid) => {
    navigate(`/checkout/${productPid}`);
  };

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1),
    0
  );

  // Loading / Empty state
  if (loading) return <p>Loading your cart...</p>;
  if (!cartItems || cartItems.length === 0)
    return (
      <div className="cart-empty">
        <h2>Your cart is empty 😕</h2>
        <button onClick={() => navigate("/products")}>Shop Now</button>
      </div>
    );

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>

      <div className="cart-items">
        {cartItems.map((item) => {
          const { product, quantity } = item;
          const imageSrc = product.img
            ? `data:image/jpeg;base64,${product.img}`
            : "/default-product.png";

          return (
            <div key={item.id} className="cart-item">
              <img src={imageSrc} alt={product.pname} className="cart-img" />

              <div className="cart-details">
                <h3>{product.pname}</h3>
                <p>{product.description}</p>
                <p>Price: ₹{product.price}</p>

                <div className="quantity-section">
                  <label>Quantity: </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(product.pid, Number(e.target.value))
                    }
                  />
                </div>

                <p>Total: ₹{product.price * quantity}</p>

                <div className="cart-actions">
                  <button
                    className="remove-btn"
                    onClick={() => handleRemove(product.pid)}
                  >
                    Remove
                  </button>
                  <button
                    className="buy-btn"
                    onClick={() => handleCheckout(product.pid)}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
