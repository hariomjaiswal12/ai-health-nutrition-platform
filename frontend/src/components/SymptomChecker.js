import React, { useState } from 'react';
import { apiClient } from '../utils/apiClient';

function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Common symptom suggestions
  const commonSymptoms = [
    'Headache',
    'Fatigue',
    'Digestive issues',
    'Joint pain',
    'Insomnia',
    'Anxiety',
    'Skin problems',
    'Cold/Flu',
    'Acidity',
    'Bloating',
    'Constipation',
    'Low appetite'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!symptoms.trim()) {
      setError('Please describe your symptoms');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const data = await apiClient(
        'http://localhost:5000/chatbot/symptom-checker',
        {
          method: 'POST',
          body: JSON.stringify({ symptoms })
        }
      );

      // If backend sends a message without analysis (e.g. rate limit / AI error)
      if (data && data.message && !data.analysis) {
        setError(data.message);
        setResults(null);
        setLoading(false);
        return;
      }

      // Expecting backend to send:
      // { analysis: string, recommendedFoods: [], totalFoodsInDb: number }
      if (!data || !data.analysis) {
        setError('Unable to analyze symptoms. Please try again.');
        setResults(null);
      } else {
        setResults({
          analysis: data.analysis || '',
          recommendedFoods: Array.isArray(data.recommendedFoods)
            ? data.recommendedFoods
            : [],
          totalFoodsInDb:
            typeof data.totalFoodsInDb === 'number'
              ? data.totalFoodsInDb
              : Array.isArray(data.recommendedFoods)
              ? data.recommendedFoods.length
              : 0
        });
      }
    } catch (err) {
      console.error('Error analyzing symptoms:', err);
      setError('Unable to analyze symptoms. Please try again.');
      setResults(null);
    }

    setLoading(false);
  };

  const addSymptom = (symptom) => {
    setSymptoms((prev) => (prev ? `${prev}, ${symptom}` : symptom));
  };

  const clearResults = () => {
    setResults(null);
    setSymptoms('');
    setError('');
  };

  return (
    <div className="container">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '64px', marginBottom: '15px' }}>🔍</div>
        <h1 style={{ color: '#2C5F2D', marginBottom: '10px' }}>
          Ayurvedic Symptom Checker
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.125rem)',
            color: '#666'
          }}
        >
          Get personalized Ayurvedic recommendations based on your symptoms
        </p>
      </div>

      {!results ? (
        <>
          {/* Symptom Input Form */}
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '20px' }}>Describe Your Symptoms</h3>

            <form onSubmit={handleSubmit}>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g., I have been experiencing frequent headaches, digestive discomfort, and difficulty sleeping..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '15px',
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  resize: 'vertical'
                }}
                required
              />

              {error && (
                <div
                  className="alert alert-error"
                  style={{ marginBottom: '20px' }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: loading ? '#ccc' : '#2C5F2D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.3s'
                }}
              >
                {loading ? '🔄 Analyzing...' : '🔍 Analyze Symptoms'}
              </button>
            </form>
          </div>

          {/* Quick Symptom Buttons */}
          <div
            className="card"
            style={{ maxWidth: '800px', margin: '30px auto 0' }}
          >
            <h3 style={{ marginBottom: '15px' }}>
              💡 Common Symptoms (Click to Add)
            </h3>
            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}
            >
              {commonSymptoms.map((symptom, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addSymptom(symptom)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ddd',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: 'clamp(0.875rem, 2vw, 0.95rem)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#2C5F2D';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f0f0f0';
                    e.target.style.color = '#000';
                  }}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div
            className="card"
            style={{
              maxWidth: '800px',
              margin: '30px auto 0',
              backgroundColor: '#f0f8ff'
            }}
          >
            <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>
              ℹ️ How It Works
            </h3>
            <ol
              style={{
                paddingLeft: '20px',
                lineHeight: '1.8',
                fontSize: 'clamp(0.9rem, 2vw, 1rem)'
              }}
            >
              <li>
                Describe your symptoms in detail (more detail = better
                recommendations)
              </li>
              <li>Our AI analyzes symptoms based on Ayurvedic principles</li>
              <li>
                Receive personalized food recommendations from our database
              </li>
              <li>Get dosha-specific lifestyle suggestions</li>
              <li>Learn when to seek professional medical help</li>
            </ol>
            <p
              style={{
                marginTop: '15px',
                fontSize: '14px',
                color: '#666'
              }}
            >
              <strong>Disclaimer:</strong> This tool provides general Ayurvedic
              guidance and should not replace professional medical advice.
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Results Section */}
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Back Button */}
            <button
              onClick={clearResults}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '20px',
                fontSize: 'clamp(0.9rem, 2vw, 1rem)'
              }}
            >
              ← New Analysis
            </button>

            {/* AI Analysis */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3
                style={{
                  color: '#2C5F2D',
                  marginBottom: '20px'
                }}
              >
                🧘 Ayurvedic Analysis
              </h3>
              <div
                style={{
                  fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
                  lineHeight: '1.8',
                  whiteSpace: 'pre-line'
                }}
                dangerouslySetInnerHTML={{
                  __html: (results.analysis || '')
                    .replace(/\*\*/g, '<strong>')
                    .replace(/\*/g, '')
                }}
              />
            </div>

            {/* Recommended Foods from Database */}
            {results.recommendedFoods &&
              results.recommendedFoods.length > 0 && (
                <div className="card" style={{ marginBottom: '20px' }}>
                  <h3
                    style={{
                      color: '#2C5F2D',
                      marginBottom: '20px'
                    }}
                  >
                    🍎 Recommended Foods from Our Database
                  </h3>
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(250px, 1fr))',
                      gap: '15px'
                    }}
                  >
                    {results.recommendedFoods.map((food) => (
                      <div
                        key={food._id || food.name}
                        style={{
                          padding: '15px',
                          backgroundColor: '#f9f9f9',
                          border: '2px solid #e8f5e9',
                          borderRadius: '8px'
                        }}
                      >
                        <h4
                          style={{
                            color: '#2C5F2D',
                            marginBottom: '8px'
                          }}
                        >
                          {food.name}
                        </h4>
                        <p
                          style={{
                            fontSize: '12px',
                            color: '#666',
                            marginBottom: '8px'
                          }}
                        >
                          {food.category}
                        </p>
                        {food.taste && (
                          <p
                            style={{
                              fontSize: '13px',
                              marginBottom: '5px'
                            }}
                          >
                            <strong>Taste:</strong> {food.taste}
                          </p>
                        )}
                        {food.properties && (
                          <p
                            style={{
                              fontSize: '13px',
                              marginBottom: '8px'
                            }}
                          >
                            <strong>Properties:</strong> {food.properties}
                          </p>
                        )}
                        <p
                          style={{
                            fontSize: '14px',
                            color: '#555'
                          }}
                        >
                          {food.benefits}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p
                    style={{
                      marginTop: '15px',
                      fontSize: '14px',
                      color: '#666',
                      textAlign: 'center'
                    }}
                  >
                    Showing {results.recommendedFoods.length} of{' '}
                    {results.totalFoodsInDb} foods in database
                  </p>
                </div>
              )}

            {/* Action Buttons */}
            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '20px' }}>What's Next?</h3>
              <div
                style={{
                  display: 'flex',
                  gap: '15px',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}
              >
                <button
                  onClick={() => (window.location.href = '/dosha-quiz')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#7b1fa2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                    flex: '1 1 200px'
                  }}
                >
                  🧘 Take Dosha Quiz
                </button>
                <button
                  onClick={() => (window.location.href = '/knowledge')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                    flex: '1 1 200px'
                  }}
                >
                  📚 Learn More
                </button>
                <button
                  onClick={() => (window.location.href = '/foods')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#388e3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                    flex: '1 1 200px'
                  }}
                >
                  🍎 Browse Foods
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SymptomChecker;
