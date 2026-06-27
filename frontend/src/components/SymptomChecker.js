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

      if (data && data.message && !data.analysis) {
        setError(data.message);
        setResults(null);
        setLoading(false);
        return;
      }

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
    <div className="container" style={{ animation: 'fadeInDown 0.6s ease-out' }}>
      {/* Header */}
      <div className="section-header" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4.5rem', marginBottom: '1rem', animation: 'bounce 2s infinite' }}>🔍</div>
        <h2 style={{ color: 'var(--primary-dark)', fontFamily: "'Playfair Display', serif" }}>
          Ayurvedic Symptom Checker
        </h2>
        <p className="subtitle">
          Describe your health symptoms to receive personalized Ayurvedic analyses and food recommendations.
        </p>
      </div>

      {!results ? (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Symptom Input Form */}
          <div className="card mb-3">
            <h3 style={{ marginTop: 0, marginBottom: '1.25rem', fontFamily: "'Playfair Display', serif" }}>
              Describe Your Symptoms
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe what you are feeling (e.g. Acid reflux after meals, bloating, cold hands, sleep issues)..."
                  required
                />
              </div>

              {error && (
                <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-large"
                style={{ width: '100%' }}
              >
                {loading ? '🔄 Analyzing via AI...' : '🔍 Analyze Symptoms'}
              </button>
            </form>
          </div>

          {/* Quick Symptom Buttons */}
          <div className="card mb-3">
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.15rem', color: 'var(--primary-dark)', fontFamily: "'Playfair Display', serif" }}>
              💡 Common Symptoms (Click to Add)
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {commonSymptoms.map((symptom, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addSymptom(symptom)}
                  className="btn btn-small btn-outline"
                  style={{
                    borderRadius: '20px',
                    borderColor: '#ccc',
                    color: '#555',
                    background: '#f9f9f9',
                    padding: '6px 14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#ccc';
                    e.currentTarget.style.color = '#555';
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="card" style={{ backgroundColor: '#E3F2FD', borderLeft: '5px solid var(--info-color)' }}>
            <h4 style={{ color: '#0D47A1', marginTop: 0, marginBottom: '10px', fontFamily: "'Playfair Display', serif" }}>
              ℹ️ Clinical Guideline
            </h4>
            <ol style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.8', color: '#1565C0', fontSize: '0.925rem' }}>
              <li>Enter single or multiple symptoms separated by commas.</li>
              <li>Our backend service parses query traits using Ayurvedic mappings.</li>
              <li>Get immediate balancing recommendations (Vata, Pitta, or Kapha adjusting).</li>
              <li>Favor the database foods shown below to restore equilibrium.</li>
            </ol>
            <p style={{ marginTop: '12px', marginBottom: 0, fontSize: '0.8rem', color: '#1A237E', opacity: 0.8 }}>
              * Disclaimer: AI recommendations are educational and do not replace formal medicine.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeInDown 0.4s ease-out' }}>
          {/* Back Button */}
          <button onClick={clearResults} className="btn btn-outline mb-3">
            ← New Analysis
          </button>

          {/* AI Analysis */}
          <div className="card mb-3" style={{ borderLeft: '5px solid var(--primary-color)' }}>
            <h3 style={{ color: 'var(--primary-dark)', marginTop: 0, marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>
              🧘 Ayurvedic Constitution Analysis
            </h3>
            <div
              style={{
                fontSize: '1.05rem',
                lineHeight: '1.8',
                color: 'var(--text-primary)',
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
          {results.recommendedFoods && results.recommendedFoods.length > 0 && (
            <div className="card mb-3">
              <h3 style={{ color: 'var(--primary-dark)', marginTop: 0, marginBottom: '1.5rem', fontFamily: "'Playfair Display', serif" }}>
                🍎 Suggested Foods to Pacify Imbalances
              </h3>
              <div className="cards-grid">
                {results.recommendedFoods.map((food) => (
                  <div
                    key={food._id || food.name}
                    className="card"
                    style={{
                      padding: '1.25rem',
                      backgroundColor: '#F8FAFB',
                      border: '1px solid #E8F5E9',
                      borderRadius: '8px'
                    }}
                  >
                    <h4 style={{ color: 'var(--primary-color)', margin: '0 0 4px 0', fontSize: '1.15rem', fontFamily: "'Playfair Display', serif" }}>
                      {food.name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#999', display: 'block', marginBottom: '8px' }}>
                      {food.category}
                    </span>
                    
                    {food.taste && (
                      <p style={{ fontSize: '0.85rem', margin: '0 0 4px 0' }}>
                        <strong>Taste:</strong> {food.taste}
                      </p>
                    )}
                    {food.properties && (
                      <p style={{ fontSize: '0.85rem', margin: '0 0 8px 0' }}>
                        <strong>Properties:</strong> {food.properties}
                      </p>
                    )}
                    <p style={{ fontSize: '0.9rem', color: '#555', margin: 0 }}>
                      {food.benefits}
                    </p>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '1.5rem', marginBottom: 0, fontSize: '0.85rem', color: '#777', textAlign: 'center' }}>
                Displaying {results.recommendedFoods.length} recommended items out of {results.totalFoodsInDb} registered foods.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="card text-center">
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontFamily: "'Playfair Display', serif" }}>Explore More Modalities</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => (window.location.href = '/dosha-quiz')} className="btn" style={{ backgroundColor: '#7B1FA2' }}>
                🧘 Take Dosha Quiz
              </button>
              <button onClick={() => (window.location.href = '/knowledge')} className="btn btn-secondary">
                📚 Knowledge Center
              </button>
              <button onClick={() => (window.location.href = '/foods')} className="btn btn-success">
                🍎 Food Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SymptomChecker;
