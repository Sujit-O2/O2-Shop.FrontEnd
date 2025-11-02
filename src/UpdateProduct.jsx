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
    imageUrl: '', // optional field for preview
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/seller/products`, {withCredentials:true});
        const prod = (response.data || []).find((p) => p.pid === parseInt(id, 10));
        if (prod) {
          setProduct({
            pname: prod.pname ?? '',
            description: prod.description ?? '',
            price: prod.price ?? 0,
            stock: prod.stock ?? 0,
            status: prod.status ?? 1,
            imageUrl: prod.img ?? '',
          });
          setError(null);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Failed to load product');
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
        headers: {
          
          'Content-Type': 'application/json',
          
        },
        withCredentials:true
      });
      alert('Product updated successfully');
      navigate('/seller/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const setField = (key, val) => setProduct((p) => ({ ...p, [key]: val }));

  if (loading) {
    return <div className="update-page"><p className="muted">Loading…</p></div>;
  }

  return (
    <div className="update-page">
      <header className="header">
        <div>
          <h2>Update Product</h2>
          <p className="muted">Edit details, availability, and pricing</p>
        </div>
        <div className="header-actions">
          <Link to="/seller/dashboard" className="btn-outlined">Back</Link>
          <button onClick={() => navigate(`/seller/products/${id}/photos`)} className="btn-outlined">
            📷 Manage Photos
          </button>
        </div>
      </header>

      {error && <div className="alert" role="alert">{error}</div>}

      <form onSubmit={handleUpdate} className="form-grid" noValidate>
        <div className="field span-2">
          <label htmlFor="pname">Product Name</label>
          <input
            id="pname"
            type="text"
            value={product.pname}
            onChange={(e) => setField('pname', e.target.value)}
            required
            className="input"
            placeholder="e.g., Wireless Mouse"
          />
        </div>

        <div className="field">
          <label htmlFor="price">Price</label>
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

        <div className="field">
          <label htmlFor="stock">Stock</label>
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

        <div className="field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={product.status}
            onChange={(e) => setField('status', parseInt(e.target.value, 10))}
            className="select"
          >
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </select>
        </div>

        

        <div className="field span-2">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={product.description}
            onChange={(e) => setField('description', e.target.value)}
            className="textarea"
            placeholder="Short description"
            rows={4}
          />
        </div>

        <div className="actions span-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateProduct;
