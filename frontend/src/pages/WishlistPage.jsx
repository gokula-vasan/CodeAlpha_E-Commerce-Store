import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaArrowLeft } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);

  // Load wishlist items on mount and listen for changes
  useEffect(() => {
    const loadWishlist = () => {
      let items = [];
      try {
        const stored = localStorage.getItem('wishlistItems');
        items = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(items)) items = [];
      } catch {
        items = [];
      }
      setWishlistItems(items);
    };

    loadWishlist();

    // Listen for storage changes so it updates instantly if an item is removed
    window.addEventListener('storage', loadWishlist);
    return () => window.removeEventListener('storage', loadWishlist);
  }, []);

  return (
    <div className="page-bg-product pb-5" style={{ minHeight: '100vh', paddingTop: '6rem' }}>
      <Container className="fade-in">
        
        {/* --- ADDED: BACK TO PRODUCTS BUTTON --- */}
        <div className="mb-4" data-aos="fade-down">
          <Link to="/" className="text-decoration-none d-inline-block">
            <Button variant="dark" className="rounded-pill px-4 py-2 fw-bold shadow d-flex align-items-center hover-lift">
              <FaArrowLeft className="me-2" /> Back to Products
            </Button>
          </Link>
        </div>

        <div className="d-flex align-items-center mb-5" data-aos="fade-right">
             <div className="me-3 p-3 rounded-circle bg-white shadow-sm text-danger">
                 <FaHeart size={30} className="pulse-soft" />
             </div>
             <div>
                 <h2 className="fw-bold mb-0 text-dark">My Wishlist</h2>
                 <p className="mb-0 text-muted">{wishlistItems.length} saved items</p>
             </div>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="text-center py-5 border-0 shadow-lg" style={{ borderRadius: '20px' }} data-aos="zoom-in">
              <Card.Body>
                <div className="mb-3 text-muted opacity-25"><FaHeart size={80} /></div>
                <h3 className="fw-bold text-dark">Your wishlist is empty</h3>
                <p className="text-muted mb-4">Save your favorite items here to buy them later!</p>
                <Link to="/" className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm custom-btn border-0 text-white">
                    <FaArrowLeft className="me-2" /> Explore Products
                </Link>
              </Card.Body>
          </Card>
        ) : (
          <Row>
            {wishlistItems.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}

      </Container>
    </div>
  );
};

export default WishlistPage;