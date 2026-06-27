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
    if (!role) {
      console.log('Waiting for role to load...');
      return; // Wait until role is available
    }
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

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

  // Coordinated premium Ayurvedic hex color palette
  const colors = {
    primarySage: '#5E8267', // Sage green
    accentClay: '#A76F53',  // Clay terracotta
    lightSage: '#8CA893',   // Light muted green
    wheatGold: '#C5A880',   // Warm wheat gold
    softRed: '#D07A60',     // Warm cinnamon red
    creamSoft: '#EAE6DF',   // Muted cream
    olive: '#C2C0A5'        // Soft olive
  };

  // Gender distribution chart data
  const genderChartData = {
    labels: ['Male', 'Female', 'Other'],
    datasets: [
      {
        label: 'Patients',
        data: [
          patients.filter(p => p.gender === 'Male').length,
          patients.filter(p => p.gender === 'Female').length,
          patients.filter(p => p.gender === 'Other').length
        ],
        backgroundColor: [colors.primarySage, colors.accentClay, colors.wheatGold],
        borderWidth: 0
      }
    ]
  };

  // Food category chart data
  const foodCategoryData = {
    labels: ['Grains', 'Vegetables', 'Fruits', 'Spices', 'Herbs', 'Dairy', 'Oils'],
    datasets: [
      {
        label: 'Indexed Items',
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
          colors.accentClay,
          colors.primarySage,
          colors.wheatGold,
          colors.softRed,
          colors.lightSage,
          colors.creamSoft,
          colors.olive
        ],
        borderWidth: 0,
        borderRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          color: '#4e5f52'
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 10 },
          color: '#4e5f52'
        }
      },
      y: {
        grid: { color: 'oklch(88% .022 130 / 0.3)' },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 10 },
          color: '#4e5f52'
        }
      }
    }
  };

  if (!role) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
        <p className="font-display" style={{ fontSize: '1.5rem', color: 'var(--muted-foreground)' }}>Loading user session...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
        <p className="font-display" style={{ fontSize: '1.5rem', color: 'var(--muted-foreground)' }}>Loading dashboard analytics...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Page Header */}
      <div style={{ marginBottom: '3.5rem' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Overview</span>
        <h2 className="font-display" style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground)' }}>Health Analytics Dashboard</h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--muted-foreground)', margin: 0 }}>
          Real-time stats and metrics across your Ayurvedic clinical registry.
        </p>
      </div>

      {/* Statistics Cards Grid */}
      <section className="dashboard-stats-grid">
        {/* Total Patients Card */}
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <h4 className="dashboard-stat-title">Patients Registered</h4>
          <p className="dashboard-stat-num">{stats.totalPatients}</p>
          <button 
            onClick={() => navigate('/patients')} 
            className="dashboard-stat-btn"
          >
            Manage Patients
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>

        {/* Total Foods Card */}
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2zm0 15c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z"></path></svg>
          </div>
          <h4 className="dashboard-stat-title">Ayurvedic Foods</h4>
          <p className="dashboard-stat-num">{stats.totalFoods}</p>
          <button 
            onClick={() => navigate('/foods')} 
            className="dashboard-stat-btn"
          >
            Browse Foods
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>

        {/* Total Diet Plans Card */}
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          </div>
          <h4 className="dashboard-stat-title">Diet Plans Created</h4>
          <p className="dashboard-stat-num">{stats.totalDietPlans}</p>
          <button 
            onClick={() => navigate('/dietplans')} 
            className="dashboard-stat-btn"
          >
            Manage Diets
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>

        {/* Total Users Card (Admin Only) */}
        {role === 'admin' && (
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </div>
            <h4 className="dashboard-stat-title">Active System Users</h4>
            <p className="dashboard-stat-num">{stats.totalUsers}</p>
            <button 
              onClick={() => navigate('/admin-panel')} 
              className="dashboard-stat-btn"
            >
              System Admin
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        )}
      </section>

      {/* Charts Section */}
      <section className="dashboard-charts-grid">
        {/* Patient Gender Distribution */}
        <div className="dashboard-chart-card">
          <h3 className="dashboard-chart-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            Gender Demographics
          </h3>
          {patients.length > 0 ? (
            <div style={{ maxHeight: '260px', display: 'flex', justifyContent: 'center' }}>
              <Pie data={genderChartData} options={chartOptions} />
            </div>
          ) : (
            <div style={{ height: '200px', display: 'grid', placeItems: 'center' }}>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', fontStyle: 'italic' }}>No demographic data available</p>
            </div>
          )}
        </div>

        {/* Food Categories */}
        <div className="dashboard-chart-card">
          <h3 className="dashboard-chart-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Food Classification
          </h3>
          {foods.length > 0 ? (
            <div style={{ maxHeight: '260px', display: 'flex', justifyContent: 'center' }}>
              <Bar data={foodCategoryData} options={barChartOptions} />
            </div>
          ) : (
            <div style={{ height: '200px', display: 'grid', placeItems: 'center' }}>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', fontStyle: 'italic' }}>No food classification data available</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity Table */}
      <section className="dashboard-table-card">
        <h3 className="dashboard-table-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          Recently Admitted Patients
        </h3>
        {patients.length > 0 ? (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-data-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Clinical Imbalance / Diagnosis</th>
                </tr>
              </thead>
              <tbody>
                {patients.slice(0, 5).map((patient) => (
                  <tr key={patient._id}>
                    <td><strong style={{ color: 'var(--foreground)' }}>{patient.name}</strong></td>
                    <td>{patient.age}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.diagnosis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--muted-foreground)', fontStyle: 'italic', margin: 0 }}>No recent patient registrations found</p>
          </div>
        )}
      </section>

      {/* Quick Actions Panel */}
      <section className="dashboard-actions-card">
        <h3 className="dashboard-table-title" style={{ marginBottom: '1.25rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          Clinical Actions
        </h3>
        <div className="dashboard-actions-grid">
          <button 
            onClick={() => navigate('/patients')} 
            className="dashboard-action-btn secondary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
            Register Patient
          </button>
          <button 
            onClick={() => navigate('/foods')} 
            className="dashboard-action-btn secondary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            Index Food Item
          </button>
          <button 
            onClick={() => navigate('/dietplans')} 
            className="dashboard-action-btn primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            Formulate Diet Plan
          </button>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
