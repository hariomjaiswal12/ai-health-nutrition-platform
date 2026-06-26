// ==================== BOOK APPOINTMENT COMPONENT ====================
// File: frontend/src/components/BookAppointment.js
// Purpose: Patient books appointment with doctor (Modification 3)
// Features: Select date/time, choose contact method, add reason

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './BookAppointment.css';

function BookAppointment() {
  // ==================== STATE & CONTEXT ====================
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, role } = useAuth();

  const doctor = location.state?.doctor;

  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    contactMethod: 'chat'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ==================== VALIDATION & ACCESS ====================
  if (!isLoggedIn) {
    return (
      <div className="book-appointment-container">
        <div className="error">Please login to book an appointment</div>
      </div>
    );
  }

  if (role !== 'patient') {
    return (
      <div className="book-appointment-container">
        <div className="error">Only patients can book appointments</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="book-appointment-container">
        <div className="error-container">
          <p className="error">Doctor information not found</p>
          <button onClick={() => navigate('/doctors')} className="btn-back">
            ← Back to Doctors
          </button>
        </div>
      </div>
    );
  }

  // ==================== EVENT HANDLERS ====================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!formData.appointmentDate || !formData.appointmentTime) {
        setError('Please select both date and time');
        setLoading(false);
        return;
      }

      // Check if date/time is in future
      const appointmentDateTime = new Date(
        `${formData.appointmentDate}T${formData.appointmentTime}`
      );
      if (appointmentDateTime < new Date()) {
        setError('Please select a future date and time');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // API Call
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: doctor._id,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          reason: formData.reason,
          contactMethod: formData.contactMethod
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to book appointment');
      }

      const data = await response.json();
      setSuccess('✅ Appointment booked successfully!');

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/appointments');
      }, 2000);
    } catch (err) {
      console.error('❌ Error booking appointment:', err);
      setError(err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  // ==================== MAIN RENDER ====================
  return (
    <div className="book-appointment-container">
      {/* Header */}
      <div className="appointment-header">
        <h1>📅 Book Appointment</h1>
        <p className="subtitle">Schedule a consultation with your doctor</p>
      </div>

      {/* Doctor Summary Card */}
      <div className="doctor-summary">
        <h3>Dr. {doctor.username}</h3>
        {doctor.specialization && (
          <p className="specialization">{doctor.specialization}</p>
        )}
        {doctor.consultationFee > 0 && (
          <p className="fee">Consultation Fee: ₹{doctor.consultationFee}</p>
        )}
        {doctor.availability && (
          <p className="availability">Available: {doctor.availability}</p>
        )}
      </div>

      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="appointment-form">
        {/* Date & Time Row */}
        <div className="form-row">
          <div className="form-group">
            <label>
              Appointment Date <span className="required">*</span>
            </label>
            <input
              type="date"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Appointment Time <span className="required">*</span>
            </label>
            <input
              type="time"
              name="appointmentTime"
              value={formData.appointmentTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Contact Method */}
        <div className="form-group">
          <label>
            Preferred Contact Method <span className="required">*</span>
          </label>
          <select
            name="contactMethod"
            value={formData.contactMethod}
            onChange={handleChange}
            required
          >
            <option value="chat">💬 Chat</option>
            <option value="whatsapp">📱 WhatsApp</option>
            <option value="call">📞 Phone Call</option>
            <option value="in-person">🏥 In-Person</option>
          </select>
        </div>

        {/* Reason */}
        <div className="form-group">
          <label>Reason for Consultation</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows="4"
            placeholder="Describe your symptoms, health concerns, or reason for consultation..."
          />
        </div>

        {/* Buttons */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? '⏳ Booking...' : '✅ Book Appointment'}
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/doctors')}
            disabled={loading}
          >
            ← Back to Doctors
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookAppointment;
