import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave, FaTruck, FaShieldAlt } from "react-icons/fa";
import "./css/Checkout.css";

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  // Address State
  const [stateFld, setStateFld] = useState("");
  const [city, setCity] = useState("");
  const [pin, setPin] = useState("");
  const [house, setHouse] = useState("");
  
  const [paymentMode, setPaymentMode] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Check Authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
          method: "GET",
          credentials: "include",
        });
        if (res.status === 401) throw new Error("Unauthorized");
      } catch {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch Product
  useEffect(() => {
    if (!id) return;
    setPageLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/user/products/${id}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => setProduct(data))
      .catch((err) => {
        console.error(err);
        alert("Unable to load product");
      })
      .finally(() => setPageLoading(false));
  }, [id]);

  // Dynamic Totals Calculation
  const orderSummary = useMemo(() => {
    if (!product) return { subtotal: 0, shipping: 0, total: 0 };
    const price = Number(product.price);
    const subtotal = price * quantity;
    const shipping = subtotal > 499 ? 0 : 40; // Free shipping over 499
    return {
      subtotal,
      shipping,
      total: subtotal + shipping
    };
  }, [product, quantity]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!stateFld || !city || !pin || !house) {
      alert("Please fill in all address fields");
      return;
    }
    
    const fullAddress = `${house}, ${city}, ${stateFld} - ${pin}`;

    try {
      setLoading(true);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/checkout/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: product.pid,
          quantity,
          address: fullAddress,
          mode: paymentMode,
        }),
      });

      if (!res.ok) throw new Error("Failed to create order");

      const data = await res.json();

      if (paymentMode === "COD") {
        navigate("/orders");
        return;
      }

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert("Razorpay SDK failed to load");
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopWave",
        description: `Order for ${product.pname}`,
        order_id: data.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(
              `${import.meta.env.VITE_API_URL}/auth/payment/verify`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  buyId: data.buyId,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            if (verifyRes.ok) {
              navigate("/orders");
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error(err);
          }
        },
        theme: { color: "#2563eb" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (e) {
      console.error(e);
      alert("Error placing order");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading || !product) {
    return <div className="loading-screen">Preparing Checkout...</div>;
  }

  // Handle Image (supports array or single string based on API)
  const imgData = Array.isArray(product.img) ? product.img[0] : product.img;
  const imgSrc = imgData 
    ? `data:image/jpeg;base64,${imgData}`
    : "https://via.placeholder.com/150";

  return (
    <div className="checkout-page">
      <motion.div 
        className="checkout-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="page-title">Secure Checkout <FaShieldAlt className="shield-icon"/></h2>

        <div className="checkout-layout">
          
          {/* --- LEFT COLUMN: Form --- */}
          <div className="form-column">
            
            {/* Address Section */}
            <div className="section-card">
              <div className="section-header">
                <FaMapMarkerAlt /> <h3>Delivery Address</h3>
              </div>
              <div className="address-form">
                <input 
                  type="text" className="full-width" placeholder="House No / Street Address" 
                  value={house} onChange={(e) => setHouse(e.target.value)} 
                />
                <div className="input-row">
                  <input 
                    type="text" placeholder="City" 
                    value={city} onChange={(e) => setCity(e.target.value)} 
                  />
                  <input 
                    type="text" placeholder="State" 
                    value={stateFld} onChange={(e) => setStateFld(e.target.value)} 
                  />
                  <input 
                    type="text" placeholder="PIN Code" 
                    value={pin} onChange={(e) => setPin(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="section-card">
               <div className="section-header">
                <FaCreditCard /> <h3>Payment Method</h3>
              </div>
              <div className="payment-options">
                <div 
                  className={`pay-card ${paymentMode === "COD" ? "active" : ""}`}
                  onClick={() => setPaymentMode("COD")}
                >
                  <FaMoneyBillWave className="pay-icon" />
                  <span>Cash on Delivery</span>
                </div>
                <div 
                  className={`pay-card ${paymentMode === "ONLINE" ? "active" : ""}`}
                  onClick={() => setPaymentMode("ONLINE")}
                >
                  <FaCreditCard className="pay-icon" />
                  <span>Pay Online</span>
                </div>
              </div>
            </div>

            {/* Product Review (Mobile Only - simplified) */}
            <div className="mobile-product-review">
              <img src={imgSrc} alt="Product" />
              <div>
                <h4>{product.pname}</h4>
                <p>Qty: {quantity}</p>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: Summary --- */}
          <div className="summary-column">
            <div className="summary-card sticky">
              <h3>Order Summary</h3>
              
              <div className="product-mini-preview">
                <img src={imgSrc} alt={product.pname} />
                <div>
                   <h4>{product.pname}</h4>
                   <span className="stock-info">
                     {product.stock > 0 ? "In Stock" : "Out of Stock"}
                   </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="quantity-control">
                <label>Quantity</label>
                <div className="qty-wrapper">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
                </div>
              </div>

              <div className="price-breakdown">
                <div className="row">
                  <span>Price (1 item)</span>
                  <span>₹{Number(product.price).toFixed(2)}</span>
                </div>
                <div className="row">
                  <span>Subtotal</span>
                  <span>₹{orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="row">
                  <span>Shipping</span>
                  <span className={orderSummary.shipping === 0 ? "free" : ""}>
                    {orderSummary.shipping === 0 ? "FREE" : `₹${orderSummary.shipping}`}
                  </span>
                </div>
                <div className="divider"></div>
                <div className="row total">
                  <span>Total Amount</span>
                  <span>₹{orderSummary.total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                className="btn-checkout" 
                onClick={handlePlaceOrder}
                disabled={loading || quantity < 1 || quantity > product.stock}
              >
                {loading ? <span className="spinner"></span> : `Pay ₹${orderSummary.total}`}
              </button>
              
              <div className="security-note">
                <FaShieldAlt /> Safe & Secure Payment
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}