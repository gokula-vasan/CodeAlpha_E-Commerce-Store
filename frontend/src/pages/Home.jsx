import React, { useEffect, useState } from 'react';
import { Row, Col, Container, Carousel, Form, Spinner, Alert, Button, InputGroup } from 'react-bootstrap';
import { FaSearch, FaShippingFast, FaHeadset, FaMoneyBillWave, FaLock, FaArrowDown } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Electronics', 'Fashion', 'Furniture', 'Books', 'Sports', 'Beauty'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/products');
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError('Failed to load products. Please check your internet connection.');
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = safeProducts.filter((product) => {
    if (!product || typeof product.name !== 'string') return false;
    const matchesSearch = product.name.toLowerCase().includes((searchTerm || '').toLowerCase().trim());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const scrollToProducts = () => {
    document.getElementById('product-section').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      
      <Carousel className="shadow-lg" style={{ marginTop: '-20px' }} fade interval={4000} indicators={false}>
        <Carousel.Item>
          <div className="position-relative" style={{ height: '550px' }}>
            <img
              className="d-block w-100 h-100"
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
              alt="First slide"
              style={{ objectFit: 'cover', filter: 'brightness(0.6)' }}
            />
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-25"></div>
            <div className="carousel-caption h-100 d-flex flex-column justify-content-center align-items-center pb-5">
               <h1 className="display-3 fw-bold text-uppercase hero-animate" style={{ letterSpacing: '3px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                  EliteShop
               </h1>
               <p className="lead fs-4 mb-4 hero-animate" style={{ animationDelay: '0.2s', maxWidth: '600px' }}>
                  Discover the future of shopping. Premium products, unbeatable prices.
               </p>
               <Button 
                 variant="light" 
                 size="lg" 
                 className="rounded-pill px-5 py-3 fw-bold shadow hero-animate hover-lift" 
                 style={{ animationDelay: '0.4s' }}
                 onClick={scrollToProducts}
               >
                  Shop Now
               </Button>
            </div>
          </div>
        </Carousel.Item>
        
        <Carousel.Item>
          <div className="position-relative" style={{ height: '550px' }}>
            <img
              className="d-block w-100 h-100"
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
              alt="Second slide"
              style={{ objectFit: 'cover', filter: 'brightness(0.6)' }}
            />
             <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-25"></div>
             <div className="carousel-caption h-100 d-flex flex-column justify-content-center align-items-center pb-5">
               <h1 className="display-3 fw-bold text-uppercase hero-animate" style={{ letterSpacing: '3px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                  New Arrivals
               </h1>
               <p className="lead fs-4 mb-4 hero-animate" style={{ animationDelay: '0.2s' }}>
                  Upgrade your lifestyle with our latest collection.
               </p>
               <Button 
                 className="btn-gradient border-0 rounded-pill px-5 py-3 fw-bold shadow hero-animate hover-lift" 
                 size="lg"
                 style={{ animationDelay: '0.4s' }}
                 onClick={scrollToProducts}
               >
                  View Collection
               </Button>
            </div>
          </div>
        </Carousel.Item>
      </Carousel>

      
      <Container className="my-5 fade-in">
        <Row className="g-4">
          {[ 
            { icon: FaShippingFast, title: "Free Shipping", text: "On all orders" },
            { icon: FaHeadset, title: "24/7 Support", text: "Expert help anytime" },
            { icon: FaMoneyBillWave, title: "Money Back", text: "30 days guarantee" },
            { icon: FaLock, title: "Secure Payment", text: "100% protected" }
          ].map((item, idx) => (
            <Col md={3} sm={6} key={idx}>
              <div className="bg-white p-4 rounded-4 shadow-sm text-center hover-lift h-100 d-flex flex-column align-items-center justify-content-center" style={{ transition: '0.3s' }}>
                <div className="bg-light rounded-circle p-3 mb-3 text-warning">
                   <item.icon size={28} />
                </div>
                <h6 className="fw-bold mb-1">{item.title}</h6>
                <small className="text-muted">{item.text}</small>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      
      <Container id="product-section" className="pt-4">
        
        
        <div className="bg-white p-4 rounded-4 shadow-sm mb-5 fade-in d-flex flex-column flex-lg-row align-items-center justify-content-between gap-3 sticky-top" style={{ top: '80px', zIndex: 10 }}>
          
         
          <div className="d-flex gap-2 overflow-auto w-100 w-lg-auto hide-scrollbar pb-2 pb-lg-0">
            {categories.map((cat) => (
              <Button 
                key={cat} 
                variant={selectedCategory === cat ? "dark" : "light"}
                className="rounded-pill px-4 fw-bold border-0"
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                style={{ transition: 'all 0.3s', whiteSpace: 'nowrap' }}
              >
                {cat}
              </Button>
            ))}
          </div>

          
          <InputGroup style={{ maxWidth: '300px' }} className="shadow-sm rounded-pill overflow-hidden border">
            <InputGroup.Text className="bg-white border-0 ps-3">
              <FaSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control 
              type="text" 
              placeholder="Search products..." 
              className="border-0 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>

       
        <div className="min-vh-50">
           {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" style={{width: '3rem', height: '3rem'}} />
              <p className="mt-3 text-muted fw-bold">Loading your exclusive shop...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="text-center shadow-sm rounded-pill mx-auto" style={{ maxWidth: '500px' }}>{error}</Alert>
          ) : (
            <Row>
              {filteredProducts.length === 0 ? (
                <Col className="text-center py-5">
                  <div className="mb-3 text-muted opacity-25" style={{ fontSize: '4rem' }}><FaSearch /></div>
                  <h4 className="text-muted">No products found</h4>
                  <Button variant="link" onClick={() => {setSearchTerm(''); setSelectedCategory('All')}}>Clear Filters</Button>
                </Col>
              ) : (
                filteredProducts.map((product, index) => (
                  <Col 
                    key={product._id} 
                    sm={12} md={6} lg={4} xl={3} 
                    className="mb-4 product-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <ProductCard product={product} />
                  </Col>
                ))
              )}
            </Row>
          )}
        </div>

      </Container>
    </div>
  );
};

export default Home;