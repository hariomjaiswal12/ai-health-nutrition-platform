import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch patients
      const patientsData = await apiClient('http://localhost:5000/patients');
      setPatients(patientsData);

      // Fetch foods
      const foodsData = await apiClient('http://localhost:5000/foods');
      setFoods(foodsData);

      // Fetch diet plans
      const dietPlansData = await apiClient('http://localhost:5000/api/dietplans');

      // Fetch users (admin only)
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

  // Gender distribution chart data
  const genderChartData = {
    labels: ['Male', 'Female', 'Other'],
    datasets: [
      {
        label: 'Patient Gender Distribution',
        data: [
          patients.filter(p => p.gender === 'Male').length,
          patients.filter(p => p.gender === 'Female').length,
          patients.filter(p => p.gender === 'Other').length
        ],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
        borderWidth: 1
      }
    ]
  };

  // Food category chart data
  const foodCategoryData = {
    labels: ['Grains', 'Vegetables', 'Fruits', 'Spices', 'Herbs', 'Dairy', 'Oils'],
    datasets: [
      {
        label: 'Food Categories',
        data: [
          foods.filter(f => f.category === 'Grains').length,
          foods.filter(f => f.category === 'Vegetables').length,
          foods.filter(f => f.category === 'Fruits').length,
          foods.filter(f => f.category === 'Spices').length,
          foods.filter(f => f.category === 'Herbs').length,
          foods.filter(f => f.category === 'Dairy').length,
          foods.filter(f => f.category === 'Oils').length
        ],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#C9CBCF'
        ],
        borderWidth: 1
      }
    ]
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>📊 Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        {/* Total Patients Card */}
        <div style={{ backgroundColor: '#e3f2fd', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>👥</div>
          <h3 style={{ margin: '10px 0', color: '#1976d2' }}>Total Patients</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '10px 0', color: '#0d47a1' }}>{stats.totalPatients}</p>
          <button 
            onClick={() => navigate('/patients')} 
            style={{ padding: '8px 16px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
          >
            View All
          </button>
        </div>

        {/* Total Foods Card */}
        <div style={{ backgroundColor: '#f3e5f5', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🍎</div>
          <h3 style={{ margin: '10px 0', color: '#7b1fa2' }}>Ayurvedic Foods</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '10px 0', color: '#4a148c' }}>{stats.totalFoods}</p>
          <button 
            onClick={() => navigate('/foods')} 
            style={{ padding: '8px 16px', backgroundColor: '#7b1fa2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
          >
            View All
          </button>
        </div>

        {/* Total Diet Plans Card */}
        <div style={{ backgroundColor: '#e8f5e9', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📋</div>
          <h3 style={{ margin: '10px 0', color: '#388e3c' }}>Diet Plans</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '10px 0', color: '#1b5e20' }}>{stats.totalDietPlans}</p>
          <button 
            onClick={() => navigate('/diet-plans')} 
            style={{ padding: '8px 16px', backgroundColor: '#388e3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
          >
            View All
          </button>
        </div>

        {/* Total Users Card (Admin Only) */}
        {role === 'admin' && (
          <div style={{ backgroundColor: '#fff3e0', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>👨‍⚕️</div>
            <h3 style={{ margin: '10px 0', color: '#f57c00' }}>Total Users</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '10px 0', color: '#e65100' }}>{stats.totalUsers}</p>
            <button 
              onClick={() => navigate('/users')} 
              style={{ padding: '8px 16px', backgroundColor: '#f57c00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
            >
              Manage Users
            </button>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '40px' }}>
        
        {/* Patient Gender Distribution */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>Patient Gender Distribution</h3>
          {patients.length > 0 ? (
            <Pie data={genderChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          ) : (
            <p style={{ textAlign: 'center', color: '#999' }}>No patient data available</p>
          )}
        </div>

        {/* Food Categories */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>Food Database by Category</h3>
          {foods.length > 0 ? (
            <Bar 
              data={foodCategoryData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: true,
                plugins: {
                  legend: { display: false }
                }
              }} 
            />
          ) : (
            <p style={{ textAlign: 'center', color: '#999' }}>No food data available</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '40px' }}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>📅 Recent Patients</h3>
        {patients.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Name</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Age</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Gender</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Diagnosis</th>
              </tr>
            </thead>
            <tbody>
              {patients.slice(0, 5).map((patient) => (
                <tr key={patient._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{patient.name}</td>
                  <td style={{ padding: '12px' }}>{patient.age}</td>
                  <td style={{ padding: '12px' }}>{patient.gender}</td>
                  <td style={{ padding: '12px' }}>{patient.diagnosis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#999' }}>No recent patients</p>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>⚡ Quick Actions</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/patients')} 
            style={{ padding: '12px 24px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
          >
            ➕ Add Patient
          </button>
          <button 
            onClick={() => navigate('/foods')} 
            style={{ padding: '12px 24px', backgroundColor: '#7b1fa2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
          >
            ➕ Add Food
          </button>
          <button 
            onClick={() => navigate('/diet-plans')} 
            style={{ padding: '12px 24px', backgroundColor: '#388e3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
          >
            ➕ Create Diet Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
