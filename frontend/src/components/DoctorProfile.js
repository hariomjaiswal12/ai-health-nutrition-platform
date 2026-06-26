// ==================== DOCTOR PROFILE COMPONENT ====================
// File: frontend/src/components/DoctorProfile.js
// Purpose: Doctor updates their professional profile (Modification 3)
// Features: Edit specialization, experience, contact info, availability

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './DoctorProfile.css';

function DoctorProfile() {
  // ==================== STATE MANAGEMENT ====================
  const navigate = useNavigate();
  const { isLoggedIn, role, doctorInfo } = useAuth();

  const [formData, setFormData] = useState({
    specialization: '',
    experience: 0,
    qualifications: '',
    languages: '',
    consultationFee: 0,
    contactPhone: '',
    whatsappNumber: '',
    availability: '',
    bio: '',
    profileImage: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // ==================== LIFECYCLE ====================
  useEffect(() => {
    // Redirect if not logged in
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // Redirect if not a doctor
    if (role !== 'doctor') {
      navigate('/dashboard');
      return;
    }

    // Load doctor info if available
    if (doctorInfo) {
      setFormData({
        specialization: doctorInfo.specialization || '',
        experience: doctorInfo.experience || 0,
        qualifications: doctorInfo.qualifications || '',
        languages: Array.isArray(doctorInfo.languages)
          ? doctorInfo.languages.join(', ')
          : doctorInfo.languages || '',
        consultationFee: doctorInfo.consultationFee || 0,
        contactPhone: doctorInfo.contactPhone || '',
        whatsappNumber: doctorInfo.whatsappNumber || '',
        availability: doctorInfo.availability || '',
        bio: doctorInfo.bio || '',
        profileImage: doctorInfo.profileImage || ''
      });
    }
  }, [isLoggedIn, role, navigate, doctorInfo]);

  // ==================== EVENT HANDLERS ====================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience' || name === 'consultationFee'
        ? Number(value)
        : value
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
      if (!formData.specialization || !formData.qualifications || !formData.contactPhone) {
        setError('Please fill in all required fields (Specialization, Qualifications, Contact Phone)');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Prepare data
      const updateData = {
        ...formData,
        languages: formData.languages
          .split(',')
          .map(lang => lang.trim())
          .filter(lang => lang.length > 0)
      };

      // API Call
      const response = await fetch('http://localhost:5000/api/doctors/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      setSuccess('✅ Profile updated successfully!');
      setIsEditing(false);

      // Update localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...user, ...data.doctor };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('❌ Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    // Reset form to current values
    if (doctorInfo) {
      setFormData({
        specialization: doctorInfo.specialization || '',
        experience: doctorInfo.experience || 0,
        qualifications: doctorInfo.qualifications || '',
        languages: Array.isArray(doctorInfo.languages)
          ? doctorInfo.languages.join(', ')
          : doctorInfo.languages || '',
        consultationFee: doctorInfo.consultationFee || 0,
        contactPhone: doctorInfo.contactPhone || '',
        whatsappNumber: doctorInfo.whatsappNumber || '',
        availability: doctorInfo.availability || '',
        bio: doctorInfo.bio || '',
        profileImage: doctorInfo.profileImage || ''
      });
    }
  };

  // ==================== ACCESS CONTROL ====================
  if (!isLoggedIn || role !== 'doctor') {
    return (
      <div className="doctor-profile-container">
        <div className="error">Access Denied. Only doctors can access this page.</div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="doctor-profile-container">
      {/* Header */}
      <div className="profile-header">
        <h1>👨‍⚕️ My Doctor Profile</h1>
        <p className="subtitle">Update your professional information and availability</p>
      </div>

      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="doctor-profile-form">
        <div className="form-section">
          <h2>Professional Information</h2>

          {/* Row 1 */}
          <div className="form-row">
            <div className="form-group">
              <label>
                Specialization <span className="required">*</span>
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g., Panchakarma, Nutrition, Rejuvenation"
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Years of Experience <span className="required">*</span>
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                min="0"
                max="100"
                disabled={!isEditing}
                required
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="form-group">
            <label>
              Qualifications <span className="required">*</span>
            </label>
            <input
              type="text"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              placeholder="e.g., BAMS, MD (Ayurveda)"
              disabled={!isEditing}
              required
            />
          </div>

          {/* Row 3 */}
          <div className="form-group">
            <label>Languages (comma-separated)</label>
            <input
              type="text"
              name="languages"
              value={formData.languages}
              onChange={handleChange}
              placeholder="e.g., English, Hindi, Sanskrit"
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Contact Section */}
        <div className="form-section">
          <h2>Contact Information</h2>

          {/* Row 1 */}
          <div className="form-row">
            <div className="form-group">
              <label>
                Contact Phone <span className="required">*</span>
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="+91 1234567890"
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label>WhatsApp Number</label>
              <input
                type="tel"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="+91 1234567890"
                disabled={!isEditing}
              />
              <small>Include country code</small>
            </div>
          </div>

          {/* Row 2 */}
          <div className="form-row">
            <div className="form-group">
              <label>Consultation Fee (₹)</label>
              <input
                type="number"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleChange}
                min="0"
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label>Availability</label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                placeholder="e.g., Mon-Fri 9AM-5PM, Sat 10AM-2PM"
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* Additional Section */}
        <div className="form-section">
          <h2>Additional Information</h2>

          <div className="form-group">
            <label>Bio / About You</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Tell patients about your expertise, approach, and specializations..."
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Profile Image URL</label>
            <input
              type="url"
              name="profileImage"
              value={formData.profileImage}
              onChange={handleChange}
              placeholder="https://example.com/your-image.jpg"
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          {!isEditing ? (
            <button
              type="button"
              className="btn-edit"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Edit Profile
            </button>
          ) : (
            <>
              <button
                type="submit"
                className="btn-save"
                disabled={loading}
              >
                {loading ? '💾 Saving...' : '💾 Save Profile'}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                ❌ Cancel
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default DoctorProfile;
