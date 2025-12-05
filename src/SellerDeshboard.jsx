import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaPlus, FaBoxOpen, FaMoneyBillWave, FaClipboardList, 
  FaSearch, FaEdit, FaEye, FaTimes, FaCloudUploadAlt 
} from 'react-icons/fa';
import './css/SellerDash.css';
import logo from "./assets/O2.png";

function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [newProduct, setNewProduct] = useState({
    pid: 0,
    pname: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    status: 1,
    img: null,
  });

  const navigate = useNavigate();

  // Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/seller/products`, {
        withCredentials: true,
      });
      setProducts(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle Add Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      // Ensure numbers are sent as numbers
      const payload = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock, 10)
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/seller/addProducts`, payload, {
        withCredentials: true,
      });
      
      setNewProduct({
        pid: 0, pname: '', description: '', price: '', stock: '', category: '', status: 1, img: null,
      });
      setShowModal(false);
      fetchProducts();
      alert("Product added successfully!");
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add product.');
    }
  };

  // Filter Products based on Search
  const filteredProducts = products.filter(p => 
    p.pname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate Stats
  const totalStock = products.reduce((acc, curr) => acc + curr.stock, 0);
  const totalValue = products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);

  return (
    <div className="dashboard-container">
      {/* --- Header Section --- */}
      <header className="dash-header">
        <div className="header-text">
          <h1>Seller Dashboard</h1>
          <p>Overview of your inventory and performance</p>
        </div>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          <FaPlus /> Add New Product
        </button>
      </header>

      {/* --- Stats Cards --- */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><FaClipboardList /></div>
          <div>
            <h3>{products.length}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><FaBoxOpen /></div>
          <div>
            <h3>{totalStock}</h3>
            <p>Total Stock</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FaMoneyBillWave /></div>
          <div>
            <h3>₹{totalValue.toLocaleString()}</h3>
            <p>Inventory Value</p>
          </div>
        </div>
      </div>

      {/* --- Search Bar --- */}
      <div className="controls-bar">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search products by name or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- Content Area --- */}
      {loading ? (
        <div className="loading-state">
           <div className="spinner"></div>
           <p>Loading your inventory...</p>
        </div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <div className="product-grid">
          {filteredProducts.length === 0 ? (
            <div className="no-results">
              <p>No products found matching your search.</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const { pid, pname, description, price, stock, status, img, category } = product;
              const imgSrc = img && img.trim().length > 0 ? `data:image/jpeg;base64,${img}` : logo;

              return (
                <div key={pid} className="product-card fade-in">
                  <div className="card-img-wrapper">
                    <img src={imgSrc} alt={pname} loading="lazy" />
                    <span className={`status-badge ${status === 1 ? 'active' : 'inactive'}`}>
                      {status === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="card-content">
                    <div className="card-info">
                      <span className="category-tag">{category}</span>
                      <h4>{pname}</h4>
                      <p className="price">₹{Number(price).toFixed(2)}</p>
                      <p className={`stock-text ${stock < 5 ? 'low-stock' : ''}`}>
                        {stock} units in stock
                      </p>
                    </div>

                    <div className="card-actions">
                      <button className="action-btn view" title="View Details" onClick={() => navigate(`/products/${pid}`)}>
                        <FaEye />
                      </button>
                      <button className="action-btn edit" title="Edit Product" onClick={() => navigate(`/seller/update/${pid}`)}>
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* --- Add Product Modal --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content slide-up">
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>
            
            <form onSubmit={handleAddProduct} className="modal-form">
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  value={newProduct.pname} 
                  onChange={e => setNewProduct({...newProduct, pname: e.target.value})} 
                  required 
                  placeholder="e.g. Wireless Headset"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={newProduct.category} 
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})} 
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home">Home Appliances</option>
                    <option value="Books">Books</option>
                    <option value="Beauty">Beauty</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={newProduct.status} 
                    onChange={e => setNewProduct({...newProduct, status: parseInt(e.target.value)})}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    value={newProduct.price} 
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
                    required 
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input 
                    type="number" 
                    value={newProduct.stock} 
                    onChange={e => setNewProduct({...newProduct, stock: e.target.value})} 
                    required 
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows="3" 
                  value={newProduct.description} 
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})} 
                  placeholder="Product features and details..."
                />
              </div>

              <button type="submit" className="submit-btn">
                <FaCloudUploadAlt /> Publish Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;