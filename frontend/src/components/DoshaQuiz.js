import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import { Pie } from 'react-chartjs-2';

function DoshaQuiz() {
  const [step, setStep] = useState('intro'); // 'intro', 'personal', 'quiz', 'results'
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [results, setResults] = useState(null);
  const [assessmentId, setAssessmentId] = useState(null);
  const [message, setMessage] = useState('');
  
  // Personal info
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    age: '',
    gender: ''
  });

  // Fetch questions on component mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const data = await apiClient('http://localhost:5000/api/dosha/questions');
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setMessage('Error loading quiz questions');
    }
  };

  const startQuiz = () => {
    const { name, age, gender } = personalInfo;
    if (!name || !age || !gender) {
      setMessage('Please fill in all required fields');
      return;
    }
    setMessage('');
    setStep('quiz');
  };

  const handleAnswer = (answer) => {
    const newResponses = [...responses, {
      questionId: questions[currentQuestionIndex].id,
      answer: answer
    }];
    setResponses(newResponses);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitQuiz(newResponses);
    }
  };

  const submitQuiz = async (finalResponses) => {
    setStep('loading');
    try {
      const payload = {
        ...personalInfo,
        age: parseInt(personalInfo.age),
        responses: finalResponses
      };

      const data = await apiClient('http://localhost:5000/api/dosha/submit', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setResults(data.results);
      setAssessmentId(data.assessmentId);
      setStep('results');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setMessage('Error submitting quiz. Please try again.');
      setStep('quiz');
    }
  };

  const downloadPDF = async () => {
    try {
      setMessage('Generating PDF...');
      const response = await fetch(`http://localhost:5000/api/dosha/${assessmentId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dosha-report-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage('✅ PDF downloaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('PDF download error:', error);
      setMessage('❌ Error downloading PDF');
    }
  };

  const restartQuiz = () => {
    setStep('intro');
    setCurrentQuestionIndex(0);
    setResponses([]);
    setResults(null);
    setAssessmentId(null);
    setPersonalInfo({ name: '', email: '', age: '', gender: '' });
    setMessage('');
  };

  const getDoshaColor = (dosha) => {
    const colors = {
      Vata: '#9C27B0',  // Purple
      Pitta: '#FF5722', // Deep Orange
      Kapha: '#4CAF50'  // Green
    };
    return colors[dosha] || '#607D8B';
  };

  // Render functions for each step
  const renderIntro = () => (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem', animation: 'bounce 2.5s infinite' }}>🧘</div>
      <h2 style={{ color: 'var(--primary-dark)', fontFamily: "'Playfair Display', serif" }}>Discover Your Dosha</h2>
      <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#555', marginBottom: '2rem' }}>
        Take this diagnostic Ayurvedic Prakriti assessment to identify your mind-body constitution.
        Select physical features and emotional traits that closely match your natural baseline.
      </p>

      <div className="grid mb-4" style={{ textAlign: 'left', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div style={{ padding: '20px', backgroundColor: '#F3E5F5', borderRadius: '12px', borderLeft: '4px solid #9C27B0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚖️</div>
          <h4 style={{ color: '#7B1FA2', margin: '0 0 5px 0', fontFamily: "'Playfair Display', serif" }}>Vata Dosha</h4>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>Air & Space: Governs movement, respiration, activity, and creative expression.</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#FBE9E7', borderRadius: '12px', borderLeft: '4px solid #FF5722' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔥</div>
          <h4 style={{ color: '#D84315', margin: '0 0 5px 0', fontFamily: "'Playfair Display', serif" }}>Pitta Dosha</h4>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>Fire & Water: Governs digestion, metabolic transformation, and intellect.</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#E8F5E9', borderRadius: '12px', borderLeft: '4px solid #4CAF50' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🌿</div>
          <h4 style={{ color: '#2E7D32', margin: '0 0 5px 0', fontFamily: "'Playfair Display', serif" }}>Kapha Dosha</h4>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>Earth & Water: Governs tissue structures, lubrication, resistance, and stability.</p>
        </div>
      </div>

      <button 
        onClick={() => setStep('personal')}
        className="btn btn-large"
      >
        Start Quiz (20 Questions)
      </button>

      <p style={{ marginTop: '15px', fontSize: '0.85rem', color: '#999' }}>
        ⏱️ Takes approximately 5-7 minutes.
      </p>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--primary-dark)', marginBottom: '10px', textAlign: 'center', fontFamily: "'Playfair Display', serif" }}>Personal Profile</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
        Provide details to record your assessment results on the progress graphs.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            value={personalInfo.name}
            onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address (Optional)</label>
          <input
            type="email"
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
            placeholder="your@email.com"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Age *</label>
            <input
              type="number"
              value={personalInfo.age}
              onChange={(e) => setPersonalInfo({ ...personalInfo, age: e.target.value })}
              placeholder="e.g., 25"
              min="1"
              max="120"
              required
            />
          </div>

          <div className="form-group">
            <label>Gender *</label>
            <select
              value={personalInfo.gender}
              onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {message && (
          <div className="alert alert-error">
            {message}
          </div>
        )}

        <div className="form-actions" style={{ borderTop: 'none', paddingTop: 0, marginTop: '1rem' }}>
          <button
            onClick={() => setStep('intro')}
            className="btn btn-outline"
            style={{ flex: 1 }}
          >
            Back
          </button>
          <button
            onClick={startQuiz}
            className="btn btn-success"
            style={{ flex: 1 }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  const renderQuiz = () => {
    if (questions.length === 0) return <div className="container"><p className="text-center">Loading quiz items...</p></div>;

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeInDown 0.4s ease-out' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#E0E0E0', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${progress}%`, 
              height: '100%', 
              backgroundColor: 'var(--primary-color)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Question Heading */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ 
            display: 'inline-block',
            padding: '4px 12px',
            backgroundColor: '#E8F5E9',
            color: 'var(--primary-color)',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            marginBottom: '10px',
            textTransform: 'uppercase'
          }}>
            Category: {currentQuestion.category}
          </span>
          <h3 style={{ fontSize: '1.4rem', color: '#333', lineHeight: '1.5', margin: 0, fontFamily: "'Playfair Display', serif" }}>
            {currentQuestion.question}
          </h3>
        </div>

        {/* Answer Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQuestion.options.map((option, index) => {
            const dColor = getDoshaColor(option.dosha);
            return (
              <button
                key={index}
                onClick={() => handleAnswer(option.text)}
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'white',
                  border: '2px solid #E0E0E0',
                  borderRadius: '10px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = dColor;
                  e.currentTarget.style.backgroundColor = '#F8FAFB';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E0E0E0';
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ 
                  width: '18px', 
                  height: '18px', 
                  borderRadius: '50%', 
                  border: '2px solid #ccc',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }} />
                <span>{option.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem', animation: 'spin 2s linear infinite', display: 'inline-block' }}>
        🌀
      </div>
      <h3 style={{ color: 'var(--primary-color)', marginBottom: '10px', fontFamily: "'Playfair Display', serif" }}>Calculating Prakriti...</h3>
      <p style={{ color: '#666' }}>
        Determining your physiological ratios of Vata, Pitta, and Kapha constitution elements.
      </p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  const renderResults = () => {
    if (!results) return null;

    const chartData = {
      labels: ['Vata', 'Pitta', 'Kapha'],
      datasets: [{
        data: [results.vata, results.pitta, results.kapha],
        backgroundColor: ['#9C27B0', '#FF5722', '#4CAF50'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeInDown 0.5s ease-out' }}>
        {/* Results Header */}
        <div className="card text-center mb-4">
          <div style={{ fontSize: '4.5rem', marginBottom: '10px' }}>🎉</div>
          <h2 style={{ color: 'var(--primary-dark)', margin: 0, fontFamily: "'Playfair Display', serif" }}>Your Constitutional Prakriti</h2>
          <p style={{ fontSize: '1.1rem', color: '#666', marginTop: '10px' }}>
            Hello <strong>{personalInfo.name}</strong>, here is your personalized mind-body blueprint report:
          </p>
        </div>

        {/* Dosha Percentages & Chart */}
        <div className="grid mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <div className="card">
            <h3 className="mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Dosha Percentage Chart</h3>
            <div style={{ maxHeight: '280px', display: 'flex', justifyContent: 'center' }}>
              <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: true }} />
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
            <h3 className="mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Elemental Score</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <div style={{ display: 'flex', justify: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold', color: '#9C27B0' }}>⚖️ Vata</span>
                  <span style={{ fontWeight: 'bold' }}>{results.vata}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', backgroundColor: '#F0F0F0', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${results.vata}%`, height: '100%', backgroundColor: '#9C27B0' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justify: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold', color: '#FF5722' }}>🔥 Pitta</span>
                  <span style={{ fontWeight: 'bold' }}>{results.pitta}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', backgroundColor: '#F0F0F0', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${results.pitta}%`, height: '100%', backgroundColor: '#FF5722' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justify: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold', color: '#4CAF50' }}>🌿 Kapha</span>
                  <span style={{ fontWeight: 'bold' }}>{results.kapha}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', backgroundColor: '#F0F0F0', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${results.kapha}%`, height: '100%', backgroundColor: '#4CAF50' }} />
                </div>
              </div>
            </div>

            <div style={{ 
              marginTop: '25px', 
              padding: '15px', 
              backgroundColor: '#E8F5E9', 
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #C8E6C9'
            }}>
              <h4 style={{ color: '#2E7D32', margin: '0 0 5px 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Primary Dosha Type</h4>
              <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: getDoshaColor(results.primaryDosha), margin: 0 }}>
                {results.primaryDosha}
              </p>
              {results.secondaryDosha && (
                <p style={{ fontSize: '0.85rem', color: '#666', margin: '4px 0 0 0' }}>Secondary Influence: {results.secondaryDosha}</p>
              )}
            </div>
          </div>
        </div>

        {/* Diet Recommendations */}
        <div className="card mb-4" style={{ borderLeft: '5px solid var(--primary-color)' }}>
          <h3 className="mb-3" style={{ color: 'var(--primary-dark)', fontFamily: "'Playfair Display', serif" }}>🍎 Ayurvedic Diet Guidance</h3>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8', margin: 0 }}>
            {results.dietRecommendations && results.dietRecommendations.map((rec, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>{rec}</li>
            ))}
          </ul>
        </div>

        {/* Foods to Favor & Avoid */}
        <div className="grid mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <div className="card" style={{ backgroundColor: '#E8F5E9', border: '1px solid #C8E6C9' }}>
            <h3 className="mb-3" style={{ color: '#2E7D32', fontFamily: "'Playfair Display', serif" }}>✅ Recommended Foods</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6', margin: 0, fontSize: '0.925rem' }}>
              {results.foodsToFavor && results.foodsToFavor.map((food, index) => (
                <li key={index} style={{ marginBottom: '4px' }}>{food}</li>
              ))}
            </ul>
          </div>

          <div className="card" style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2' }}>
            <h3 className="mb-3" style={{ color: '#C62828', fontFamily: "'Playfair Display', serif" }}>❌ Foods to Limit / Avoid</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6', margin: 0, fontSize: '0.925rem' }}>
              {results.foodsToAvoid && results.foodsToAvoid.map((food, index) => (
                <li key={index} style={{ marginBottom: '4px' }}>{food}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lifestyle Recommendations */}
        <div className="card mb-4" style={{ borderLeft: '5px solid var(--info-color)' }}>
          <h3 className="mb-3" style={{ color: '#0D47A1', fontFamily: "'Playfair Display', serif" }}>🧘 Lifestyle & Vihara Recommendations</h3>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8', margin: 0 }}>
            {results.lifestyleRecommendations && results.lifestyleRecommendations.map((rec, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>{rec}</li>
            ))}
          </ul>
        </div>

        {/* Action Panel */}
        <div className="card text-center">
          {message && (
            <div className={`alert ${message.includes('❌') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '1.5rem' }}>
              {message}
            </div>
          )}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={downloadPDF}
              className="btn btn-large"
              style={{ flex: 1, minWidth: '220px' }}
            >
              📄 Download PDF Report
            </button>
            <button
              onClick={restartQuiz}
              className="btn btn-large btn-outline"
              style={{ flex: 1, minWidth: '220px' }}
            >
              🔄 Take Quiz Again
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      {step === 'intro' && renderIntro()}
      {step === 'personal' && renderPersonalInfo()}
      {step === 'quiz' && renderQuiz()}
      {step === 'loading' && renderLoading()}
      {step === 'results' && renderResults()}
    </div>
  );
}

export default DoshaQuiz;
