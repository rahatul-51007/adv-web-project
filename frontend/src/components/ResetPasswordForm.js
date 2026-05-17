'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      setValidatingToken(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/validate-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Invalid or expired token');
      }

      setTokenValid(true);
    } catch (err) {
      setError(err.message || 'Invalid or expired reset link');
    } finally {
      setValidatingToken(false);
    }
  };

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to reset password');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
        <div className="container" style={{ maxWidth: '450px' }}>
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-body p-5 text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h4>Validating reset link...</h4>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
        <div className="container" style={{ maxWidth: '450px' }}>
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="bg-danger text-white text-center py-5 px-4">
              <i className="bi bi-exclamation-triangle-fill mb-3" style={{ fontSize: '3rem' }}></i>
              <h2 className="fw-bold mb-1">Invalid Link</h2>
              <p className="text-white-50 mb-0">This password reset link is invalid or has expired</p>
            </div>

            <div className="card-body p-5 text-center">
              {error && (
                <div className="alert alert-danger d-flex align-items-center py-2 px-3 mb-4 rounded-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}

              <p className="text-muted mb-4">
                Please request a new password reset link to continue.
              </p>

              <div className="d-grid gap-2">
                <Link href="/forgot-password" className="btn btn-primary">
                  <i className="bi bi-key-fill me-2"></i>
                  Request New Reset Link
                </Link>
                <Link href="/login" className="btn btn-outline-secondary">
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

  if (success) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
        <div className="container" style={{ maxWidth: '450px' }}>
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="bg-success text-white text-center py-5 px-4">
              <i className="bi bi-check-circle-fill mb-3" style={{ fontSize: '3rem' }}></i>
              <h2 className="fw-bold mb-1">Password Reset!</h2>
              <p className="text-white-50 mb-0">Your password has been successfully reset</p>
            </div>

            <div className="card-body p-5 text-center">
              <p className="text-muted mb-4">
                You can now sign in with your new password.
              </p>

              <Link href="/login" className="btn btn-primary btn-lg">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Sign In Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
      <div className="container" style={{ maxWidth: '450px' }}>
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
          <div className="bg-info text-white text-center py-5 px-4">
            <i className="bi bi-shield-lock-fill mb-3" style={{ fontSize: '3rem' }}></i>
            <h2 className="fw-bold mb-1">Reset Password</h2>
            <p className="text-white-50 mb-0">Enter your new password</p>
          </div>

          <div className="card-body p-4 p-sm-5 bg-white">
            {error && (
              <div className="alert alert-danger d-flex align-items-center py-2 px-3 mb-4 rounded-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-floating mb-3">
                <input
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type="password"
                  className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                  id="floatingNewPassword"
                  placeholder="New Password"
                />
                <label htmlFor="floatingNewPassword">New Password</label>
                {errors.newPassword && (
                  <div className="invalid-feedback">{errors.newPassword.message}</div>
                )}
              </div>

              <div className="form-floating mb-4">
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                  })}
                  type="password"
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  id="floatingConfirmPassword"
                  placeholder="Confirm Password"
                />
                <label htmlFor="floatingConfirmPassword">Confirm Password</label>
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword.message}</div>
                )}
              </div>

              <div className="alert alert-info d-flex align-items-center py-2 px-3 mb-4 rounded-3" role="alert">
                <i className="bi bi-info-circle-fill me-2"></i>
                <div className="small">
                  Password must be at least 6 characters long.
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-info w-100 py-3 rounded-3 fw-bold mb-4 shadow-sm d-flex align-items-center justify-content-center text-white"
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    <span role="status">Resetting...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-lock-fill me-2"></i>
                    Reset Password
                  </>
                )}
              </button>
            </form>
            
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
