import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

function ProgressDashboard() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [newEntry, setNewEntry] = useState({
    weight: '',
    bp: '',
    bloodSugar: '',
    sleepQuality: '',
    mood: '',
    digestion: '',
    notes: '',
  });
  const [error, setError] = useState('');

  // Always send JWT token (for protected route)
  const fetchData = useCallback(async () => {
    if (!user?._id) return;
    try {
      const data = await apiClient(`http://localhost:5000/api/progress/${user._id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setRecords(data);
      setError('');
    } catch (err) {
      setError('Could not load progress entries.');
      console.error('Error loading progress data:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient('http://localhost:5000/api/progress', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...newEntry, patientId: user?._id }),
      });
      setNewEntry({ weight: '', bp: '', bloodSugar: '', sleepQuality: '', mood: '', digestion: '', notes: '' });
      fetchData();
    } catch (err) {
      setError('Error saving entry. Please check your inputs or login status.');
    }
  };

  const chartData = {
    labels: records.map(r => new Date(r.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Weight (kg)',
        data: records.map(r => r.weight),
        fill: false,
        borderColor: '#2C5F2D',
        tension: 0.3,
      },
      {
        label: 'Mood (1-10)',
        data: records.map(r => r.mood),
        fill: false,
        borderColor: '#7b1fa2',
        tension: 0.3,
      },
      {
        label: 'Digestion (1-10)',
        data: records.map(r => r.digestion),
        fill: false,
        borderColor: '#388e3c',
        tension: 0.3,
      }
    ]
  };

  return (
    <div className="container">
      <h2>📈 Health Progress Dashboard</h2>
      <p style={{ color: '#666' }}>Track your daily well-being and witness your improvements over time.</p>

      {/* Error message (if any) */}
      {error && (<div className="alert alert-error" style={{ margin: '12px 0' }}>{error}</div>)}

      {/* Add Progress Entry */}
      <div className="card" style={{ marginTop: '30px' }}>
        <h3>Add New Progress Entry</h3>
        <form onSubmit={handleSubmit} className="grid" style={{ gap: '10px' }}>
          <input type="number" min="0" max="500" step="0.1" placeholder="Weight (kg)" value={newEntry.weight} onChange={e => setNewEntry({ ...newEntry, weight: e.target.value })} />
          <input placeholder="Blood Pressure (e.g., 120/80)" value={newEntry.bp} onChange={e => setNewEntry({ ...newEntry, bp: e.target.value })} />
          <input type="number" min="0" max="600" step="0.1" placeholder="Blood Sugar" value={newEntry.bloodSugar} onChange={e => setNewEntry({ ...newEntry, bloodSugar: e.target.value })} />
          <input type="number" min="1" max="10" placeholder="Sleep Quality 1-10" value={newEntry.sleepQuality} onChange={e => setNewEntry({ ...newEntry, sleepQuality: e.target.value })} />
          <input type="number" min="1" max="10" placeholder="Mood 1-10" value={newEntry.mood} onChange={e => setNewEntry({ ...newEntry, mood: e.target.value })} />
          <input type="number" min="1" max="10" placeholder="Digestion 1-10" value={newEntry.digestion} onChange={e => setNewEntry({ ...newEntry, digestion: e.target.value })} />
          <textarea placeholder="Notes" value={newEntry.notes} onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })} />
          <button type="submit" style={{ backgroundColor: '#2C5F2D', color: 'white', border: 'none', borderRadius: '5px', padding: '10px' }}>Save Progress</button>
        </form>
      </div>

      {/* Chart Section */}
      <div className="card" style={{ marginTop: '40px' }}>
        <h3 style={{ marginBottom: '15px' }}>Your Wellness Trends Over Time</h3>
        {records.length > 0 ? (
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
        ) : (
          <p>No data yet. Start tracking your progress above!</p>
        )}
      </div>

      {/* Table Summary */}
      {records.length > 0 && (
        <div className="card" style={{ marginTop: '30px' }}>
          <h3>📅 Recent Entries</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>BP</th>
                  <th>Blood Sugar</th>
                  <th>Sleep</th>
                  <th>Mood</th>
                  <th>Digestion</th>
                </tr>
              </thead>
              <tbody>
                {records.slice(-5).reverse().map(r => (
                  <tr key={r._id}>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>{r.weight}</td>
                    <td>{r.bp}</td>
                    <td>{r.bloodSugar}</td>
                    <td>{r.sleepQuality}</td>
                    <td>{r.mood}</td>
                    <td>{r.digestion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressDashboard;
