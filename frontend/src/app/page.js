'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/dashboard';
    }
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Hero Section */}
      <div className="flex-grow-1 d-flex align-items-center bg-white border-bottom shadow-sm">
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 text-center text-lg-start">
              <h1 className="display-4 fw-bold lh-1 mb-3 text-primary">
                Modern Library <br />
                <span className="text-dark">Management System</span>
              </h1>
              <p className="lead text-muted mb-4">
                Experience seamless library operations with our advanced platform. 
                Manage books, track users, and streamline your entire library workflow 
                with ease and professionalism.
              </p>
              <div className="d-grid gap-2 d-sm-flex justify-content-sm-center justify-content-lg-start">
                <Link href="/login" className="btn btn-primary btn-lg px-4 gap-3 rounded-pill shadow-sm">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login Account
                </Link>
                <Link href="/register" className="btn btn-outline-secondary btn-lg px-4 rounded-pill">
                  <i className="bi bi-person-plus me-2"></i>
                  Create Account
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="bg-light p-5 rounded-4 shadow-sm text-center border">
                <i className="bi bi-book text-primary mb-3" style={{ fontSize: '5rem' }}></i>
                <h3 className="fw-bold mb-3">Discover Knowledge</h3>
                <p className="text-muted mb-0">
                  Access a vast collection of books and resources. Our system ensures you find exactly what you need quickly and efficiently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container py-5">
        <div className="row g-4 py-5 row-cols-1 row-cols-lg-3">
          <div className="col d-flex align-items-start">
            <div className="icon-square text-bg-light bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3 p-3 rounded-3">
              <i className="bi bi-collection"></i>
            </div>
            <div>
              <h3 className="fs-4 fw-semibold text-dark">Extensive Catalog</h3>
              <p className="text-muted">Browse through thousands of books across various categories and genres easily.</p>
            </div>
          </div>
          <div className="col d-flex align-items-start">
            <div className="icon-square text-bg-light bg-success bg-opacity-10 text-success d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3 p-3 rounded-3">
              <i className="bi bi-person-check"></i>
            </div>
            <div>
              <h3 className="fs-4 fw-semibold text-dark">User Management</h3>
              <p className="text-muted">Efficiently manage user accounts, roles, and permissions within the system.</p>
            </div>
          </div>
          <div className="col d-flex align-items-start">
            <div className="icon-square text-bg-light bg-info bg-opacity-10 text-info d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3 p-3 rounded-3">
              <i className="bi bi-graph-up"></i>
            </div>
            <div>
              <h3 className="fs-4 fw-semibold text-dark">Real-time Tracking</h3>
              <p className="text-muted">Track book availability, borrowing history, and due dates in real-time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-3 bg-white border-top">
        <div className="container text-center">
          <span className="text-muted">© 2026 Library Management System. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
