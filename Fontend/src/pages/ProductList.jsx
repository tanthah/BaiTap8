// Fontend/src/pages/ProductList.jsx - FIXED
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Form } from 'react-bootstrap';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import axiosInstance from '../axois/api'; // FIXED: Use axiosInstance

const ProductList = () => {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const observer = useRef();
  const currentSort = searchParams.get('sort') || 'newest';
  
  // Intersection Observer cho lazy loading
  const lastProductRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Fetch products function
  const fetchProducts = async (pageNum, isNewSearch = false) => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: pageNum,
        limit: 12,
        sort: currentSort,
      };
      
      let response;
      
      if (categorySlug) {
        // FIXED: Use axiosInstance
        response = await axiosInstance.get(`/products/category/${categorySlug}`, { params });
      } else {
        // FIXED: Use axiosInstance
        response = await axiosInstance.get('/products', { params });
      }
      
      if (categorySlug && response.data.category) {
        setCategory(response.data.category);
      }
      
      const newProducts = response.data.data || [];
      const pagination = response.data.pagination;
      
      if (isNewSearch) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
      
      setHasMore(pagination?.hasMore || false);
      setTotalProducts(pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Effect khi thay đổi category hoặc sort
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
    fetchProducts(1, true);
  }, [categorySlug, currentSort]);

  // Effect khi thay đổi page (lazy loading)
  useEffect(() => {
    if (page > 1) {
      fetchProducts(page, false);
    }
  }, [page]);

  const handleSortChange = (e) => {
    setSearchParams({ sort: e.target.value });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (initialLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" size="lg" />
        <p className="mt-3">Đang tải sản phẩm...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2>{category ? category.name : 'Tất cả sản phẩm'}</h2>
            {category?.description && (
              <p className="text-muted mb-0">{category.description}</p>
            )}
            <small className="text-muted">
              {products.length} / {totalProducts} sản phẩm
            </small>
          </div>
          
          <Form.Select 
            style={{ width: '200px' }}
            value={currentSort}
            onChange={handleSortChange}
          >
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
            <option value="popular">Bán chạy</option>
            <option value="rating">Đánh giá cao</option>
          </Form.Select>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <Row>
          {products.map((product, index) => {
            const isLastProduct = products.length === index + 1;
            
            return (
              <Col 
                key={`${product._id}-${index}`}
                xs={6} 
                md={4} 
                lg={3} 
                className="mb-4"
                ref={isLastProduct ? lastProductRef : null}
              >
                <Card className="h-100 shadow-sm product-card">
                  <div className="position-relative">
                    <Link to={`/product/${product._id}`}>
                      <Card.Img 
                        variant="top" 
                        src={product.mainImage}
                        style={{ height: '200px', objectFit: 'cover' }}
                        alt={product.name}
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
                    
                    {product.featured && (
                      <Badge 
                        bg="warning" 
                        text="dark"
                        className="position-absolute top-0 start-0 m-2"
                      >
                        <i className="bi bi-star-fill"></i> Nổi bật
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
                      <div className="d-flex align-items-center mb-1">
                        <span className="text-warning me-1" style={{ fontSize: '0.9rem' }}>
                          {'★'.repeat(Math.floor(product.rating || 0))}
                          {'☆'.repeat(5 - Math.floor(product.rating || 0))}
                        </span>
                        <small className="text-muted">
                          ({product.numReviews || 0})
                        </small>
                      </div>
                      <small className="text-muted">
                        <i className="bi bi-bag-check"></i> Đã bán: {product.sold || 0}
                      </small>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <div className="text-danger fw-bold">
                            {formatPrice(product.price)}
                          </div>
                          {product.originalPrice && (
                            <small className="text-muted text-decoration-line-through">
                              {formatPrice(product.originalPrice)}
                            </small>
                          )}
                        </div>
                        
                        {product.stock > 0 ? (
                          <Badge bg="success">Còn hàng</Badge>
                        ) : (
                          <Badge bg="secondary">Hết hàng</Badge>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Alert variant="info" className="text-center">
          <Alert.Heading>Không có sản phẩm</Alert.Heading>
          <p>Không tìm thấy sản phẩm nào trong danh mục này.</p>
        </Alert>
      )}

      {/* Loading Indicator */}
      {loading && !initialLoading && (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Đang tải thêm sản phẩm...</p>
        </div>
      )}

      {/* No More Products */}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-4">
          <p className="text-muted">
            <i className="bi bi-check-circle"></i> Đã hiển thị tất cả {totalProducts} sản phẩm
          </p>
        </div>
      )}

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
    </Container>
  );
};

export default ProductList;