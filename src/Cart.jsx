import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrashAlt, FaShoppingBag, FaArrowRight, FaMinus, FaPlus } from "react-icons/fa";
import "./css/Cart.css";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/user/cart`, {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 401) {
          navigate("/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        setCartItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        // Small delay for smooth skeleton transition
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchCart();
  }, [navigate]);

  // Handle Remove
  const handleRemove = async (productPid) => {
    // Optimistic UI update: Remove immediately from UI, revert if API fails
    const originalItems = [...cartItems];
    setCartItems((prev) => prev.filter((item) => item.product.pid !== productPid));

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/user/cart/remove/${productPid}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed");
    } catch (err) {
      alert("Failed to remove item");
      setCartItems(originalItems); // Revert
    }
  };

  // Handle Quantity
  const handleQuantityChange = async (productPid, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    // Optimistic UI update
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.pid === productPid ? { ...item, quantity: newQty } : item
      )
    );

    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/user/cart/update/${productPid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ quantity: newQty }),
        }
      );
    } catch (err) {
      console.error("Update failed");
      // Revert logic could go here
    }
  };

  // Calculate Totals
  const { subtotal, totalItems } = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => ({
        subtotal: acc.subtotal + (item.product.price * item.quantity),
        totalItems: acc.totalItems + item.quantity
      }),
      { subtotal: 0, totalItems: 0 }
    );
  }, [cartItems]);

  const shipping = subtotal > 499 ? 0 : 40;
  const grandTotal = subtotal + shipping;

  // Render Loading
  if (loading) return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      <div className="cart-grid">
        <div className="cart-list">
          {[1, 2].map((i) => <div key={i} className="skeleton-item"></div>)}
        </div>
      </div>
    </div>
  );

  // Render Empty
  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <FaShoppingBag className="empty-icon" />
        </motion.div>
        <h2>Your cart is currently empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <button onClick={() => navigate("/")} className="btn-shop">
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="page-header">
        <h2>Shopping Cart <span>({totalItems} items)</span></h2>
      </div>

      <div className="cart-grid">
        {/* --- Left Column: Items --- */}
        <div className="cart-list">
          <AnimatePresence>
            {cartItems.map((item) => {
              const { product, quantity } = item;
              // Handle image array or string
              const imgRaw = Array.isArray(product.img) ? product.img[0] : product.img;
              const imageSrc = imgRaw
                ? `data:image/jpeg;base64,${imgRaw}`
                : "/default-product.png";

              return (
                <motion.div 
                  key={product.pid} 
                  className="cart-item"
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="item-image">
                    <img src={imageSrc} alt={product.pname} />
                  </div>

                  <div className="item-details">
                    <div className="item-header">
                      <h3>{product.pname}</h3>
                      <button 
                        className="btn-trash" 
                        onClick={() => handleRemove(product.pid)}
                        title="Remove Item"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                    
                    <p className="item-price">₹{Number(product.price).toLocaleString()}</p>
                    
                    <div className="item-actions">
                      <div className="qty-control">
                        <button onClick={() => handleQuantityChange(product.pid, quantity, -1)}>
                          <FaMinus />
                        </button>
                        <span>{quantity}</span>
                        <button onClick={() => handleQuantityChange(product.pid, quantity, 1)}>
                          <FaPlus />
                        </button>
                      </div>
                      
                      {/* Individual Checkout Button */}
                      <button 
                        className="btn-buy-now" 
                        onClick={() => navigate(`/checkout/${product.pid}`)}
                      >
                        Buy This Now <FaArrowRight />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* --- Right Column: Summary --- */}
        <div className="cart-summary">
          <div className="summary-card">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping Estimate</span>
              <span className={shipping === 0 ? "free-text" : ""}>
                {shipping === 0 ? "FREE" : `₹${shipping}`}
              </span>
            </div>
            
            <div className="divider"></div>
            
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>

            <p className="note">
              * Note: You can proceed to checkout for individual items using the "Buy Now" buttons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}