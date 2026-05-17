'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function UserDashboard() {
  const { user, token } = useAuth();
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
    fetchBorrowedBooks();
    fetchBorrowRequests();
    fetchReturnRequests();
  }, []);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/books', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBorrowedBooks = async () => {
    try {
      const response = await fetch('http://localhost:5000/borrowed-books/my-books', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setBorrowedBooks(data);
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
    }
  };

  const fetchBorrowRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/borrow-requests/my-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setBorrowRequests(data);
    } catch (error) {
      console.error('Error fetching borrow requests:', error);
    }
  };

  const fetchReturnRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/return-requests/my-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setReturnRequests(data);
      } else {
        console.error('Unexpected return request response:', response.status, data);
        setReturnRequests([]);
      }
    } catch (error) {
      console.error('Error fetching return requests:', error);
      setReturnRequests([]);
    }
  };

  const handleBorrowRequest = async (bookId) => {
    try {
      const response = await fetch(`http://localhost:5000/books/${bookId}/borrow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchBorrowRequests();
        fetchBooks();
        // Show success message
        alert('Book request submitted successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to request book');
      }
    } catch (error) {
      console.error('Error requesting book:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleReturnBook = async (borrowId) => {
    if (confirm('Are you sure you want to request a return for this book?')) {
      try {
        const response = await fetch('http://localhost:5000/return-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ borrowId })
        });

        if (response.ok) {
          fetchReturnRequests();
          fetchBorrowedBooks();
          alert('Return request submitted. Admin must approve it.');
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to submit return request');
        }
      } catch (error) {
        console.error('Error requesting return:', error);
        alert('Network error. Please try again.');
      }
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (confirm('Are you sure you want to cancel this request?')) {
      try {
        await fetch(`http://localhost:5000/borrow-requests/${requestId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchBorrowRequests();
      } catch (error) {
        console.error('Error canceling request:', error);
      }
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableBooks = filteredBooks.filter(book => book.availableCopies > 0);

  const safeReturnRequests = Array.isArray(returnRequests) ? returnRequests : [];

  const stats = {
    availableBooks: availableBooks.length,
    borrowedBooks: borrowedBooks.length,
    pendingRequests: borrowRequests.filter(r => r.status?.toLowerCase() === 'pending').length +
      safeReturnRequests.filter(r => r.status?.toLowerCase() === 'pending').length,
    totalBooks: books.length
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4 d-flex flex-column flex-md-row align-items-center justify-content-between">
          <div className="mb-3 mb-md-0 text-center text-md-start">
            <h1 className="h3 fw-bold text-dark mb-1">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-muted mb-0">
              Discover and manage your library books
            </p>
          </div>
          
          {/* User Avatar */}
          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <p className="fw-semibold text-dark mb-0 lh-1">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill mt-1">
                {user?.role}
              </span>
            </div>
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
              {user?.firstName?.[0] || 'U'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <p className="text-primary fw-medium mb-1 small">Available Books</p>
                <h3 className="fw-bold text-dark mb-0">{stats.availableBooks}</h3>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary rounded px-3 py-2">
                <i className="bi bi-journal-text fs-4"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <p className="text-success fw-medium mb-1 small">Borrowed Books</p>
                <h3 className="fw-bold text-dark mb-0">{stats.borrowedBooks}</h3>
              </div>
              <div className="bg-success bg-opacity-10 text-success rounded px-3 py-2">
                <i className="bi bi-book fs-4"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <p className="text-warning fw-medium mb-1 small">Pending Requests</p>
                <h3 className="fw-bold text-dark mb-0">{stats.pendingRequests}</h3>
              </div>
              <div className="bg-warning bg-opacity-10 text-warning rounded px-3 py-2">
                <i className="bi bi-hourglass-split fs-4"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <p className="text-info fw-medium mb-1 small">Total Books</p>
                <h3 className="fw-bold text-dark mb-0">{stats.totalBooks}</h3>
              </div>
              <div className="bg-info bg-opacity-10 text-info rounded px-3 py-2">
                <i className="bi bi-collection fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-header bg-white border-bottom-0 pt-3 pb-0">
          <ul className="nav nav-tabs border-bottom-0 gap-2">
            {[
              { id: 'available', label: 'Available Books', icon: 'bi-journal-check', count: availableBooks.length },
              { id: 'borrowed', label: 'My Books', icon: 'bi-book-half', count: borrowedBooks.length },
              { id: 'requests', label: 'Requests', icon: 'bi-clipboard-data', count: borrowRequests.length }
            ].map((tab) => (
              <li className="nav-item" key={tab.id}>
                <button
                  className={`nav-link border-0 fw-medium d-flex align-items-center gap-2 pb-3 px-4 ${
                    activeTab === tab.id ? 'active text-primary border-bottom border-primary border-3 bg-transparent' : 'text-muted'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ borderRadius: 0 }}
                >
                  <i className={`bi ${tab.icon}`}></i>
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="badge bg-primary rounded-pill ms-1">
                      {tab.count}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Available Books Tab */}
      {activeTab === 'available' && (
        <>
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <div className="position-relative">
                <i className="bi bi-search position-absolute top-50 translate-middle-y text-muted ms-3"></i>
                <input
                  type="text"
                  className="form-control form-control-lg bg-light border-0 ps-5"
                  placeholder="Search books by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {availableBooks.map((book) => (
                <div key={book.id} className="col-sm-6 col-lg-4 col-xl-3">
                  <div className="card h-100 border-0 shadow-sm rounded-4 hover-shadow transition-all">
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="bg-primary text-white rounded p-3 d-flex align-items-center justify-content-center shadow-sm">
                          <i className="bi bi-book fs-5"></i>
                        </div>
                        <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2">Available</span>
                      </div>
                      
                      <h5 className="card-title fw-bold text-dark mb-1">{book.title}</h5>
                      <p className="text-muted small mb-3">by {book.author}</p>
                      
                      <div className="mb-3 flex-grow-1">
                        <div className="d-flex align-items-center text-muted small mb-2">
                          <i className="bi bi-upc-scan me-2"></i>
                          ISBN: {book.isbn}
                        </div>
                        <div className="d-flex align-items-center text-muted small mb-2">
                          <i className="bi bi-tags me-2"></i>
                          <span className="badge bg-secondary bg-opacity-10 text-secondary">{book.genre}</span>
                        </div>
                        <div className="d-flex align-items-center text-muted small">
                          <i className="bi bi-layers me-2"></i>
                          {book.availableCopies} of {book.totalCopies} copies
                        </div>
                      </div>
                      
                      {book.description && (
                        <p className="card-text text-muted small mb-4 text-truncate-3" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {book.description}
                        </p>
                      )}
                      
                      <button
                        onClick={() => handleBorrowRequest(book.id)}
                        className="btn btn-primary w-100 mt-auto rounded-pill fw-medium d-flex align-items-center justify-content-center gap-2"
                      >
                        <i className="bi bi-arrow-right-square"></i>
                        Request to Borrow
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {availableBooks.length === 0 && (
                <div className="col-12 text-center py-5 text-muted">
                  <i className="bi bi-journal-x fs-1 mb-3 d-block"></i>
                  <h5>No books found</h5>
                  <p>Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Borrowed Books Tab */}
      {activeTab === 'borrowed' && (
        <div className="row g-4">
          {borrowedBooks.map((borrow) => (
            <div key={borrow.id} className="col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-4">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="bg-success text-white rounded p-3 d-flex align-items-center justify-content-center shadow-sm">
                      <i className="bi bi-bookmark-check fs-5"></i>
                    </div>
                    <span className={`badge rounded-pill px-3 py-2 ${
                        borrow.status === 'active' 
                          ? 'bg-success bg-opacity-10 text-success'
                          : 'bg-warning bg-opacity-10 text-warning'
                      }`}>
                      {borrow.status}
                    </span>
                  </div>
                  
                  <h5 className="card-title fw-bold text-dark mb-1">{borrow.book?.title}</h5>
                  <p className="text-muted small mb-3">by {borrow.book?.author}</p>
                  
                  <div className="mb-4 bg-light rounded p-3 flex-grow-1">
                    <div className="d-flex align-items-center text-dark small mb-2">
                      <i className="bi bi-calendar-check text-success me-2"></i>
                      <strong>Borrowed:</strong> <span className="ms-auto">{new Date(borrow.borrowDate).toLocaleDateString()}</span>
                    </div>
                    <div className="d-flex align-items-center text-dark small">
                      <i className="bi bi-calendar-x text-danger me-2"></i>
                      <strong>Due:</strong> <span className="ms-auto">{new Date(borrow.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {borrow.status === 'active' && (
                    <button
                      onClick={() => handleReturnBook(borrow.id)}
                      className="btn btn-outline-success w-100 mt-auto rounded-pill fw-medium d-flex align-items-center justify-content-center gap-2"
                    >
                      <i className="bi bi-arrow-return-left"></i>
                      Return Book
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {borrowedBooks.length === 0 && (
            <div className="col-12 text-center py-5 text-muted">
              <i className="bi bi-journal-minus fs-1 mb-3 d-block"></i>
              <h5>No borrowed books</h5>
              <p>You haven't borrowed any books yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Borrow Requests Tab */}
      {activeTab === 'requests' && (
        <>
          <div className="row g-4">
            {borrowRequests.map((request) => (
              <div key={request.id} className="col-sm-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm rounded-4">
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="bg-warning text-white rounded p-3 d-flex align-items-center justify-content-center shadow-sm">
                        <i className="bi bi-clock-history fs-5"></i>
                      </div>
                      <span className={`badge rounded-pill px-3 py-2 ${
                          request.status?.toLowerCase() === 'pending'
                            ? 'bg-warning bg-opacity-10 text-warning'
                            : request.status?.toLowerCase() === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-danger bg-opacity-10 text-danger'
                        }`}>
                        {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                      </span>
                    </div>
                    
                    <h5 className="card-title fw-bold text-dark mb-1">{request.book?.title}</h5>
                    <p className="text-muted small mb-3">by {request.book?.author}</p>
                    
                    <div className="mb-4 bg-light rounded p-3 flex-grow-1">
                      <div className="d-flex align-items-center text-dark small">
                        <i className="bi bi-calendar-event text-primary me-2"></i>
                        <strong>Requested:</strong> <span className="ms-auto">{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {request.status?.toLowerCase() === 'pending' && (
                      <button
                        onClick={() => handleCancelRequest(request.id)}
                        className="btn btn-outline-danger w-100 mt-auto rounded-pill fw-medium d-flex align-items-center justify-content-center gap-2"
                      >
                        <i className="bi bi-x-circle"></i>
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <h4 className="mb-4">Return Requests</h4>
            <div className="row g-4">
              {safeReturnRequests.map((request) => (
                <div key={request.id} className="col-sm-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm rounded-4">
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="bg-info text-white rounded p-3 d-flex align-items-center justify-content-center shadow-sm">
                          <i className="bi bi-arrow-counterclockwise fs-5"></i>
                        </div>
                        <span className={`badge rounded-pill px-3 py-2 ${
                            request.status?.toLowerCase() === 'pending'
                              ? 'bg-warning bg-opacity-10 text-warning'
                              : request.status?.toLowerCase() === 'approved'
                              ? 'bg-success bg-opacity-10 text-success'
                              : 'bg-danger bg-opacity-10 text-danger'
                          }`}>
                          {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                        </span>
                      </div>

                      <h5 className="card-title fw-bold text-dark mb-1">{request.book?.title}</h5>
                      <p className="text-muted small mb-3">by {request.book?.author}</p>

                      <div className="mb-4 bg-light rounded p-3 flex-grow-1">
                        <div className="d-flex align-items-center text-dark small">
                          <i className="bi bi-calendar-event text-primary me-2"></i>
                          <strong>Requested:</strong> <span className="ms-auto">{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {borrowRequests.length === 0 && safeReturnRequests.length === 0 && (
                <div className="col-12 text-center py-5 text-muted">
                  <i className="bi bi-clipboard-x fs-1 mb-3 d-block"></i>
                  <h5>No requests found</h5>
                  <p>You don't have any pending borrow or return requests.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
