import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function Shop() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Cart & Drawers State
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // Orders State
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [myOrdersList, setMyOrdersList] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Admin Management State
  const [showAdminOrdersModal, setShowAdminOrdersModal] = useState(false);
  const [adminOrdersList, setAdminOrdersList] = useState([]);
  const [adminOrdersLoading, setAdminOrdersLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Tax Invoice / Bill State
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Shipping Address
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India'
  });

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', exp: '', cvv: '' });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Landing Screen Auth State
  const [authRoleTab, setAuthRoleTab] = useState('customer'); // 'customer' | 'admin'
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Admin Add Product Form State
  const [prodForm, setProdForm] = useState({
    name: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
    description: '',
    image: ''
  });

  const isAdmin = currentUser?.role === 'admin';

  async function fetchProductsAndCategories() {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
      if (catRes.data?.length > 0 && !prodForm.category) {
        setProdForm((prev) => ({ ...prev, category: catRes.data[0]._id }));
      }
    } catch {
      toast.error('Unable to fetch product catalog');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCart() {
    if (!currentUser) return;
    try {
      const res = await api.get('/cart');
      setCart(res.data || { items: [], total: 0 });
    } catch {
      // Cart unauthenticated or empty
    }
  }

  async function fetchMyOrders() {
    if (!currentUser) return;
    try {
      setOrdersLoading(true);
      const res = await api.get('/orders/mine');
      setMyOrdersList(res.data || []);
    } catch {
      toast.error('Could not load your orders');
    } finally {
      setOrdersLoading(false);
    }
  }

  async function fetchAllCustomerOrders() {
    if (!isAdmin) return;
    try {
      setAdminOrdersLoading(true);
      const res = await api.get('/orders');
      setAdminOrdersList(res.data || []);
    } catch {
      toast.error('Failed to load customer orders');
    } finally {
      setAdminOrdersLoading(false);
    }
  }

  // Only fetch inventory and store resources if user is authenticated
  useEffect(() => {
    if (currentUser) {
      fetchProductsAndCategories();
      fetchCart();
      fetchMyOrders();
      if (currentUser.role === 'admin') {
        fetchAllCustomerOrders();
      }
    }
  }, [currentUser]);

  // Auth Handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authRoleTab === 'customer' && isRegisterMode) {
        const res = await api.post('/auth/register', {
          name: authName || 'Customer',
          email: authEmail,
          password: authPassword
        });
        const userData = res.data.user || res.data;
        if (res.data.token) localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setCurrentUser(userData);
        toast.success(`Welcome to NexaCart, ${userData.name || 'Customer'}!`);
      } else {
        const res = await api.post('/auth/login', {
          email: authEmail,
          password: authPassword
        });
        const userData = res.data.user || res.data;
        if (authRoleTab === 'admin' && userData.role !== 'admin') {
          return toast.error('Access Denied: You do not have Administrator privileges.');
        }
        if (res.data.token) localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setCurrentUser(userData);
        toast.success(`Logged in as ${userData.role === 'admin' ? 'Store Administrator' : 'Customer'}`);
      }
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    setProducts([]);
    setCart({ items: [], total: 0 });
    setMyOrdersList([]);
    setAdminOrdersList([]);
    setShowCartDrawer(false);
    setShowOrdersModal(false);
    setShowAdminOrdersModal(false);
    setSelectedInvoiceOrder(null);
    toast.success('Signed out successfully');
  };

  // Add to Cart
  const handleAddToCart = async (productId) => {
    try {
      const res = await api.post('/cart', { productId, quantity: 1 });
      setCart(res.data);
      toast.success('Added to your cart!');
      setShowCartDrawer(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item to cart');
    }
  };

  // Checkout & Payment
  const handleCheckoutAndPay = async () => {
    if (!cart.items || cart.items.length === 0) {
      return toast.error('Your cart is empty');
    }
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.zip) {
      return toast.error('Please enter street address, city, and zip code');
    }
    if (paymentMethod === 'UPI' && !upiId) {
      return toast.error('Please enter your UPI ID (e.g., yourname@okhdfcbank)');
    }
    if (paymentMethod === 'Credit Card' && (!cardDetails.number || !cardDetails.exp || !cardDetails.cvv)) {
      return toast.error('Please complete all card details');
    }

    try {
      setIsProcessingPayment(true);

      const orderPayload = {
        shippingAddress: {
          name: shippingAddress.name || currentUser?.name || 'Customer',
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state || 'TN',
          zip: shippingAddress.zip,
          country: shippingAddress.country
        },
        paymentMethod:
          paymentMethod === 'UPI'
            ? `UPI (${upiId})`
            : paymentMethod === 'Credit Card'
            ? 'Credit Card'
            : 'Cash on Delivery'
      };

      const res = await api.post('/orders', orderPayload);
      const createdOrder = res.data;

      toast.success('Order placed successfully! Generating tax invoice...');
      setCart({ items: [], total: 0 });
      setShowCartDrawer(false);

      setSelectedInvoiceOrder(createdOrder);
      fetchMyOrders();
      fetchProductsAndCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process order');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Cancel Customer Order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order? Stock will be restored to store.')) return;
    try {
      const res = await api.put(`/orders/${orderId}/cancel`);
      toast.success(res.data.message || 'Order cancelled successfully');
      fetchMyOrders();
      if (isAdmin) fetchAllCustomerOrders();
      fetchProductsAndCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  // Admin Update Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      setAdminOrdersList((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, status: newStatus } : ord))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update order status');
    }
  };

  // Admin Delete Order
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Permanently delete this order record?')) return;
    try {
      await api.delete(`/orders/${orderId}`);
      toast.success('Order permanently removed');
      setAdminOrdersList((prev) => prev.filter((ord) => ord._id !== orderId));
      fetchMyOrders();
      fetchProductsAndCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete order');
    }
  };

  // Admin Add Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!prodForm.name || !prodForm.price || !prodForm.category) {
      return toast.error('Name, Price, and Category are mandatory');
    }

    try {
      const payload = {
        name: prodForm.name,
        price: Number(prodForm.price),
        category: prodForm.category,
        brand: prodForm.brand || 'Generic',
        stock: Number(prodForm.stock) || 0,
        description: prodForm.description,
        images: prodForm.image
          ? [prodForm.image]
          : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop']
      };

      const res = await api.post('/products', payload);
      toast.success('Product catalog updated!');
      setProducts([res.data, ...products]);
      setProdForm({
        name: '',
        price: '',
        category: categories[0]?._id || '',
        brand: '',
        stock: '',
        description: '',
        image: ''
      });
      setShowAddForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product');
    }
  };

  // Admin Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product permanently from the shop?')) return;
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted');
      setProducts(products.filter((p) => p._id !== productId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const totalCartCount = cart.items?.reduce((acc, it) => acc + it.quantity, 0) || 0;
  const cartSubtotal = cart.items?.reduce((acc, it) => acc + (it.product?.price || it.price || 0) * it.quantity, 0) || 0;
  const cartShipping = cartSubtotal >= 100 || cartSubtotal === 0 ? 0 : 9.99;
  const cartTax = cartSubtotal * 0.05;
  const cartGrandTotal = cartSubtotal + cartShipping + cartTax;

  const filteredProducts = products.filter((p) => {
    const categoryName = typeof p.category === 'object' ? p.category?.name : p.category;
    const matchesCategory =
      activeCategory === 'All' ||
      categoryName?.toLowerCase() === activeCategory.toLowerCase() ||
      p.category === activeCategory;
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status) => {
    let bg = '#e5e7eb';
    let color = '#374151';
    if (status === 'Delivered') { bg = '#dcfce7'; color = '#15803d'; }
    if (status === 'Shipped' || status === 'Dispatched') { bg = '#dbeafe'; color = '#1d4ed8'; }
    if (status === 'Processing') { bg = '#fef3c7'; color = '#b45309'; }
    if (status === 'Cancelled') { bg = '#fee2e2'; color = '#b91c1c'; }
    if (status === 'Placed') { bg = '#f3e8ff'; color = '#6b21a8'; }
    return (
      <span style={{ padding: '4px 10px', borderRadius: '9999px', background: bg, color: color, fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {status || 'Placed'}
      </span>
    );
  };

  /* ==========================================================================
     1. HERO LANDING SCREEN (DISPLAYED WHEN NOT LOGGED IN - NO PRODUCTS VISIBLE)
     ========================================================================== */
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#090d16', color: '#ffffff', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        
        {/* Simple Top Brand Header */}
        <header style={{ padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '1.3rem', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}>
              N
            </div>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.02em', color: '#ffffff' }}>Nexa<span style={{ color: '#3b82f6' }}>Cart</span></span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600' }}>Enterprise Commerce Engine</span>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Secure Portal Access
          </div>
        </header>

        {/* Big Screen Hero: Split Welcome Pitch & Inline Login/Signup Card */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', background: 'radial-gradient(circle at top right, #1e293b 0%, #090d16 60%)' }}>
          <div style={{ width: '100%', maxWidth: '1140px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
            
            {/* Left Column: Big Welcome Pitch */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', fontSize: '0.8rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                <span>✨</span> WELCOME TO NEXACART
              </div>

              <h1 style={{ fontSize: '3rem', fontWeight: '900', lineHeight: 1.12, letterSpacing: '-0.03em', marginBottom: '1.25rem', color: '#ffffff' }}>
                The Next Generation of <span style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Unified Shopping.</span>
              </h1>

              <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.65, marginBottom: '2rem' }}>
                Sign in to unlock our complete catalog, tailored cart checkout with instant tax invoices, and real-time live package status tracking.
              </p>

              {/* Feature Points */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div>
                  <div style={{ fontWeight: '800', color: '#f8fafc', fontSize: '1rem', marginBottom: '2px' }}>🔒 Verified Access</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Customer or Admin credentials</div>
                </div>
                <div>
                  <div style={{ fontWeight: '800', color: '#f8fafc', fontSize: '1rem', marginBottom: '2px' }}>⚡ Instant Billing</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Custom address invoices</div>
                </div>
              </div>
            </div>

            {/* Right Column: Embedded Login & Signup Box */}
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '2.5rem', color: '#0f172a', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              
              {/* Customer vs Admin Role Tabs */}
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => { setAuthRoleTab('customer'); setIsRegisterMode(false); }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    background: authRoleTab === 'customer' ? '#ffffff' : 'transparent',
                    color: authRoleTab === 'customer' ? '#2563eb' : '#64748b',
                    boxShadow: authRoleTab === 'customer' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  Customer Access
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthRoleTab('admin'); setIsRegisterMode(false); }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    background: authRoleTab === 'admin' ? '#0f172a' : 'transparent',
                    color: authRoleTab === 'admin' ? '#ffffff' : '#64748b',
                    boxShadow: authRoleTab === 'admin' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  Admin Portal
                </button>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.45rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                  {authRoleTab === 'admin' ? 'Administrator Login' : isRegisterMode ? 'Create Customer Account' : 'Customer Sign In'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                  {authRoleTab === 'admin'
                    ? 'Use your admin credentials to manage inventory & orders'
                    : isRegisterMode
                    ? 'Register with any valid email to explore products'
                    : 'Enter your email and password to enter the store'}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit}>
                {authRoleTab === 'customer' && isRegisterMode && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>Your Name</label>
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="e.g. Alex Smith"
                      required
                      style={{ width: '100%', padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.95rem' }}
                    />
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>Email Address</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder={authRoleTab === 'admin' ? 'admin@example.com' : 'any-email@gmail.com'}
                    required
                    style={{ width: '100%', padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '6px' }}>Password</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ width: '100%', padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.95rem' }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: authRoleTab === 'admin' ? '#0f172a' : '#2563eb',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {authRoleTab === 'admin' ? 'Log In to Admin Console' : isRegisterMode ? 'Register & Enter Store' : 'Sign In to Shop'}
                </button>

                {authRoleTab === 'customer' && (
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(!isRegisterMode)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      {isRegisterMode ? 'Already have an account? Sign In' : "Don't have an account? Sign Up with any email"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     2. STOREFRONT VIEW (ONLY DISPLAYED AFTER SUCCESSFUL AUTHENTICATION)
     ========================================================================== */
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Top Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '1.2rem' }}>
              N
            </div>
            <div>
              <span style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#0f172a' }}>Nexa<span style={{ color: '#2563eb' }}>Cart</span></span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: '500', marginTop: '-2px' }}>Live Storefront</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '5px 12px', borderRadius: '9999px', fontSize: '0.85rem', gap: '8px', marginRight: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isAdmin ? '#dc2626' : '#16a34a' }}></span>
              <span style={{ color: '#475569', fontWeight: '500' }}>{currentUser.email}</span>
              <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: isAdmin ? '#fee2e2' : '#e0f2fe', color: isAdmin ? '#b91c1c' : '#0369a1', fontWeight: '700' }}>
                {isAdmin ? 'ADMIN' : 'CUSTOMER'}
              </span>
            </div>

            {isAdmin && (
              <button
                onClick={() => { fetchAllCustomerOrders(); setShowAdminOrdersModal(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
              >
                📊 Track All Orders ({adminOrdersList.length})
              </button>
            )}

            {!isAdmin && (
              <button
                onClick={() => { fetchMyOrders(); setShowOrdersModal(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
              >
                📦 My Orders ({myOrdersList.length})
              </button>
            )}

            <button
              onClick={() => setShowCartDrawer(true)}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
            >
              🛒 Cart
              <span style={{ background: '#2563eb', color: '#fff', padding: '1px 7px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '800' }}>
                {totalCartCount}
              </span>
            </button>

            <button
              onClick={handleLogout}
              style={{ padding: '8px 14px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Catalog View */}
      <main style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 1.25rem 4rem' }}>
        
        {/* Search & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by brand, title, or tags..."
              style={{ width: '100%', padding: '12px 18px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '0.95rem', outline: 'none', backgroundColor: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}
              >
                ✕
              </button>
            )}
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{ padding: '12px 22px', backgroundColor: showAddForm ? '#475569' : '#0f172a', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              {showAddForm ? '✕ Close Form' : '+ Add New Product'}
            </button>
          )}
        </div>

        {/* Admin Product Form */}
        {isAdmin && showAddForm && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.25rem', color: '#0f172a' }}>Add Product to Catalog (Admin Only)</h2>
            <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Product Name *</label>
                <input
                  type="text"
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  placeholder="e.g. Wireless Headset"
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Category *</label>
                <select
                  value={prodForm.category}
                  onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#fff' }}
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Price (₹) *</label>
                <input
                  type="number"
                  value={prodForm.price}
                  onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                  placeholder="1999"
                  min="0"
                  step="0.01"
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Brand</label>
                <input
                  type="text"
                  value={prodForm.brand}
                  onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                  placeholder="Brand Name"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Stock Quantity</label>
                <input
                  type="number"
                  value={prodForm.stock}
                  onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                  placeholder="20"
                  min="0"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Image URL</label>
                <input
                  type="text"
                  value={prodForm.image}
                  onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Product Description</label>
                <textarea
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  rows="2"
                  placeholder="Features, specifications..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>

              <button
                type="submit"
                style={{ gridColumn: '1 / -1', padding: '12px 24px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
              >
                Publish Product to Store
              </button>
            </form>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '2rem' }}>
          {['All', 'Accessories', 'Beauty', 'Electronics', 'Fashion', 'Home & Living', 'Sports'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 20px',
                borderRadius: '9999px',
                border: activeCategory === cat ? '1px solid #0f172a' : '1px solid #e2e8f0',
                backgroundColor: activeCategory === cat ? '#0f172a' : '#ffffff',
                color: activeCategory === cat ? '#ffffff' : '#475569',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#334155' }}>No products found</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {filteredProducts.map((p) => (
              <div key={p._id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '240px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                  <img
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop'}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(15, 23, 42, 0.75)', color: '#fff', fontSize: '0.7rem', fontWeight: '700', padding: '4px 8px', borderRadius: '6px' }}>
                    {p.brand || 'Generic'}
                  </span>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.3 }}>{p.name}</h3>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Price</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>₹{p.price}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: p.stock > 0 ? '#16a34a' : '#dc2626' }}>
                      {p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(p._id)}
                    disabled={p.stock <= 0}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: p.stock > 0 ? '#2563eb' : '#94a3b8',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      cursor: p.stock > 0 ? 'pointer' : 'not-allowed',
                      marginBottom: isAdmin ? '8px' : '0'
                    }}
                  >
                    {p.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteProduct(p._id)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      Delete Product
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart & Checkout Drawer */}
      {showCartDrawer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end', zIndex: 100 }}>
          <div style={{ backgroundColor: '#ffffff', width: '460px', maxWidth: '100%', height: '100%', padding: '1.75rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>Shopping Cart</h2>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Enter address & choose payment</span>
              </div>
              <button onClick={() => setShowCartDrawer(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ flex: 'none', maxHeight: '180px', overflowY: 'auto', marginBottom: '1.25rem' }}>
              {cart.items && cart.items.length > 0 ? (
                cart.items.map((item, index) => {
                  const prod = item.product || {};
                  return (
                    <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <img
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop'}
                        alt={prod.name}
                        style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{prod.name || 'Product'}</div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>₹{prod.price || item.price} × {item.quantity}</div>
                      </div>
                      <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>
                        ₹{(((prod.price || item.price) || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>Your shopping cart is empty.</div>
              )}
            </div>

            {cart.items && cart.items.length > 0 && (
              <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '1rem' }}>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', marginBottom: '6px' }}>Shipping Address</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '6px', fontSize: '0.85rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '6px', fontSize: '0.85rem' }}
                  />
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                    <input
                      type="text"
                      placeholder="City"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      style={{ width: '50%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      style={{ width: '50%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={shippingAddress.zip}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                      style={{ width: '50%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      style={{ width: '50%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', marginBottom: '6px' }}>Payment Method</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {['UPI', 'Credit Card', 'Cash on Delivery'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        style={{
                          padding: '10px 4px',
                          border: paymentMethod === method ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          borderRadius: '8px',
                          background: paymentMethod === method ? '#eff6ff' : '#ffffff',
                          color: paymentMethod === method ? '#1d4ed8' : '#475569',
                          fontWeight: '700',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        {method === 'UPI' ? '⚡ UPI' : method === 'Credit Card' ? '💳 Card' : '💵 Cash'}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === 'UPI' && (
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '1.2rem', border: '1px solid #e2e8f0' }}>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. user@okhdfcbank"
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                  </div>
                )}

                {paymentMethod === 'Credit Card' && (
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '1.2rem', border: '1px solid #e2e8f0' }}>
                    <input
                      type="text"
                      placeholder="Card Number"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '6px', fontSize: '0.85rem' }}
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.exp}
                        onChange={(e) => setCardDetails({ ...cardDetails, exp: e.target.value })}
                        style={{ width: '50%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        maxLength="3"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        style={{ width: '50%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: '600' }}>₹{cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Shipping:</span>
                    <span style={{ fontWeight: '600' }}>{cartShipping === 0 ? 'FREE' : `₹${cartShipping.toFixed(2)}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Tax (5%):</span>
                    <span style={{ fontWeight: '600' }}>₹{cartTax.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '6px', marginTop: '6px', fontWeight: '800', fontSize: '1.1rem' }}>
                    <span>Total:</span>
                    <span style={{ color: '#16a34a' }}>₹{cartGrandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutAndPay}
                  disabled={isProcessingPayment}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: isProcessingPayment ? '#94a3b8' : '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '1rem',
                    cursor: isProcessingPayment ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isProcessingPayment ? 'Validating Order...' : `Confirm & Pay ₹${cartGrandTotal.toFixed(2)}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer "My Orders" Modal */}
      {showOrdersModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '720px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0 }}>My Orders & Tracking</h2>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Account: <strong>{currentUser?.email}</strong></div>
              </div>
              <button onClick={() => setShowOrdersModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            {ordersLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading orders...</div>
            ) : myOrdersList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No orders placed yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {myOrdersList.map((ord) => (
                  <div key={ord._id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: '800' }}>Order #{ord._id.slice(-6).toUpperCase()}</span>
                      {getStatusBadge(ord.status)}
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>
                      Deliver to: <strong>{ord.shippingAddress?.street}, {ord.shippingAddress?.city} ({ord.shippingAddress?.zip})</strong>
                    </div>

                    <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.75rem' }}>
                      {(ord.items || []).map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', margin: '4px 0' }}>
                          <span>{it.name} (x{it.quantity})</span>
                          <span style={{ fontWeight: '600' }}>₹{(it.price * it.quantity).toFixed(2)}</span>
                        </div>
                      ))}

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '10px', fontWeight: '800', alignItems: 'center' }}>
                        <span>Total: ₹{(ord.total || 0).toFixed(2)}</span>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedInvoiceOrder(ord)}
                            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                          >
                            📄 View / Print Bill
                          </button>
                          
                          {ord.status !== 'Delivered' && ord.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleCancelOrder(ord._id)}
                              style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                            >
                              ✕ Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin All Orders Modal */}
      {showAdminOrdersModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px', width: '95%', maxWidth: '1000px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>Master Customer Order Tracker</h2>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Live customer order status updates & address verifications</div>
              </div>
              <button onClick={() => setShowAdminOrdersModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            {adminOrdersLoading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading orders...</div>
            ) : adminOrdersList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>No customer orders placed yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 10px' }}>Order ID</th>
                    <th style={{ padding: '12px 10px' }}>Customer</th>
                    <th style={{ padding: '12px 10px' }}>Destination</th>
                    <th style={{ padding: '12px 10px' }}>Amount</th>
                    <th style={{ padding: '12px 10px' }}>Status</th>
                    <th style={{ padding: '12px 10px' }}>Update Status</th>
                    <th style={{ padding: '12px 10px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminOrdersList.map((ord) => (
                    <tr key={ord._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px 10px', fontWeight: '800' }}>#{ord._id.slice(-6).toUpperCase()}</td>
                      <td style={{ padding: '12px 10px' }}>{ord.user?.email || 'Customer'}</td>
                      <td style={{ padding: '12px 10px' }}>
                        {ord.shippingAddress?.street}, {ord.shippingAddress?.city}
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: '800' }}>₹{(ord.total || 0).toFixed(2)}</td>
                      <td style={{ padding: '12px 10px' }}>{getStatusBadge(ord.status)}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <select
                          value={ord.status || 'Placed'}
                          onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                          style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                        >
                          <option value="Placed">Placed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <button
                          onClick={() => handleDeleteOrder(ord._id)}
                          style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '6px', padding: '6px 10px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 110 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '16px', width: '90%', maxWidth: '660px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>TAX INVOICE</h1>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>NexaCart Retail Technologies Pvt Ltd.</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: '800' }}>#{selectedInvoiceOrder._id?.slice(-8).toUpperCase()}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Date: {new Date(selectedInvoiceOrder.createdAt || Date.now()).toLocaleDateString()}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div>
                <strong style={{ display: 'block', marginBottom: '4px', textTransform: 'uppercase', color: '#64748b', fontSize: '0.75rem' }}>Billed To</strong>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{selectedInvoiceOrder.shippingAddress?.name || currentUser?.name || 'Customer'}</div>
                <div>{currentUser?.email}</div>
              </div>
              <div>
                <strong style={{ display: 'block', marginBottom: '4px', textTransform: 'uppercase', color: '#64748b', fontSize: '0.75rem' }}>Shipping Destination</strong>
                <div>{selectedInvoiceOrder.shippingAddress?.street}</div>
                <div>{selectedInvoiceOrder.shippingAddress?.city}, {selectedInvoiceOrder.shippingAddress?.state} {selectedInvoiceOrder.shippingAddress?.zip}</div>
                <div>{selectedInvoiceOrder.shippingAddress?.country || 'India'}</div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '8px' }}>Product</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(selectedInvoiceOrder.items || []).map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px', fontWeight: '600' }}>{it.name}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{it.quantity}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{it.price?.toFixed(2)}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: '700' }}>₹{(it.price * it.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Subtotal:</span>
                <span>₹{(selectedInvoiceOrder.subtotal || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Shipping Fee:</span>
                <span>{selectedInvoiceOrder.shipping === 0 ? 'FREE' : `₹${(selectedInvoiceOrder.shipping || 0).toFixed(2)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Tax (GST 5%):</span>
                <span>₹{(selectedInvoiceOrder.tax || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '6px', fontWeight: '900', fontSize: '1.15rem' }}>
                <span>Amount Paid:</span>
                <span style={{ color: '#16a34a' }}>₹{(selectedInvoiceOrder.total || 0).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => window.print()}
                style={{ padding: '10px 18px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
              >
                🖨️ Print Invoice
              </button>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                style={{ padding: '10px 18px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}