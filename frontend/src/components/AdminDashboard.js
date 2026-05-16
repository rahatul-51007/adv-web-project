'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  
  // Debug info
  console.log('AdminDashboard rendered - User:', user, 'Role:', user?.role);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('books');
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    genre: '',
    totalCopies: 1,
    availableCopies: 1,
  });

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  useEffect(() => {
    fetchBooks();
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/all-users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchBorrowRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/borrow-requests', {
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
      const response = await fetch('http://localhost:5000/return-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setReturnRequests(data);
      } else {
        console.error('Unexpected return request response:', data);
        setReturnRequests([]);
      }
    } catch (error) {
      console.error('Error fetching return requests:', error);
      setReturnRequests([]);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const url = editingBook 
        ? `http://localhost:5000/books/${editingBook.id}`
        : 'http://localhost:5000/books';
      
      const method = editingBook ? 'PUT' : 'POST';
      
      const payload = {
        ...bookForm,
        totalCopies: Number(bookForm.totalCopies) || 1,
      };

      if (!editingBook) {
        payload.availableCopies = payload.totalCopies;
      } else if (payload.availableCopies > payload.totalCopies) {
        payload.availableCopies = payload.totalCopies;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchBooks();
        setShowBookForm(false);
        setEditingBook(null);
        setBookForm({
          title: '',
          author: '',
          isbn: '',
          description: '',
          genre: '',
          totalCopies: 1,
          availableCopies: 1,
        });
        setSuccessMessage(
          editingBook 
            ? 'Book updated successfully!' 
            : 'Book added successfully!'
        );
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to save book');
      }
    } catch (error) {
      console.error('Error saving book:', error);
      setErrorMessage('Network error. Please try again.');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      setErrorMessage('');
      setSuccessMessage('');
      
      try {
        const response = await fetch(`http://localhost:5000/books/${bookId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          fetchBooks();
          setSuccessMessage('Book deleted successfully!');
        } else {
          const errorData = await response.json();
          setErrorMessage(errorData.message || 'Failed to delete book');
        }
      } catch (error) {
        console.error('Error deleting book:', error);
        setErrorMessage('Network error. Please try again.');
      }
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setBookForm(book);
    setShowBookForm(true);
  };

  const handleBorrowRequest = async (requestId, action) => {
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const response = await fetch(`http://localhost:5000/borrow-requests/${requestId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchBorrowRequests();
        fetchBooks();
        setSuccessMessage(`Request ${action}d successfully!`);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || `Failed to ${action} request`);
      }
    } catch (error) {
      console.error('Error handling borrow request:', error);
      setErrorMessage('Network error. Please try again.');
    }
  };

  const handleReturnRequestAction = async (requestId, action) => {
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const response = await fetch(`http://localhost:5000/return-requests/${requestId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchReturnRequests();
        fetchBooks();
        setSuccessMessage(`Return request ${action}d successfully!`);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || `Failed to ${action} return request`);
      }
    } catch (error) {
      console.error('Error handling return request:', error);
      setErrorMessage('Network error. Please try again.');
    }
  };

  const updateCopies = (field, delta) => {
    setBookForm((current) => {
      const currentValue = Number(current[field] ?? 1);
      const next = Math.max(1, currentValue + delta);
      const updated = { ...current, [field]: next };

      if (field === 'totalCopies') {
        updated.availableCopies = editingBook
          ? Math.min(current.availableCopies ?? next, next)
          : next;
      }

      return updated;
    });
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalBooks: books.reduce((sum, book) => sum + (Number(book.totalCopies) || 0), 0),
    totalUsers: users.length,
    pendingRequests:
      borrowRequests.filter(r => r.status?.toLowerCase() === 'pending').length +
      (Array.isArray(returnRequests)
        ? returnRequests.filter(r => r.status?.toLowerCase() === 'pending').length
        : 0),
    availableBooks: books.reduce((sum, book) => sum + (Number(book.availableCopies) || 0), 0)
  };

  return (
    <div className="container py-5">
      {/* Success and Error Messages */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-4 rounded-3" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          <div>{successMessage}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setSuccessMessage('')}></button>
        </div>
      )}
      
      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center mb-4 rounded-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>{errorMessage}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setErrorMessage('')}></button>
        </div>
      )}

      {/* Header */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-danger bg-opacity-10 border-danger">
        <div className="card-body p-4">
          <div className="text-center mb-3">
            <div className="badge bg-danger text-white fs-6 mb-2 px-3 py-2">
              <i className="bi bi-shield-fill-exclamation me-2"></i>
              ADMIN ONLY DASHBOARD
            </div>
            <h1 className="h2 fw-bold text-danger mb-1">
              Admin Control Panel
            </h1>
            <p className="text-muted mb-0">
              User: {user?.firstName} {user?.lastName} | Role: {user?.role}
            </p>
          </div>
          <div className="d-flex justify-content-center gap-2">
            <button
              onClick={() => {
                fetchBooks();
                fetchUsers();
                fetchBorrowRequests();
                fetchReturnRequests();
                setSuccessMessage('Dashboard refreshed successfully!');
              }}
              className="btn btn-danger rounded-pill px-4 shadow-sm"
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <p className="text-primary fw-medium mb-1 small">Total Books</p>
                <h3 className="fw-bold text-dark mb-0">{stats.totalBooks}</h3>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary rounded px-3 py-2">
                <i className="bi bi-book fs-4"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <p className="text-success fw-medium mb-1 small">Available</p>
                <h3 className="fw-bold text-dark mb-0">{stats.availableBooks}</h3>
              </div>
              <div className="bg-success bg-opacity-10 text-success rounded px-3 py-2">
                <i className="bi bi-journal-check fs-4"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <p className="text-purple fw-medium text-purple mb-1 small" style={{ color: '#6f42c1' }}>Users</p>
                <h3 className="fw-bold text-dark mb-0">{stats.totalUsers}</h3>
              </div>
              <div className="rounded px-3 py-2" style={{ backgroundColor: '#f3e8ff', color: '#6f42c1' }}>
                <i className="bi bi-people fs-4"></i>
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
                <i className="bi bi-clipboard-data fs-4"></i>
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
              { id: 'books', label: 'Books', icon: 'bi-book' },
              { id: 'users', label: 'Users', icon: 'bi-people' },
              { id: 'requests', label: 'Borrow Requests', icon: 'bi-clipboard-check' },
              { id: 'return-requests', label: 'Return Requests', icon: 'bi-arrow-return-left' }
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
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Books Tab */}
      {activeTab === 'books' && (
        <>
          {/* Debug Info - Remove in production */}
          {console.log('Active Tab:', activeTab, 'Show Book Form:', showBookForm)}
          
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
              <div className="position-relative w-100" style={{ maxWidth: '400px' }}>
                <i className="bi bi-search position-absolute top-50 translate-middle-y text-muted ms-3"></i>
                <input
                  type="text"
                  className="form-control form-control-lg bg-light border-0 ps-5"
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => {
                  console.log('Add Book button clicked!');
                  setShowBookForm(true);
                }}
                className="btn btn-success btn-lg rounded-pill px-4 fw-medium d-flex align-items-center gap-2 shadow-lg whitespace-nowrap"
                style={{ minWidth: '150px', backgroundColor: '#28a745', border: '2px solid #28a745' }}
              >
                <i className="bi bi-plus-circle-fill"></i>
                Add New Book
              </button>
            </div>
          </div>

          {/* Fallback Add Book Button - Always Visible */}
          <div className="text-center mb-4">
            <button
              onClick={() => {
                console.log('Fallback Add Book button clicked!');
                setShowBookForm(true);
              }}
              className="btn btn-primary btn-lg rounded-pill px-5 shadow-lg"
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add Book (Fallback)
            </button>
          </div>

          {/* Book Form Modal */}
          {showBookForm && (
            <div className="modal fade show d-block bg-dark bg-opacity-50" tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div className="modal-content border-0 rounded-4 shadow-lg">
                  <div className="modal-header border-0 pb-0 pt-4 px-4">
                    <h5 className="modal-title fw-bold fs-4">
                      {editingBook ? 'Edit Book' : 'Add New Book'}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => {
                        setShowBookForm(false);
                        setEditingBook(null);
                        setBookForm({
                          title: '',
                          author: '',
                          isbn: '',
                          description: '',
                          genre: '',
                          totalCopies: 1,
                          availableCopies: 1,
                        });
                      }}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body p-4">
                    <form onSubmit={handleBookSubmit}>
                      <div className="row g-3 mb-3">
                        <div className="col-md-6 form-floating">
                          <input
                            type="text"
                            value={bookForm.title}
                            onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                            className="form-control"
                            id="bookTitle"
                            placeholder="Title"
                            required
                          />
                          <label htmlFor="bookTitle" className="ms-2">Title</label>
                        </div>
                        <div className="col-md-6 form-floating">
                          <input
                            type="text"
                            value={bookForm.author}
                            onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                            className="form-control"
                            id="bookAuthor"
                            placeholder="Author"
                            required
                          />
                          <label htmlFor="bookAuthor" className="ms-2">Author</label>
                        </div>
                        <div className="col-md-6 form-floating">
                          <input
                            type="text"
                            value={bookForm.isbn}
                            onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})}
                            className="form-control"
                            id="bookIsbn"
                            placeholder="ISBN"
                          />
                          <label htmlFor="bookIsbn" className="ms-2">ISBN</label>
                        </div>
                        <div className="col-md-6 form-floating">
                          <input
                            type="text"
                            value={bookForm.genre}
                            onChange={(e) => setBookForm({...bookForm, genre: e.target.value})}
                            className="form-control"
                            id="bookGenre"
                            placeholder="Genre"
                            required
                          />
                          <label htmlFor="bookGenre" className="ms-2">Genre</label>
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="bookCopies" className="form-label fw-semibold ms-1">Total Copies</label>
                          <div className="input-group">
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => updateCopies('totalCopies', -1)}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={bookForm.totalCopies}
                              onChange={(e) => {
                                const parsed = parseInt(e.target.value, 10);
                                setBookForm((current) => {
                                  const next = Number.isNaN(parsed) ? 1 : Math.max(1, parsed);
                                  return {
                                    ...current,
                                    totalCopies: next,
                                    availableCopies: editingBook
                                      ? Math.min(current.availableCopies ?? next, next)
                                      : next,
                                  };
                                });
                              }}
                              className="form-control text-center"
                              id="bookCopies"
                              placeholder="Total Copies"
                              min="1"
                              required
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => updateCopies('totalCopies', 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="form-floating mb-4">
                        <textarea
                          value={bookForm.description}
                          onChange={(e) => setBookForm({...bookForm, description: e.target.value})}
                          className="form-control"
                          id="bookDescription"
                          placeholder="Description"
                          style={{ height: '100px' }}
                        ></textarea>
                        <label htmlFor="bookDescription" className="ms-2">Description</label>
                      </div>
                      
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-light border rounded-pill px-4"
                          onClick={() => {
                            setShowBookForm(false);
                            setEditingBook(null);
                            setBookForm({
                              title: '',
                              author: '',
                              isbn: '',
                              description: '',
                              genre: '',
                              totalCopies: 1,
                              availableCopies: 1,
                            });
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary rounded-pill px-4 shadow-sm"
                        >
                          {editingBook ? 'Update Book' : 'Add Book'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Books List */}
          <div className="card border-0 shadow-sm rounded-4">
            {isLoading ? (
              <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 rounded-start-4 ps-4 py-3">Title</th>
                      <th className="border-0 py-3">Author</th>
                      <th className="border-0 py-3">ISBN</th>
                      <th className="border-0 py-3">Genre</th>
                      <th className="border-0 py-3">Copies</th>
                      <th className="border-0 py-3">Status</th>
                      <th className="border-0 rounded-end-4 text-end pe-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map((book) => (
                      <tr key={book.id}>
                        <td className="ps-4 py-3">
                          <p className="fw-bold mb-0 text-dark">{book.title}</p>
                          <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                            {book.description}
                          </small>
                        </td>
                        <td className="py-3 text-muted">{book.author}</td>
                        <td className="py-3 text-muted">{book.isbn}</td>
                        <td className="py-3">
                          <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-2 py-1">
                            {book.genre}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="fw-medium text-dark">{book.availableCopies}</span>
                          <span className="text-muted mx-1">/</span>
                          <span className="text-muted">{book.totalCopies}</span>
                        </td>
                        <td className="py-3">
                          <span className={`badge rounded-pill px-2 py-1 ${
                            book.availableCopies > 0 
                              ? 'bg-success bg-opacity-10 text-success'
                              : 'bg-danger bg-opacity-10 text-danger'
                          }`}>
                            {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="text-end pe-4 py-3">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              onClick={() => handleEditBook(book)}
                              className="btn btn-sm btn-outline-primary rounded-pill px-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book.id)}
                              className="btn btn-sm btn-outline-danger rounded-pill px-3"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredBooks.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-muted">
                          No books found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 rounded-start-4 ps-4 py-3">Name</th>
                  <th className="border-0 py-3">Email</th>
                  <th className="border-0 py-3">Role</th>
                  <th className="border-0 rounded-end-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
                          <span className="fw-bold">{user.firstName?.[0] || 'U'}</span>
                        </div>
                        <p className="fw-bold text-dark mb-0">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 text-muted">{user.email}</td>
                    <td className="py-3">
                      <span className={`badge rounded-pill px-2 py-1 ${
                        user.role?.toLowerCase() === 'admin' 
                          ? 'bg-danger bg-opacity-10 text-danger'
                          : 'bg-success bg-opacity-10 text-success'
                      }`}>
                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`badge rounded-pill px-2 py-1 ${
                        user.isActive 
                          ? 'bg-success bg-opacity-10 text-success'
                          : 'bg-danger bg-opacity-10 text-danger'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Borrow Requests Tab */}
      {activeTab === 'requests' && (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 rounded-start-4 ps-4 py-3">Book</th>
                  <th className="border-0 py-3">Requested By</th>
                  <th className="border-0 py-3">Date</th>
                  <th className="border-0 py-3">Status</th>
                  <th className="border-0 rounded-end-4 text-end pe-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="ps-4 py-3">
                      <p className="fw-bold text-dark mb-0">{request.book?.title}</p>
                      <small className="text-muted">by {request.book?.author}</small>
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                          <span className="fw-bold">{request.user?.firstName?.[0] || 'U'}</span>
                        </div>
                        <div>
                          <p className="fw-medium text-dark mb-0 lh-1" style={{ fontSize: '0.9rem' }}>
                            {request.user?.firstName} {request.user?.lastName}
                          </p>
                          <small className="text-muted">{request.user?.email}</small>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-muted">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className={`badge rounded-pill px-2 py-1 ${
                      request.status?.toLowerCase() === 'pending'
                        ? 'bg-warning bg-opacity-10 text-warning'
                        : request.status?.toLowerCase() === 'approved'
                        ? 'bg-success bg-opacity-10 text-success'
                        : 'bg-danger bg-opacity-10 text-danger'
                    }`}>
                        {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                      </span>
                    </td>
                    <td className="text-end pe-4 py-3">
                      {request.status?.toLowerCase() === 'pending' && (
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            onClick={() => handleBorrowRequest(request.id, 'approve')}
                            className="btn btn-sm btn-success rounded-pill px-3 shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleBorrowRequest(request.id, 'reject')}
                            className="btn btn-sm btn-danger rounded-pill px-3 shadow-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {borrowRequests.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No borrow requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Return Requests Tab */}
      {activeTab === 'return-requests' && (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 rounded-start-4 ps-4 py-3">Book</th>
                  <th className="border-0 py-3">Requested By</th>
                  <th className="border-0 py-3">Borrowed On</th>
                  <th className="border-0 py-3">Status</th>
                  <th className="border-0 rounded-end-4 text-end pe-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {returnRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="ps-4 py-3">
                      <p className="fw-bold text-dark mb-0">{request.book?.title}</p>
                      <small className="text-muted">by {request.book?.author}</small>
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                          <span className="fw-bold">{request.user?.firstName?.[0] || 'U'}</span>
                        </div>
                        <div>
                          <p className="fw-medium text-dark mb-0 lh-1" style={{ fontSize: '0.9rem' }}>
                            {request.user?.firstName} {request.user?.lastName}
                          </p>
                          <small className="text-muted">{request.user?.email}</small>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-muted">
                      {request.borrowedBook?.borrowDate ? new Date(request.borrowedBook.borrowDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3">
                      <span className={`badge rounded-pill px-2 py-1 ${
                        request.status?.toLowerCase() === 'pending'
                          ? 'bg-warning bg-opacity-10 text-warning'
                          : request.status?.toLowerCase() === 'approved'
                          ? 'bg-success bg-opacity-10 text-success'
                          : 'bg-danger bg-opacity-10 text-danger'
                      }`}>
                        {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                      </span>
                    </td>
                    <td className="text-end pe-4 py-3">
                      {request.status?.toLowerCase() === 'pending' && (
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            onClick={() => handleReturnRequestAction(request.id, 'approve')}
                            className="btn btn-sm btn-success rounded-pill px-3 shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReturnRequestAction(request.id, 'reject')}
                            className="btn btn-sm btn-danger rounded-pill px-3 shadow-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {returnRequests.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No return requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
