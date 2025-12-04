// Fontend/src/components/ReviewSection.jsx - FIXED
import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Spinner, Row, Col, ProgressBar, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axiosInstance from '../axois/api'; // FIXED: Use axiosInstance

const ReviewSection = ({ productId }) => {
  const { user, token } = useSelector(state => state.auth);
  
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      // FIXED: Use axiosInstance without base URL
      const response = await axiosInstance.get(`/reviews/${productId}`);
      setReviews(response.data.data);
      setStats(response.data.stats);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Vui lòng đăng nhập để đánh giá');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // FIXED: Use axiosInstance with token
      await axiosInstance.post(`/reviews/${productId}`, formData);
      
      setSuccess('Đã gửi đánh giá thành công!');
      setFormData({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (reviewId) => {
    if (!user) {
      alert('Vui lòng đăng nhập để thích đánh giá');
      return;
    }

    try {
      // FIXED: Use axiosInstance with token
      await axiosInstance.post(`/reviews/${reviewId}/like`);
      fetchReviews();
    } catch (err) {
      console.error('Error liking review:', err);
    }
  };

  const renderStars = (rating) => {
    return (
      <span className="text-warning">
        {'★'.repeat(rating)}
        {'☆'.repeat(5 - rating)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Rating Summary */}
      {stats && (
        <Card className="mb-4 border-0 bg-light">
          <Card.Body>
            <Row>
              <Col md={4} className="text-center border-end">
                <h1 className="display-3 text-warning mb-0">
                  {stats.avgRating}
                  <span className="fs-4 text-muted">/5</span>
                </h1>
                <div className="mb-2">{renderStars(Math.round(stats.avgRating))}</div>
                <p className="text-muted mb-0">{stats.totalReviews} đánh giá</p>
              </Col>
              
              <Col md={8}>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = stats.ratingCounts[star] || 0;
                  const percentage = stats.totalReviews > 0 
                    ? (count / stats.totalReviews * 100) 
                    : 0;
                  
                  return (
                    <div key={star} className="d-flex align-items-center mb-2">
                      <span className="me-2" style={{ width: '60px' }}>
                        {star} {renderStars(star)}
                      </span>
                      <ProgressBar 
                        now={percentage} 
                        className="flex-grow-1 me-2"
                        variant="warning"
                        style={{ height: '8px' }}
                      />
                      <span className="text-muted" style={{ width: '50px' }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Review Form */}
      {user ? (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Viết đánh giá của bạn</h5>
          </Card.Header>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Đánh giá của bạn</Form.Label>
                <div>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      onClick={() => setFormData({ ...formData, rating: star })}
                      style={{ 
                        fontSize: '2rem', 
                        cursor: 'pointer',
                        color: star <= formData.rating ? '#ffc107' : '#e4e5e9'
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nhận xét</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  required
                />
              </Form.Group>

              <Button 
                type="submit" 
                variant="primary"
                disabled={submitting}
              >
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="info">
          Vui lòng <Alert.Link href="/login">đăng nhập</Alert.Link> để viết đánh giá
        </Alert>
      )}

      {/* Reviews List */}
      <h5 className="mb-3">Tất cả đánh giá ({reviews.length})</h5>
      
      {reviews.length === 0 ? (
        <Alert variant="info">
          Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
        </Alert>
      ) : (
        reviews.map(review => (
          <Card key={review._id} className="mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="d-flex align-items-center mb-1">
                    <strong className="me-2">{review.user.name}</strong>
                    <Badge bg="secondary">
                      {renderStars(review.rating)}
                    </Badge>
                  </div>
                  <small className="text-muted">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </small>
                </div>
              </div>
              
              <p className="mb-2">{review.comment}</p>
              
              {review.images && review.images.length > 0 && (
                <div className="mb-2">
                  {review.images.map((img, idx) => (
                    <img 
                      key={idx}
                      src={img} 
                      alt="Review" 
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        objectFit: 'cover',
                        marginRight: '8px',
                        borderRadius: '4px'
                      }}
                    />
                  ))}
                </div>
              )}
              
              <Button 
                variant="link" 
                size="sm"
                className="p-0 text-muted"
                onClick={() => handleLike(review._id)}
              >
                <i className={`bi bi-hand-thumbs-up${review.likes?.includes(user?._id) ? '-fill' : ''}`}></i>
                {' '}Hữu ích ({review.likes?.length || 0})
              </Button>
            </Card.Body>
          </Card>
        ))
      )}
    </div>
  );
};

export default ReviewSection;