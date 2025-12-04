
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải danh mục...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2>Danh mục sản phẩm</h2>
        <p className="text-muted">Khám phá các danh mục sản phẩm của chúng tôi</p>
      </div>

      <Row>
        {categories.map((category) => (
          <Col key={category._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <Link 
              to={`/category/${category.slug}`} 
              className="text-decoration-none"
            >
              <Card className="h-100 shadow-sm category-card">
                <Card.Img 
                  variant="top" 
                  src={category.image}
                  style={{ height: '150px', objectFit: 'cover' }}
                />
                <Card.Body className="text-center">
                  <Card.Title className="h5 mb-2">{category.name}</Card.Title>
                  {category.description && (
                    <Card.Text className="text-muted small">
                      {category.description}
                    </Card.Text>
                  )}
                  <div className="mt-2">
                    <span className="badge bg-primary">
                      {category.productCount} sản phẩm
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      <style>{`
        .category-card {
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
        }
      `}</style>
    </Container>
  );
};

export default Categories;