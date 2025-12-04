// Fontend/src/components/SimilarProducts.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const SimilarProducts = ({ productId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSimilarProducts();
  }, [productId]);

  const fetchSimilarProducts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/products/${productId}/similar?limit=8`
      );
      setProducts(response.data.data);
    } catch (err) {
      setError('Không thể tải sản phẩm tương tự');
    } finally {
      setLoading(false);
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
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (products.length === 0) {
    return (
      <Alert variant="info">
        Không có sản phẩm tương tự
      </Alert>
    );
  }

  return (
    <Row>
      {products.map(product => (
        <Col key={product._id} xs={6} md={4} lg={3} className="mb-4">
          <Card className="h-100 shadow-sm product-card">
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
              
              <div className="mt-auto">
                <div className="text-danger fw-bold">
                  {formatPrice(product.price)}
                </div>
                {product.originalPrice && (
                  <small className="text-muted text-decoration-line-through">
                    {formatPrice(product.originalPrice)}
                  </small>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
      
      <style>{`
        .product-card {
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
        }
      `}</style>
    </Row>
  );
};

export default SimilarProducts;