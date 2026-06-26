import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import { Pie } from 'react-chartjs-2';

function DoshaQuiz() {
  const [step, setStep] = useState('intro'); // 'intro', 'personal', 'quiz', 'results'
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
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
    setLoading(false);
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

      setMessage('PDF downloaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('PDF download error:', error);
      setMessage('Error downloading PDF');
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

  // Get dosha color
  const getDoshaColor = (dosha) => {
    const colors = {
      Vata: '#9C27B0',
      Pitta: '#FF5722',
      Kapha: '#4CAF50'
    };
    return colors[dosha] || '#999';
  };

  // Render functions for each step
  const renderIntro = () => (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🧘</div>
      <h2 style={{ color: '#2C5F2D', marginBottom: '20px' }}>Discover Your Dosha</h2>
      <p style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', lineHeight: '1.8', color: '#555', marginBottom: '30px' }}>
        Take this comprehensive Ayurvedic assessment to discover your unique mind-body constitution (Prakriti). 
        Answer 20 questions about your physical characteristics, mental tendencies, and lifestyle preferences 
        to receive personalized health and diet recommendations.
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px',
        textAlign: 'left'
      }}>
        <div style={{ padding: '20px', backgroundColor: '#f3e5f5', borderRadius: '8px' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚖️</div>
          <h4 style={{ color: '#7b1fa2', marginBottom: '8px' }}>Vata</h4>
          <p style={{ fontSize: '14px', color: '#666' }}>Air & Ether - Movement, creativity, quick thinking</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#fbe9e7', borderRadius: '8px' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔥</div>
          <h4 style={{ color: '#d84315', marginBottom: '8px' }}>Pitta</h4>
          <p style={{ fontSize: '14px', color: '#666' }}>Fire & Water - Transformation, intelligence, passion</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>🌿</div>
          <h4 style={{ color: '#2e7d32', marginBottom: '8px' }}>Kapha</h4>
          <p style={{ fontSize: '14px', color: '#666' }}>Earth & Water - Structure, stability, endurance</p>
        </div>
      </div>

      <button 
        onClick={() => setStep('personal')}
        style={{ 
          padding: '15px 40px', 
          backgroundColor: '#2C5F2D', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px',
          fontSize: 'clamp(1rem, 2vw, 1.125rem)',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        Start Assessment
      </button>

      <p style={{ marginTop: '20px', fontSize: '14px', color: '#999' }}>
        ⏱️ Takes approximately 5-7 minutes
      </p>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#2C5F2D', marginBottom: '20px', textAlign: 'center' }}>Personal Information</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Please provide some basic information to personalize your results
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            Full Name *
          </label>
          <input
            type="text"
            value={personalInfo.name}
            onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
            placeholder="Enter your full name"
            required
            style={{ width: '100%', padding: '12px', fontSize: '16px' }}
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            Email (Optional)
          </label>
          <input
            type="email"
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
            placeholder="your@email.com"
            style={{ width: '100%', padding: '12px', fontSize: '16px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Age *
            </label>
            <input
              type="number"
              value={personalInfo.age}
              onChange={(e) => setPersonalInfo({ ...personalInfo, age: e.target.value })}
              placeholder="25"
              min="1"
              max="120"
              required
              style={{ width: '100%', padding: '12px', fontSize: '16px' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Gender *
            </label>
            <select
              value={personalInfo.gender}
              onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
              required
              style={{ width: '100%', padding: '12px', fontSize: '16px' }}
            >
              <option value="">Select</option>
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

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            onClick={() => setStep('intro')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Back
          </button>
          <button
            onClick={startQuiz}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#2C5F2D',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Continue to Quiz
          </button>
        </div>
      </div>
    </div>
  );

  const renderQuiz = () => {
    if (questions.length === 0) return <p>Loading questions...</p>;

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span style={{ fontSize: '14px', color: '#2C5F2D', fontWeight: 'bold' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e0e0e0', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${progress}%`, 
              height: '100%', 
              backgroundColor: '#2C5F2D',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Question */}
        <div style={{ marginBottom: '30px' }}>
          <span style={{ 
            display: 'inline-block',
            padding: '4px 12px',
            backgroundColor: '#e8f5e9',
            color: '#2C5F2D',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '15px'
          }}>
            {currentQuestion.category.toUpperCase()}
          </span>
          <h3 style={{ fontSize: 'clamp(1.125rem, 3vw, 1.5rem)', color: '#333', lineHeight: '1.6' }}>
            {currentQuestion.question}
          </h3>
        </div>

        {/* Answer Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option.text)}
              style={{
                padding: '20px',
                backgroundColor: 'white',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                transition: 'all 0.2s ease',
                color: '#333'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = getDoshaColor(option.dosha);
                e.target.style.backgroundColor = '#f9f9f9';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.backgroundColor = 'white';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  border: '2px solid #ddd',
                  flexShrink: 0
                }} />
                <span>{option.text}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px', animation: 'spin 2s linear infinite' }}>
        🌀
      </div>
      <h3 style={{ color: '#2C5F2D', marginBottom: '10px' }}>Analyzing Your Responses...</h3>
      <p style={{ color: '#666' }}>
        Calculating your unique dosha constitution based on Ayurvedic principles
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
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Results Header */}
        <div className="card" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '15px' }}>🎉</div>
          <h2 style={{ color: '#2C5F2D', marginBottom: '10px' }}>Your Dosha Assessment Results</h2>
          <p style={{ fontSize: '18px', color: '#666' }}>
            Hello <strong>{personalInfo.name}</strong>, here's your personalized Ayurvedic constitution
          </p>
        </div>

        {/* Dosha Percentages & Chart */}
        <div className="grid mb-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div className="card">
            <h3 className="mb-2">Your Dosha Distribution</h3>
            <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>

          <div className="card">
            <h3 className="mb-2">Constitution Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold', color: '#9C27B0' }}>⚖️ Vata</span>
                  <span style={{ fontWeight: 'bold' }}>{results.vata}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
                  <div style={{ 
                    width: `${results.vata}%`, 
                    height: '100%', 
                    backgroundColor: '#9C27B0', 
                    borderRadius: '5px',
                    transition: 'width 1s ease'
                  }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold', color: '#FF5722' }}>🔥 Pitta</span>
                  <span style={{ fontWeight: 'bold' }}>{results.pitta}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
                  <div style={{ 
                    width: `${results.pitta}%`, 
                    height: '100%', 
                    backgroundColor: '#FF5722', 
                    borderRadius: '5px',
                    transition: 'width 1s ease'
                  }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold', color: '#4CAF50' }}>🌿 Kapha</span>
                  <span style={{ fontWeight: 'bold' }}>{results.kapha}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
                  <div style={{ 
                    width: `${results.kapha}%`, 
                    height: '100%', 
                    backgroundColor: '#4CAF50', 
                    borderRadius: '5px',
                    transition: 'width 1s ease'
                  }} />
                </div>
              </div>
            </div>

            <div style={{ 
              marginTop: '30px', 
              padding: '20px', 
              backgroundColor: '#e8f5e9', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#2C5F2D', marginBottom: '5px' }}>Primary Dosha</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: getDoshaColor(results.primaryDosha), margin: 0 }}>
                {results.primaryDosha}
              </p>
              {results.secondaryDosha && (
                <>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Secondary: {results.secondaryDosha}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Diet Recommendations */}
        <div className="card mb-3">
          <h3 className="mb-2">🍎 Diet Recommendations</h3>
          <ul style={{ lineHeight: '1.8', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
            {results.dietRecommendations && results.dietRecommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>

        {/* Foods to Favor */}
        <div className="grid mb-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div className="card" style={{ backgroundColor: '#e8f5e9' }}>
            <h3 className="mb-2" style={{ color: '#2C5F2D' }}>✅ Foods to Favor</h3>
            <ul style={{ lineHeight: '1.6', fontSize: '14px' }}>
              {results.foodsToFavor && results.foodsToFavor.map((food, index) => (
                <li key={index}>{food}</li>
              ))}
            </ul>
          </div>

          <div className="card" style={{ backgroundColor: '#ffebee' }}>
            <h3 className="mb-2" style={{ color: '#c62828' }}>❌ Foods to Avoid</h3>
            <ul style={{ lineHeight: '1.6', fontSize: '14px' }}>
              {results.foodsToAvoid && results.foodsToAvoid.map((food, index) => (
                <li key={index}>{food}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lifestyle Recommendations */}
        <div className="card mb-3">
          <h3 className="mb-2">🧘 Lifestyle Recommendations</h3>
          <ul style={{ lineHeight: '1.8', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
            {results.lifestyleRecommendations && results.lifestyleRecommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={downloadPDF}
              style={{
                padding: '15px 30px',
                backgroundColor: '#2C5F2D',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                flex: '1 1 200px'
              }}
            >
              📄 Download PDF Report
            </button>
            <button
              onClick={restartQuiz}
              style={{
                padding: '15px 30px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                flex: '1 1 200px'
              }}
            >
              🔄 Take Quiz Again
            </button>
          </div>
          {message && (
            <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`} style={{ marginTop: '15px' }}>
              {message}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Main render
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
