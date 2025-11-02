import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/SellerDash.css';
import logo from "./assets/O2.png";

function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProduct, setNewProduct] = useState({
    pid: 0,
    pname: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    status: 1,
    img: null,
  });

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/seller/products`, {
        withCredentials: true,
      });
      setProducts(response.data || []);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch products. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/seller/addProducts`, newProduct, {
        withCredentials: true,
      });
      setNewProduct({
        pid: 0,
        pname: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        status: 1,
        img: null,
      });
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product. Please try again.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="seller-page">
      <header className="header">
        <div>
          <h2>Seller Dashboard</h2>
          <p className="muted">Manage listings, add new products, and edit quickly</p>
        </div>
      </header>

      {loading && <p className="muted">Loading products…</p>}
      {error && <div className="alert" role="alert">{error}</div>}

      {!loading && !error && (
        <>
          {/* Add Product Section */}
          <section className="section">
            <h3>Add New Product</h3>
            <form className="form-grid" onSubmit={handleAddProduct}>
              <div className="field">
                <label htmlFor="pname">Product Name</label>
                <input
                  id="pname"
                  type="text"
                  value={newProduct.pname}
                  onChange={(e) => setNewProduct({ ...newProduct, pname: e.target.value })}
                  required
                  className="input"
                  placeholder="e.g., Wireless Mouse"
                />
              </div>

              {/* ✅ Category Dropdown */}
              <div className="field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  required
                  className="select"
                >
                  <option value="">Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home Appliances">Home Appliances</option>
                  <option value="Books">Books</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Sports">Sports</option>
                  <option value="Toys">Toys</option>
                </select>
              </div>

              <div className="field span-2">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="textarea"
                  placeholder="Short description"
                  rows={3}
                />
              </div>

              <div className="field">
                <label htmlFor="price">Price</label>
                <input
                  id="price"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: parseFloat(e.target.value || '0') })
                  }
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
                  value={newProduct.stock}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, stock: parseInt(e.target.value || '0', 10) })
                  }
                  required
                  min="0"
                  className="input"
                />
              </div>

              <div className="field">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={newProduct.status}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, status: parseInt(e.target.value, 10) })
                  }
                  className="select"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>

              <div className="actions span-2">
                <button type="submit" className="btn-primary">Add Product</button>
              </div>
            </form>
          </section>

          {/* Product List Section */}
          <section className="section">
            <div className="section-head">
              <h3>Your Products</h3>
              <span className="count">{products.length}</span>
            </div>

            {products.length === 0 ? (
              <p className="muted">No products listed.</p>
            ) : (
              <ul className="card-grid" role="list">
                {products.map((product) => {
                  const { pid, pname, description, price, stock, status, img, category } = product;
                  const imgSrc =
                    img && img.trim().length > 0
                      ? `data:image/jpeg;base64,${img}`
                      : logo;

                  return (
                    <li key={pid} className="card" role="listitem">
                      <div className="thumb">
                        <img
                          src={imgSrc}
                          alt={"hii"}
                          loading="lazy"
                          width="640"
                          height="480"
                        />
                        {status !== 1 && <span className="badge badge-gray">Inactive</span>}
                      </div>

                      <div className="card-body">
                        <h4 className="card-title">{pname}</h4>
                        <p className="card-desc" title={description}>{description}</p>
                        <p className="muted">Category: {category || 'N/A'}</p>
                        <div className="meta">
                          <span className="price">₹{Number(price).toFixed(2)}</span>
                          <span className={`stock ${stock > 0 ? 'in' : 'out'}`}>
                            {stock > 0 ? `Stock: ${stock}` : 'Out of stock'}
                          </span>
                        </div>

                        <div className="card-actions">
                          <button
                            className="btn-secondary"
                            onClick={() => navigate(`/products/${pid}`)}
                          >
                            Show
                          </button>
                          <button
                            className="btn-primary"
                            onClick={() => navigate(`/seller/update/${pid}`)}
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default SellerDashboard;
