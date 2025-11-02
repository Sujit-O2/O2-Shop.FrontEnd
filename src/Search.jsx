import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/userdash.css"; 

export default function Search() {
  const { query } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
     const roleCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("role="));
      const role = roleCookie ? roleCookie.split("=")[1] : null;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res =(role==="SELLER")?(await axios.get(`${import.meta.env.VITE_API_URL}/seller/products/search`, {
          params: { keyword: query }, withCredentials:true
        })):(await axios.get(`${import.meta.env.VITE_API_URL}/auth/products/search`, {
          params: { keyword: query },
        }))
        setResults(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch search results.");
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchResults();
  }, [query]);

  if (loading) return <p className="status">🔍 Searching for “{query}”...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="user-page">
      <div className="user-header">
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <h2 style={{ margin: 0 }}>
            Search Results for "<span style={{ color: "#007bff" }}>{query}</span>"
          </h2>
        </div>
      </div>

      {results.length === 0 ? (
        <p className="status">No products found for your search.</p>
      ) : (
        <ul className="product-grid" role="list">
          {results.map((product) => {
            const imgSrc = product.img?.trim()
              ? `data:image/jpeg;base64,${product.img}`
              : "/placeholder.png";

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
                      <span className="price">₹{Number(product.price).toFixed(2)}</span>
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
