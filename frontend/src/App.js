// src/App.js
// ==================== COMPLETE APP.JS - ALL FEATURES ====================
// Updated: October 29, 2025
// Features: All previous + Doctor Directory & Appointment Booking + Admin Panel

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import ChatBox from './ChatBox';
import { apiClient } from './utils/apiClient';
import { useAuth } from './hooks/useAuth';

// ==================== COMPONENT IMPORTS ====================
import DietPlans from './components/DietPlans';
import KnowledgeCenter from './components/KnowledgeCenter';
import DoshaQuiz from './components/DoshaQuiz';
import SymptomChecker from './components/SymptomChecker';
import ProgressDashboard from './components/ProgressDashboard';
import AdminPanel from './components/AdminPanel';

// ==================== MODIFICATION 3 IMPORTS ====================
import DoctorsList from './components/DoctorsList';
import BookAppointment from './components/BookAppointment';
import AppointmentsList from './components/AppointmentsList';
import DoctorProfile from './components/DoctorProfile';

// ==================== CHART.JS IMPORTS ====================
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './index.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// ==================== LOGOUT COMPONENT ====================
function Logout() {
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };
  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        whiteSpace: 'nowrap'
      }}
    >
      🚪 Logout
    </button>
  );
}

// ==================== HOME COMPONENT ====================
function Home() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/')
      .then((res) => res.json())
      .then((data) => {
        setBackendStatus(data);
        setLoading(false);
      })
      .catch(() => {
        setBackendStatus({ message: 'Error contacting backend', status: 'error' });
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <h2>🌿 Welcome to Swasthya Sutra</h2>
      <p style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', color: '#666' }}>
        Your Ayurvedic Health Management Platform
      </p>

      <div className={`alert ${backendStatus?.status === 'error' ? 'alert-error' : 'alert-success'}`}>
        <strong>Backend Status:</strong>{' '}
        {loading ? '⏳ Checking...' : backendStatus?.status === 'error' ? '❌ Offline' : '✅ Online'}
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h3>🎯 Features:</h3>
        <ul style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>👥 <strong>Patient Management</strong> - Add, view, edit, and delete patient records</li>
          <li>🍎 <strong>Ayurvedic Food Database</strong> - Comprehensive database with dosha properties</li>
          <li>🔐 <strong>User Authentication</strong> - Secure role-based access control</li>
          <li>📋 <strong>Diet Planning</strong> - Personalized Ayurvedic diet recommendations</li>
          <li>📊 <strong>Admin Dashboard</strong> - Analytics with interactive charts</li>
          <li>🤖 <strong>AI Chatbot</strong> - Smart food recommendations powered by Google Gemini</li>
          <li>📄 <strong>PDF Reports</strong> - Downloadable diet plans and patient reports</li>
          <li>📚 <strong>Knowledge Center</strong> - Learn from ancient Ayurvedic texts and videos</li>
          <li>🧘 <strong>Dosha Assessment Quiz</strong> - Discover your unique Ayurvedic constitution</li>
          <li>🔍 <strong>Symptom Checker</strong> - AI-powered symptom analysis with personalized recommendations</li>
          <li>📈 <strong>Progress Tracker</strong> - Monitor your health improvements over time</li>
          <li>👨‍⚕️ <strong>Doctor Directory</strong> - Find and book appointments with Ayurvedic doctors (NEW)</li>
          <li>📅 <strong>Appointment Booking</strong> - Schedule and manage consultations (NEW)</li>
        </ul>
      </div>

      <div className="card" style={{ marginTop: '20px', backgroundColor: '#f0f8ff' }}>
        <h3>🚀 Quick Start:</h3>
        <ol style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>
            <Link to="/register" style={{ color: '#007bff', fontWeight: 'bold' }}>Register</Link> as a patient, doctor, or admin
          </li>
          <li>
            <Link to="/login" style={{ color: '#007bff', fontWeight: 'bold' }}>Login</Link> to access features
          </li>
          <li>
            Use the <Link to="/symptom-checker" style={{ color: '#007bff', fontWeight: 'bold' }}>Symptom Checker</Link> for personalized health advice
          </li>
          <li>
            Take the <Link to="/dosha-quiz" style={{ color: '#007bff', fontWeight: 'bold' }}>Dosha Quiz</Link> to discover your constitution
          </li>
          <li>
            Track your wellness with the <Link to="/progress" style={{ color: '#007bff', fontWeight: 'bold' }}>Progress Dashboard</Link>
          </li>
          <li>
            Find <Link to="/doctors" style={{ color: '#007bff', fontWeight: 'bold' }}>Ayurvedic Doctors</Link> and book appointments (NEW)
          </li>
          <li>
            View the <Link to="/dashboard" style={{ color: '#007bff', fontWeight: 'bold' }}>Dashboard</Link> for analytics
          </li>
          <li>
            Explore the <Link to="/knowledge" style={{ color: '#007bff', fontWeight: 'bold' }}>Knowledge Center</Link> for Ayurvedic learning
          </li>
          <li>Add patients, foods, and create diet plans</li>
          <li>Use the AI chatbot for Ayurvedic advice</li>
        </ol>
      </div>
    </div>
  );
}

