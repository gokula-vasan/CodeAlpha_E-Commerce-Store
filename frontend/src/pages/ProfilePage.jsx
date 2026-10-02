import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Spinner, Alert, Modal, ListGroup, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaBoxOpen, FaEye, FaTimes, FaCheck, FaCalendarAlt, FaShippingFast, FaLock, FaEdit } from 'react-icons/fa';
import api from '../services/api';
import { formatToINR } from '../utils/currencyUtils';

const ProfilePage = () => {
  // User Profile State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Update Status State
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let userInfo = null;
    try {
      const stored = localStorage.getItem('userInfo');
      userInfo = stored ? JSON.parse(stored) : null;
    } catch {
      userInfo = null;
    }

    if (!userInfo) {
      navigate('/login');
    } else {
      setName(userInfo.name || '');
      setEmail(userInfo.email || '');
      fetchMyOrders();
    }
  }, [navigate]);

  const fetchMyOrders = async () => {
    try {
      setLoadingOrders(true);
      const { data } = await api.get('/orders/myorders');
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // --- Profile Update Handler ---
  const submitUpdateHandler = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess(false);

    if (password && password !== confirmPassword) {
      setUpdateError('Passwords do not match');
      return;
    }

    try {
      setUpdateLoading(true);
      const updateData = { name, email };
      if (password) {
        updateData.password = password;
      }

      const { data } = await api.put('/users/profile', updateData);

      // Update Local Storage with new User Info
      localStorage.setItem('userInfo', JSON.stringify(data));
      window.dispatchEvent(new Event("storage"));
      
      setUpdateSuccess(true);
      setPassword(''); // Clear passwords for security
      setConfirmPassword('');
      
      // Hide success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);

    } catch (error) {
      setUpdateError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    window.dispatchEvent(new Event("storage"));
    navigate('/login');
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  return (
    <div className="auth-wrapper" style={{ alignItems: 'flex-start', paddingTop: '6rem', paddingBottom: '4rem', height: 'auto', minHeight: '100vh' }}>
      <Container className="fade-in">
        
        <div className="d-flex align-items-center justify-content-between mb-5">
             <div className="d-flex align-items-center">
                 <div className="me-3 p-3 rounded-circle bg-white shadow-sm text-primary">
                     <FaUser size={30} />
                 </div>
                 <div>
                     <h2 className="fw-bold mb-0 text-white">My Profile</h2>
                     <p className="mb-0 text-white-50">Manage your account and view orders</p>
                 </div>
             </div>
             <Button variant="outline-light" className="rounded-pill px-4 fw-bold" onClick={handleLogout}>
                 Logout
             </Button>
        </div>

        <Row className="g-4">
          {/* --- UPDATED: Account Details Form Column --- */}
          <Col md={4}>
            <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4 border-bottom pb-2">
                    <FaEdit className="text-primary me-2 fs-5" />
                    <h5 className="fw-bold mb-0">Update Details</h5>
                </div>

                {updateSuccess && <Alert variant="success" className="py-2 small">Profile Updated Successfully!</Alert>}
                {updateError && <Alert variant="danger" className="py-2 small">{updateError}</Alert>}

                <Form onSubmit={submitUpdateHandler}>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="small text-muted fw-bold text-uppercase">Name</Form.Label>
                    <div className="position-relative">
                      <Form.Control 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        style={{ paddingLeft: '40px', height: '45px', backgroundColor: '#f8f9fa', border: 'none' }} 
                      />
                      <FaUser style={{ position: 'absolute', top: '15px', left: '15px', color: '#aaa' }} />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small text-muted fw-bold text-uppercase">Email</Form.Label>
                    <div className="position-relative">
                      <Form.Control 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        style={{ paddingLeft: '40px', height: '45px', backgroundColor: '#f8f9fa', border: 'none' }} 
                      />
                      <FaEnvelope style={{ position: 'absolute', top: '15px', left: '15px', color: '#aaa' }} />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small text-muted fw-bold text-uppercase">New Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control 
                        type="password" 
                        placeholder="Leave blank to keep current" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        style={{ paddingLeft: '40px', height: '45px', backgroundColor: '#f8f9fa', border: 'none' }} 
                      />
                      <FaLock style={{ position: 'absolute', top: '15px', left: '15px', color: '#aaa' }} />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small text-muted fw-bold text-uppercase">Confirm Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control 
                        type="password" 
                        placeholder="Confirm new password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        style={{ paddingLeft: '40px', height: '45px', backgroundColor: '#f8f9fa', border: 'none' }} 
                      />
                      <FaLock style={{ position: 'absolute', top: '15px', left: '15px', color: '#aaa' }} />
                    </div>
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 rounded-pill custom-btn border-0 shadow-sm fw-bold" 
                    disabled={updateLoading}
                  >
                    {updateLoading ? <Spinner size="sm" /> : 'Save Changes'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Orders Column */}
          <Col md={8}>
            <Card className="border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4 border-bottom pb-2">
                    <FaBoxOpen className="text-primary me-2 fs-4" />
                    <h5 className="fw-bold mb-0">Order History</h5>
                </div>

                {loadingOrders ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : orders.length === 0 ? (
                  <Alert variant="info" className="text-center bg-light border-0 text-muted shadow-sm rounded-3">
                    You have not placed any orders yet.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="align-middle text-center mb-0">
                      <thead className="bg-light text-secondary small text-uppercase">
                        <tr>
                          <th className="py-3 border-0">ID</th>
                          <th className="py-3 border-0">Date</th>
                          <th className="py-3 border-0">Total</th>
                          <th className="py-3 border-0">Paid</th>
                          <th className="py-3 border-0">Delivered</th>
                          <th className="py-3 border-0 text-end pe-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(orders) && orders.map((order) => {
                          const orderId = order?._id ? String(order._id) : '';
                          const dateStr = order?.createdAt ? String(order.createdAt).substring(0, 10) : 'Recent';
                          return (
                            <tr key={order._id} className="border-bottom">
                              <td className="fw-bold text-primary">...{orderId.slice(-6)}</td>
                              <td>{dateStr}</td>
                              <td className="fw-bold">{formatToINR(order.totalPrice || 0)}</td>
                            <td>
                              {order.isPaid ? (
                                <FaCheck className="text-success" />
                              ) : (
                                <FaTimes className="text-danger" />
                              )}
                            </td>
                            <td>
                              {order.isDelivered ? (
                                <FaCheck className="text-success" />
                              ) : (
                                <FaTimes className="text-danger" />
                              )}
                            </td>
                            <td className="text-end pe-3">
                              <Button 
                                variant="light" 
                                size="sm" 
                                className="rounded-pill text-primary border shadow-sm fw-bold px-3 hover-lift"
                                onClick={() => handleViewOrder(order)}
                              >
                                <FaEye className="me-1" /> View
                              </Button>
                            </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* --- ORDER DETAILS MODAL --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center">
            <FaBoxOpen className="text-primary me-2" /> Order Details
          </Modal.Title>
        </Modal.Header>
        
        {selectedOrder && (
          <Modal.Body className="p-4 pt-3">
            <Row className="mb-4 g-3">
               <Col sm={6}>
                 <div className="bg-light p-3 rounded-3 border">
                    <p className="small text-muted text-uppercase fw-bold mb-1">Order ID</p>
                    <h6 className="fw-bold text-dark mb-0">{selectedOrder._id}</h6>
                 </div>
               </Col>
               <Col sm={6}>
                 <div className="bg-light p-3 rounded-3 border">
                    <p className="small text-muted text-uppercase fw-bold mb-1">Date Placed</p>
                    <h6 className="fw-bold text-dark d-flex align-items-center mb-0">
                      <FaCalendarAlt className="me-2 text-primary" /> 
                      {selectedOrder?.createdAt ? String(selectedOrder.createdAt).substring(0, 10) : 'Recent'}
                    </h6>
                 </div>
               </Col>
            </Row>

            <h6 className="fw-bold mb-3 border-bottom pb-2">Items in this Order</h6>
            <ListGroup variant="flush" className="mb-4 border rounded-3 overflow-hidden">
              {selectedOrder.orderItems.map((item, index) => (
                <ListGroup.Item key={index} className="p-3 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded p-1 me-3 border shadow-sm" style={{ width: '50px', height: '50px' }}>
                      <Image src={item.image} alt={item.name} fluid style={{ maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">{item.name}</h6>
                      <small className="text-muted">Qty: {item.qty}</small>
                    </div>
                  </div>
                  <div className="text-end">
                    <h6 className="fw-bold text-primary mb-0">{formatToINR(item.price * item.qty)}</h6>
                    <small className="text-muted">{formatToINR(item.price)} each</small>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <Row>
              <Col md={6} className="mb-3 mb-md-0">
                 <h6 className="fw-bold mb-2">Delivery Status</h6>
                 {selectedOrder.isDelivered ? (
                    <Badge bg="success" className="px-3 py-2 rounded-pill fw-normal fs-6 shadow-sm"><FaCheck className="me-2"/> Delivered</Badge>
                 ) : (
                    <Badge bg="warning" className="px-3 py-2 rounded-pill fw-normal fs-6 shadow-sm text-dark"><FaShippingFast className="me-2"/> Processing / In Transit</Badge>
                 )}
              </Col>
              <Col md={6}>
                <Card className="border-0 bg-light shadow-sm">
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                       <span className="text-muted fw-bold">Items Total:</span>
                       <span>{formatToINR(selectedOrder.totalPrice)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                       <span className="text-muted fw-bold">Shipping:</span>
                       <span className="text-success fw-bold">Free</span>
                    </div>
                    <hr className="my-2 opacity-25" />
                    <div className="d-flex justify-content-between align-items-center">
                       <span className="fw-bold fs-5 text-dark">Total Paid:</span>
                       <span className="fw-bold fs-5 text-primary">{formatToINR(selectedOrder.totalPrice)}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

          </Modal.Body>
        )}
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" className="rounded-pill px-4" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default ProfilePage;