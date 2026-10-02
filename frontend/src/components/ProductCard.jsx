import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Toast, ToastContainer } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaStar, FaHeart, FaRegHeart, FaCheck } from 'react-icons/fa';
import { formatToINR } from '../utils/currencyUtils';

const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(() => {
    try {
      const stored = localStorage.getItem('wishlistItems');
      const wishlist = stored ? JSON.parse(stored) : [];
      return Array.isArray(wishlist) && wishlist.some((x) => x._id === product?._id);
    } catch {
      return false;
    }
  });
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ show: false, message: '', variant: 'success' }), 2500);
  };

  // Synchronize wishlist status on storage updates
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('wishlistItems');
        const wishlist = stored ? JSON.parse(stored) : [];
        if (Array.isArray(wishlist)) {
          setIsWishlisted(wishlist.some((x) => x._id === product?._id));
        }
      } catch {
        setIsWishlisted(false);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [product?._id]);

  const toggleWishlistHandler = (e) => {
    e.preventDefault();
    let wishlist = [];
    try {
      const stored = localStorage.getItem('wishlistItems');
      wishlist = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(wishlist)) wishlist = [];
    } catch {
      wishlist = [];
    }

    if (isWishlisted) {
      wishlist = wishlist.filter((x) => x._id !== product._id);
      showToast('Removed from wishlist', 'secondary');
    } else {
      wishlist.push(product);
      showToast('Added to wishlist ❤️', 'danger');
    }

    localStorage.setItem('wishlistItems', JSON.stringify(wishlist));
    setIsWishlisted(!isWishlisted);
    window.dispatchEvent(new Event('storage'));
  };

  const addToCartHandler = (e) => {
    e.preventDefault();
    let cartItems = [];
    try {
      const stored = localStorage.getItem('cartItems');
      cartItems = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(cartItems)) cartItems = [];
    } catch {
      cartItems = [];
    }

    const existingItemIndex = cartItems.findIndex((x) => x._id === product._id);

    if (existingItemIndex !== -1) {
      const currentQty = Number(cartItems[existingItemIndex].qty) || 1;
      const maxStock = product.countInStock || 10;
      cartItems[existingItemIndex].qty = Math.min(currentQty + 1, maxStock);
      showToast(`Added another ${product.name} to cart! (Qty: ${cartItems[existingItemIndex].qty})`);
    } else {
      cartItems.push({ ...product, qty: 1 });
      showToast(`${product.name} added to cart!`);
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  return (
    <Card
      data-aos="fade-up"
      className="my-3 border-0 shadow-sm rounded-4 h-100 hover-lift overflow-hidden position-relative"
      style={{ transition: 'all 0.3s ease' }}
    >
      {/* Toast Notification */}
      {toast.show && (
        <ToastContainer position="top-center" style={{ zIndex: 9999, position: 'fixed', top: '80px' }}>
          <Toast show={toast.show} bg={toast.variant} delay={2500} autohide className="text-white">
            <Toast.Body className="fw-bold d-flex align-items-center gap-2">
              <FaCheck /> {toast.message}
            </Toast.Body>
          </Toast>
        </ToastContainer>
      )}

      {/* Wishlist Heart Button */}
      <div className="position-absolute top-0 end-0 p-3" style={{ zIndex: 10 }}>
        <div
          onClick={toggleWishlistHandler}
          className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center text-muted"
          style={{ width: '35px', height: '35px', cursor: 'pointer', transition: '0.2s' }}
        >
          {isWishlisted ? <FaHeart color="red" size={16} className="pulse-soft" /> : <FaRegHeart size={16} />}
        </div>
      </div>

      {/* Product Image */}
      <Link
        to={`/product/${product._id}`}
        className="overflow-hidden bg-light d-flex align-items-center justify-content-center p-4"
        style={{ height: '220px' }}
      >
        <Card.Img
          src={product.image}
          variant="top"
          className="product-image-zoom"
          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f1f3f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23adb5bd' font-family='sans-serif' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
          }}
        />
      </Link>

      <Card.Body className="d-flex flex-column p-4">
        <div className="mb-2">
          <Badge
            bg="light"
            text="secondary"
            className="border fw-normal px-2 py-1 text-uppercase"
            style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}
          >
            {product.category || 'General'}
          </Badge>
        </div>

        <Link to={`/product/${product._id}`} className="text-decoration-none text-dark mb-2">
          <Card.Title
            as="h6"
            className="fw-bold text-truncate"
            title={product.name}
            style={{ lineHeight: '1.4' }}
          >
            {product.name}
          </Card.Title>
        </Link>

        <div className="mb-3 d-flex align-items-center">
          <div className="d-flex text-warning small me-2" style={{ fontSize: '0.8rem' }}>
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < (product.rating || 4) ? '' : 'text-muted opacity-25'} />
            ))}
          </div>
          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
            ({product.numReviews || 0} reviews)
          </small>
        </div>

        <div className="mt-auto d-flex align-items-center justify-content-between">
          <h5 className="mb-0 fw-bold text-primary">{formatToINR(product.price)}</h5>

          <Button
            className="rounded-pill px-3 py-2 custom-btn border-0 shadow-sm d-flex align-items-center justify-content-center"
            onClick={addToCartHandler}
            disabled={product.countInStock === 0}
            style={{ fontSize: '0.85rem' }}
          >
            {product.countInStock === 0 ? (
              <span className="small">Out of Stock</span>
            ) : (
              <><FaShoppingCart className="me-2" /> Add</>
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;