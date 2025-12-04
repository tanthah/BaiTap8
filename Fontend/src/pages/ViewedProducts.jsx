// Fontend/src/pages/ViewedProducts.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const ViewedProducts = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchViewedProducts();
  }, [user]);

  const fetchViewedProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/viewed-products?limit=20');
      setProducts(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải lịch sử xem');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử xem?')) {
      try {
        await axios.delete('http://localhost:5000/api/viewed-products');
        setProducts([]);
      } catch (err) {
        alert('Lỗi xóa lịch sử xem');
      }
    }
  };

  const handleRemove = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/viewed-products/${productId}`);
      setProducts(products.filter(item => item.product._id !== productId));
    } catch (err) {
      alert('Lỗi xóa sản phẩm');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải lịch sử xem...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <i className="bi bi-clock-history"></i> Sản phẩm đã xem
          </h2>
          <p className="text-muted mb-0">
            {products.length} sản phẩm
          </p>
        </div>
        
        {products.length > 0 && (
          <Button variant="outline-danger" onClick={handleClear}>
            <i className="bi bi-trash"></i> Xóa lịch sử
          </Button>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {products.length === 0 ? (
        <Alert variant="info" className="text-center py-5">
          <i className="bi bi-clock-history" style={{ fontSize: '3rem' }}></i>
          <h4 className="mt-3">Chưa có lịch sử xem sản phẩm</h4>
          <p>Hãy khám phá các sản phẩm của chúng tôi!</p>
          <Link to="/products" className="btn btn-primary">
            Xem sản phẩm
          </Link>
        </Alert>
      ) : (
        <Row>
          {products.map(item => {
            const product = item.product;
            if (!product) return null;

            return (
              <Col key={product._id} xs={6} md={4} lg={3} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <div className="position-relative">
                    <Link to={`/product/${product._id}`}>
                      <Card.Img 
                        variant="top" 
                        src={product.mainImage}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    </Link>
                    
                    {product.discount > 0 && (
                      <Badge 
                        bg="danger" 
                        className="position-absolute top-0 end-0 m-2"
                      >
                        -{product.discount}%
                      </Badge>
                    )}
                    
                    <Button
                      variant="light"
                      size="sm"
                      className="position-absolute top-0 start-0 m-2"
                      onClick={() => handleRemove(product._id)}
                      title="Xóa khỏi lịch sử"
                    >
                      <i className="bi bi-x-lg"></i>
                    </Button>

                    <Badge 
                      bg="secondary" 
                      className="position-absolute bottom-0 start-0 m-2"
                    >
                      Đã xem {item.viewCount} lần
                    </Badge>
                  </div>
                  
                  <Card.Body className="d-flex flex-column">
                    <Link 
                      to={`/product/${product._id}`} 
                      className="text-decoration-none text-dark"
                    >
                      <Card.Title 
                        className="h6 mb-2"
                        style={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: '40px'
                        }}
                      >
                        {product.name}
                      </Card.Title>
                    </Link>
                    
                    <div className="mb-2">
                      <span className="text-warning me-1">
                        {'★'.repeat(Math.floor(product.rating || 0))}
                        {'☆'.repeat(5 - Math.floor(product.rating || 0))}
                      </span>
                      <small className="text-muted">
                        ({product.numReviews || 0})
                      </small>
                    </div>
                    
                    {product.category && (
                      <small className="text-muted mb-2">
                        {product.category.name}
                      </small>
                    )}
                    
                    <div className="mt-auto">
                      <div className="text-danger fw-bold mb-2">
                        {formatPrice(product.price)}
                      </div>
                      
                      <small className="text-muted d-block mb-2">
                        Xem lần cuối: {new Date(item.viewedAt).toLocaleDateString('vi-VN')}
                      </small>
                      
                      {product.stock > 0 ? (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="w-100"
                          as={Link}
                          to={`/product/${product._id}`}
                        >
                          Xem lại
                        </Button>
                      ) : (
                        <Badge bg="secondary" className="w-100">
                          Hết hàng
                        </Badge>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default ViewedProducts;