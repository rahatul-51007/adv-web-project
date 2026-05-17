'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:5000/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send reset email');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
      <div className="container" style={{ maxWidth: '450px' }}>
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
          {/* Header Section */}
          <div className="bg-warning text-white text-center py-5 px-4">
            <i className="bi bi-key-fill mb-3" style={{ fontSize: '3rem' }}></i>
            <h2 className="fw-bold mb-1">Forgot Password?</h2>
            <p className="text-white-50 mb-0">Enter your email to reset your password</p>
          </div>

          <div className="card-body p-4 p-sm-5 bg-white">
            {error && (
              <div className="alert alert-danger d-flex align-items-center py-2 px-3 mb-4 rounded-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{error}</div>
              </div>
            )}

            {success && (
              <div className="alert alert-success d-flex align-items-center py-2 px-3 mb-4 rounded-3" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                <div>
                  If an account with that email exists, a password reset link has been sent to your email.
                </div>
              </div>
            )}

            {!success ? (
              <>
                <div className="alert alert-info d-flex align-items-center py-2 px-3 mb-4 rounded-3" role="alert">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  <div>
                    Enter your email address and we'll send you a link to reset your password.
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="form-floating mb-4">
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email format',
                        },
                      })}
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="floatingEmail"
                      placeholder="name@example.com"
                    />
                    <label htmlFor="floatingEmail">Email address</label>
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email.message}</div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-warning w-100 py-3 rounded-3 fw-bold mb-4 shadow-sm d-flex align-items-center justify-content-center text-white"
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                        <span role="status">Sending...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send-fill me-2"></i>
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <i className="bi bi-envelope-check-fill text-success" style={{ fontSize: '4rem' }}></i>
                <h4 className="mt-3 mb-3">Check Your Email</h4>
                <p className="text-muted mb-4">
                  We've sent a password reset link to your email address. 
                  Please check your inbox and follow the instructions.
                </p>
                <p className="text-muted small mb-4">
                  Didn't receive the email? Check your spam folder or try again later.
                </p>
              </div>
            )}

            {/* Back to Login */}
            <div className="text-center">
              <Link href="/login" className="text-decoration-none text-primary fw-bold">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
