import React, { useEffect, useState, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Container, 
  Row, 
  Col, 
  Card, 
  Modal, 
  Form, 
  Badge, 
  Tabs, 
  Tab, 
  Pagination, 
  InputGroup, 
  Spinner, 
  Alert,
  Toast,
  ToastContainer
} from 'react-bootstrap';
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaBoxOpen, 
  FaDollarSign, 
  FaShoppingCart, 
  FaSearch, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaLock, 
  FaShieldAlt, 
  FaBoxes, 
  FaCheck, 
  FaExclamationTriangle,
  FaArrowRight,
  FaArrowLeft
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatToINR } from '../utils/currencyUtils';

const AdminDashboard = () => {
  const [key, setKey] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    description: '',
    countInStock: 0,
  });

  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  const navigate = useNavigate();

  const showNotification = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ show: false, message: '', variant: 'success' }), 3000);
  };

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await api.get('/products');
      const productList = Array.isArray(data) ? data : (data?.products || []);
      setProducts(productList);
    } catch (err) {
      console.error('Error fetching products:', err);
      showNotification('Failed to load products', 'danger');
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await api.get('/orders');
      const orderList = Array.isArray(data) ? data : (data?.orders || []);
      setOrders(orderList);
    } catch (err) {
      console.error('Error fetching orders:', err);
      showNotification('Failed to load orders', 'danger');
    }
  }, []);

  const initData = useCallback(async () => {
    setLoading(true);
    setError('');

    let userInfo = null;
    try {
      const stored = localStorage.getItem('userInfo');
      userInfo = stored ? JSON.parse(stored) : null;
    } catch {
      userInfo = null;
    }

    if (!userInfo) {
      setAuthError('unauthenticated');
      setLoading(false);
      return;
    }

    setAuthError(null);

    try {
      await Promise.all([fetchProducts(), fetchOrders()]);
    } catch {
      setError('Error loading administrative data.');
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, fetchOrders]);

  useEffect(() => {
    initData();
  }, [initData]);

  const markAsDelivered = async (id) => {
    try {
      await api.put(`/orders/${id}/deliver`, {});
      await fetchOrders();
      showNotification('Order marked as Delivered!', 'success');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update order status', 'danger');
    }
  };

  const deleteHandler = async (id, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName || 'this product'}"?`)) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(prev => prev.filter((p) => p._id !== id));
        showNotification('Product deleted successfully', 'secondary');
      } catch (err) {
        showNotification(err.response?.data?.message || 'Error deleting product', 'danger');
      }
    }
  };

  const handleShowModal = (product = null) => {
    if (product) {
      setIsEditing(true);
      setCurrentProductId(product._id);
      setProductForm({
        name: product.name || '',
        price: product.price !== undefined ? product.price : '',
        category: product.category || '',
        image: product.image || '',
        description: product.description || '',
        countInStock: product.countInStock !== undefined ? product.countInStock : 0,
      });
    } else {
      setIsEditing(false);
      setCurrentProductId(null);
      setProductForm({
        name: '',
        price: '',
        category: '',
        image: '',
        description: '',
        countInStock: 0,
      });
    }
    setShowModal(true);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const formattedData = {
        ...productForm,
        price: Number(productForm.price),
        countInStock: Number(productForm.countInStock) || 0,
      };

      if (isEditing) {
        await api.put(`/products/${currentProductId}`, formattedData);
        showNotification('Product updated successfully!', 'success');
      } else {
        await api.post('/products', formattedData);
        showNotification('Product created successfully!', 'success');
      }
      await fetchProducts();
      setShowModal(false);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Operation failed. Please check inputs.', 'danger');
    } finally {
      setSavingProduct(false);
    }
  };

  // Unauthenticated screen
  if (authError === 'unauthenticated') {
    return (
      <div className="auth-wrapper" style={{ alignItems: 'center', paddingTop: '6rem', paddingBottom: '4rem', minHeight: '100vh' }}>
        <Container className="fade-in d-flex justify-content-center">
          <Card className="border-0 shadow-lg p-4 text-center" style={{ maxWidth: '480px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.98)' }}>
            <Card.Body className="p-4">
              <div 
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4 text-danger shadow-sm"
                style={{ width: '70px', height: '70px', background: 'rgba(220, 53, 69, 0.1)' }}
              >
                <FaLock size={30} />
              </div>
              <h3 className="fw-bold text-dark mb-2">Admin Access Required</h3>
              <p className="text-muted mb-4 small">
                You must be signed in with an administrator account to access store controls, product catalogs, and order management.
              </p>
              <Button 
                variant="primary" 
                className="w-100 py-3 rounded-pill fw-bold custom-btn border-0 shadow-sm d-flex align-items-center justify-content-center gap-2 mb-3"
                onClick={() => navigate('/login?redirect=admin')}
              >
                Sign In to Admin Account <FaArrowRight />
              </Button>
              <Link to="/" className="text-decoration-none text-muted small">
                ← Return to Storefront
              </Link>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  // Loading screen
  if (loading) {
    return (
      <div className="auth-wrapper" style={{ alignItems: 'center', minHeight: '100vh', paddingTop: '6rem' }}>
        <Container className="text-center py-5">
          <Spinner animation="border" variant="light" style={{ width: '3.5rem', height: '3.5rem' }} />
          <p className="text-white-50 mt-3 fw-semibold">Loading Admin Dashboard...</p>
        </Container>
      </div>
    );
  }

  const safeProducts = Array.isArray(products) ? products : [];
  const safeOrders = Array.isArray(orders) ? orders : [];

  const totalRevenue = safeOrders.reduce((acc, order) => acc + (Number(order?.totalPrice) || 0), 0);
  const totalStock = safeProducts.reduce((acc, p) => acc + (Number(p?.countInStock) || 0), 0);

  const filteredProducts = safeProducts.filter((product) => {
    if (!product || typeof product.name !== 'string') return false;
    const nameMatch = product.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
    const categoryMatch = product.category && typeof product.category === 'string' && product.category.toLowerCase().includes(searchTerm.trim().toLowerCase());
    return nameMatch || categoryMatch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="auth-wrapper" style={{ alignItems: 'flex-start', paddingTop: '6rem', paddingBottom: '4rem', height: 'auto', minHeight: '100vh' }}>
      
      {/* Floating Toast Notification */}
      {toast.show && (
        <ToastContainer position="top-center" style={{ zIndex: 9999, position: 'fixed', top: '80px' }}>
          <Toast show={toast.show} bg={toast.variant} delay={3000} autohide className="text-white shadow-lg border-0">
            <Toast.Body className="fw-bold d-flex align-items-center gap-2">
              <FaCheck /> {toast.message}
            </Toast.Body>
          </Toast>
        </ToastContainer>
      )}

      <Container className="fade-in pb-5">
        
        {/* Top Action Bar / Back to Store */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <Link to="/" className="text-decoration-none">
            <Button 
              variant="light" 
              className="rounded-pill px-3 py-2 fw-bold shadow-sm d-inline-flex align-items-center gap-2 border hover-lift"
              style={{ fontSize: '0.85rem', background: 'rgba(255, 255, 255, 0.95)', color: '#0f172a' }}
            >
              <FaArrowLeft /> Back to Products
            </Button>
          </Link>
          <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill shadow-sm fw-bold border">
            ● Live Store Mode
          </Badge>
        </div>

        {/* Header Bar */}
        <div className="mb-4">
          <div className="text-white">
            <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <FaShieldAlt className="text-warning" size={28} /> Admin Dashboard
            </h2>
            <p className="opacity-75 mb-0 small">Manage catalog products, track real-time revenue, and fulfill orders</p>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="border-0 rounded-4 shadow-sm mb-4">
            <FaExclamationTriangle className="me-2" /> {error}
          </Alert>
        )}
        
        {/* KPI Metric Summary Cards */}
        <Row className="mb-4 g-4">
          <Col md={6} lg={3}>
            <Card className="border-0 shadow-lg text-white hover-lift h-100" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', borderRadius: '18px' }}>
              <Card.Body className="p-4 d-flex align-items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-circle me-3">
                  <FaBoxOpen size={28} />
                </div>
                <div>
                  <h6 className="mb-1 opacity-75 small text-uppercase fw-semibold">Total Products</h6>
                  <h3 className="mb-0 fw-bold">{safeProducts.length}</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="border-0 shadow-lg text-white hover-lift h-100" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', borderRadius: '18px' }}>
              <Card.Body className="p-4 d-flex align-items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-circle me-3">
                  <FaDollarSign size={28} />
                </div>
                <div>
                  <h6 className="mb-1 opacity-75 small text-uppercase fw-semibold">Total Revenue</h6>
                  <h3 className="mb-0 fw-bold">{formatToINR(totalRevenue)}</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="border-0 shadow-lg text-white hover-lift h-100" style={{ background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)', borderRadius: '18px' }}>
              <Card.Body className="p-4 d-flex align-items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-circle me-3">
                  <FaShoppingCart size={28} />
                </div>
                <div>
                  <h6 className="mb-1 opacity-75 small text-uppercase fw-semibold">Total Orders</h6>
                  <h3 className="mb-0 fw-bold">{safeOrders.length}</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="border-0 shadow-lg text-white hover-lift h-100" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)', borderRadius: '18px' }}>
              <Card.Body className="p-4 d-flex align-items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-circle me-3">
                  <FaBoxes size={28} />
                </div>
                <div>
                  <h6 className="mb-1 opacity-75 small text-uppercase fw-semibold">Units In Stock</h6>
                  <h3 className="mb-0 fw-bold">{totalStock}</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabbed Management Panel */}
        <Card className="shadow-lg border-0" style={{ borderRadius: '22px', overflow: 'hidden' }}>
          <Card.Body className="p-4 bg-white">
            <Tabs
              id="admin-tabs"
              activeKey={key}
              onSelect={(k) => setKey(k)}
              className="mb-4 custom-tabs border-bottom-0 gap-2"
            >
              
              {/* --- PRODUCTS TAB --- */}
              <Tab eventKey="products" title={<span className="fw-bold px-2 py-1"><FaBoxOpen className="me-2"/>Products ({safeProducts.length})</span>}>
                
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 p-3 bg-light rounded-4">
                  <InputGroup style={{ maxWidth: '380px' }} className="shadow-sm rounded-pill overflow-hidden bg-white border">
                    <InputGroup.Text className="bg-white border-0 ps-3">
                      <FaSearch className="text-muted"/>
                    </InputGroup.Text>
                    <Form.Control 
                      placeholder="Search products by title or category..." 
                      className="border-0 shadow-none bg-white"
                      value={searchTerm}
                      onChange={(e) => { 
                        setSearchTerm(e.target.value); 
                        setCurrentPage(1); 
                      }}
                    />
                    {searchTerm && (
                      <Button variant="link" className="text-muted text-decoration-none pe-3" onClick={() => setSearchTerm('')}>
                        ✕
                      </Button>
                    )}
                  </InputGroup>

                  <Button 
                    variant="primary" 
                    className="px-4 py-2 rounded-pill fw-bold shadow-sm custom-btn border-0 d-flex align-items-center gap-2" 
                    onClick={() => handleShowModal()}
                  >
                    <FaPlus /> Add Product
                  </Button>
                </div>

                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead className="bg-light text-secondary small text-uppercase">
                      <tr>
                        <th className="ps-4 border-0 py-3">Product</th>
                        <th className="border-0 py-3">Category</th>
                        <th className="border-0 py-3">Price</th>
                        <th className="border-0 py-3">Stock</th>
                        <th className="border-0 py-3 text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProducts.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-5 text-muted">
                            <FaBoxOpen size={40} className="mb-2 opacity-25 d-block mx-auto" />
                            <p className="mb-0 fw-semibold">No products found matching your search</p>
                          </td>
                        </tr>
                      ) : (
                        currentProducts.map((product) => (
                          <tr key={product._id} className="border-bottom">
                            <td className="ps-4 py-3">
                              <div className="d-flex align-items-center">
                                <div 
                                  className="rounded bg-white p-1 me-3 border shadow-sm flex-shrink-0" 
                                  style={{ width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23f1f3f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23adb5bd' font-size='10'%3ENo Img%3C/text%3E%3C/svg%3E";
                                    }}
                                  />
                                </div>
                                <div>
                                  <Link to={`/product/${product._id}`} className="text-decoration-none text-dark fw-bold hover-primary">
                                    {product.name}
                                  </Link>
                                  <small className="text-muted d-block text-truncate" style={{ maxWidth: '280px' }}>
                                    {product.description || 'No description'}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <Badge bg="light" text="dark" className="border fw-normal px-2 py-1 text-uppercase" style={{ fontSize: '0.75rem' }}>
                                {product.category || 'General'}
                              </Badge>
                            </td>
                            <td className="fw-bold text-primary">{formatToINR(product.price)}</td>
                            <td>
                              {product.countInStock > 0 ? (
                                <Badge bg="success" className="bg-opacity-10 text-success px-2 py-1 fw-normal border border-success">
                                  In Stock ({product.countInStock})
                                </Badge>
                              ) : (
                                <Badge bg="danger" className="bg-opacity-10 text-danger px-2 py-1 fw-normal border border-danger">
                                  Out of Stock
                                </Badge>
                              )}
                            </td>
                            <td className="text-end pe-4">
                              <Button 
                                variant="light" 
                                size="sm" 
                                className="me-2 text-primary shadow-sm rounded-circle p-2 border hover-lift" 
                                onClick={() => handleShowModal(product)}
                                title="Edit Product"
                              >
                                <FaEdit />
                              </Button>
                              <Button 
                                variant="light" 
                                size="sm" 
                                className="text-danger shadow-sm rounded-circle p-2 border hover-lift" 
                                onClick={() => deleteHandler(product._id, product.name)}
                                title="Delete Product"
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="d-flex justify-content-center pt-4">
                    <Pagination className="mb-0 shadow-sm rounded-pill overflow-hidden">
                      <Pagination.Prev 
                        onClick={() => paginate(Math.max(1, currentPage - 1))} 
                        disabled={currentPage === 1} 
                        className="border-0" 
                      />
                      {[...Array(totalPages)].map((_, i) => (
                        <Pagination.Item 
                          key={i + 1} 
                          active={i + 1 === currentPage} 
                          onClick={() => paginate(i + 1)} 
                          className="border-0"
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next 
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))} 
                        disabled={currentPage === totalPages} 
                        className="border-0" 
                      />
                    </Pagination>
                  </div>
                )}
              </Tab>

              {/* --- ORDERS TAB --- */}
              <Tab eventKey="orders" title={<span className="fw-bold px-2 py-1"><FaShoppingCart className="me-2"/>Orders ({safeOrders.length})</span>}>
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead className="bg-light text-secondary small text-uppercase">
                      <tr>
                        <th className="ps-4 border-0 py-3">Order ID</th>
                        <th className="border-0 py-3">Customer</th>
                        <th className="border-0 py-3">Total</th>
                        <th className="border-0 py-3 text-center">Payment</th>
                        <th className="border-0 py-3 text-center">Delivery</th>
                        <th className="border-0 py-3 text-end pe-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeOrders.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-5 text-muted">
                            <FaShoppingCart size={40} className="mb-2 opacity-25 d-block mx-auto" />
                            <p className="mb-0 fw-semibold">No orders placed yet</p>
                          </td>
                        </tr>
                      ) : (
                        safeOrders.map((order) => {
                          if (!order) return null;
                          const orderIdStr = order._id ? String(order._id) : '';
                          const shortId = orderIdStr ? orderIdStr.substring(0, 8) : 'N/A';
                          const dateStr = order.createdAt ? String(order.createdAt).substring(0, 10) : 'Recent';
                          const customerName = (order.user && typeof order.user === 'object' && order.user.name) 
                            ? order.user.name 
                            : (typeof order.user === 'string' ? `User (${order.user.slice(0, 6)})` : 'Guest');

                          return (
                            <tr key={order._id || Math.random()} className="border-bottom">
                              <td className="ps-4 fw-bold text-primary">#{shortId}</td>
                              <td>
                                <div className="d-flex flex-column">
                                  <span className="fw-bold text-dark">{customerName}</span>
                                  <small className="text-muted">{dateStr}</small>
                                </div>
                              </td>
                              <td className="fw-bold text-dark">{formatToINR(order.totalPrice || 0)}</td>
                              <td className="text-center">
                                {order.isPaid ? (
                                  <Badge bg="success" className="bg-opacity-10 text-success px-3 py-1 rounded-pill fw-normal border border-success">
                                    <FaCheckCircle className="me-1"/> Paid
                                  </Badge>
                                ) : (
                                  <Badge bg="warning" className="bg-opacity-10 text-warning px-3 py-1 rounded-pill fw-normal border border-warning">
                                    <FaTimesCircle className="me-1"/> Pending
                                  </Badge>
                                )}
                              </td>
                              <td className="text-center">
                                {order.isDelivered ? (
                                  <Badge bg="primary" className="bg-opacity-10 text-primary px-3 py-1 rounded-pill fw-normal border border-primary">
                                    Delivered
                                  </Badge>
                                ) : (
                                  <Badge bg="secondary" className="bg-opacity-10 text-dark px-3 py-1 rounded-pill fw-normal border border-secondary">
                                    Processing
                                  </Badge>
                                )}
                              </td>
                              <td className="text-end pe-4">
                                {!order.isDelivered ? (
                                  <Button 
                                    variant="outline-success" 
                                    size="sm" 
                                    className="rounded-pill px-3 fw-bold shadow-sm" 
                                    onClick={() => markAsDelivered(order._id)}
                                  >
                                    Mark Delivered
                                  </Button>
                                ) : (
                                  <span className="text-muted small fw-bold">
                                    <FaCheckCircle className="text-success me-1"/> Completed
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </Table>
                </div>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>

        {/* Add / Edit Product Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static" size="lg">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold">{isEditing ? 'Edit Product' : 'Add New Product'}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form onSubmit={submitHandler}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-uppercase text-muted">Product Name</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={productForm.name} 
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})} 
                      className="bg-light border-0" 
                      placeholder="e.g. Wireless Headphones"
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-uppercase text-muted">Category</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={productForm.category} 
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})} 
                      className="bg-light border-0" 
                      placeholder="e.g. Electronics, Fashion, Furniture"
                      required 
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-uppercase text-muted">Price (₹)</Form.Label>
                    <Form.Control 
                      type="number" 
                      value={productForm.price} 
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})} 
                      className="bg-light border-0" 
                      placeholder="0"
                      min="0"
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-uppercase text-muted">Stock Count</Form.Label>
                    <Form.Control 
                      type="number" 
                      value={productForm.countInStock} 
                      onChange={(e) => setProductForm({...productForm, countInStock: e.target.value})} 
                      className="bg-light border-0" 
                      placeholder="0"
                      min="0"
                      required 
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-uppercase text-muted">Image URL</Form.Label>
                <Form.Control 
                  type="url" 
                  value={productForm.image} 
                  onChange={(e) => setProductForm({...productForm, image: e.target.value})} 
                  className="bg-light border-0" 
                  placeholder="https://images.unsplash.com/..."
                  required 
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-uppercase text-muted">Description</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  value={productForm.description} 
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})} 
                  className="bg-light border-0" 
                  placeholder="Detailed description of the product..."
                  required 
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="light" onClick={() => setShowModal(false)} disabled={savingProduct}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" className="px-4 fw-bold custom-btn border-0" disabled={savingProduct}>
                  {savingProduct ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    isEditing ? 'Save Changes' : 'Create Product'
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

      </Container>
    </div>
  );
};

export default AdminDashboard;