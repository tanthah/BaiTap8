// Fontend/src/pages/ProductDetail.jsx - FIXED
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Breadcrumb, Tabs, Tab } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../axois/api'; // FIXED: Use axiosInstance
import { addToWishlist, removeFromWishlist } from '../redux/wishlistSlice';
import ReviewSection from '../components/ReviewSection';
import SimilarProducts from '../components/SimilarProducts';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    fetchProduct();
    if (user) {
      recordView();
    }
  }, [id]);

  useEffect(() => {
    // Check if product is in wishlist
    if (product && wishlistItems) {
      const inWishlist = wishlistItems.some(
        item => item.product?._id === product._id
      );
      setIsInWishlist(inWishlist);
    }
  }, [product, wishlistItems]);

  const fetchProduct = async () => {
    try {
      // FIXED: Use axiosInstance without base URL
      const response = await axiosInstance.get(`/products/${id}`);
      setProduct(response.data.data);
      setSelectedImage(response.data.data.mainImage);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const recordView = async () => {
    try {
      // FIXED: Use axiosInstance with token
      await axiosInstance.post(`/viewed-products/${id}`);
    } catch (err) {
      console.error('Error recording view:', err);
      // Don't show error to user - this is a background operation
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để sử dụng chức năng này');
      return;
    }

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(id)).unwrap();
      } else {
        await dispatch(addToWishlist(id)).unwrap();
      }
    } catch (error) {
      alert(error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase' && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải sản phẩm...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Link to="/products" className="btn btn-primary">
          Quay lại danh sách sản phẩm
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Trang chủ
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/categories" }}>
          Danh mục
        </Breadcrumb.Item>
        {product.category && (
          <Breadcrumb.Item 
            linkAs={Link} 
            linkProps={{ to: `/category/${product.category.slug}` }}
          >
            {product.category.name}
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row>
        {/* Images */}
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Img 
              variant="top" 
              src={selectedImage}
              style={{ height: '400px', objectFit: 'contain', padding: '20px' }}
            />
          </Card>
          
          {product.images && product.images.length > 0 && (
            <Row className="mt-3 g-2">
              <Col xs={3}>
                <img 
                  src={product.mainImage}
                  className={`img-thumbnail ${selectedImage === product.mainImage ? 'border-primary' : ''}`}
                  style={{ cursor: 'pointer', height: '80px', objectFit: 'cover' }}
                  onClick={() => setSelectedImage(product.mainImage)}
                  alt="Main"
                />
              </Col>
              {product.images.map((img, index) => (
                <Col xs={3} key={index}>
                  <img 
                    src={img}
                    className={`img-thumbnail ${selectedImage === img ? 'border-primary' : ''}`}
                    style={{ cursor: 'pointer', height: '80px', objectFit: 'cover' }}
                    onClick={() => setSelectedImage(img)}
                    alt={`Image ${index + 1}`}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Col>

        {/* Product Info */}
        <Col md={6}>
          <div className="mb-3">
            {product.featured && (
              <Badge bg="warning" text="dark" className="me-2">
                <i className="bi bi-star-fill"></i> Nổi bật
              </Badge>
            )}
            {product.stock > 0 ? (
              <Badge bg="success">Còn hàng</Badge>
            ) : (
              <Badge bg="danger">Hết hàng</Badge>
            )}
          </div>

          <h2 className="mb-3">{product.name}</h2>

          {/* Rating & Stats */}
          <div className="mb-3">
            <div className="d-flex align-items-center flex-wrap gap-3">
              <div className="d-flex align-items-center">
                <span className="text-warning me-2" style={{ fontSize: '1.2rem' }}>
                  {'★'.repeat(Math.floor(product.rating || 0))}
                  {'☆'.repeat(5 - Math.floor(product.rating || 0))}
                </span>
                <span className="text-muted">
                  {product.rating} ({product.numReviews} đánh giá)
                </span>
              </div>
              
              <span className="text-muted border-start ps-3">
                <i className="bi bi-people-fill"></i> {product.buyersCount || product.sold} người đã mua
              </span>
              
              <span className="text-muted border-start ps-3">
                <i className="bi bi-chat-dots-fill"></i> {product.reviewsCount || 0} bình luận
              </span>
            </div>
          </div>

          {/* Price */}
          <Card className="bg-light border-0 mb-3">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h3 className="text-danger mb-0">{formatPrice(product.price)}</h3>
                  {product.originalPrice && (
                    <div>
                      <small className="text-muted text-decoration-line-through me-2">
                        {formatPrice(product.originalPrice)}
                      </small>
                      {product.discount > 0 && (
                        <Badge bg="danger">-{product.discount}%</Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Quantity */}
          <div className="mb-3">
            <label className="form-label fw-bold">Số lượng:</label>
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary" 
                onClick={() => handleQuantityChange('decrease')}
                disabled={quantity <= 1}
              >
                <i className="bi bi-dash"></i>
              </Button>
              <span className="mx-3 fw-bold">{quantity}</span>
              <Button 
                variant="outline-secondary" 
                onClick={() => handleQuantityChange('increase')}
                disabled={quantity >= product.stock}
              >
                <i className="bi bi-plus"></i>
              </Button>
              <span className="ms-3 text-muted">
                {product.stock} sản phẩm có sẵn
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="d-grid gap-2">
            <Button 
              variant="danger" 
              size="lg"
              disabled={product.stock === 0}
            >
              <i className="bi bi-cart-plus"></i> Thêm vào giỏ hàng
            </Button>
            
            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                size="lg"
                disabled={product.stock === 0}
                className="flex-grow-1"
              >
                Mua ngay
              </Button>
              
              <Button 
                variant={isInWishlist ? "success" : "outline-secondary"}
                size="lg"
                onClick={handleWishlist}
                title={isInWishlist ? "Đã thích" : "Thêm vào yêu thích"}
              >
                <i className={`bi bi-heart${isInWishlist ? '-fill' : ''}`}></i>
              </Button>
            </div>
          </div>

          {/* Category */}
          {product.category && (
            <div className="mt-4">
              <strong>Danh mục: </strong>
              <Link to={`/category/${product.category.slug}`}>
                {product.category.name}
              </Link>
            </div>
          )}
        </Col>
      </Row>

      {/* Tabs: Description, Reviews, Similar Products */}
      <Row className="mt-5">
        <Col>
          <Tabs defaultActiveKey="description" className="mb-3">
            <Tab eventKey="description" title="Mô tả sản phẩm">
              <Card>
                <Card.Body>
                  <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="reviews" title={`Đánh giá (${product.numReviews})`}>
              <ReviewSection productId={product._id} />
            </Tab>
            
            <Tab eventKey="similar" title="Sản phẩm tương tự">
              <SimilarProducts productId={product._id} />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;