// ==================== DASHBOARD COMPONENT ====================
function Dashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalFoods: 0,
    totalDietPlans: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [foods, setFoods] = useState([]);

    // Add this before the useEffect that calls fetchDashboardData
  useEffect(() => {
    if (!role) {
      console.log('Waiting for role to load...');
      return;  // Wait until role is available
    }
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const patientsData = await apiClient('http://localhost:5000/patients');
      setPatients(patientsData);

      const foodsData = await apiClient('http://localhost:5000/foods');
      setFoods(foodsData);

      const dietPlansData = await apiClient('http://localhost:5000/api/dietplans');

      let usersData = [];
      if (role === 'admin') {
        usersData = await apiClient('http://localhost:5000/users');
      }

      setStats({
        totalPatients: patientsData.length,
        totalFoods: foodsData.length,
        totalDietPlans: dietPlansData.length,
        totalUsers: usersData.length
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
    setLoading(false);
  };

  const genderChartData = {
    labels: ['Male', 'Female', 'Other'],
    datasets: [
      {
        label: 'Patient Gender Distribution',
        data: [
          patients.filter((p) => p.gender === 'Male').length,
          patients.filter((p) => p.gender === 'Female').length,
          patients.filter((p) => p.gender === 'Other').length
        ],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
        borderWidth: 1
      }
    ]
  };

  const foodCategoryData = {
    labels: ['Grains', 'Vegetables', 'Fruits', 'Spices', 'Herbs', 'Dairy', 'Oils'],
    datasets: [
      {
        label: 'Food Categories',
        data: [
          foods.filter((f) => f.category === 'Grains').length,
          foods.filter((f) => f.category === 'Vegetables').length,
          foods.filter((f) => f.category === 'Fruits').length,
          foods.filter((f) => f.category === 'Spices').length,
          foods.filter((f) => f.category === 'Herbs').length,
          foods.filter((f) => f.category === 'Dairy').length,
          foods.filter((f) => f.category === 'Oils').length
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'],
        borderWidth: 1
      }
    ]
  };

  // Add this NEW check BEFORE the existing loading check
  if (!role) {
    return <p className="text-center">Loading user info...</p>;
  }

  // Keep your existing check
  if (loading) return <p className="text-center">Loading dashboard...</p>;
  return (
    <div className="container">
      <h1 className="mb-3">📊 Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid mb-3">
        <div className="card" style={{ backgroundColor: '#e3f2fd' }}>
          <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '10px' }}>👥</div>
          <h3 style={{ color: '#1976d2', fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>Total Patients</h3>
          <p style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: 'bold', color: '#0d47a1', margin: '10px 0' }}>
            {stats.totalPatients}
          </p>
          <button
            onClick={() => navigate('/patients')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            View All
          </button>
        </div>

        <div className="card" style={{ backgroundColor: '#f3e5f5' }}>
          <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '10px' }}>🍎</div>
          <h3 style={{ color: '#7b1fa2', fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>Ayurvedic Foods</h3>
          <p style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: 'bold', color: '#4a148c', margin: '10px 0' }}>
            {stats.totalFoods}
          </p>
          <button
            onClick={() => navigate('/foods')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#7b1fa2',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            View All
          </button>
        </div>

        <div className="card" style={{ backgroundColor: '#e8f5e9' }}>
          <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '10px' }}>📋</div>
          <h3 style={{ color: '#388e3c', fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>Diet Plans</h3>
          <p style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: 'bold', color: '#1b5e20', margin: '10px 0' }}>
            {stats.totalDietPlans}
          </p>
          <button
            onClick={() => navigate('/dietplans')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#388e3c',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            View All
          </button>
        </div>

        {role === 'admin' && (
          <div className="card" style={{ backgroundColor: '#fff3e0' }}>
            <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '10px' }}>👨‍⚕️</div>
            <h3 style={{ color: '#f57c00', fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>Total Users</h3>
            <p style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: 'bold', color: '#e65100', margin: '10px 0' }}>
              {stats.totalUsers}
            </p>
            <button
              onClick={() => navigate('/admin-panel')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f57c00',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Manage Users
            </button>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid mb-3">
        <div className="card">
          <h3 className="mb-2">Patient Gender Distribution</h3>
          {patients.length > 0 ? (
            <Pie data={genderChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          ) : (
            <p className="text-center" style={{ color: '#999' }}>
              No patient data available
            </p>
          )}
        </div>

        <div className="card">
          <h3 className="mb-2">Food Database by Category</h3>
          {foods.length > 0 ? (
            <Bar data={foodCategoryData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } }} />
          ) : (
            <p className="text-center" style={{ color: '#999' }}>
              No food data available
            </p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card mb-3">
        <h3 className="mb-2">📅 Recent Patients</h3>
        {patients.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Diagnosis</th>
                </tr>
              </thead>
              <tbody>
                {patients.slice(0, 5).map((patient) => (
                  <tr key={patient._id}>
                    <td>{patient.name}</td>
                    <td>{patient.age}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.diagnosis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center" style={{ color: '#999' }}>
            No recent patients
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="mb-2">⚡ Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/patients')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              flex: '1 1 200px'
            }}
          >
            ➕ Add Patient
          </button>
          <button
            onClick={() => navigate('/foods')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#7b1fa2',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              flex: '1 1 200px'
            }}
          >
            ➕ Add Food
          </button>
          <button
            onClick={() => navigate('/dietplans')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#388e3c',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              flex: '1 1 200px'
            }}
          >
            ➕ Create Diet Plan
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== PATIENTS COMPONENT ====================
function Patients() {
  const { role } = useAuth();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [patients, setPatients] = useState([]);
  const [addMessage, setAddMessage] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await apiClient('http://localhost:5000/patients');
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddMessage('');
    if (role !== 'doctor' && role !== 'admin') {
      setAddMessage('❌ You do not have permission to add patients.');
      return;
    }
    try {
      const data = await apiClient('http://localhost:5000/add-patient', {
        method: 'POST',
        body: JSON.stringify({ name, age, gender, phone, diagnosis })
      });
      setAddMessage('✅ ' + (data.message || 'Patient added successfully!'));
      if (data.message) {
        setName('');
        setAge('');
        setGender('');
        setPhone('');
        setDiagnosis('');
        fetchPatients();
      }
    } catch (err) {
      setAddMessage('❌ ' + (err.message || 'Error adding patient'));
    }
  };

  const deletePatient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    if (role !== 'doctor' && role !== 'admin') {
      alert('You do not have permission to delete patients.');
      return;
    }
    try {
      await apiClient(`http://localhost:5000/patients/${id}`, { method: 'DELETE' });
      setAddMessage('✅ Patient deleted successfully');
      fetchPatients();
    } catch (err) {
      console.error('Error deleting patient:', err);
      setAddMessage('❌ Error deleting patient');
    }
  };

  const handlePatientReportPDF = async (patientId) => {
    try {
      setAddMessage('📄 Generating PDF report...');
      const response = await fetch(`http://localhost:5000/api/patients/${patientId}/report/pdf`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
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

      setAddMessage('✅ PDF downloaded successfully!');
      setTimeout(() => setAddMessage(''), 3000);
    } catch (err) {
      setAddMessage('❌ Error downloading patient report');
      console.error(err);
    }
  };

  if (!role) return <p className="text-center">Loading user info...</p>;

  return (
    <div className="container">
      <h2 className="mb-2">👥 Patient Management</h2>

      {(role === 'doctor' || role === 'admin') && (
        <div className="card mb-3" style={{ backgroundColor: '#f9f9f9' }}>
          <h3>➕ Add New Patient</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required />
              <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" type="number" required />
              <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" required />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Diagnosis/Symptoms"
                required
                style={{ width: '100%', height: '80px' }}
              />
            </div>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Add Patient
            </button>
          </form>
          {addMessage && <div className={`alert ${addMessage.includes('❌') ? 'alert-error' : 'alert-success'}`}>{addMessage}</div>}
        </div>
      )}

      <div>
        <h3 className="mb-2">Patient List ({patients.length})</h3>
        {patients.length === 0 ? (
          <p className="text-center" style={{ color: '#999' }}>
            No patients added yet.
          </p>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '15px' }}>
            {patients.map((patient) => (
              <div key={patient._id} className="card">
                <h4 style={{ marginBottom: '10px', color: '#2C5F2D' }}>{patient.name}</h4>
                <p>
                  <strong>Age:</strong> {patient.age} | <strong>Gender:</strong> {patient.gender}
                </p>
                <p>
                  <strong>Phone:</strong> {patient.phone}
                </p>
                <p>
                  <strong>Diagnosis:</strong> {patient.diagnosis}
                </p>

                <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handlePatientReportPDF(patient._id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#7b1fa2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      flex: '1 1 auto'
                    }}
                  >
                    📋 Report PDF
                  </button>

                  {(role === 'doctor' || role === 'admin') && (
                    <button
                      onClick={() => deletePatient(patient._id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        flex: '1 1 auto'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== FOODS COMPONENT ====================
function Foods() {
  const { role } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [benefits, setBenefits] = useState('');
  const [properties, setProperties] = useState('');
  const [taste, setTaste] = useState('');
  const [potency, setPotency] = useState('');
  const [foods, setFoods] = useState([]);
  const [addMessage, setAddMessage] = useState('');

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const data = await apiClient('http://localhost:5000/foods');
      setFoods(data);
    } catch (err) {
      console.error('Error fetching foods:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddMessage('');
    if (role !== 'doctor' && role !== 'admin') {
      setAddMessage('❌ You do not have permission to add foods.');
      return;
    }
    try {
      const data = await apiClient('http://localhost:5000/add-food', {
        method: 'POST',
        body: JSON.stringify({ name, category, benefits, properties, taste, potency })
      });
      setAddMessage('✅ ' + (data.message || 'Food added successfully!'));
      if (data.message) {
        setName('');
        setCategory('');
        setBenefits('');
        setProperties('');
        setTaste('');
        setPotency('');
        fetchFoods();
      }
    } catch (err) {
      setAddMessage('❌ ' + (err.message || 'Error adding food'));
    }
  };

  const deleteFood = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food?')) return;
    if (role !== 'doctor' && role !== 'admin') {
      alert('You do not have permission to delete foods.');
      return;
    }
    try {
      await apiClient(`http://localhost:5000/foods/${id}`, { method: 'DELETE' });
      setAddMessage('✅ Food deleted successfully');
      fetchFoods();
    } catch (err) {
      console.error('Error deleting food:', err);
      setAddMessage('❌ Error deleting food');
    }
  };

  if (!role) return <p className="text-center">Loading user info...</p>;

  return (
    <div className="container">
      <h2 className="mb-2">🍎 Ayurvedic Food Database</h2>

      {(role === 'doctor' || role === 'admin') && (
        <div className="card mb-3" style={{ backgroundColor: '#f9f9f9' }}>
          <h3>➕ Add New Food Item</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '15px' }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Food Name" required />
              <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="">Select Category</option>
                <option value="Grains">Grains</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Spices">Spices</option>
                <option value="Herbs">Herbs</option>
                <option value="Dairy">Dairy</option>
                <option value="Oils">Oils</option>
              </select>
              <select value={taste} onChange={(e) => setTaste(e.target.value)}>
                <option value="">Taste</option>
                <option value="Sweet">Sweet</option>
                <option value="Sour">Sour</option>
                <option value="Salty">Salty</option>
                <option value="Bitter">Bitter</option>
                <option value="Pungent">Pungent</option>
                <option value="Astringent">Astringent</option>
              </select>
              <select value={potency} onChange={(e) => setPotency(e.target.value)}>
                <option value="">Potency</option>
                <option value="Hot">Hot</option>
                <option value="Cold">Cold</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <textarea
                value={properties}
                onChange={(e) => setProperties(e.target.value)}
                placeholder="Ayurvedic Properties (Vata, Pitta, Kapha effects)"
                style={{ width: '100%', height: '60px', marginBottom: '10px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <textarea
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                placeholder="Health Benefits"
                required
                style={{ width: '100%', height: '60px' }}
              />
            </div>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Add Food
            </button>
          </form>
          {addMessage && <div className={`alert ${addMessage.includes('❌') ? 'alert-error' : 'alert-success'}`}>{addMessage}</div>}
        </div>
      )}

      <div>
        <h3 className="mb-2">Food Database ({foods.length} items)</h3>
        {foods.length === 0 ? (
          <p className="text-center" style={{ color: '#999' }}>
            No food items added yet.
          </p>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
            {foods.map((food) => (
              <div key={food._id} className="card">
                <h4 style={{ color: '#2C5F2D', marginBottom: '10px' }}>
                  {food.name} ({food.category})
                </h4>
                {food.taste && (
                  <p>
                    <strong>Taste:</strong> {food.taste}
                  </p>
                )}
                {food.potency && (
                  <p>
                    <strong>Potency:</strong> {food.potency}
                  </p>
                )}
                {food.properties && (
                  <p>
                    <strong>Properties:</strong> {food.properties}
                  </p>
                )}
                <p>
                  <strong>Benefits:</strong> {food.benefits}
                </p>
                {(role === 'doctor' || role === 'admin') && (
                  <button
                    onClick={() => deleteFood(food._id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      marginTop: '10px',
                      width: '100%'
                    }}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== LOGIN COMPONENT ====================
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
        window.location.reload(); // Reload to update navbar
      }
    } catch (err) {
      setMessage('Error logging in');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <div className="card">
        <h2 className="mb-2">🔐 Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
          </div>
          <div className="form-group">
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
          </div>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', width: '100%', cursor: 'pointer' }}>
            Login
          </button>
        </form>
        {message && <div className={`alert ${message.includes('Error') || message.includes('Invalid') ? 'alert-error' : 'alert-success'}`}>{message}</div>}
      </div>
    </div>
  );
}

// ==================== REGISTER COMPONENT ====================
function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role })
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        setUsername('');
        setEmail('');
        setPassword('');
        setRole('patient');
      }
    } catch (err) {
      setMessage('Error registering user');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <div className="card">
        <h2 className="mb-2">📝 Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
          </div>
          <div className="form-group">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
          </div>
          <div className="form-group">
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
          </div>
          <div className="form-group">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', width: '100%', cursor: 'pointer' }}>
            Register
          </button>
        </form>
        {message && <div className={`alert ${message.includes('Error') || message.includes('exists') ? 'alert-error' : 'alert-success'}`}>{message}</div>}
      </div>
    </div>
  );
}

// ==================== MAIN APP COMPONENT ====================
function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('user'));
  }, []);

  useEffect(() => {
    const syncLoginState = () => setLoggedIn(!!localStorage.getItem('user'));
    window.addEventListener('storage', syncLoginState);
    return () => window.removeEventListener('storage', syncLoginState);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <Router>
      <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Responsive Navbar */}
        <nav
          style={{
            padding: '15px 30px',
            backgroundColor: '#2C5F2D',
            color: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'relative'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              maxWidth: '1400px',
              margin: '0 auto'
            }}
          >
            {/* Logo + User Greeting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <h1
                style={{
                  margin: '0',
                  fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                🌿 Swasthya Sutra
              </h1>

              {/* Show user greeting if logged in */}
              {loggedIn &&
                (() => {
                  const user = JSON.parse(localStorage.getItem('user') || '{}');
                  return (
                    <span
                      style={{
                        fontSize: 'clamp(0.85rem, 2vw, 1rem)',
                        color: '#d4f4dd',
                        fontWeight: '500',
                        padding: '5px 12px',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        borderRadius: '20px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      👋 Welcome, <strong>{user.username}</strong> ({user.role})
                    </span>
                  );
                })()}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="mobile-menu-button"
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.75rem',
                cursor: 'pointer',
                padding: '5px 10px'
              }}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>

            {/* Navigation Links */}
            <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
              {/* Base Navigation Links */}
              <Link to="/" onClick={closeMobileMenu} style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', padding: '8px 12px' }}>
                🏠 Home
              </Link>

              {loggedIn && (
                <>
                  <Link to="/dashboard" onClick={closeMobileMenu} style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', padding: '8px 12px' }}>
                    📊 Dashboard
                  </Link>
                  <Link to="/knowledge" onClick={closeMobileMenu} style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', padding: '8px 12px' }}>
                    📚 Knowledge
                  </Link>
                  <Link to="/symptom-checker" onClick={closeMobileMenu} style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', padding: '8px 12px' }}>
                    🔍 Symptoms
                  </Link>
                  <Link to="/dosha-quiz" onClick={closeMobileMenu} style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', padding: '8px 12px' }}>
                    🧘 Dosha Quiz
                  </Link>
                  <Link to="/progress" onClick={closeMobileMenu} style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', padding: '8px 12px' }}>
                    📈 Progress
                  </Link>
                  <Link to="/patients" onClick={closeMobileMenu} style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', padding: '8px 12px' }}>
                    👥 Patients
                  </Link>
                  <Link to="/foods" onClick={closeMobileMenu} style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', padding: '8px 12px' }}>
                    🍎 Foods
                  </Link>
                  <Link to="/dietplans" onClick={closeMobileMenu} style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', padding: '8px 12px' }}>
                    📋 Diet Plans
                  </Link>
                </>
              )}

              {/* ==================== MODIFICATION 3 NAVIGATION ==================== */}
              {/* PATIENT-ONLY LINKS */}
              {loggedIn &&
                (() => {
                  const user = JSON.parse(localStorage.getItem('user') || '{}');
                  return user.role === 'patient' ? (
                    <>
                      <Link
                        to="/doctors"
                        onClick={closeMobileMenu}
                        style={{
                          color: 'white',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          padding: '8px 12px',
                          backgroundColor: '#FF6B6B',
                          borderRadius: '5px',
                          marginLeft: '5px'
                        }}
                      >
                        👨‍⚕️ Find Doctors
                      </Link>
                      <Link
                        to="/appointments"
                        onClick={closeMobileMenu}
                        style={{
                          color: 'white',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          padding: '8px 12px',
                          backgroundColor: '#4ECDC4',
                          borderRadius: '5px',
                          marginLeft: '5px'
                        }}
                      >
                        📅 My Appointments
                      </Link>
                    </>
                  ) : null;
                })()}

              {/* DOCTOR-ONLY LINKS */}
              {loggedIn &&
                (() => {
                  const user = JSON.parse(localStorage.getItem('user') || '{}');
                  return user.role === 'doctor' ? (
                    <>
                      <Link
                        to="/appointments"
                        onClick={closeMobileMenu}
                        style={{
                          color: 'white',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          padding: '8px 12px',
                          backgroundColor: '#4ECDC4',
                          borderRadius: '5px',
                          marginLeft: '5px'
                        }}
                      >
                        📅 Patient Appointments
                      </Link>
                      <Link
                        to="/doctor-profile"
                        onClick={closeMobileMenu}
                        style={{
                          color: '#333',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          padding: '8px 12px',
                          backgroundColor: '#FFD93D',
                          borderRadius: '5px',
                          marginLeft: '5px'
                        }}
                      >
                        👨‍⚕️ My Profile
                      </Link>
                    </>
                  ) : null;
                })()}

              {/* ADMIN-ONLY LINKS */}
              {loggedIn &&
                (() => {
                  const user = JSON.parse(localStorage.getItem('user') || '{}');
                  return user.role === 'admin' ? (
                    <>
                      <Link
                        to="/doctors"
                        onClick={closeMobileMenu}
                        style={{
                          color: 'white',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          padding: '8px 12px',
                          backgroundColor: '#1976D2',
                          borderRadius: '5px',
                          marginLeft: '5px'
                        }}
                      >
                        👨‍⚕️ All Doctors
                      </Link>
                      <Link
                        to="/appointments"
                        onClick={closeMobileMenu}
                        style={{
                          color: 'white',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          padding: '8px 12px',
                          backgroundColor: '#1976D2',
                          borderRadius: '5px',
                          marginLeft: '5px'
                        }}
                      >
                        📅 All Appointments
                      </Link>
                      <Link
                        to="/admin-panel"
                        onClick={closeMobileMenu}
                        style={{
                          color: 'white',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          padding: '8px 12px',
                          backgroundColor: '#388e3c',
                          borderRadius: '5px',
                          marginLeft: '5px'
                        }}
                      >
                        🔐 Admin Panel
                      </Link>
                    </>
                  ) : null;
                })()}

              {/* Login/Logout Buttons */}
              {!loggedIn ? (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    style={{
                      color: 'white',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      padding: '8px 16px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '5px',
                      marginLeft: '5px'
                    }}
                  >
                    🔐 Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    style={{
                      color: 'white',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      padding: '8px 16px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '5px',
                      marginLeft: '5px'
                    }}
                  >
                    📝 Register
                  </Link>
                </>
              ) : (
                <div onClick={closeMobileMenu}>
                  <Logout />
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* ==================== ROUTES ==================== */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/knowledge" element={<KnowledgeCenter />} />
          <Route path="/symptom-checker" element={<SymptomChecker />} />
          <Route path="/dosha-quiz" element={<DoshaQuiz />} />
          <Route path="/progress" element={<ProgressDashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/foods" element={<Foods />} />
          <Route path="/dietplans" element={<DietPlans />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ==================== MODIFICATION 3 ROUTES ==================== */}
          <Route path="/doctors" element={<DoctorsList />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/appointments" element={<AppointmentsList />} />
          <Route path="/doctor-profile" element={<DoctorProfile />} />
        </Routes>

        <ChatBox />
      </div>
    </Router>
  );
}

export default App;
