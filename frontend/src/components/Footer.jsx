import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Toast, ToastContainer } from 'react-bootstrap';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaPaperPlane, 
  FaStore, 
  FaCheckCircle,
  FaShieldAlt,
  FaArrowRight
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="elite-footer pt-5 mt-auto">
      {/* Toast Confirmation */}
      {subscribed && (
        <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
          <Toast bg="success" onClose={() => setSubscribed(false)} delay={4000} autohide className="text-white border-0 shadow-lg">
            <Toast.Body className="fw-semibold d-flex align-items-center gap-2">
              <FaCheckCircle size={18} /> Thank you for subscribing! Check your inbox soon.
            </Toast.Body>
          </Toast>
        </ToastContainer>
      )}

      <Container className="position-relative" style={{ zIndex: 2 }}>
        <Row className="py-4 g-4">
          
          {/* Column 1: Brand Info */}
          <Col lg={4} md={6} className="mb-4 pe-lg-4">
            <Link to="/" className="elite-brand-logo mb-3 d-inline-flex">
              <div className="elite-logo-icon">
                <FaStore size={18} />
              </div>
              <span className="elite-logo-text">
                Elite<span className="elite-logo-accent">Shop</span>
              </span>
            </Link>

            <p className="text-muted small mt-2 mb-4" style={{ lineHeight: '1.7', maxWidth: '320px' }}>
              Your premium destination for the latest verified trends in electronics, fashion, home, and lifestyle essentials.
            </p>

            <div className="d-flex gap-2">
              {[
                { icon: FaFacebookF, label: 'Facebook', href: '#' },
                { icon: FaTwitter, label: 'Twitter', href: '#' },
                { icon: FaInstagram, label: 'Instagram', href: '#' },
                { icon: FaLinkedinIn, label: 'LinkedIn', href: '#' }
              ].map((item, index) => (
                <a 
                  key={index} 
                  href={item.href} 
                  aria-label={item.label}
                  className="elite-social-btn"
                >
                  <item.icon size={14} />
                </a>
              ))}
            </div>
          </Col>

          {/* Column 2: Quick Links */}
          <Col lg={2} sm={6} xs={6} className="mb-4">
            <h6 className="elite-footer-title">Navigation</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li><Link to="/" className="elite-footer-link">Home Storefront</Link></li>
              <li><Link to="/card" className="elite-footer-link">Shopping Bag</Link></li>
              <li><Link to="/wishlist" className="elite-footer-link">My Wishlist</Link></li>
              <li><Link to="/profile" className="elite-footer-link">User Account</Link></li>
              <li><Link to="/login" className="elite-footer-link">Sign In</Link></li>
              <li>
                <Link to="/admin" className="elite-footer-admin-link mt-1">
                  <FaShieldAlt size={12} /> Admin Portal
                </Link>
              </li>
            </ul>
          </Col>

          {/* Column 3: Contact Details */}
          <Col lg={3} sm={6} xs={6} className="mb-4">
            <h6 className="elite-footer-title">Contact Support</h6>
            <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
              <li className="elite-footer-contact-item">
                <div className="elite-footer-contact-icon">
                  <FaMapMarkerAlt />
                </div>
                <span>123 Innovation Way,<br />Tech Park, CA 94043</span>
              </li>
              <li className="elite-footer-contact-item">
                <div className="elite-footer-contact-icon">
                  <FaEnvelope />
                </div>
                <span>support@eliteshop.com</span>
              </li>
              <li className="elite-footer-contact-item">
                <div className="elite-footer-contact-icon">
                  <FaPhone />
                </div>
                <span>+1 (800) 123-4567</span>
              </li>
            </ul>
          </Col>

          {/* Column 4: Newsletter */}
          <Col lg={3} md={6} className="mb-4">
            <h6 className="elite-footer-title">Newsletter</h6>
            <p className="small text-muted mb-3">
              Subscribe to unlock 10% off your next order and exclusive seasonal drops.
            </p>
            <Form onSubmit={handleSubscribe}>
              <InputGroup className="mb-2">
                <Form.Control
                  type="email"
                  placeholder="name@example.com"
                  className="elite-newsletter-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="elite-newsletter-btn">
                  <FaPaperPlane size={13} />
                </Button>
              </InputGroup>
            </Form>
            <small className="text-muted" style={{ fontSize: '0.72rem' }}>
              🔒 No spam ever. Unsubscribe anytime.
            </small>
          </Col>
        </Row>

        <hr className="my-4" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

        {/* Bottom Legal / Copyright */}
        <div className="pb-4 d-flex flex-column flex-md-row justify-content-between align-items-center small text-muted gap-2">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} EliteShop Inc. All rights reserved.
          </p>
          <div className="d-flex gap-4">
            <a href="#" className="elite-footer-link" style={{ fontSize: '0.8rem' }}>Privacy Policy</a>
            <a href="#" className="elite-footer-link" style={{ fontSize: '0.8rem' }}>Terms of Service</a>
            <a href="#" className="elite-footer-link" style={{ fontSize: '0.8rem' }}>Security & Cookies</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;