// Fontend/src/App.jsx - CẬP NHẬT
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import ProductList from './pages/ProductList';
import ProductListPagination from './pages/ProductListPagination';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import ViewedProducts from './pages/ViewedProducts';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Redirect root to products */}
        <Route path="/" element={<Navigate to="/products" replace />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/viewed-products" element={<ViewedProducts />} />
        
        {/* Product routes */}
        <Route path="/categories" element={<Categories />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products-pagination" element={<ProductListPagination />} />
        <Route path="/category/:categorySlug" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>
    </Router>
  );
}

export default App;