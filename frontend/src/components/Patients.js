import React, { useEffect, useState } from 'react';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';

function Patients() {
  const { role } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state for adding new patient
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    diagnosis: ''
  });
  
  // Edit state
  const [editingPatient, setEditingPatient] = useState(null); // Stores ID of patient being edited
  const [editFormData, setEditFormData] = useState({}); // Stores edit form values
  const [message, setMessage] = useState('');

  // Fetch all patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient('http://localhost:5000/patients');
      setPatients(data);
    } catch (err) {
      setError('Error fetching patients. Make sure the server is online.');
    }
    setLoading(false);
  };

  // Add new patient
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (role !== 'doctor' && role !== 'admin') {
      setMessage('❌ You do not have permission to add patients.');
      return;
    }
    
    try {
      await apiClient('http://localhost:5000/add-patient', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMessage('✅ Patient added successfully!');
      setForm({
        name: '',
        age: '',
        gender: '',
        phone: '',
        diagnosis: ''
      });
      fetchPatients(); // Refresh patient list
    } catch (err) {
      setMessage('❌ Error adding patient: ' + (err.message || 'Unknown error'));
    }
  };

  // Initialize edit mode
  const handleEdit = (patient) => {
    setEditingPatient(patient._id);
    setEditFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      diagnosis: patient.diagnosis
    });
    setMessage('');
  };

  // Handle changes in edit form
  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submit update
  const handleUpdate = async (patientId) => {
    try {
      await apiClient(`http://localhost:5000/patients/${patientId}`, {
        method: 'PUT',
        body: JSON.stringify(editFormData),
      });
      
      setMessage('✅ Patient updated successfully!');
      setEditingPatient(null);
      setEditFormData({});
      fetchPatients(); // Refresh patient list
    } catch (err) {
      setMessage('❌ Error updating patient');
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingPatient(null);
    setEditFormData({});
    setMessage('');
  };

  // Delete patient
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    
    if (role !== 'doctor' && role !== 'admin') {
      alert('You do not have permission to delete patients.');
      return;
    }
    
    try {
      await apiClient(`http://localhost:5000/patients/${id}`, { method: 'DELETE' });
      setMessage('✅ Patient deleted successfully');
      fetchPatients(); // Refresh patient list
    } catch (err) {
      setMessage('❌ Error deleting patient');
    }
  };

  // Generate and Download PDF Report
  const handlePatientReportPDF = async (patientId) => {
    try {
      setMessage('📄 Generating PDF report...');
      const response = await fetch(`http://localhost:5000/api/patients/${patientId}/report/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `patient-report-${patientId}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage('✅ PDF downloaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Error downloading patient report');
      console.error(err);
    }
  };

  if (!role) return <div className="container"><p className="text-center">Loading user info...</p></div>;
  if (loading && patients.length === 0) return <div className="container"><p className="text-center">Loading patients...</p></div>;

  return (
    <div className="container" style={{ animation: 'fadeInDown 0.6s ease-out' }}>
      <div className="section-header">
        <h2>👥 Patient Management</h2>
        <p className="subtitle">Manage patient diagnoses, wellness records, and download comprehensive PDF summaries.</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('❌') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}
      
      {/* Add New Patient Form */}
      {(role === 'doctor' || role === 'admin') && !editingPatient && (
        <div className="form-container mb-4">
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary-color)' }}>➕ Add New Patient</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  placeholder="Enter full name" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Age *</label>
                <input 
                  value={form.age} 
                  onChange={(e) => setForm({ ...form, age: e.target.value })} 
                  placeholder="Enter age" 
                  type="number" 
                  required 
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Gender *</label>
                <select 
                  value={form.gender} 
                  onChange={(e) => setForm({ ...form, gender: e.target.value })} 
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Phone Number *</label>
                <input 
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                  placeholder="Phone number" 
                  required 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Diagnosis & Health Condition *</label>
              <textarea 
                value={form.diagnosis} 
                onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} 
                placeholder="Describe current symptoms, health conditions, or Ayurvedic imbalances..." 
                required
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-success">
                Add Patient
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Patient List with Edit Functionality */}
      <div className="section-header" style={{ marginTop: '2rem' }}>
        <h3>Patient Registry ({patients.length})</h3>
      </div>
      
      {error && <div className="alert alert-error">{error}</div>}

      {patients.length === 0 ? (
        <p className="text-center" style={{ color: '#999', padding: '40px' }}>
          No patients registered yet. Use the form above to add one.
        </p>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
          {patients.map((patient) => (
            <div key={patient._id} className="card" style={{ borderLeft: '5px solid var(--primary-color)' }}>
              {editingPatient === patient._id ? (
                // EDIT MODE
                <div style={{ animation: 'slideDown 0.3s ease-out' }}>
                  <h4 style={{ color: 'var(--primary-color)', margin: '0 0 1.5rem 0' }}>✏️ Editing: {patient.name}</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input 
                        value={editFormData.name} 
                        onChange={(e) => handleEditChange('name', e.target.value)} 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Age</label>
                      <input 
                        value={editFormData.age} 
                        onChange={(e) => handleEditChange('age', e.target.value)} 
                        type="number"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Gender</label>
                      <select 
                        value={editFormData.gender} 
                        onChange={(e) => handleEditChange('gender', e.target.value)} 
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Phone</label>
                      <input 
                        value={editFormData.phone} 
                        onChange={(e) => handleEditChange('phone', e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Diagnosis</label>
                    <textarea 
                      value={editFormData.diagnosis} 
                      onChange={(e) => handleEditChange('diagnosis', e.target.value)} 
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button 
                      onClick={() => handleUpdate(patient._id)} 
                      className="btn btn-success"
                    >
                      💾 Save Changes
                    </button>
                    <button 
                      onClick={handleCancelEdit} 
                      className="btn btn-outline"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '1.4rem' }}>{patient.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: '#999', background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>
                      ID: {patient._id}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    <strong>Age:</strong> {patient.age} | <strong>Gender:</strong> {patient.gender} | <strong>Phone:</strong> {patient.phone}
                  </p>
                  
                  <div style={{ background: '#f9f9f9', padding: '12px 16px', borderRadius: '8px', border: '1px dashed #e0e0e0', margin: '1rem 0' }}>
                    <strong style={{ color: '#555', display: 'block', marginBottom: '4px' }}>Diagnosis & Ayurvedic Imbalance:</strong>
                    <p style={{ margin: 0, color: '#666', whiteSpace: 'pre-line' }}>{patient.diagnosis}</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <button
                      onClick={() => handlePatientReportPDF(patient._id)}
                      className="btn btn-secondary"
                      style={{ backgroundColor: '#7B1FA2' }}
                    >
                      📋 Download Report PDF
                    </button>
                    
                    {(role === 'doctor' || role === 'admin') && (
                      <>
                        <button 
                          onClick={() => handleEdit(patient)} 
                          className="btn btn-outline"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(patient._id)} 
                          className="btn btn-danger"
                        >
                          🗑️ Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Patients;
