import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';

function KnowledgeCenter() {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedResource, setSelectedResource] = useState(null);

  const categories = ['All', 'Ancient Texts', 'Doshas', 'Herbs & Spices', 'Treatments', 'Lifestyle', 'Philosophy', 'History', 'Diet & Nutrition'];
  const types = ['All', 'article', 'video', 'text', 'document'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, selectedType, selectedDifficulty, resources]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await apiClient('http://localhost:5000/api/knowledge');
      setResources(data);
      setFilteredResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
    setLoading(false);
  };

  const filterResources = () => {
    let filtered = resources;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    // Filter by type
    if (selectedType !== 'All') {
      filtered = filtered.filter(r => r.type === selectedType);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(r => r.difficulty === selectedDifficulty);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term) ||
        r.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    setFilteredResources(filtered);
  };

  const openResource = (resource) => {
    setSelectedResource(resource);
  };

  const closeResource = () => {
    setSelectedResource(null);
  };

  const getTypeIcon = (type) => {
    const icons = {
      article: '📝',
      video: '🎬',
      text: '📖',
      document: '📄'
    };
    return icons[type] || '📚';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Ancient Texts': '📜',
      'Doshas': '⚖️',
      'Herbs & Spices': '🌿',
      'Treatments': '💊',
      'Lifestyle': '🧘',
      'Philosophy': '🕉️',
      'History': '🏛️',
      'Diet & Nutrition': '🍎'
    };
    return icons[category] || '📚';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Beginner: '#4caf50',
      Intermediate: '#ff9800',
      Advanced: '#f44336'
    };
    return colors[difficulty] || '#999';
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
          <p style={{ fontSize: '18px', color: '#666' }}>Loading Knowledge Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ marginBottom: '10px', color: '#2C5F2D' }}>🌿 Ayurveda Knowledge Center</h1>
        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', color: '#666', marginBottom: '30px' }}>
          Explore ancient wisdom, modern insights, and comprehensive resources on Ayurvedic medicine
        </p>

        {/* Search Bar */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="🔍 Search articles, videos, ancient texts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              border: '2px solid #ddd',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2C5F2D'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
        </div>

        {/* Filters */}
        <div className="card" style={{ backgroundColor: '#f9f9f9' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {/* Category Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
              >
                {types.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {selectedCategory !== 'All' && (
              <span style={{ padding: '6px 12px', backgroundColor: '#2C5F2D', color: 'white', borderRadius: '20px', fontSize: '14px' }}>
                {getCategoryIcon(selectedCategory)} {selectedCategory}
              </span>
            )}
            {selectedType !== 'All' && (
              <span style={{ padding: '6px 12px', backgroundColor: '#1976d2', color: 'white', borderRadius: '20px', fontSize: '14px' }}>
                {getTypeIcon(selectedType)} {selectedType}
              </span>
            )}
            {selectedDifficulty !== 'All' && (
              <span style={{ padding: '6px 12px', backgroundColor: getDifficultyColor(selectedDifficulty), color: 'white', borderRadius: '20px', fontSize: '14px' }}>
                {selectedDifficulty}
              </span>
            )}
          </div>
        </div>

        {/* Results Count */}
        <p style={{ marginTop: '20px', color: '#666', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
          Showing <strong>{filteredResources.length}</strong> of <strong>{resources.length}</strong> resources
        </p>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>No resources found</h3>
          <p style={{ color: '#999' }}>Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {filteredResources.map((resource) => (
            <div
              key={resource._id}
              className="card"
              onClick={() => openResource(resource)}
              style={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              {/* Type Badge */}
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                backgroundColor: 'rgba(44, 95, 45, 0.9)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {getTypeIcon(resource.type)} {resource.type.toUpperCase()}
              </div>

              {/* Category Icon */}
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>
                {getCategoryIcon(resource.category)}
              </div>

              {/* Title */}
              <h3 style={{ marginBottom: '10px', color: '#2C5F2D', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
                {resource.title}
              </h3>

              {/* Category */}
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>
                {resource.category}
              </p>

              {/* Description */}
              <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.95rem)', color: '#555', lineHeight: '1.6', marginBottom: '15px' }}>
                {resource.description.substring(0, 120)}...
              </p>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{
                  padding: '4px 10px',
                  backgroundColor: getDifficultyColor(resource.difficulty),
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {resource.difficulty}
                </span>
                <span style={{ fontSize: '13px', color: '#666' }}>
                  ⏱️ {resource.readTime}
                </span>
              </div>

              {/* Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {resource.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} style={{
                      padding: '4px 8px',
                      backgroundColor: '#f0f0f0',
                      color: '#666',
                      borderRadius: '10px',
                      fontSize: '11px'
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resource Modal */}
      {selectedResource && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto'
          }}
          onClick={closeResource}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeResource}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>

            {/* Content */}
            <div style={{ padding: '40px 30px' }}>
              {/* Header */}
              <div style={{ marginBottom: '25px' }}>
                <div style={{ fontSize: '64px', marginBottom: '15px' }}>
                  {getCategoryIcon(selectedResource.category)}
                </div>
                <h2 style={{ marginBottom: '10px', color: '#2C5F2D', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                  {selectedResource.title}
                </h2>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '15px' }}>
                  <span style={{
                    padding: '6px 14px',
                    backgroundColor: '#2C5F2D',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '14px'
                  }}>
                    {selectedResource.category}
                  </span>
                  <span style={{
                    padding: '6px 14px',
                    backgroundColor: getDifficultyColor(selectedResource.difficulty),
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '14px'
                  }}>
                    {selectedResource.difficulty}
                  </span>
                  <span style={{
                    padding: '6px 14px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '14px'
                  }}>
                    {getTypeIcon(selectedResource.type)} {selectedResource.type}
                  </span>
                </div>
              </div>

              {/* Video Player */}
              {selectedResource.type === 'video' && selectedResource.videoUrl && (
                <div style={{ marginBottom: '30px', position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                  <iframe
                    src={selectedResource.videoUrl}
                    title={selectedResource.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      borderRadius: '8px'
                    }}
                  ></iframe>
                </div>
              )}

              {/* Description */}
              <div style={{
                padding: '20px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                marginBottom: '25px',
                borderLeft: '4px solid #2C5F2D'
              }}>
                <p style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', lineHeight: '1.8', color: '#333' }}>
                  {selectedResource.description}
                </p>
              </div>

              {/* Content */}
              {selectedResource.content && (
                <div style={{
                  fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
                  lineHeight: '1.9',
                  color: '#333',
                  whiteSpace: 'pre-line'
                }}>
                  {selectedResource.content}
                </div>
              )}

              {/* Meta Information */}
              <div style={{
                marginTop: '30px',
                padding: '20px',
                backgroundColor: '#f0f8ff',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  {selectedResource.author && (
                    <div>
                      <strong style={{ color: '#666' }}>✍️ Author:</strong>
                      <p style={{ marginTop: '5px', color: '#333' }}>{selectedResource.author}</p>
                    </div>
                  )}
                  {selectedResource.readTime && (
                    <div>
                      <strong style={{ color: '#666' }}>⏱️ Duration:</strong>
                      <p style={{ marginTop: '5px', color: '#333' }}>{selectedResource.readTime}</p>
                    </div>
                  )}
                  {selectedResource.language && (
                    <div>
                      <strong style={{ color: '#666' }}>🌐 Language:</strong>
                      <p style={{ marginTop: '5px', color: '#333' }}>{selectedResource.language}</p>
                    </div>
                  )}
                  {selectedResource.source && (
                    <div>
                      <strong style={{ color: '#666' }}>📚 Source:</strong>
                      <p style={{ marginTop: '5px', color: '#333' }}>{selectedResource.source}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {selectedResource.tags && selectedResource.tags.length > 0 && (
                <div style={{ marginTop: '25px' }}>
                  <strong style={{ color: '#666', display: 'block', marginBottom: '10px' }}>🏷️ Tags:</strong>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedResource.tags.map((tag, index) => (
                      <span key={index} style={{
                        padding: '6px 12px',
                        backgroundColor: '#e8f5e9',
                        color: '#2C5F2D',
                        borderRadius: '15px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KnowledgeCenter;
