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
        return '#FFA500';
      case 'confirmed':
        return '#2196F3';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#999';
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
        <div className="error">Please login to view appointments</div>
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
          <p>❌ {error}</p>
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
      ? '📅 Patient Appointments'
      : role === 'admin'
      ? '📅 All Appointments'
      : '📅 My Appointments';

  // ==================== MAIN RENDER ====================
  return (
    <div className="appointments-list-container">
      {/* Header */}
      <div className="appointments-header">
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
                  📅 {formatDate(appointment.appointmentDate)}
                </span>
              </div>

              {/* Card Body */}
              <div className="card-body">
                <p className="time">
                  <strong>⏰ Time:</strong> {appointment.appointmentTime}
                </p>

                {role === 'doctor' || role === 'admin' ? (
                  <p className="patient-name">
                    <strong>👤 Patient:</strong>{' '}
                    {appointment.patientId?.username ||
                      appointment.patientName}
                  </p>
                ) : (
                  <p className="doctor-name">
                    <strong>👨‍⚕️ Doctor:</strong>{' '}
                    {appointment.doctorId?.username ||
                      appointment.doctorName}
                  </p>
                )}

                {appointment.reason && (
                  <p className="reason">
                    <strong>📝 Reason:</strong> {appointment.reason}
                  </p>
                )}

                <p className="contact-method">
                  <strong>📞 Contact:</strong> {appointment.contactMethod}
                </p>

                {appointment.notes && (
                  <p className="notes">
                    <strong>📌 Notes:</strong> {appointment.notes}
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
                        ✅ Confirm
                      </button>
                      <button
                        className="btn-cancel-action"
                        onClick={() =>
                          handleStatusUpdate(appointment._id, 'cancelled')
                        }
                        disabled={updating === appointment._id}
                      >
                        ❌ Cancel
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
                      ✔️ Mark Complete
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
                    ❌ Cancel Appointment
                  </button>
                )}

                <button
                  className="btn-delete"
                  onClick={() => handleDelete(appointment._id)}
                  disabled={updating === appointment._id}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-appointments">
          <p>😔 No appointments found</p>
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
              📅 Book an Appointment
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default AppointmentsList;
