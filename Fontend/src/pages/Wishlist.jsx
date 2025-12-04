// Fontend/src/pages/Wishlist.jsx
import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeFromWishlist, clearWishlist } from '../redux/wishlistSlice';

const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items, loading, error } = useSelector(state => state.wishlist);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(fetchWishlist());
  }, [user, dispatch]);

  const handleRemove = async (productId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?')) {
      try {
        await dispatch(removeFromWishlist(productId)).unwrap();
      } catch (err) {
        alert(err);
      }
    }
  };

  const handleClear = async () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ danh sách yêu thích?')) {
      try {
        await dispatch(clearWishlist()).unwrap();
      } catch (err) {
        alert(err);
      }
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
        <p className="mt-2">Đang tải danh sách yêu thích...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <i className="bi bi-heart-fill text-danger"></i> Danh sách yêu thích
          </h2>
          <p className="text-muted mb-0">
            {items.length} sản phẩm
          </p>
        </div>
        
        {items.length > 0 && (
          <Button variant="outline-danger" onClick={handleClear}>
            <i className="bi bi-trash"></i> Xóa tất cả
          </Button>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {items.length === 0 ? (
        <Alert variant="info" className="text-center py-5">
          <i className="bi bi-heart" style={{ fontSize: '3rem' }}></i>
          <h4 className="mt-3">Danh sách yêu thích trống</h4>
          <p>Hãy thêm những sản phẩm bạn yêu thích vào đây!</p>
          <Link to="/products" className="btn btn-primary">
            Khám phá sản phẩm
          </Link>
        </Alert>
      ) : (
        <Row>
          {items.map(item => {
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
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 start-0 m-2"
                      onClick={() => handleRemove(product._id)}
                    >
                      <i className="bi bi-heart-fill"></i>
                    </Button>
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
                    
                    {product.category && (
                      <small className="text-muted mb-2">
                        {product.category.name}
                      </small>
                    )}
                    
                    <div className="mt-auto">
                      <div className="text-danger fw-bold mb-2">
                        {formatPrice(product.price)}
                      </div>
                      
                      {product.stock > 0 ? (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="w-100"
                          as={Link}
                          to={`/product/${product._id}`}
                        >
                          <i className="bi bi-cart-plus"></i> Thêm vào giỏ
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

export default Wishlist;