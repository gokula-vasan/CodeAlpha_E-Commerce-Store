import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// --- IMPORT AOS FOR ANIMATIONS ---
import AOS from 'aos';
import 'aos/dist/aos.css';

// Components & Pages
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CardPage from './pages/Card'; 
import AdminDashboard from './pages/AdminDashboard';
import ProductPage from './pages/ProductPage'; 
import ProfilePage from './pages/ProfilePage'; 
import WishlistPage from './pages/WishlistPage'; // <-- 1. IMPORT ADDED HERE

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// --- Scroll To Top Helper ---
// Ensures page scrolls to top when navigating
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppContent = () => {
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <div className="d-flex flex-column min-vh-100">
      {!isAuthPage && <Navbar />}
      
      <main className="flex-grow-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/card" element={<CardPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/product/:id" element={<ProductPage />} />

          {/* Private / User Routes */}
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Admin Route */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      
      {!isAuthPage && <Footer />}
    </div>
  );
};

function App() {
  // --- INITIALIZE ANIMATIONS ---
  useEffect(() => {
    AOS.init({
      duration: 800, // Animation duration (800ms feels smooth)
      once: true,    // Only animate once when scrolling down
      offset: 100,   // Triggers animation slightly before it enters the screen
    });
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;