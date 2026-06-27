// ==================== APPOINTMENTS LIST COMPONENT ====================
// File: frontend/src/components/AppointmentsList.js
// Purpose: View and manage appointments (Modification 3)
// Features: List, filter, update status, cancel appointments

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AppointmentsList.css';

function AppointmentsList() {
  // ==================== STATE MANAGEMENT ====================
  const navigate = useNavigate();
  const { isLoggedIn, role, user, isLoading } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  console.log('AppointmentsList auth state:', { isLoggedIn, role, user, isLoading });

  // ==================== LIFECYCLE ====================
  useEffect(() => {
    // Wait for auth hook to finish
    if (isLoading) return;

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isLoading, navigate]);

  // ==================== API CALLS ====================
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching appointments:', err);
      setError(err.message || 'Failed to fetch appointments');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this appointment?`)) {
      return;
    }

    try {
      setUpdating(appointmentId);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      // Refresh list
      fetchAppointments();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      setUpdating(appointmentId);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      fetchAppointments();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setUpdating(null);
    }
  };

  // ==================== HELPER FUNCTIONS ====================
  const getFilteredAppointments = () => {
    if (filter === 'all') return appointments;
    return appointments.filter((apt) => apt.status === filter);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-pending';
      case 'confirmed':
        return 'badge-confirmed';
      case 'completed':
        return 'badge-completed';
      case 'cancelled':
        return 'badge-cancelled';
      default:
        return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#C5A880'; // Warm wheat gold
      case 'confirmed':
        return '#5E8267'; // Sage green
      case 'completed':
        return '#8CA893'; // Muted green
      case 'cancelled':
        return '#D07A60'; // Terracotta spice
      default:
        return '#c2c0a5';
    }
  };

  // ==================== RENDER STATES ====================
  if (isLoading) {
    return (
      <div className="appointments-list-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Checking login status...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="appointments-list-container">
        <div className="error-message">
          <p>Please login to view appointments</p>
          <button onClick={() => navigate('/login')} className="btn-retry">
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="appointments-list-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointments-list-container">
        <div className="error-message">
          <p>Unable to retrieve appointments: {error}</p>
          <button onClick={fetchAppointments} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredAppointments = getFilteredAppointments();
  const title =
    role === 'doctor'
      ? 'Patient Appointments'
      : role === 'admin'
      ? 'All Appointments'
      : 'My Appointments';

  // ==================== MAIN RENDER ====================
  return (
    <div className="appointments-list-container">
      {/* Header */}
      <div className="appointments-header">
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Scheduler</span>
        <h1>{title}</h1>
        <p className="subtitle">Manage your appointments and consultations</p>
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(
          (status) => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="count">
                {
                  appointments.filter(
                    (a) => status === 'all' || a.status === status
                  ).length
                }
              </span>
            </button>
          )
        )}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length > 0 ? (
        <div className="appointments-grid">
          {filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              {/* Status Badge */}
              <div className="card-header">
                <span
                  className={`status-badge ${getStatusBadgeClass(
                    appointment.status
                  )}`}
                  style={{ backgroundColor: getStatusColor(appointment.status) }}
                >
                  {appointment.status.toUpperCase()}
                </span>
                <span className="appointment-date">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px', verticalAlign: 'middle' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  {formatDate(appointment.appointmentDate)}
                </span>
              </div>

              {/* Card Body */}
              <div className="card-body">
                <p className="time">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '3px' }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <strong>Time:</strong> {appointment.appointmentTime}
                </p>

                {role === 'doctor' || role === 'admin' ? (
                  <p className="patient-name">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '3px' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <strong>Patient:</strong>{' '}
                    {appointment.patientId?.username ||
                      appointment.patientName}
                  </p>
                ) : (
                  <p className="doctor-name">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '3px' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <strong>Doctor:</strong>{' '}
                    {appointment.doctorId?.username ||
                      appointment.doctorName}
                  </p>
                )}

                {appointment.reason && (
                  <p className="reason">
                    <strong>Reason:</strong> {appointment.reason}
                  </p>
                )}

                <p className="contact-method">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '3px' }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  <strong>Contact:</strong> {appointment.contactMethod}
                </p>

                {appointment.notes && (
                  <p className="notes">
                    <strong>Notes:</strong> {appointment.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="card-actions">
                {(role === 'doctor' || role === 'admin') &&
                  appointment.status === 'pending' && (
                    <>
                      <button
                        className="btn-confirm"
                        onClick={() =>
                          handleStatusUpdate(appointment._id, 'confirmed')
                        }
                        disabled={updating === appointment._id}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Confirm
                      </button>
                      <button
                        className="btn-cancel-action"
                        onClick={() =>
                          handleStatusUpdate(appointment._id, 'cancelled')
                        }
                        disabled={updating === appointment._id}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        Cancel
                      </button>
                    </>
                  )}

                {(role === 'doctor' || role === 'admin') &&
                  appointment.status === 'confirmed' && (
                    <button
                      className="btn-complete"
                      onClick={() =>
                        handleStatusUpdate(appointment._id, 'completed')
                      }
                      disabled={updating === appointment._id}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Complete
                    </button>
                  )}

                {role === 'patient' && appointment.status === 'pending' && (
                  <button
                    className="btn-cancel-action"
                    onClick={() =>
                      handleStatusUpdate(appointment._id, 'cancelled')
                    }
                    disabled={updating === appointment._id}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    Cancel
                  </button>
                )}

                <button
                  className="btn-delete"
                  onClick={() => handleDelete(appointment._id)}
                  disabled={updating === appointment._id}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-appointments">
          <p>No appointments found</p>
          {filter !== 'all' && (
            <button
              className="btn-clear-filter"
              onClick={() => setFilter('all')}
            >
              Clear Filter
            </button>
          )}
          {role === 'patient' && (
            <button
              className="btn-book-now"
              onClick={() => navigate('/doctors')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Book an Appointment
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default AppointmentsList;
