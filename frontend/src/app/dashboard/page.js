'use client';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';
import Navbar from '../../components/Navbar';
import AdminDashboard from '../../components/AdminDashboard';
import UserDashboard from '../../components/UserDashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="d-flex min-vh-100 align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-light min-vh-100">
      <Navbar />
      {user?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
}
