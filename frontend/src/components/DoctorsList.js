// ==================== DOCTORS LIST COMPONENT ====================
// File: frontend/src/components/DoctorsList.js
// Purpose: Display all available doctors (Modification 3)
// Features: View doctors, search, filter, book appointment

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './DoctorsList.css';

function DoctorsList() {
  // ==================== STATE MANAGEMENT ====================
  const navigate = useNavigate();
  const { isLoggedIn, role, user, isLoading } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchSpecialization, setSearchSpecialization] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  console.log('DoctorsList auth state:', { isLoggedIn, role, user, isLoading });

  // ==================== LIFECYCLE ====================
  useEffect(() => {
    // Wait until auth hook has initialized
    if (isLoading) return;

    // If still not logged in after initialization, go to login
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isLoading, navigate]);

  // Filter doctors when search changes
  useEffect(() => {
    if (searchSpecialization.trim() === '') {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter((doctor) =>
        (doctor.specialization || '')
          .toLowerCase()
          .includes(searchSpecialization.toLowerCase())
      );
      setFilteredDoctors(filtered);
    }
  }, [searchSpecialization, doctors]);

  // ==================== API CALLS ====================
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/doctors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setDoctors(data.doctors || []);
      setFilteredDoctors(data.doctors || []);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching doctors:', err);
      setError(err.message || 'Failed to fetch doctors');
      setLoading(false);
    }
  };

  // ==================== EVENT HANDLERS ====================
  const handleBookAppointment = (doctor) => {
    navigate('/book-appointment', { state: { doctor } });
  };

  const handleWhatsApp = (number) => {
    if (!number) {
      alert('WhatsApp number not available');
      return;
    }
    window.open(`https://wa.me/${number}`, '_blank');
  };

  const handleCall = (number) => {
    if (!number) {
      alert('Phone number not available');
      return;
    }
    window.location.href = `tel:${number}`;
  };

  const handleRefresh = () => {
    fetchDoctors();
  };

  // ==================== RENDER STATES ====================
  // While auth is initializing, just show a loading state
  if (isLoading) {
    return (
      <div className="doctors-list-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Checking login status...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="doctors-list-container">
        <div className="error">Please login to view doctors</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="doctors-list-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctors-list-container">
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={handleRefresh} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="doctors-list-container">
      {/* Header Section */}
      <div className="doctors-header">
        <h1>👨‍⚕️ Our Ayurvedic Doctors</h1>
        <p className="subtitle">
          Find and book appointments with our expert practitioners
        </p>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by specialization (e.g., Panchakarma, Nutrition)..."
            value={searchSpecialization}
            onChange={(e) => setSearchSpecialization(e.target.value)}
            className="search-input"
          />
          {searchSpecialization && (
            <button
              className="clear-btn"
              onClick={() => setSearchSpecialization('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <button onClick={handleRefresh} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <p>
          Showing <strong>{filteredDoctors.length}</strong> doctor(s)
          {searchSpecialization &&
            ` with specialization "${searchSpecialization}"`}
        </p>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length > 0 ? (
        <div className="doctors-grid">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="doctor-card">
              {/* Doctor Image */}
              <div className="doctor-image">
                {doctor.profileImage ? (
                  <img src={doctor.profileImage} alt={doctor.username} />
                ) : (
                  <div className="default-avatar">
                    {doctor.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Doctor Information */}
              <div className="doctor-info">
                <h3 className="doctor-name">Dr. {doctor.username}</h3>

                {doctor.specialization && (
                  <p className="specialization">
                    <strong>🎯 Specialization:</strong> {doctor.specialization}
                  </p>
                )}

                {doctor.experience > 0 && (
                  <p className="experience">
                    <strong>📅 Experience:</strong> {doctor.experience} year(s)
                  </p>
                )}

                {doctor.qualifications && (
                  <p className="qualifications">
                    <strong>🎓 Qualifications:</strong> {doctor.qualifications}
                  </p>
                )}

                {doctor.languages && doctor.languages.length > 0 && (
                  <p className="languages">
                    <strong>🗣️ Languages:</strong>{' '}
                    {doctor.languages.join(', ')}
                  </p>
                )}

                {doctor.consultationFee > 0 && (
                  <p className="fee">
                    <strong>💰 Consultation Fee:</strong> ₹
                    {doctor.consultationFee}
                  </p>
                )}

                {doctor.availability && (
                  <p className="availability">
                    <strong>⏰ Available:</strong> {doctor.availability}
                  </p>
                )}

                {doctor.bio && <p className="bio">{doctor.bio}</p>}
              </div>

              {/* Action Buttons */}
              <div className="doctor-actions">
                <button
                  className="btn-primary"
                  onClick={() => handleBookAppointment(doctor)}
                >
                  📅 Book Appointment
                </button>

                <div className="contact-buttons">
                  {doctor.whatsappNumber && (
                    <button
                      className="btn-whatsapp"
                      onClick={() => handleWhatsApp(doctor.whatsappNumber)}
                      title="Chat on WhatsApp"
                    >
                      💬 WhatsApp
                    </button>
                  )}

                  {doctor.contactPhone && (
                    <button
                      className="btn-call"
                      onClick={() => handleCall(doctor.contactPhone)}
                      title="Call doctor"
                    >
                      📞 Call
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <p>😔 No doctors found</p>
          {searchSpecialization && (
            <button
              className="btn-clear-search"
              onClick={() => setSearchSpecialization('')}
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default DoctorsList;
