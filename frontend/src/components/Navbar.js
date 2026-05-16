'use client';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-white border-bottom sticky-top shadow-sm">
      <div className="container-fluid px-4">
        {/* Logo and Brand */}
        <Link href="/dashboard" className="navbar-brand d-flex align-items-center">
          <div className="bg-primary text-white rounded p-2 me-2 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            <i className="bi bi-book-half fs-5"></i>
          </div>
          <div>
            <span className="fw-bold fs-5 text-dark d-block lh-1 mb-1">Library Management</span>
            <small className="text-muted" style={{ fontSize: '0.75rem' }}>Professional System</small>
          </div>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links and User Menu */}
        <div className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`} id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-md-0 ms-md-4">
            <li className="nav-item">
              <Link href="/dashboard" className="nav-link text-dark fw-medium px-3 rounded hover-bg-light">
                Dashboard
              </Link>
            </li>
            {user?.role?.toLowerCase() === 'admin' && (
              <>
                <li className="nav-item">
                  <Link href="/dashboard?tab=users" className="nav-link text-dark fw-medium px-3 rounded hover-bg-light">
                    Users
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/dashboard?tab=books" className="nav-link text-dark fw-medium px-3 rounded hover-bg-light">
                    Books
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center flex-wrap gap-3 mt-3 mt-md-0">
            
            {/* User Info */}
            <div className="d-flex align-items-center bg-light border rounded-pill px-3 py-1 shadow-sm">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-2" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                {user?.firstName?.[0] || 'U'}
              </div>
              <div className="d-none d-lg-block text-start me-2">
                <div className="fw-semibold text-dark lh-1 mb-1" style={{ fontSize: '0.85rem' }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill fw-medium" style={{ fontSize: '0.7rem' }}>
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn btn-danger rounded-pill px-4 shadow-sm fw-medium d-flex align-items-center gap-2"
            >
              <i className="bi bi-box-arrow-right"></i>
              <span className="d-none d-sm-inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
