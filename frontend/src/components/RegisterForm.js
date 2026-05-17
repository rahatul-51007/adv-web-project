'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      // Registration successful, redirect to login page
      window.location.href = '/login';
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
      <div className="container" style={{ maxWidth: '550px' }}>
        {/* White Card Container */}
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
          {/* Header Section */}
          <div className="bg-success text-white text-center py-4 px-4">
            <i className="bi bi-person-plus-fill mb-2" style={{ fontSize: '2.5rem' }}></i>
            <h2 className="fw-bold mb-1">Create Account</h2>
            <p className="text-white-50 mb-0">Join our library management system</p>
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
              {/* Name Fields */}
              <div className="row g-3 mb-3">
                <div className="col-md-6 form-floating">
                  <input
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'First name must be at least 2 characters',
                      },
                    })}
                    type="text"
                    className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                    id="floatingFirstName"
                    placeholder="First name"
                  />
                  <label htmlFor="floatingFirstName" className="ms-2">First name</label>
                  {errors.firstName && (
                    <div className="invalid-feedback">{errors.firstName.message}</div>
                  )}
                </div>
                <div className="col-md-6 form-floating">
                  <input
                    {...register('lastName', {
                      required: 'Last name is required',
                      minLength: {
                        value: 2,
                        message: 'Last name must be at least 2 characters',
                      },
                    })}
                    type="text"
                    className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                    id="floatingLastName"
                    placeholder="Last name"
                  />
                  <label htmlFor="floatingLastName" className="ms-2">Last name</label>
                  {errors.lastName && (
                    <div className="invalid-feedback">{errors.lastName.message}</div>
                  )}
                </div>
              </div>

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
                  id="floatingRegEmail"
                  placeholder="name@example.com"
                />
                <label htmlFor="floatingRegEmail">Email address</label>
                {errors.email && (
                  <div className="invalid-feedback">{errors.email.message}</div>
                )}
              </div>

              {/* Password Fields */}
              <div className="form-floating mb-3">
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
                  id="floatingRegPassword"
                  placeholder="Password"
                />
                <label htmlFor="floatingRegPassword">New password</label>
                {errors.password && (
                  <div className="invalid-feedback">{errors.password.message}</div>
                )}
              </div>

              <div className="form-floating mb-3">
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                  type="password"
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  id="floatingConfirmPassword"
                  placeholder="Confirm password"
                />
                <label htmlFor="floatingConfirmPassword">Confirm password</label>
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword.message}</div>
                )}
              </div>

              {/* Role Field */}
              <div className="form-floating mb-3">
                <select
                  {...register('role', { required: 'Role is required' })}
                  className={`form-select ${errors.role ? 'is-invalid' : ''}`}
                  id="floatingRole"
                  defaultValue="member"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <label htmlFor="floatingRole">Role</label>
                {errors.role && (
                  <div className="invalid-feedback">{errors.role.message}</div>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="form-check mb-4">
                <input className="form-check-input" type="checkbox" id="termsCheck" required />
                <label className="form-check-label text-muted small" htmlFor="termsCheck">
                  I agree to the{' '}
                  <a href="#" className="text-decoration-none text-success">Terms and Conditions</a>
                  {' '}and{' '}
                  <a href="#" className="text-decoration-none text-success">Privacy Policy</a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-success w-100 py-3 rounded-3 fw-bold mb-4 shadow-sm d-flex align-items-center justify-content-center"
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    <span role="status">Creating Account...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus me-2"></i>
                    Sign Up
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

            {/* Sign In Link */}
            <div className="text-center">
              <span className="text-muted">Already have an account? </span>
              <Link href="/login" className="text-decoration-none text-primary fw-bold">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
