// src/components/AddPatient.js
import React, { useEffect, useState } from 'react';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';

function AddPatient() {
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
      setError('Error fetching patients');
    }
    setLoading(false);
  };

  // Add new patient
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (role !== 'doctor' && role !== 'admin') {
      setMessage('You do not have permission to add patients.');
      return;
    }
    
    try {
      const response = await apiClient('http://localhost:5000/add-patient', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMessage('Patient added successfully!');
      setForm({
        name: '',
        age: '',
        gender: '',
        phone: '',
        diagnosis: ''
      });
      fetchPatients(); // Refresh patient list
    } catch (err) {
      setMessage('Error adding patient');
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
      const response = await apiClient(`http://localhost:5000/patients/${patientId}`, {
        method: 'PUT',
        body: JSON.stringify(editFormData),
      });
      
      setMessage('Patient updated successfully!');
      setEditingPatient(null);
      setEditFormData({});
      fetchPatients(); // Refresh patient list
    } catch (err) {
      setMessage('Error updating patient');
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
      setMessage('Patient deleted successfully');
      fetchPatients(); // Refresh patient list
    } catch (err) {
      setMessage('Error deleting patient');
    }
  };

  if (!role) return <p>Loading user info...</p>;
  if (loading) return <p>Loading patients...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Patient Management</h2>
      
      {/* Add New Patient Form */}
      {(role === 'doctor' || role === 'admin') && (
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
          <h3>Add New Patient</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <input 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                placeholder="Full Name" 
                required 
                style={{ padding: '8px', marginRight: '10px', width: '200px' }}
              />
              <input 
                value={form.age} 
                onChange={(e) => setForm({ ...form, age: e.target.value })} 
                placeholder="Age" 
                type="number" 
                required 
                style={{ padding: '8px', marginRight: '10px', width: '100px' }}
              />
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <select 
                value={form.gender} 
                onChange={(e) => setForm({ ...form, gender: e.target.value })} 
                required 
                style={{ padding: '8px', marginRight: '10px', width: '120px' }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              
              <input 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                placeholder="Phone Number" 
                required 
                style={{ padding: '8px', marginRight: '10px', width: '200px' }}
              />
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <textarea 
                value={form.diagnosis} 
                onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} 
                placeholder="Diagnosis / Health Condition" 
                required 
                style={{ padding: '8px', width: '400px', height: '60px' }}
              />
            </div>
            
            <button 
              type="submit" 
              style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              Add Patient
            </button>
          </form>
          
          {message && (
            <p style={{ marginTop: '10px', color: message.includes('Error') ? 'red' : 'green' }}>
              {message}
            </p>
          )}
        </div>
      )}
      
      {/* Patient List with Edit Functionality */}
      <h3>Patient List ({patients.length})</h3>
      {patients.length === 0 ? (
        <p>No patients added yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {patients.map((patient) => (
            <div 
              key={patient._id} 
              style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                borderRadius: '5px', 
                backgroundColor: '#f9f9f9' 
              }}
            >
              {editingPatient === patient._id ? (
                // EDIT MODE
                <div>
                  <h4 style={{ color: '#007bff', marginBottom: '15px' }}>✏️ Editing: {patient.name}</h4>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                      Name:
                    </label>
                    <input 
                      value={editFormData.name} 
                      onChange={(e) => handleEditChange('name', e.target.value)} 
                      style={{ padding: '8px', width: '100%', maxWidth: '400px' }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                      Age:
                    </label>
                    <input 
                      value={editFormData.age} 
                      onChange={(e) => handleEditChange('age', e.target.value)} 
                      type="number"
                      style={{ padding: '8px', width: '100%', maxWidth: '100px' }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                      Gender:
                    </label>
                    <select 
                      value={editFormData.gender} 
                      onChange={(e) => handleEditChange('gender', e.target.value)} 
                      style={{ padding: '8px', width: '100%', maxWidth: '150px' }}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                      Phone:
                    </label>
                    <input 
                      value={editFormData.phone} 
                      onChange={(e) => handleEditChange('phone', e.target.value)} 
                      style={{ padding: '8px', width: '100%', maxWidth: '200px' }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                      Diagnosis:
                    </label>
                    <textarea 
                      value={editFormData.diagnosis} 
                      onChange={(e) => handleEditChange('diagnosis', e.target.value)} 
                      style={{ padding: '8px', width: '100%', maxWidth: '400px', height: '60px' }}
                    />
                  </div>
                  
                  <div style={{ marginTop: '15px' }}>
                    <button 
                      onClick={() => handleUpdate(patient._id)} 
                      style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '3px',
                        marginRight: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      💾 Save Changes
                    </button>
                    <button 
                      onClick={handleCancelEdit} 
                      style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#6c757d', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <div>
                  <h4>{patient.name} (ID: {patient._id})</h4>
                  <p><strong>Age:</strong> {patient.age} | <strong>Gender:</strong> {patient.gender}</p>
                  <p><strong>Phone:</strong> {patient.phone}</p>
                  <p><strong>Diagnosis:</strong> {patient.diagnosis}</p>
                  
                  {(role === 'doctor' || role === 'admin') && (
                    <div style={{ marginTop: '10px' }}>
                      <button 
                        onClick={() => handleEdit(patient)} 
                        style={{ 
                          padding: '5px 15px', 
                          backgroundColor: '#007bff', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '3px',
                          marginRight: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(patient._id)} 
                        style={{ 
                          padding: '5px 15px', 
                          backgroundColor: '#dc3545', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AddPatient;
