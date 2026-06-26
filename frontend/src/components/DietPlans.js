import React, { useEffect, useState } from 'react';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';

function DietPlans() {
  const { role } = useAuth();
  const [dietPlans, setDietPlans] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    mealTime: 'Breakfast',
    foods: '',
    rasa: '',
    doshaBalance: '',
    notes: ''
  });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([
        fetchDietPlans(),
        fetchPatients(),
        fetchDoctors()
      ]);
    } catch (err) {
      setError('Error loading data');
    }
    setLoading(false);
  };

  // Fetch diet plans
  const fetchDietPlans = async () => {
    try {
      const data = await apiClient('http://localhost:5000/api/dietplans');
      setDietPlans(data);
    } catch (err) {
      console.error('Error fetching diet plans:', err);
      throw err;
    }
  };

  // Fetch patients
  const fetchPatients = async () => {
    try {
      const data = await apiClient('http://localhost:5000/patients');
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  // Fetch doctors (users with doctor role)
  const fetchDoctors = async () => {
    try {
      if (role === 'admin') {
        const data = await apiClient('http://localhost:5000/users');
        setDoctors(data.filter(user => user.role === 'doctor' || user.role === 'admin'));
      } else {
        // If not admin, get current user from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          setDoctors([user]);
          setForm(prev => ({ ...prev, doctorId: user.id }));
        }
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  // Add or update diet plan
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    // Validate patient and doctor exist
    if (!form.patientId || !form.doctorId) {
      setMessage('Please select both patient and doctor');
      return;
    }

    const payload = { 
      ...form, 
      foods: form.foods.split(',').map(f => f.trim()).filter(f => f) 
    };

    try {
      if (editId) {
        await apiClient(`http://localhost:5000/api/dietplans/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setMessage('✅ Diet plan updated successfully!');
      } else {
        await apiClient(`http://localhost:5000/api/dietplans`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setMessage('✅ Diet plan added successfully!');
      }
      
      resetForm();
      fetchDietPlans();
    } catch (err) {
      setMessage('❌ Error saving diet plan: ' + (err.message || 'Unknown error'));
    }
  };

  // Reset form
  const resetForm = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    setForm({
      patientId: '',
      doctorId: user?.id || '',
      mealTime: 'Breakfast',
      foods: '',
      rasa: '',
      doshaBalance: '',
      notes: ''
    });
    setEditId(null);
  };

  // Edit diet plan
  const handleEdit = (plan) => {
    setForm({
      patientId: plan.patientId,
      doctorId: plan.doctorId,
      mealTime: plan.mealTime,
      foods: Array.isArray(plan.foods) ? plan.foods.join(', ') : plan.foods,
      rasa: plan.rasa || '',
      doshaBalance: plan.doshaBalance || '',
      notes: plan.notes || ''
    });
    setEditId(plan._id);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Download PDF
  const handleDownloadPDF = async (planId) => {
    try {
      setMessage('📄 Generating PDF...');
      
      const response = await fetch(`http://localhost:5000/api/dietplans/${planId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'PDF generation failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diet-plan-${planId}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setMessage('✅ PDF downloaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Error downloading PDF: ' + err.message);
      console.error('PDF download error:', err);
    }
  };

  // Delete diet plan
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this diet plan?')) return;
    
    try {
      await apiClient(`http://localhost:5000/api/dietplans/${id}`, { method: 'DELETE' });
      setMessage('✅ Diet plan deleted successfully');
      fetchDietPlans();
    } catch (err) {
      setMessage('❌ Error deleting diet plan');
    }
  };

  // Get patient name by ID
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p._id === patientId);
    return patient ? patient.name : patientId;
  };

  // Get doctor name by ID
  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d._id === doctorId || d.id === doctorId);
    return doctor ? `Dr. ${doctor.username}` : doctorId;
  };

  if (!role) return <p className="text-center">Loading user info...</p>;
  if (loading) return <p className="text-center">Loading diet plans...</p>;
  if (error) return <p className="text-center" style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="container">
      <h2 className="mb-2">📋 Diet Plans Management</h2>
      
      {(role === 'doctor' || role === 'admin') && (
        <div className="card mb-3" style={{ backgroundColor: '#f9f9f9' }}>
          <h3 style={{ color: '#2C5F2D' }}>{editId ? '✏️ Edit Diet Plan' : '➕ Add New Diet Plan'}</h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
              
              <div className="form-group">
                <label>Patient *</label>
                <select 
                  value={form.patientId} 
                  onChange={e => setForm({ ...form, patientId: e.target.value })}
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} (Age: {patient.age})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Doctor *</label>
                <select 
                  value={form.doctorId} 
                  onChange={e => setForm({ ...form, doctorId: e.target.value })}
                  required 
                  disabled={role === 'doctor' && doctors.length === 1}
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id || doctor.id} value={doctor._id || doctor.id}>
                      Dr. {doctor.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Meal Time *</label>
                <select 
                  value={form.mealTime} 
                  onChange={e => setForm({ ...form, mealTime: e.target.value })}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Mid-Morning Snack">Mid-Morning Snack</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Evening Snack">Evening Snack</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <div className="form-group">
                <label>Rasa (Taste)</label>
                <input 
                  value={form.rasa} 
                  onChange={e => setForm({ ...form, rasa: e.target.value })}
                  placeholder="e.g., Sweet, Bitter"
                />
              </div>

              <div className="form-group">
                <label>Dosha Balance</label>
                <input 
                  value={form.doshaBalance} 
                  onChange={e => setForm({ ...form, doshaBalance: e.target.value })}
                  placeholder="e.g., Pitta reducing"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Foods (comma separated) *</label>
              <input 
                value={form.foods} 
                onChange={e => setForm({ ...form, foods: e.target.value })}
                placeholder="e.g., Rice, Lentils, Vegetables"
                required
              />
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea 
                value={form.notes} 
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Any special instructions or dietary notes..."
                style={{ height: '80px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                type="submit" 
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: '#2C5F2D', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  fontWeight: 'bold',
                  flex: '1 1 auto'
                }}
              >
                {editId ? '💾 Update Diet Plan' : '➕ Add Diet Plan'}
              </button>
              
              {editId && (
                <button 
                  type="button"
                  onClick={resetForm}
                  style={{ 
                    padding: '12px 24px', 
                    backgroundColor: '#6c757d', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                    flex: '1 1 auto'
                  }}
                >
                  ❌ Cancel
                </button>
              )}
            </div>

            {message && (
              <div className={`alert ${message.includes('❌') ? 'alert-error' : 'alert-success'}`}>
                {message}
              </div>
            )}
          </form>
        </div>
      )}

      <div>
        <h3 className="mb-2">All Diet Plans ({dietPlans.length})</h3>
        
        {dietPlans.length === 0 ? (
          <p className="text-center" style={{ color: '#666', padding: '40px' }}>
            📋 No diet plans created yet. {(role === 'doctor' || role === 'admin') && 'Create your first one above!'}
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Meal Time</th>
                  <th>Foods</th>
                  <th>Rasa</th>
                  <th>Dosha</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dietPlans.map((plan, index) => (
                  <tr key={plan._id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                    <td>
                      <strong>{getPatientName(plan.patientId)}</strong>
                    </td>
                    <td>
                      {getDoctorName(plan.doctorId)}
                    </td>
                    <td>
                      <span style={{ 
                        padding: '4px 8px', 
                        backgroundColor: '#e3f2fd', 
                        borderRadius: '4px',
                        fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                        whiteSpace: 'nowrap'
                      }}>
                        {plan.mealTime}
                      </span>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      {Array.isArray(plan.foods) ? plan.foods.join(', ') : plan.foods}
                    </td>
                    <td>{plan.rasa || '-'}</td>
                    <td>{plan.doshaBalance || '-'}</td>
                    <td style={{ maxWidth: '150px' }}>
                      {plan.notes || '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => handleDownloadPDF(plan._id)} 
                          title="Download PDF"
                          style={{ 
                            padding: '6px 12px', 
                            backgroundColor: '#f57c00', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          📄 PDF
                        </button>

                        {(role === 'doctor' || role === 'admin') && (
                          <>
                            <button 
                              onClick={() => handleEdit(plan)} 
                              title="Edit"
                              style={{ 
                                padding: '6px 12px', 
                                backgroundColor: '#007bff', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(plan._id)} 
                              title="Delete"
                              style={{ 
                                padding: '6px 12px', 
                                backgroundColor: '#dc3545', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DietPlans;
