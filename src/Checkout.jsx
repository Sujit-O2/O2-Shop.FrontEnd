import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./css/Checkout.css";

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [stateFld, setStateFld] = useState("");
  const [city, setCity] = useState("");
  const [pin, setPin] = useState("");
  const [house, setHouse] = useState("");
  const [paymentMode, setPaymentMode] = useState("COD");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
          method: "GET",
          credentials: "include", // send cookies
        });
        if (res.status === 401) {
          alert("Please login to continue");
          navigate("/login");
        }
      } catch {
        alert("Please login to continue");
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!id) return;

    fetch(`${import.meta.env.VITE_API_URL}/user/products/${id}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Please login to continue");
        return res.json();
      })
      .then((data) => setProduct(data))
      .catch((err) => {
        console.error(err);
        alert("Unable to load product");
      });
  }, [id]);

  if (!product) return <p>Loading product...</p>;

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
    if (quantity < 1) {
      alert("Quantity must be at least 1");
      return;
    }
    if (product && Number(quantity) > Number(product.stock)) {
      alert("Quantity exceeds available stock");
      return;
    }

    const fullAddress = `${house}, ${city}, ${stateFld} - ${pin}`;

    try {
      setLoading(true);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/checkout/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: product.pid,
          quantity,
          address: fullAddress,
          mode: paymentMode,
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to create order");
      }

      const data = await res.json();

      if (paymentMode === "COD") {
        alert("Order placed successfully with Cash on Delivery!");
        navigate("/orders");
        return;
      }

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert("Failed to load Razorpay SDK. Check your connection.");
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Sujit Store",
        description: product.pname,
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
              alert("Payment successful! Order confirmed.");
              navigate("/orders");
            } else {
              const txt = await verifyRes.text();
              alert(txt || "Payment verification failed.");
            }
          } catch (err) {
            console.error(err);
            alert("Error verifying payment.");
          }
        },
        prefill: {
          name: "Your Name",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: { color: "#3399cc" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (e) {
      console.error(e);
      alert(e.message || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      <div className="checkout-content">
        <div className="product-summary">
          <img
            src={
              product.img && product.img[0]
                ? `data:image/jpeg;base64,${product.img[0]}`
                : "/default-product.png"
            }
            alt={product.pname}
            className="product-img"
          />
          <div className="product-details">
            <h3>{product.pname}</h3>
            <p>Price: ₹{product.price}</p>
            <p>Stock Available: {product.stock}</p>
          </div>
        </div>

        <div className="checkout-form">
          <label>
            Quantity:
            <input
              type="number"
              min="1"
              max={Number(product.stock)}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </label>

          <div className="address-section">
            <h3>Delivery Address</h3>
            <div className="address-grid">
              <input
                type="text"
                placeholder="State"
                value={stateFld}
                onChange={(e) => setStateFld(e.target.value)}
              />
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <input
                type="text"
                placeholder="PIN Code"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
            <textarea
              placeholder="House / Street Address"
              value={house}
              onChange={(e) => setHouse(e.target.value)}
            />
          </div>

          <label>
            Payment Mode:
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="COD">Cash on Delivery</option>
              <option value="ONLINE">Online Payment</option>
            </select>
          </label>

          <button
            className="btn-place-order"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
