import React, { useState, useEffect } from 'react';
import { Row, Col, ListGroup, Image, Button, Card, Container, Spinner, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaArrowLeft, FaShoppingBag, FaLock, FaCreditCard, FaTruck } from 'react-icons/fa';
import api from '../services/api';
import { formatToINR } from '../utils/currencyUtils';

const CardPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let items = [];
    try {
      const stored = localStorage.getItem('cartItems');
      items = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(items)) items = [];
    } catch {
      items = [];
    }
    const itemsWithQty = items.map(item => ({ ...item, qty: item.qty || 1 }));
    setCartItems(itemsWithQty);
  }, []);

  const updateCart = (newItems) => {
    setCartItems(newItems);
    localStorage.setItem('cartItems', JSON.stringify(newItems));
    window.dispatchEvent(new Event("storage"));
  };

  const removeFromCart = (index) => {
    const newItems = cartItems.filter((_, i) => i !== index);
    updateCart(newItems);
  };

  const changeQty = (index, delta) => {
    const newItems = [...cartItems];
    const currentItem = newItems[index];
    const newQty = currentItem.qty + delta;
    const maxStock = currentItem.countInStock || 10; 

    if (newQty > 0 && newQty <= maxStock) {
        newItems[index].qty = newQty;
        updateCart(newItems);
    } else if (newQty > maxStock) {
        alert(`Sorry, only ${maxStock} items available in stock.`);
    }
  };

  const baseTotalPrice = cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
  const totalItems = cartItems.reduce((acc, item) => acc + (Number(item.qty) || 1), 0);

  const checkoutHandler = async () => {
    let userInfo = null;
    try {
      const stored = localStorage.getItem('userInfo');
      userInfo = stored ? JSON.parse(stored) : null;
    } catch {
      userInfo = null;
    }
    
    if (!userInfo) {
        alert("Please Sign In to Place an Order");
        navigate('/login?redirect=card');
        return;
    }

    try {
        setLoadingCheckout(true);

        const orderItemsToSend = cartItems.map(item => ({
            name: item.name,
            qty: Number(item.qty) || 1,
            image: item.image,
            price: Number(item.price) || 0,
            product: item._id 
        }));

        const orderData = {
            orderItems: orderItemsToSend,
            totalPrice: baseTotalPrice
        };

        await api.post('/orders', orderData);

        alert('Order Placed Successfully!');
        updateCart([]); 
        navigate('/profile'); 

    } catch (error) {
        console.error("Order Error:", error);
        const errorMsg = error.response && error.response.data.message ? error.response.data.message : error.message;
        alert(`Failed to place order: ${errorMsg}`);
    } finally {
        setLoadingCheckout(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ alignItems: 'flex-start', paddingTop: '6rem', paddingBottom: '4rem', height: 'auto', minHeight: '100vh' }}>
      <Container className="fade-in">
        
        <div className="d-flex align-items-center mb-5">
             <div className="me-3 p-3 rounded-circle bg-white shadow-sm text-primary">
                 <FaShoppingBag size={30} />
             </div>
             <div>
                 <h2 className="fw-bold mb-0 text-white">Shopping Bag</h2>
                 <p className="mb-0 text-white-50">{totalItems} items in your cart</p>
             </div>
        </div>
        
        <Row className="g-4">
          
          <Col lg={8}>
            {cartItems.length === 0 ? (
              <Card className="text-center py-5 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                  <Card.Body>
                    <div className="mb-3 text-muted opacity-25"><FaShoppingBag size={80} /></div>
                    <h3 className="fw-bold text-dark">Your cart is empty</h3>
                    <p className="text-muted mb-4">Looks like you haven't added anything yet.</p>
                    <Link to="/" className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm custom-btn border-0 text-white">
                        <FaArrowLeft className="me-2" /> Start Shopping
                    </Link>
                  </Card.Body>
              </Card>
            ) : (
              <div className="d-flex flex-column gap-3">
                {cartItems.map((item, index) => (
                  <Card key={index} className="border-0 shadow-sm hover-lift" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                    <Card.Body className="p-3">
                      <Row className="align-items-center">
                        
                        <Col xs={3} sm={2}>
                          <div className="bg-light rounded p-2 text-center d-flex align-items-center justify-content-center" style={{ height: '80px' }}>
                              <Image 
                                src={item.image} 
                                alt={item.name} 
                                fluid 
                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f1f3f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23adb5bd' font-size='10'%3ENo Img%3C/text%3E%3C/svg%3E";
                                }}
                              />
                          </div>
                        </Col>
                        
                        <Col xs={9} sm={4}>
                          <Link to={`/product/${item._id}`} className="text-decoration-none text-dark">
                            <h6 className="fw-bold mb-1 text-truncate">{item.name}</h6>
                          </Link>
                          <div className="small text-muted mb-1">{item.category || 'General'}</div>
                          {item.countInStock > 0 ? (
                            <Badge bg="success" className="fw-normal">In Stock</Badge>
                          ) : (
                            <Badge bg="danger" className="fw-normal">Out of Stock</Badge>
                          )}
                        </Col>
                        
                        <Col xs={6} sm={3} className="mt-3 mt-sm-0">
                            <div className="d-flex align-items-center bg-light rounded-pill p-1 border" style={{ width: 'fit-content' }}>
                                <Button variant="link" size="sm" className="text-dark p-0 px-2" onClick={() => changeQty(index, -1)}>
                                    <FaMinus size={10} />
                                </Button>
                                <span className="fw-bold mx-2 small">{item.qty}</span>
                                <Button variant="link" size="sm" className="text-dark p-0 px-2" onClick={() => changeQty(index, 1)}>
                                    <FaPlus size={10} />
                                </Button>
                            </div>
                        </Col>

                        <Col xs={6} sm={3} className="text-end mt-3 mt-sm-0">
                            <h5 className="fw-bold mb-0 text-primary">{formatToINR(item.price * item.qty)}</h5>
                            <small className="text-muted d-block mb-1">{formatToINR(item.price)} / each</small>
                            <Button variant="link" className="text-danger p-0 small text-decoration-none" onClick={() => removeFromCart(index)}>
                                <FaTrash size={12} className="me-1" /> Remove
                            </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-lg sticky-top" style={{ top: '100px', borderRadius: '20px', overflow: 'hidden' }}>
              <div className="bg-light p-4 border-bottom">
                  <h5 className="fw-bold mb-0 text-dark">Order Summary</h5>
              </div>
              <Card.Body className="p-4 bg-white">
                <ListGroup variant="flush">
                  <ListGroup.Item className="border-0 px-0 d-flex justify-content-between align-items-center">
                      <span className="text-muted">Subtotal ({totalItems} items)</span>
                      <span className="fw-bold">{formatToINR(baseTotalPrice)}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0 px-0 d-flex justify-content-between align-items-center">
                      <span className="text-muted">Shipping</span>
                      <span className="text-success fw-bold">Free</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0 px-0 d-flex justify-content-between align-items-center">
                      <span className="text-muted">Tax Estimate</span>
                      <span className="fw-bold">{formatToINR(0)}</span>
                  </ListGroup.Item>
                  
                  <hr className="my-3 opacity-10" />

                  <ListGroup.Item className="border-0 px-0 d-flex justify-content-between align-items-center mb-4">
                      <h5 className="fw-bold mb-0">Total</h5>
                      <h4 className="fw-bold text-primary mb-0">{formatToINR(baseTotalPrice)}</h4>
                  </ListGroup.Item>
                  
                  <Button 
                      className="w-100 custom-btn text-white fw-bold py-3 shadow-sm border-0 d-flex align-items-center justify-content-center" 
                      disabled={cartItems.length === 0 || loadingCheckout} 
                      onClick={checkoutHandler}
                      style={{ borderRadius: '12px', background: 'linear-gradient(to right, #1e3c72, #2a5298)' }}
                  >
                    {loadingCheckout ? (
                      <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                          Processing...
                      </>
                    ) : (
                      <>
                          <FaLock className="me-2" /> Checkout Now
                      </>
                    )}
                  </Button>
                  
                  <div className="mt-4 pt-3 border-top">
                      <div className="d-flex align-items-center justify-content-center gap-3 text-muted opacity-50">
                          <FaCreditCard size={24} />
                          <FaLock size={20} />
                          <FaTruck size={24} />
                      </div>
                      <p className="text-center text-muted small mt-2 mb-0">Secure Checkout • Free Shipping • Easy Returns</p>
                  </div>

                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

        </Row>
      </Container>
    </div>
  );
};

export default CardPage;