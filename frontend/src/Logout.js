import React from 'react';

function Logout() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Redirect to login page after logout
  };

  return (
    <button onClick={handleLogout} style={{ marginLeft: '15px', padding: '8px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
      Logout
    </button>
  );
}

export default Logout;
