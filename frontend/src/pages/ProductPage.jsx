import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Card, Button, Form, Container, Badge, Spinner, Alert, Toast, ToastContainer } from 'react-bootstrap';
import api from '../services/api';
import { FaShoppingCart, FaArrowLeft, FaStar, FaTruck, FaShieldAlt, FaCheck } from 'react-icons/fa';
import { formatToINR } from '../utils/currencyUtils';

const ProductPage = () => {
  const { id } = useParams(); 
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found or server error');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCartHandler = () => {
    if (!product) return;

    let cartItems = [];
    try {
      const stored = localStorage.getItem('cartItems');
      cartItems = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(cartItems)) cartItems = [];
    } catch {
      cartItems = [];
    }

    const selectedQty = Math.max(1, Number(qty) || 1);
    const existingIndex = cartItems.findIndex((x) => x._id === product._id);

    if (existingIndex !== -1) {
      const currentQty = Number(cartItems[existingIndex].qty) || 1;
      const maxStock = product.countInStock || 10;
      cartItems[existingIndex].qty = Math.min(currentQty + selectedQty, maxStock);
    } else {
      cartItems.push({
        _id: product._id,
        name: product.name,
        image: product.image,
        price: Number(product.price) || 0,
        category: product.category,
        countInStock: product.countInStock,
        qty: selectedQty,
      });
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('cartUpdated'));

    // Visual feedback
    setIsAdded(true);
    setShowToast(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2500);
  };

  if (loading) return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh', marginTop: '80px' }}>
       <Spinner animation="grow" variant="primary" style={{ width: '4rem', height: '4rem' }} />
    </Container>
  );

  if (error || !product) return (
    <Container className="text-center" style={{ marginTop: '120px' }}>
      <Alert variant="danger" className="shadow-sm">{error || 'Product not found'}</Alert>
      <Link className="btn btn-dark rounded-pill px-4" to="/">Back to Home</Link>
    </Container>
  );

  return (
    <Container className="fade-in" style={{ marginTop: '100px', marginBottom: '50px' }}>
      
      {/* Toast Notification */}
      {showToast && (
        <ToastContainer position="top-center" style={{ zIndex: 9999, position: 'fixed', top: '80px' }}>
          <Toast bg="success" onClose={() => setShowToast(false)} delay={3000} autohide className="text-white shadow-lg">
            <Toast.Body className="fw-bold d-flex align-items-center justify-content-between gap-3">
              <span className="d-flex align-items-center gap-2">
                <FaCheck /> {product.name} ({qty}) added to cart!
              </span>
              <Link to="/card" className="btn btn-sm btn-light fw-bold rounded-pill text-success px-3">
                View Cart
              </Link>
            </Toast.Body>
          </Toast>
        </ToastContainer>
      )}

      {/* Back Button */}
      <div className="mb-4">
        <Link to="/" className="text-decoration-none d-inline-block">
          <Button variant="dark" className="rounded-pill px-4 py-2 fw-bold shadow d-flex align-items-center hover-lift">
            <FaArrowLeft className="me-2" /> Back to Products
          </Button>
        </Link>
      </div>

      <Row className="g-5">
        
        {/* LEFT COLUMN: Product Image */}
        <Col md={6} className="mb-4">
          <div className="p-4 bg-white rounded-4 shadow-sm hover-lift position-relative d-flex align-items-center justify-content-center" style={{ minHeight: '380px', overflow: 'hidden' }}>
            <Image 
              src={product.image} 
              alt={product.name} 
              fluid 
              className="product-image-zoom" 
              style={{ maxHeight: '420px', maxWidth: '100%', objectFit: 'contain', transition: 'transform 0.5s ease', cursor: 'pointer', borderRadius: '15px' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f1f3f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23adb5bd' font-family='sans-serif' font-size='18'%3ENo Image Available%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </Col>

        {/* MIDDLE COLUMN: Product Info */}
        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item className="border-0 px-0 bg-transparent">
              <Badge bg="light" text="dark" className="border fw-normal px-2 py-1 mb-2 text-uppercase">
                {product.category || 'General'}
              </Badge>
              <h2 className="fw-bold text-dark display-6 mb-2">{product.name}</h2>
              <div className="mb-2 d-flex align-items-center">
                 <span className="text-warning fs-6 me-2">
                   {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < (product.rating || 4) ? "text-warning" : "text-muted opacity-25"} />
                   ))}
                 </span>
                 <span className="text-muted small">({product.numReviews || 0} reviews)</span>
              </div>
            </ListGroup.Item>

            <ListGroup.Item className="border-0 px-0 bg-transparent py-2">
              <h3 className="fw-bold text-primary display-5">{formatToINR(product.price)}</h3>
            </ListGroup.Item>

            <ListGroup.Item className="border-0 px-0 bg-transparent text-muted" style={{ lineHeight: '1.8' }}>
              {product.description}
            </ListGroup.Item>

            {/* Features Icons */}
            <ListGroup.Item className="border-0 px-0 bg-transparent mt-3">
               <div className="d-flex flex-column gap-2 text-muted small">
                  <div className="d-flex align-items-center"><FaTruck className="me-2 text-primary"/> Free Delivery on orders over {formatToINR(500)}</div>
                  <div className="d-flex align-items-center"><FaShieldAlt className="me-2 text-primary"/> 2 Year Extended Warranty</div>
               </div>
            </ListGroup.Item>
          </ListGroup>
        </Col>

        {/* RIGHT COLUMN: Action Card */}
        <Col md={3}>
          <Card className="shadow border-0 rounded-4 sticky-top" style={{ top: '100px' }}>
            <Card.Body className="p-4">
              <ListGroup variant="flush">
                <ListGroup.Item className="border-0 px-0 pb-2">
                  <Row>
                    <Col className="text-muted">Price:</Col>
                    <Col className="text-end"><strong>{formatToINR(product.price)}</strong></Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item className="border-0 px-0 pb-3">
                  <Row>
                    <Col className="text-muted">Status:</Col>
                    <Col className="text-end">
                      {product.countInStock > 0 ? (
                        <Badge bg="success" className="px-2 py-1 fw-normal">In Stock ({product.countInStock})</Badge>
                      ) : (
                        <Badge bg="danger" className="px-2 py-1 fw-normal">Out of Stock</Badge>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>

                {product.countInStock > 0 && (
                  <ListGroup.Item className="border-0 px-0 pb-3">
                    <Row className="align-items-center">
                      <Col className="text-muted">Quantity:</Col>
                      <Col>
                        <Form.Select 
                          value={qty} 
                          onChange={(e) => setQty(Number(e.target.value))}
                          className="form-select-sm shadow-none border-secondary text-center fw-bold"
                        >
                          {[...Array(Math.min(product.countInStock, 10)).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )}

                <ListGroup.Item className="border-0 px-0 pt-3">
                  <Button
                    onClick={addToCartHandler}
                    className={`w-100 fw-bold py-2 shadow-sm transition-all border-0 ${isAdded ? 'btn-success' : 'custom-btn text-white'}`}
                    type="button"
                    disabled={product.countInStock === 0}
                    style={{ 
                      background: isAdded ? '#28a745' : 'linear-gradient(to right, #1e3c72, #2a5298)', 
                      borderRadius: '10px'
                    }}
                  >
                    {isAdded ? (
                      <><FaCheck className="me-2" /> Added to Cart!</>
                    ) : (
                      <><FaShoppingCart className="me-2" /> Add to Cart</>
                    )}
                  </Button>

                  {/* Immediate Navigation Link to Cart */}
                  <Link 
                    to="/card" 
                    className="btn btn-outline-dark w-100 mt-2 py-2 fw-semibold rounded-3 d-flex align-items-center justify-content-center"
                    style={{ fontSize: '0.9rem' }}
                  >
                    Go to Cart &rarr;
                  </Link>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

      </Row>
    </Container>
  );
};

export default ProductPage;