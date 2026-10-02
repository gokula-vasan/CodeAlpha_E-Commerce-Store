import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaShoppingCart, 
  FaUser, 
  FaStore, 
  FaUserShield, 
  FaSignOutAlt, 
  FaBars, 
  FaHeart, 
  FaSignInAlt 
} from 'react-icons/fa';

const Navigation = () => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Scroll effect for Navbar styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update counts from localStorage
  useEffect(() => {
    const updateState = () => {
      try {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
        const user = JSON.parse(localStorage.getItem('userInfo'));
        
        const cCount = Array.isArray(cartItems) ? cartItems.reduce((acc, item) => acc + Number(item.qty || 1), 0) : 0;
        
        setCartCount(cCount);
        setWishlistCount(Array.isArray(wishlistItems) ? wishlistItems.length : 0);
        setUserInfo(user);
      } catch (err) {
        console.error('Storage parse error', err);
      }
    };
    
    updateState();
    window.addEventListener('storage', updateState);
    window.addEventListener('cartUpdated', updateState);
    return () => {
      window.removeEventListener('storage', updateState);
      window.removeEventListener('cartUpdated', updateState);
    };
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts[0].charAt(0).toUpperCase();
  };

  return (
    <Navbar 
      expand="lg" 
      fixed="top"
      className={`elite-navbar ${scrolled ? 'scrolled' : ''}`}
      variant="dark"
    >
      <Container>
        {/* Brand Logo */}
        <Navbar.Brand as={Link} to="/" className="elite-brand-logo">
          <div className="elite-logo-icon">
            <FaStore size={18} />
          </div>
          <span className="elite-logo-text">
            Elite<span className="elite-logo-accent">Shop</span>
          </span>
        </Navbar.Brand>

        {/* Mobile Toggle */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 text-white shadow-none p-1">
          <FaBars size={20} />
        </Navbar.Toggle>

        {/* Navigation Items */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-3 pt-3 pt-lg-0">
            
            {/* Admin Dashboard Pill */}
            <Link to="/admin" className="elite-admin-pill">
              <FaUserShield size={14} className="text-danger" />
              <span>Admin</span>
            </Link>

            {/* Wishlist Icon Button */}
            <Link to="/wishlist" className="elite-nav-icon-btn" title="Wishlist">
              <FaHeart size={16} className={wishlistCount > 0 ? 'text-danger pulse-soft' : ''} />
              {wishlistCount > 0 && (
                <span className="elite-badge-pill elite-badge-wishlist">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon Button */}
            <Link to="/card" className="elite-nav-icon-btn" title="Shopping Bag">
              <FaShoppingCart size={16} />
              {cartCount > 0 && (
                <span className="elite-badge-pill elite-badge-cart">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Auth Action */}
            {userInfo ? (
              <NavDropdown 
                title={
                  <div className="elite-user-chip">
                    <div className="elite-user-avatar">
                      {getInitials(userInfo.name)}
                    </div>
                    <span className="small fw-semibold">
                      {userInfo.name.split(' ')[0]}
                    </span>
                  </div>
                } 
                id="username"
                align="end"
                className="elite-user-dropdown"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  <FaUser size={13} className="text-primary" /> User Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin">
                  <FaUserShield size={13} className="text-danger" /> Admin Dashboard
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logoutHandler} className="text-danger fw-semibold">
                  <FaSignOutAlt size={13} /> Sign Out
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Link to="/login" className="elite-signin-btn">
                <FaSignInAlt size={13} />
                <span>Sign In</span>
              </Link>
            )}

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;