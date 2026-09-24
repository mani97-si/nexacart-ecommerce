import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
    description: '',
    image: ''
  });

  async function loadData() {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      if (catRes.data.length > 0 && !form.category) {
        setForm((prev) => ({ ...prev, category: catRes.data[0]._id }));
      }
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      return toast.error('Please fill all required fields');
    }

    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        brand: form.brand || 'Generic',
        stock: Number(form.stock) || 0,
        description: form.description,
        images: form.image ? [form.image] : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop']
      };

      const res = await api.post('/products', payload);
      toast.success('Product created successfully');
      setProducts([res.data, ...products]);

      // Reset form
      setForm({
        name: '',
        price: '',
        category: categories[0]?._id || '',
        brand: '',
        stock: '',
        description: '',
        image: ''
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product removed');
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Admin Panel...</div>;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Admin Dashboard</h1>

      {/* Add Product Form */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Add New Product</h2>
        <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Product Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Mechanical Keyboard"
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Price (₹) *</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="e.g. 499"
              min="0"
              step="0.01"
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Brand</label>
            <input
              type="text"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="e.g. Logitech"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Initial Stock</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="e.g. 25"
              min="0"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Image URL</label>
            <input
              type="text"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              placeholder="Product details, specs, and highlights..."
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <button
            type="submit"
            style={{
              gridColumn: '1 / -1',
              padding: '10px 20px',
              backgroundColor: '#111827',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Create Product
          </button>
        </form>
      </div>

      {/* Inventory Management */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Product Inventory ({products.length})
        </h2>
        <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px' }}>Product</th>
                <th style={{ padding: '12px' }}>Price</th>
                <th style={{ padding: '12px' }}>Stock</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {p.images?.[0] && (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    )}
                    <span style={{ fontWeight: '500' }}>{p.name}</span>
                  </td>
                  <td style={{ padding: '12px' }}>₹{p.price}</td>
                  <td style={{ padding: '12px' }}>{p.stock}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteProduct(p._id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}