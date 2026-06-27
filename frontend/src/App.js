// src/App.js
// ==================== COMPLETE APP.JS - ALL FEATURES ====================
// Updated: October 29, 2025
// Features: All previous + Doctor Directory & Appointment Booking + Admin Panel

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ChatBox from './ChatBox';

// ==================== COMPONENT IMPORTS ====================
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import Foods from './components/Foods';
import Login from './Login';
import Register from './components/Register';
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

import './index.css';
import './Navbar.css';

// ==================== LOGOUT COMPONENT ====================
function Logout() {
  const handleLogout = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };
  return (
    <button
      onClick={handleLogout}
      className="navbar-logout-btn"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
      Logout
    </button>
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
      <div className="bg-hero" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Responsive Navbar */}
        <nav className="app-navbar">
          <div className="navbar-container">
            {/* Logo + User Greeting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <Link to="/" className="navbar-brand">
                <span className="navbar-brand-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-15deg)' }}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 5.5a7 7 0 0 1-7 7V20H11Z"></path><path d="M19 9H13"></path></svg>
                </span>
                <span>Swasthya <span className="navbar-brand-highlight">Sutra</span></span>
              </Link>

              {/* Show user greeting if logged in */}
              {loggedIn &&
                (() => {
                  const user = JSON.parse(localStorage.getItem('user') || '{}');
                  return (
                    <span className="navbar-greeting">
                      👋 Welcome, <strong>{user.username}</strong> ({user.role})
                    </span>
                  );
                })()}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="navbar-toggle"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>

            {/* Navigation Links */}
            <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
              {/* Base Navigation Links */}
              <Link to="/" onClick={closeMobileMenu} className="navbar-link">
                Home
              </Link>

              {loggedIn && (
                <>
                  <Link to="/dashboard" onClick={closeMobileMenu} className="navbar-link">
                    Dashboard
                  </Link>
                  <Link to="/knowledge" onClick={closeMobileMenu} className="navbar-link">
                    Knowledge
                  </Link>
                  <Link to="/symptom-checker" onClick={closeMobileMenu} className="navbar-link">
                    Symptoms
                  </Link>
                  <Link to="/dosha-quiz" onClick={closeMobileMenu} className="navbar-link">
                    Quiz
                  </Link>
                  <Link to="/progress" onClick={closeMobileMenu} className="navbar-link">
                    Progress
                  </Link>
                  <Link to="/patients" onClick={closeMobileMenu} className="navbar-link">
                    Patients
                  </Link>
                  <Link to="/foods" onClick={closeMobileMenu} className="navbar-link">
                    Foods
                  </Link>
                  <Link to="/dietplans" onClick={closeMobileMenu} className="navbar-link">
                    Diet Plans
                  </Link>
                </>
              )}

              {/* PATIENT-ONLY LINKS */}
              {loggedIn &&
                (() => {
                  const user = JSON.parse(localStorage.getItem('user') || '{}');
                  return user.role === 'patient' ? (
                    <>
                      <Link
                        to="/doctors"
                        onClick={closeMobileMenu}
                        className="navbar-link patient-only"
                      >
                        Find Doctors
                      </Link>
                      <Link
                        to="/appointments"
                        onClick={closeMobileMenu}
                        className="navbar-link patient-only"
                      >
                        My Appointments
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
                        className="navbar-link doctor-only"
                      >
                        Appointments
                      </Link>
                      <Link
                        to="/doctor-profile"
                        onClick={closeMobileMenu}
                        className="navbar-link doctor-profile"
                      >
                        My Profile
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
                        className="navbar-link admin-only"
                      >
                        Doctors
                      </Link>
                      <Link
                        to="/appointments"
                        onClick={closeMobileMenu}
                        className="navbar-link admin-only"
                      >
                        Appointments
                      </Link>
                      <Link
                        to="/admin-panel"
                        onClick={closeMobileMenu}
                        className="navbar-link admin-badge"
                      >
                        Admin Panel
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
                    className="navbar-auth-login"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="navbar-auth-register"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center' }}>
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
