import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Module imports
import * as ShopModule from './pages/Shop.jsx';
import * as AuthModule from './pages/Auth.jsx';
import * as CartModule from './pages/Cart.jsx';
import * as OrdersModule from './pages/Orders.jsx';
import * as WishlistModule from './pages/Wishlist.jsx';
import * as ProfileModule from './pages/Profile.jsx';
import * as ProductModule from './pages/Product.jsx';
import * as CheckoutModule from './pages/Checkout.jsx';

import './styles.css';

// Safe component extractor
function getComponent(mod, name) {
  if (!mod) return () => <div>{name} not loaded</div>;
  if (typeof mod.default === 'function') return mod.default;
  if (typeof mod[name] === 'function') return mod[name];
  const firstFunc = Object.values(mod).find((val) => typeof val === 'function');
  if (firstFunc) return firstFunc;
  return () => <div>Component {name} not found</div>;
}

const Shop = getComponent(ShopModule, 'Shop');
const Auth = getComponent(AuthModule, 'Auth');
const Cart = getComponent(CartModule, 'Cart');
const Orders = getComponent(OrdersModule, 'Orders');
const Wishlist = getComponent(WishlistModule, 'Wishlist');
const Profile = getComponent(ProfileModule, 'Profile');
const Product = getComponent(ProductModule, 'Product');
const Checkout = getComponent(CheckoutModule, 'Checkout');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/shop" replace />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/admin" element={<Navigate to="/shop" replace />} />

        <Route path="/auth" element={<Auth />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="*" element={<Navigate to="/shop" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);