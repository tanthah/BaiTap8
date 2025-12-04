// Fontend/src/components/Navbar.jsx - CẬP NHẬT
import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist } from '../redux/wishlistSlice';
import axios from 'axios';

const NavigationBar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [user, dispatch]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="bi bi-shop"></i> UTE Shop
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/products">
              <i className="bi bi-grid-3x3-gap"></i> Sản phẩm
            </Nav.Link>
            
            <NavDropdown title="Danh mục" id="categories-dropdown">
              {categories.map(category => (
                <NavDropdown.Item 
                  key={category._id}
                  as={Link}
                  to={`/category/${category.slug}`}
                >
                  {category.name}
                  <Badge bg="secondary" className="ms-2">
                    {category.productCount}
                  </Badge>
                </NavDropdown.Item>
              ))}
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/categories">
                <i className="bi bi-grid"></i> Tất cả danh mục
              </NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="Xem theo" id="view-dropdown">
              <NavDropdown.Item as={Link} to="/products">
                <i className="bi bi-arrow-down-circle"></i> Lazy Loading
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products-pagination">
                <i className="bi bi-123"></i> Phân trang
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          
          <Nav>
            {user && (
              <>
                <Nav.Link as={Link} to="/wishlist" className="position-relative">
                  <i className="bi bi-heart-fill"></i> Yêu thích
                  {wishlistItems?.length > 0 && (
                    <Badge 
                      bg="danger" 
                      pill 
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {wishlistItems.length}
                    </Badge>
                  )}
                </Nav.Link>

                <Nav.Link as={Link} to="/viewed-products">
                  <i className="bi bi-clock-history"></i> Đã xem
                </Nav.Link>
              </>
            )}

            {user ? (
              <NavDropdown 
                title={
                  <>
                    <i className="bi bi-person-circle"></i> {user.name}
                  </>
                }
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/dashboard">
                  <i className="bi bi-speedometer2"></i> Dashboard
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/wishlist">
                  <i className="bi bi-heart"></i> Yêu thích
                  {wishlistItems?.length > 0 && (
                    <Badge bg="danger" className="ms-2">{wishlistItems.length}</Badge>
                  )}
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/viewed-products">
                  <i className="bi bi-clock-history"></i> Đã xem
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right"></i> Đăng xuất
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <i className="bi bi-box-arrow-in-right"></i> Đăng nhập
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <i className="bi bi-person-plus"></i> Đăng ký
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;