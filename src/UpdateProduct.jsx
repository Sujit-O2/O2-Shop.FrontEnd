// UpdateProduct.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './css/UpdateProd.css';

function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    pname: '',
    description: '',
    price: 0,
    stock: 0,
    status: 1,
    imageUrl: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Ideally, fetch by ID: /seller/product/${id} if your API supports it
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/seller/products`, { withCredentials: true });
        
        // Note: Check if response.data is the array or if it's wrapped in an object
        const productList = Array.isArray(response.data) ? response.data : response.data.products || [];
        
        const prod = productList.find((p) => p.pid === parseInt(id, 10));

        if (prod) {
          setProduct({
            pname: prod.pname ?? '',
            description: prod.description ?? '',
            price: prod.price ?? 0,
            stock: prod.stock ?? 0,
            status: prod.status ?? 1,
            imageUrl: prod.img || 'https://via.placeholder.com/150?text=No+Image',
          });
          setError(null);
        } else {
          setError('Product not found in database.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load product details. Check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/seller/updateProduct/${id}`, product, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      // Optional: Use a toast library here instead of alert
      alert('Success! Product updated.');
      navigate('/seller/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const setField = (key, val) => setProduct((p) => ({ ...p, [key]: val }));

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="muted">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="update-page">
      {/* Header Section */}
      <header className="header">
        <div>
          <h2>Update Product</h2>
          <p className="muted">Manage details for <strong>#{id}</strong></p>
        </div>
        <div className="header-actions">
          <Link to="/seller/dashboard" className="btn-outlined">
            Cancel
          </Link>
          <button onClick={() => navigate(`/seller/products/${id}/photos`)} className="btn-outlined">
            📷 Manage Photos
          </button>
        </div>
      </header>

      {error && <div className="alert" role="alert">⚠️ {error}</div>}

      {/* Main Form Card */}
      <div className="form-card">
        <form onSubmit={handleUpdate} className="form-grid" noValidate>
          
          {/* Image Preview & Name Group */}
          <div className="field span-2">
            <div className="image-preview-box">
              <img 
                src={product.imageUrl} 
                alt="Preview" 
                className="thumb-img" 
                onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Error'}
              />
              <div style={{ flex: 1 }}>
                 <label htmlFor="pname">Product Name</label>
                 <input
                  id="pname"
                  type="text"
                  value={product.pname}
                  onChange={(e) => setField('pname', e.target.value)}
                  required
                  className="input"
                  placeholder="e.g., Wireless Gaming Mouse"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="field">
            <label htmlFor="price">Price (₹)</label>
            <input
              id="price"
              type="number"
              value={product.price}
              onChange={(e) => setField('price', parseFloat(e.target.value || '0'))}
              required
              min="0"
              step="0.01"
              className="input"
            />
          </div>

          {/* Stock */}
          <div className="field">
            <label htmlFor="stock">Stock Quantity</label>
            <input
              id="stock"
              type="number"
              value={product.stock}
              onChange={(e) => setField('stock', parseInt(e.target.value || '0', 10))}
              required
              min="0"
              className="input"
            />
          </div>

          {/* Status */}
          <div className="field">
            <label htmlFor="status">Availability Status</label>
            <select
              id="status"
              value={product.status}
              onChange={(e) => setField('status', parseInt(e.target.value, 10))}
              className="select"
            >
              <option value={1}>✅ Active (Visible)</option>
              <option value={0}>⛔ Inactive (Hidden)</option>
            </select>
          </div>

          {/* Empty spacer for grid alignment on desktop */}
          <div className="field desktop-only"></div>

          {/* Description */}
          <div className="field span-2">
            <label htmlFor="description">Product Description</label>
            <textarea
              id="description"
              value={product.description}
              onChange={(e) => setField('description', e.target.value)}
              className="textarea"
              placeholder="Describe the main features of the product..."
              rows={5}
            />
          </div>

          {/* Action Buttons */}
          <div className="actions span-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <span><span className="spinner" style={{width: '15px', height:'15px', borderTopColor: '#fff', display: 'inline-block', marginRight:'8px'}}></span> Saving...</span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProduct;