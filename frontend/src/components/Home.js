import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

  const isOnline = !loading && backendStatus?.status !== 'error';
  const statusText = loading ? 'Connecting to system...' : isOnline ? 'All systems calm' : 'System offline';
  const statusColor = loading ? '#E5AF0E' : isOnline ? '#10B981' : '#EF4444';

  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 15c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z"></path><path d="M12 9c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"></path></svg>
      ),
      title: 'Dosha Assessment Quiz',
      desc: 'Discover your unique Ayurvedic mind-body constitution (Prakriti).',
      link: '/dosha-quiz'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="8" y1="11" x2="16" y2="11"></line><line x1="12" y1="7" x2="12" y2="15"></line></svg>
      ),
      title: 'AI Symptom Checker',
      desc: 'Get personalized Ayurvedic analysis and food suggestions for your symptoms.',
      link: '/symptom-checker'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5h20c0-2.31-1-4.24-2.5-5.5"></path><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"></path><path d="M16 11h-2.5V8.5h-3V11H8v3h2.5v2.5h3V14H16z"></path></svg>
      ),
      title: 'Doctor Directory',
      desc: 'Find certified Ayurvedic practitioners and book virtual or physical consultations.',
      link: '/doctors'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      ),
      title: 'Appointment Booking',
      desc: 'Schedule, reschedule, and manage your health consultations effortlessly.',
      link: '/book-appointment'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
      ),
      title: 'Ayurvedic Food Database',
      desc: 'Explore foods categorized by taste (Rasa), potency (Virya), and dosha effects.',
      link: '/foods'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      ),
      title: 'Personalized Diet Plans',
      desc: 'Receive tailored nutrition and meal plans designed specifically for your constitution.',
      link: '/dietplans'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M8 10h.01"></path><path d="M12 10h.01"></path><path d="M16 10h.01"></path></svg>
      ),
      title: 'AI Chatbot Assistant',
      desc: 'Get instant Ayurvedic dietary answers powered by advanced Gemini AI.',
      link: '#chat'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
      ),
      title: 'Progress Tracker',
      desc: 'Monitor your health metrics, quizzes, and wellness journey over time.',
      link: '/progress'
    }
  ];

  const handleChatLink = (e, link) => {
    if (link === '#chat') {
      e.preventDefault();
      // Look for the toggle button in our ChatBox component and simulate a click
      const chatToggle = document.querySelector('.chatbox-toggle');
      if (chatToggle) {
        chatToggle.click();
      }
    }
  };

  return (
    <div className="container">
      {/* 1. Hero Grid Section */}
      <section className="home-hero-grid">
        <div className="home-hero-left">
          {/* Status Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--secondary)',
            border: '1px solid oklch(88% .022 130 / 0.4)',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.825rem',
            fontWeight: '500',
            color: 'var(--secondary-foreground)',
            marginBottom: '1.75rem'
          }}>
            <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px' }}>
              {isOnline && (
                <span style={{
                  position: 'absolute',
                  display: 'inline-flex',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: statusColor,
                  opacity: 0.75,
                  animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                }} />
              )}
              <span style={{
                position: 'relative',
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: statusColor
              }} />
            </span>
            {statusText}
          </div>

          <h1 className="font-display" style={{ color: 'var(--foreground)', margin: '0 0 1.5rem 0', lineHeight: '1.1', fontSize: 'clamp(2.5rem, 6vw, 4.25rem)' }}>
            Your Ancient Blueprint for <span style={{ color: 'var(--primary)' }}>Modern Longevity</span>
          </h1>
          
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--muted-foreground)', maxWidth: '560px', margin: '0 0 2.5rem 0', lineHeight: '1.6' }}>
            Discover balance, personalize your nutrition, and heal through Ayurveda. Swasthya Sutra maps your unique constitution for optimal health.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '3.5rem' }}>
            <Link to="/dosha-quiz" className="btn" style={{ padding: '0.85rem 2rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              Discover your dosha
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
            <a href="#features" className="btn btn-outline" style={{ padding: '0.85rem 2rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', border: '1px solid var(--border)', color: 'var(--foreground)', background: 'var(--card)' }}>
              Explore the practice
            </a>
          </div>

          {/* Core Stats DL */}
          <dl style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
            margin: '0',
            padding: '2.5rem 0 0 0',
            borderTop: '1px solid oklch(88% .022 130 / 0.5)',
            width: '100%',
            maxWidth: '560px'
          }}>
            <div>
              <dd style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: '500', color: 'var(--foreground)', fontFamily: "'Cormorant Garamond', serif", margin: '0 0 0.15rem 0', lineHeight: '1' }}>120+</dd>
              <dt style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)', fontWeight: '500', margin: '0' }}>Certified vaidyas</dt>
            </div>
            <div>
              <dd style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: '500', color: 'var(--foreground)', fontFamily: "'Cormorant Garamond', serif", margin: '0 0 0.15rem 0', lineHeight: '1' }}>10k+</dd>
              <dt style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)', fontWeight: '500', margin: '0' }}>Happy patients</dt>
            </div>
            <div>
              <dd style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: '500', color: 'var(--foreground)', fontFamily: "'Cormorant Garamond', serif", margin: '0 0 0.15rem 0', lineHeight: '1' }}>99%</dd>
              <dt style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)', fontWeight: '500', margin: '0' }}>Accuracy Rate</dt>
            </div>
          </dl>
        </div>

        <div className="home-hero-right">
          {/* Prakriti Element Distribution Card */}
          <div className="animate-float-slow" style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '250px', height: '250px', borderRadius: '50%', background: 'oklch(91% .025 135 / 0.4)', filter: 'blur(50px)', zIndex: 1 }} />
            
            <div className="glass-card" style={{ position: 'relative', zIndex: 2, padding: '2.5rem', borderRadius: '24px', boxShadow: 'var(--shadow-elegant)' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Your Prakriti</span>
              <h3 className="font-display" style={{ margin: '0 0 1.5rem 0', fontSize: '1.85rem', fontWeight: '500', color: 'var(--foreground)' }}>Vata Dominance</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Vata */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    <span>Vata (Air & Ether)</span>
                    <span style={{ color: 'var(--primary)' }}>58%</span>
                  </div>
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'oklch(92% .02 130)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '58%', backgroundColor: 'var(--primary)', borderRadius: '9999px' }} />
                  </div>
                </div>

                {/* Pitta */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    <span>Pitta (Fire & Water)</span>
                    <span style={{ color: 'var(--clay)' }}>27%</span>
                  </div>
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'oklch(92% .02 130)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '27%', backgroundColor: 'var(--clay)', borderRadius: '9999px' }} />
                  </div>
                </div>

                {/* Kapha */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    <span>Kapha (Earth & Water)</span>
                    <span style={{ color: 'oklch(60% .02 145)' }}>15%</span>
                  </div>
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'oklch(92% .02 130)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '15%', backgroundColor: 'oklch(79% .04 140)', borderRadius: '9999px' }} />
                  </div>
                </div>
              </div>
              
              <p style={{ margin: '1.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: '1.5' }}>
                Next Prakriti assessment scheduled in 14 days. Maintain warm, grounding routines to balance Vata.
              </p>
            </div>

            {/* Small Overlay Pill */}
            <div style={{
              position: 'absolute',
              bottom: '-1.25rem',
              left: '-1.25rem',
              zIndex: 3,
              backgroundColor: 'var(--card)',
              border: '1px solid oklch(88% .022 130 / 0.5)',
              borderRadius: '16px',
              padding: '0.75rem 1rem',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1rem' }}>🧘</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--foreground)', lineHeight: '1.2' }}>Constitutional state</span>
                <span style={{ fontSize: '0.625rem', color: 'var(--primary)', fontWeight: '500' }}>Vata-Pitta balance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Wellness Modalities Section */}
      <section id="features" style={{ marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Our Services</span>
          <h2 className="font-display" style={{ margin: '0 0 0.75rem 0', color: 'var(--foreground)' }}>Core Wellness Modalities</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted-foreground)', maxWidth: '580px', margin: '0 auto' }}>
            Select a custom modality to explore health and wellness recommendations mapped to your Prakriti.
          </p>
        </div>

        {/* Feature Cards Grid (gap-px simulation) */}
        <div className="home-features-grid">
          {features.map((feature, i) => (
            <Link
              key={i}
              to={feature.link}
              onClick={(e) => handleChatLink(e, feature.link)}
              className="home-feature-card"
            >
              <span className="home-feature-icon-wrapper">
                {feature.icon}
              </span>
              <h3 className="home-feature-title">{feature.title}</h3>
              <p className="home-feature-desc">{feature.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Workflow Journey Section */}
      <section style={{ marginBottom: '6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Your Path</span>
          <h2 className="font-display" style={{ margin: '0 0 0.75rem 0', color: 'var(--foreground)' }}>Begin Your Wellness Journey</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted-foreground)', maxWidth: '580px', margin: '0 auto' }}>
            A structured Ayurvedic approach designed to help you achieve balance, nutrition, and lasting longevity.
          </p>
        </div>

        <ol className="home-journey-list">
          {/* Step 1 */}
          <Link to="/register" className="home-journey-item">
            <span className="home-journey-num">01</span>
            <div className="home-journey-content">
              <h4 className="home-journey-title">Create Account</h4>
              <p className="home-journey-desc">Register to unlock personalized constitutional assessments, progress tracking, and expert directory access.</p>
            </div>
            <span className="home-journey-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </span>
          </Link>

          {/* Step 2 */}
          <Link to="/dosha-quiz" className="home-journey-item">
            <span className="home-journey-num">02</span>
            <div className="home-journey-content">
              <h4 className="home-journey-title">Find Your Dosha</h4>
              <p className="home-journey-desc">Complete the comprehensive Prakriti assessment quiz to identify your baseline ratios of Vata, Pitta, and Kapha.</p>
            </div>
            <span className="home-journey-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </span>
          </Link>

          {/* Step 3 */}
          <Link to="/symptom-checker" className="home-journey-item">
            <span className="home-journey-num">03</span>
            <div className="home-journey-content">
              <h4 className="home-journey-title">Analyze Symptoms</h4>
              <p className="home-journey-desc">Evaluate active physical or mental imbalances with our AI Symptom Checker for personalized dietary insights.</p>
            </div>
            <span className="home-journey-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </span>
          </Link>

          {/* Step 4 */}
          <Link to="/doctors" className="home-journey-item">
            <span className="home-journey-num">04</span>
            <div className="home-journey-content">
              <h4 className="home-journey-title">Consult Experts</h4>
              <p className="home-journey-desc">Schedule appointments with certified practitioners (Vaidyas), receive diet templates, and track your metrics.</p>
            </div>
            <span className="home-journey-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </span>
          </Link>
        </ol>
      </section>

      {/* 4. Elegant CTA Banner Section */}
      <section style={{ marginBottom: '6rem' }}>
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '32px',
          border: '1px solid oklch(88% .022 130 / 0.5)',
          backgroundColor: 'var(--card)',
          padding: '4rem 3rem',
          boxShadow: 'var(--shadow-elegant)',
          textAlign: 'center'
        }}>
          {/* Blurred Glow blobs */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'oklch(91% .025 135 / 0.4)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'oklch(79% .04 140 / 0.2)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px', margin: '0 auto' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', fontWeight: '600', display: 'block', marginBottom: '0.75rem' }}>Get Started</span>
            <h2 className="font-display" style={{ margin: '0 0 1rem 0', fontSize: '2.5rem', fontWeight: '500', color: 'var(--foreground)' }}>
              Begin your path to balance today.
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--muted-foreground)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
              Experience targeted Ayurvedic wellness diagnostics and diet plans tailored to your unique Prakriti. Join our community of wellness practitioners.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <Link to="/dosha-quiz" className="btn" style={{ padding: '0.8rem 1.75rem', borderRadius: '9999px', textDecoration: 'none', background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                Discover your dosha
              </Link>
              <Link to="/register" className="btn btn-outline" style={{ padding: '0.8rem 1.75rem', borderRadius: '9999px', textDecoration: 'none', border: '1px solid var(--border)', color: 'var(--foreground)', background: 'transparent' }}>
                Create your account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Sleek Premium Footer */}
      <footer style={{
        padding: '3rem 0',
        borderTop: '1px solid oklch(88% .022 130 / 0.5)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '1rem',
            display: 'grid',
            placeItems: 'center',
            width: '1.75rem',
            height: '1.75rem',
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            borderRadius: '50%'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-15deg)' }}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 5.5a7 7 0 0 1-7 7V20H11Z"></path><path d="M19 9H13"></path></svg>
          </span>
          <span className="font-display" style={{ fontSize: '1.15rem', fontWeight: '600', color: 'var(--foreground)' }}>
            Swasthya <span style={{ color: 'var(--primary)' }}>Sutra</span>
          </span>
          <span style={{ fontSize: '0.825rem', color: 'var(--muted-foreground)', marginLeft: '1rem' }}>
            © {new Date().getFullYear()} Swasthya Sutra. All rights reserved.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="#features" style={{ fontSize: '0.825rem', color: 'var(--muted-foreground)', textDecoration: 'none', transition: 'var(--transition-fast)' }} onMouseOver={(e) => e.target.style.color = 'var(--foreground)'} onMouseOut={(e) => e.target.style.color = 'var(--muted-foreground)'}>Features</a>
          <Link to="/knowledge" style={{ fontSize: '0.825rem', color: 'var(--muted-foreground)', textDecoration: 'none', transition: 'var(--transition-fast)' }} onMouseOver={(e) => e.target.style.color = 'var(--foreground)'} onMouseOut={(e) => e.target.style.color = 'var(--muted-foreground)'}>Knowledge Center</Link>
          <Link to="/dosha-quiz" style={{ fontSize: '0.825rem', color: 'var(--muted-foreground)', textDecoration: 'none', transition: 'var(--transition-fast)' }} onMouseOver={(e) => e.target.style.color = 'var(--foreground)'} onMouseOut={(e) => e.target.style.color = 'var(--muted-foreground)'}>Dosha Quiz</Link>
        </div>
      </footer>
    </div>
  );
}

export default Home;
