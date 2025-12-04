
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Form, Pagination } from 'react-bootstrap';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ProductListPagination = () => {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12,
  });

  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentSort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categorySlug, currentPage, currentSort]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        limit: 12,
        sort: currentSort,
      };
      
      let response;
      if (categorySlug) {
        response = await axios.get(
          `http://localhost:5000/api/products/category/${categorySlug}`,
          { params }
        );
        setCategory(response.data.category);
      } else {
        response = await axios.get(
          'http://localhost:5000/api/products',
          { params }
        );
      }
      
      setProducts(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber);
    setSearchParams(params);
  };

  const handleSortChange = (e) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', e.target.value);
    params.set('page', '1');
    setSearchParams(params);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderPaginationItems = () => {
    const items = [];
    const { page, pages } = pagination;
    const maxVisible = 5;
    
    // First page
    items.push(
      <Pagination.First 
        key="first" 
        onClick={() => handlePageChange(1)}
        disabled={page === 1}
      />
    );
    
    // Previous
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
      />
    );
    
    // Page numbers
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(pages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
      items.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === page}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    if (endPage < pages) {
      items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
    }
    
    // Next
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(page + 1)}
        disabled={page === pages}
      />
    );
    
    // Last page
    items.push(
      <Pagination.Last 
        key="last" 
        onClick={() => handlePageChange(pages)}
        disabled={page === pages}
      />
    );
    
    return items;
  };

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
              Hiển thị {products.length} / {pagination.total} sản phẩm
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

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Đang tải sản phẩm...</p>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <Row>
            {products.map((product) => (
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
                        <span className="text-warning me-1">
                          {'★'.repeat(Math.floor(product.rating))}
                          {'☆'.repeat(5 - Math.floor(product.rating))}
                        </span>
                        <small className="text-muted">
                          ({product.numReviews})
                        </small>
                      </div>
                      <small className="text-muted">
                        Đã bán: {product.sold}
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
            ))}
          </Row>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>{renderPaginationItems()}</Pagination>
            </div>
          )}

          {/* No Products */}
          {products.length === 0 && (
            <Alert variant="info" className="text-center">
              Không tìm thấy sản phẩm nào
            </Alert>
          )}
        </>
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

export default ProductListPagination;