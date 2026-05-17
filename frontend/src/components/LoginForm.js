'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      login(result.user, result.access_token);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
      <div className="container" style={{ maxWidth: '450px' }}>
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden position-relative">
          {/* Home Icon */}
          <Link href="/" className="position-absolute top-0 start-0 mt-3 ms-3 text-white text-decoration-none" style={{ zIndex: 10 }}>
            <i className="bi bi-house-fill" style={{ fontSize: '1.5rem', transition: 'transform 0.2s' }} 
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'} 
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}></i>
          </Link>
          
          {/* Header Section */}
          <div className="bg-primary text-white text-center py-5 px-4">
            <i className="bi bi-book-half mb-3" style={{ fontSize: '3rem' }}></i>
            <h2 className="fw-bold mb-1">Welcome Back</h2>
            <p className="text-white-50 mb-0">Sign in to your library account</p>
          </div>

          <div className="card-body p-4 p-sm-5 bg-white">
            {/* Error Alert */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center py-2 px-3 mb-4 rounded-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{error}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Email Field */}
              <div className="form-floating mb-3">
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email format',
                    },
                  })}
                  type="text"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  id="floatingEmail"
                  placeholder="name@example.com"
                />
                <label htmlFor="floatingEmail">Email address</label>
                {errors.email && (
                  <div className="invalid-feedback">{errors.email.message}</div>
                )}
              </div>

              {/* Password Field */}
              <div className="form-floating mb-4">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  id="floatingPassword"
                  placeholder="Password"
                />
                <label htmlFor="floatingPassword">Password</label>
                {errors.password && (
                  <div className="invalid-feedback">{errors.password.message}</div>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="rememberMe" />
                  <label className="form-check-label text-muted" htmlFor="rememberMe">
                    Remember me
                  </label>
                </div>
                <Link href="/forgot-password" className="text-decoration-none text-primary fw-medium" style={{ fontSize: '0.9rem' }}>
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-100 py-3 rounded-3 fw-bold mb-4 shadow-sm d-flex align-items-center justify-content-center"
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    <span role="status">Signing in...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="position-relative text-center mb-4">
              <hr className="text-muted" />
              <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                or
              </span>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <span className="text-muted">Don't have an account? </span>
              <Link href="/register" className="text-decoration-none text-success fw-bold">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
